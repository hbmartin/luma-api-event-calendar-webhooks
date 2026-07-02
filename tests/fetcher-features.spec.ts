import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { LumaClient, LumaAbortError, BASE_URL, createFetcher } from "../src/index.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const okBody = { user: { api_id: "user-1", email: "a@b.co", name: "A" } };

const jsonResponse = (body: unknown) => ({
  ok: true,
  status: 200,
  headers: new Headers({ "content-type": "application/json" }),
  text: async () => JSON.stringify(body),
});

beforeEach(() => {
  mockFetch.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("injectable fetch", () => {
  it("should use the custom fetch instead of the global one", async () => {
    const customFetch = vi.fn().mockResolvedValue(jsonResponse(okBody));
    const client = new LumaClient({ apiKey: "k", fetch: customFetch });

    const result = await client.user.getSelf();

    expect(result.user.api_id).toBe("user-1");
    expect(customFetch).toHaveBeenCalledTimes(1);
    expect(customFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/user/get-self`,
      expect.objectContaining({ method: "GET" })
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should fall back to the global fetch by default", async () => {
    const client = new LumaClient({ apiKey: "k" });
    mockFetch.mockResolvedValueOnce(jsonResponse(okBody));

    await client.user.getSelf();

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe("per-request AbortSignal", () => {
  const abortAwareFetch = () =>
    mockFetch.mockImplementationOnce(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          const signal = init.signal!;
          const abort = () => reject(new DOMException("Aborted", "AbortError"));
          if (signal.aborted) {
            abort();
            return;
          }
          signal.addEventListener("abort", abort, { once: true });
        })
    );

  it("should reject with LumaAbortError when aborted mid-request", async () => {
    abortAwareFetch();
    const controller = new AbortController();
    const client = new LumaClient({ apiKey: "k" });

    const promise = client.user.getSelf({ signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toBeInstanceOf(LumaAbortError);
  });

  it("should reject immediately for an already-aborted signal", async () => {
    abortAwareFetch();
    const controller = new AbortController();
    controller.abort();
    const client = new LumaClient({ apiKey: "k" });

    await expect(client.user.getSelf({ signal: controller.signal })).rejects.toBeInstanceOf(
      LumaAbortError
    );
  });

  it("should preserve the abort reason as the error cause", async () => {
    abortAwareFetch();
    const controller = new AbortController();
    const client = new LumaClient({ apiKey: "k" });

    const promise = client.user.getSelf({ signal: controller.signal });
    const reason = new Error("user cancelled");
    controller.abort(reason);

    await expect(promise).rejects.toMatchObject({ cause: reason });
  });

  it("should pass a combined signal to fetch", async () => {
    const controller = new AbortController();
    mockFetch.mockResolvedValueOnce(jsonResponse(okBody));
    const client = new LumaClient({ apiKey: "k" });

    await client.user.getSelf({ signal: controller.signal });

    const init = mockFetch.mock.calls[0][1] as RequestInit;
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("should still succeed when the signal never aborts", async () => {
    const controller = new AbortController();
    mockFetch.mockResolvedValueOnce(jsonResponse(okBody));
    const client = new LumaClient({ apiKey: "k" });

    const result = await client.user.getSelf({ signal: controller.signal });
    expect(result.user.api_id).toBe("user-1");
  });
});

describe("array query params", () => {
  const schema = z.object({ success: z.boolean() });

  it("should serialize arrays as repeated params", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: true }));
    const fetcher = createFetcher({ apiKey: "k" });

    await fetcher.get("/v1/test", { ids: ["a", "b"], flag: true }, schema);

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/test?ids=a&ids=b&flag=true`,
      expect.any(Object)
    );
  });

  it("should serialize numeric and boolean array values", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: true }));
    const fetcher = createFetcher({ apiKey: "k" });

    await fetcher.get("/v1/test", { nums: [1, 2, 3] }, schema);

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/test?nums=1&nums=2&nums=3`,
      expect.any(Object)
    );
  });

  it("should skip undefined values but keep empty arrays out of the URL", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: true }));
    const fetcher = createFetcher({ apiKey: "k" });

    await fetcher.get("/v1/test", { ids: [], missing: undefined, keep: "yes" }, schema);

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/v1/test?keep=yes`, expect.any(Object));
  });
});

describe("runtime portability", () => {
  it("should not import node builtins from src", async () => {
    // The library relies on globalThis.crypto and fetch only, so it can run
    // on edge runtimes. Guard against node: imports sneaking back in.
    const { readFile } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    const path = await import("node:path");

    const srcDir = fileURLToPath(new URL("../src", import.meta.url));
    const files: string[] = [];
    const walk = async (dir: string) => {
      const { readdir } = await import("node:fs/promises");
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.name.endsWith(".ts")) {
          files.push(fullPath);
        }
      }
    };
    await walk(srcDir);

    for (const file of files) {
      const content = await readFile(file, "utf8");
      expect(content, `${file} imports a node builtin`).not.toMatch(/from ['"]node:/);
    }
  });
});
