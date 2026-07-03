import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LumaClient, LumaAbortError, LumaApiError, LumaNetworkError, LumaRateLimitError } from "../src/index.js";
import { computeRetryDelayMs, isRetryableError, resolveRetryConfig, waitBeforeRetry } from "../src/client/retry.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const okBody = { user: { api_id: "user-1", email: "a@b.co", name: "A" } };

const jsonResponse = (body: unknown, init?: { ok?: boolean; status?: number; headers?: Record<string, string> }) => ({
  ok: init?.ok ?? true,
  status: init?.status ?? 200,
  headers: new Headers({ "content-type": "application/json", ...init?.headers }),
  text: async () => JSON.stringify(body),
});

describe("resolveRetryConfig", () => {
  it("should apply defaults", () => {
    expect(resolveRetryConfig({})).toEqual({
      maxRetries: 2,
      initialDelayMs: 500,
      maxDelayMs: 30_000,
      backoffMultiplier: 2,
    });
  });

  it("should honor overrides", () => {
    expect(resolveRetryConfig({ maxRetries: 5, initialDelayMs: 100 })).toEqual({
      maxRetries: 5,
      initialDelayMs: 100,
      maxDelayMs: 30_000,
      backoffMultiplier: 2,
    });
  });
});

describe("isRetryableError", () => {
  it("should retry network errors", () => {
    expect(isRetryableError(new LumaNetworkError("boom"))).toBe(true);
  });

  it("should retry rate limit errors", () => {
    expect(isRetryableError(new LumaRateLimitError("slow down", 1))).toBe(true);
  });

  it("should retry server errors", () => {
    expect(isRetryableError(new LumaApiError("oops", 500))).toBe(true);
    expect(isRetryableError(new LumaApiError("oops", 503))).toBe(true);
  });

  it("should not retry client errors", () => {
    expect(isRetryableError(new LumaApiError("bad", 400))).toBe(false);
    expect(isRetryableError(new LumaApiError("nope", 404))).toBe(false);
  });

  it("should not retry aborts or unknown errors", () => {
    expect(isRetryableError(new LumaAbortError())).toBe(false);
    expect(isRetryableError(new Error("random"))).toBe(false);
  });
});

describe("computeRetryDelayMs", () => {
  const config = resolveRetryConfig({ initialDelayMs: 100, maxRetries: 3, maxDelayMs: 1000 });

  it("should return undefined once attempts are exhausted", () => {
    const error = new LumaNetworkError("boom");
    expect(computeRetryDelayMs({ error, attempt: 3, config })).toBeUndefined();
  });

  it("should return undefined for non-retryable errors", () => {
    const error = new LumaApiError("bad", 400);
    expect(computeRetryDelayMs({ error, attempt: 0, config })).toBeUndefined();
  });

  it("should honor Retry-After for rate limits", () => {
    const error = new LumaRateLimitError("slow down", 1);
    // Retry-After is exact (no jitter): 1s => 1000ms, capped by maxDelayMs.
    expect(computeRetryDelayMs({ error, attempt: 0, config })).toBe(1000);
  });

  it("should cap Retry-After at maxDelayMs", () => {
    const error = new LumaRateLimitError("slow down", 60);
    expect(computeRetryDelayMs({ error, attempt: 0, config })).toBe(1000);
  });

  it("should backoff exponentially with jitter", () => {
    const error = new LumaNetworkError("boom");
    const first = computeRetryDelayMs({ error, attempt: 0, config });
    const second = computeRetryDelayMs({ error, attempt: 1, config });
    // attempt 0: capped base 100 -> [50, 100]; attempt 1: base 200 -> [100, 200]
    expect(first).toBeGreaterThanOrEqual(50);
    expect(first).toBeLessThanOrEqual(100);
    expect(second).toBeGreaterThanOrEqual(100);
    expect(second).toBeLessThanOrEqual(200);
  });

  it("should never exceed maxDelayMs", () => {
    const error = new LumaNetworkError("boom");
    const delay = computeRetryDelayMs({
      error,
      attempt: 2,
      config: resolveRetryConfig({ initialDelayMs: 5000, maxDelayMs: 800, maxRetries: 5 }),
    });
    expect(delay).toBeLessThanOrEqual(800);
  });
});

describe("waitBeforeRetry", () => {
  it("should reject immediately for an already-aborted signal", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(waitBeforeRetry(1000, controller.signal)).rejects.toBeInstanceOf(LumaAbortError);
  });

  it("should resolve after the delay without a signal", async () => {
    await expect(waitBeforeRetry(1)).resolves.toBeUndefined();
  });
});

describe("client retry integration", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should not retry when the retry option is omitted", async () => {
    const client = new LumaClient({ apiKey: "k" });
    mockFetch.mockResolvedValueOnce(jsonResponse({ message: "rate limited" }, { ok: false, status: 429 }));

    await expect(client.user.getSelf()).rejects.toBeInstanceOf(LumaRateLimitError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should retry a 429 honoring Retry-After and then succeed", async () => {
    const client = new LumaClient({ apiKey: "k", retry: {} });
    mockFetch
      .mockResolvedValueOnce(
        jsonResponse({ message: "rate limited" }, { ok: false, status: 429, headers: { "retry-after": "1" } })
      )
      .mockResolvedValueOnce(jsonResponse(okBody));

    const promise = client.user.getSelf();
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;

    expect(result.user.api_id).toBe("user-1");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should retry server errors with backoff", async () => {
    const client = new LumaClient({ apiKey: "k", retry: { initialDelayMs: 10 } });
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ message: "oops" }, { ok: false, status: 500 }))
      .mockResolvedValueOnce(jsonResponse(okBody));

    const promise = client.user.getSelf();
    await vi.advanceTimersByTimeAsync(10);
    const result = await promise;

    expect(result.user.api_id).toBe("user-1");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should retry network errors", async () => {
    const client = new LumaClient({ apiKey: "k", retry: { initialDelayMs: 10 } });
    mockFetch
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(jsonResponse(okBody));

    const promise = client.user.getSelf();
    await vi.advanceTimersByTimeAsync(10);
    const result = await promise;

    expect(result.user.api_id).toBe("user-1");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should not retry 4xx errors", async () => {
    const client = new LumaClient({ apiKey: "k", retry: {} });
    mockFetch.mockResolvedValueOnce(jsonResponse({ message: "bad request" }, { ok: false, status: 400 }));

    await expect(client.user.getSelf()).rejects.toBeInstanceOf(LumaApiError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should give up after maxRetries and rethrow the last error", async () => {
    const client = new LumaClient({ apiKey: "k", retry: { maxRetries: 2 } });
    mockFetch.mockResolvedValue(
      jsonResponse({ message: "rate limited" }, { ok: false, status: 429, headers: { "retry-after": "1" } })
    );

    const promise = client.user.getSelf();
    const assertion = expect(promise).rejects.toBeInstanceOf(LumaRateLimitError);
    await vi.advanceTimersByTimeAsync(2000);
    await assertion;

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("should stop retrying when the caller aborts during backoff", async () => {
    const client = new LumaClient({ apiKey: "k", retry: {} });
    const controller = new AbortController();
    mockFetch.mockResolvedValue(
      jsonResponse({ message: "rate limited" }, { ok: false, status: 429, headers: { "retry-after": "5" } })
    );

    const promise = client.user.getSelf({ signal: controller.signal });
    const assertion = expect(promise).rejects.toBeInstanceOf(LumaAbortError);
    // Flush the first (failing) request, then abort while waiting out the backoff.
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    await assertion;

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
