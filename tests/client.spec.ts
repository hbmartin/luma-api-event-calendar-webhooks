import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LumaClient, BASE_URL, parseRetryAfter, LumaError, LumaRateLimitError, LumaApiError, LumaNetworkError, LumaAuthenticationError, LumaNotFoundError, LumaValidationError, type DebugContext } from "../src/index.js";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const hasHeaders = (value: unknown): value is { headers: HeadersInit } => {
  if (!value || typeof value !== "object") {
    return false;
  }
  return "headers" in value;
};

describe("LumaClient", () => {
  let client: LumaClient;

  beforeEach(() => {
    client = new LumaClient({ apiKey: "test-api-key" });
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create client with API key", () => {
      const testClient = new LumaClient({ apiKey: "my-key" });
      expect(testClient).toBeInstanceOf(LumaClient);
    });

    it("should use custom base URL", () => {
      const customClient = new LumaClient({
        apiKey: "my-key",
        baseUrl: "https://custom.api.com",
      });
      expect(customClient).toBeInstanceOf(LumaClient);
    });

    it("should use custom timeout", () => {
      const customClient = new LumaClient({
        apiKey: "my-key",
        timeout: 60000,
      });
      expect(customClient).toBeInstanceOf(LumaClient);
    });
  });

  describe("BASE_URL", () => {
    it("should export correct base URL", () => {
      expect(BASE_URL).toBe("https://public-api.luma.com");
    });
  });

  describe("user.getSelf", () => {
    it("should fetch current user", async () => {
      const mockResponse = {
        user: {
          api_id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await client.user.getSelf();

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/user/get-self`,
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "x-luma-api-key": "test-api-key",
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("event.get", () => {
    it("should fetch event by ID", async () => {
      const mockEvent = {
        event: {
          api_id: "evt-123",
          name: "Test Event",
          start_at: "2024-01-15T10:00:00Z",
          end_at: "2024-01-15T12:00:00Z",
          timezone: "America/Los_Angeles",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockEvent),
      });

      const result = await client.event.get({ event_api_id: "evt-123" });

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/event/get?event_api_id=evt-123`,
        expect.any(Object)
      );
      expect(result.event.api_id).toBe("evt-123");
    });
  });

  describe("event.create", () => {
    it("should create new event", async () => {
      const mockResponse = {
        event: {
          api_id: "evt-new",
          name: "New Event",
          start_at: "2024-02-01T14:00:00Z",
          end_at: "2024-02-01T16:00:00Z",
          timezone: "UTC",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await client.event.create({
        name: "New Event",
        start_at: "2024-02-01T14:00:00Z",
        end_at: "2024-02-01T16:00:00Z",
        timezone: "UTC",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/event/create`,
        expect.objectContaining({
          method: "POST",
          body: expect.any(String),
        })
      );
      expect(result.event.name).toBe("New Event");
    });
  });

  describe("calendar.listEvents", () => {
    it("should list calendar events with pagination", async () => {
      const mockResponse = {
        entries: [
          {
            api_id: "evt-1",
            event: { api_id: "evt-1", name: "Event 1" },
          },
        ],
        has_more: true,
        next_cursor: "cursor-123",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await client.calendar.listEvents({
        after: "2024-01-01T00:00:00Z",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("after=2024-01-01T00%3A00%3A00Z"),
        expect.any(Object)
      );
      expect(result.entries).toHaveLength(1);
      expect(result.has_more).toBe(true);
    });
  });

  describe("webhook.create", () => {
    it("should create webhook", async () => {
      const mockResponse = {
        webhook: {
          api_id: "wh-123",
          url: "https://example.com/webhook",
          event_types: ["event.created"],
          status: "active",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await client.webhook.create({
        calendar_id: "cal-123",
        url: "https://example.com/webhook",
        event_types: ["event.created"],
      });

      expect(result.webhook.url).toBe("https://example.com/webhook");
    });
  });

  describe("error handling", () => {
    it("should throw LumaAuthenticationError on 401", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ message: "Invalid API key" }),
      });

      await expect(client.user.getSelf()).rejects.toThrow(LumaAuthenticationError);
    });

    it("should throw LumaNotFoundError on 404", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ message: "Event not found" }),
      });

      await expect(
        client.event.get({ event_api_id: "nonexistent" })
      ).rejects.toThrow(LumaNotFoundError);
    });

    it("should throw LumaRateLimitError on 429", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({
          "content-type": "application/json",
          "retry-after": "60",
        }),
        text: async () => JSON.stringify({ message: "Rate limit exceeded" }),
      });

      try {
        await client.user.getSelf();
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(LumaRateLimitError);
        if (error instanceof LumaRateLimitError) {
          expect(error.retryAfter).toBe(60);
        } else {
          throw new Error("Expected LumaRateLimitError");
        }
      }
    });

    it("should throw LumaApiError on other error status codes", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ message: "Internal server error" }),
      });

      try {
        await client.user.getSelf();
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(LumaApiError);
        if (error instanceof LumaApiError) {
          expect(error.statusCode).toBe(500);
        } else {
          throw new Error("Expected LumaApiError");
        }
      }
    });

    it("should throw LumaNetworkError on fetch failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(client.user.getSelf()).rejects.toThrow(LumaNetworkError);
    });

    it("should throw LumaNetworkError on timeout", async () => {
      const timeoutClient = new LumaClient({
        apiKey: "test-key",
        timeout: 1, // 1ms timeout
      });

      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          })
      );

      // The AbortError should be caught and wrapped
      await expect(timeoutClient.user.getSelf()).rejects.toThrow(LumaNetworkError);
    });

    it("should throw LumaValidationError on schema mismatch", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ user: {} }),
      });

      await expect(client.user.getSelf()).rejects.toThrow(LumaValidationError);
    });

    it("should handle invalid JSON response gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => "{ invalid json }",
      });

      await expect(client.user.getSelf()).rejects.toThrow(LumaValidationError);
    });

    it("should handle empty response body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => "",
      });

      await expect(client.user.getSelf()).rejects.toThrow(LumaValidationError);
    });

    it("should handle non-JSON content type response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "text/plain" }),
        text: async () => "Plain text response",
      });

      await expect(client.user.getSelf()).rejects.toThrow(LumaValidationError);
    });

    it("should parse JSON subtypes like application/problem+json", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ "content-type": "application/problem+json" }),
        text: async () => JSON.stringify({ message: "Bad request" }),
      });

      await expect(client.user.getSelf()).rejects.toThrow(LumaApiError);
    });

    it("should parse vendor JSON subtypes like application/vnd.api+json", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ "content-type": "application/vnd.api+json" }),
        text: async () => JSON.stringify({ message: "Validation failed" }),
      });

      await expect(client.user.getSelf()).rejects.toThrow(LumaApiError);
    });

    it("should parse JSON content type with charset parameter", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          "content-type": "application/json; charset=utf-8",
        }),
        text: async () => JSON.stringify({ message: "Error with charset" }),
      });

      await expect(client.user.getSelf()).rejects.toThrow(LumaApiError);
    });

    it("should use fallback error message when response has no message field", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ error: "no message field" }),
      });

      try {
        await client.user.getSelf();
        throw new Error("Expected error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(LumaApiError);
        if (error instanceof LumaApiError) {
          expect(error.message).toBe("Request failed with status 500");
        }
      }
    });
  });

  describe("query parameters", () => {
    it("should handle undefined query parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({
          entries: [],
          has_more: false,
          next_cursor: null,
        }),
      });

      await client.calendar.listEvents({
        cursor: undefined,
        limit: undefined,
      });

      const calledUrl = mockFetch.mock.calls[0]?.[0];
      if (typeof calledUrl !== "string") {
        throw new Error("Expected request URL to be a string.");
      }
      expect(calledUrl).not.toContain("pagination_cursor=");
      expect(calledUrl).not.toContain("pagination_limit=");
      expect(calledUrl).not.toMatch(/[?&]cursor=/);
      expect(calledUrl).not.toMatch(/[?&]limit=/);
    });

    it("should include defined query parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({
          entries: [],
          has_more: false,
          next_cursor: null,
        }),
      });

      await client.calendar.listEvents({
        cursor: "page-2",
        limit: 50,
      });

      const calledUrl = mockFetch.mock.calls[0]?.[0];
      if (typeof calledUrl !== "string") {
        throw new Error("Expected request URL to be a string.");
      }
      expect(calledUrl).toContain("pagination_cursor=page-2");
      expect(calledUrl).toContain("pagination_limit=50");
      expect(calledUrl).not.toMatch(/[?&]cursor=/);
      expect(calledUrl).not.toMatch(/[?&]limit=/);
    });
  });

  describe("request headers", () => {
    it("should include API key header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ user: { api_id: "user-123" } }),
      });

      await client.user.getSelf();

      const calledOptions: unknown = mockFetch.mock.calls[0]?.[1];
      if (!hasHeaders(calledOptions)) {
        throw new Error("Expected request options with headers.");
      }
      expect(calledOptions.headers).toEqual(
        expect.objectContaining({
          "x-luma-api-key": "test-api-key",
        })
      );
    });

    it("should include content-type header when body is present", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () =>
          JSON.stringify({
            webhook: { api_id: "wh-123", url: "https://example.com", event_types: [] },
          }),
      });

      await client.webhook.create({
        url: "https://example.com",
        event_types: [],
      });

      const calledOptions: unknown = mockFetch.mock.calls[0]?.[1];
      if (!hasHeaders(calledOptions)) {
        throw new Error("Expected request options with headers.");
      }
      expect(calledOptions.headers).toEqual(
        expect.objectContaining({
          "Content-Type": "application/json",
        })
      );
    });

    it("should not include content-type header when body is absent", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ user: { api_id: "user-123" } }),
      });

      await client.user.getSelf();

      const calledOptions: unknown = mockFetch.mock.calls[0]?.[1];
      if (!hasHeaders(calledOptions)) {
        throw new Error("Expected request options with headers.");
      }
      expect(calledOptions.headers).not.toHaveProperty("Content-Type");
    });
  });

  describe("debug hook", () => {
    it("should call debug hook on successful request", async () => {
      const debugSpy = vi.fn<[DebugContext], void>();
      const debugClient = new LumaClient({
        apiKey: "test-api-key",
        debug: debugSpy,
      });

      const mockResponse = {
        user: {
          api_id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockResponse),
      });

      await debugClient.user.getSelf();

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const context = debugSpy.mock.calls[0]![0];
      expect(context.request.method).toBe("GET");
      expect(context.request.url).toContain("/v1/user/get-self");
      expect(context.request.headers["x-luma-api-key"]).toBe("test-api-key");
      expect(context.outcome.type).toBe("success");
      if (context.outcome.type === "success") {
        expect(context.outcome.response.status).toBe(200);
        expect(context.outcome.response.ok).toBe(true);
        expect(context.outcome.response.body).toEqual(mockResponse);
      }
      expect(context.durationMs).toBeGreaterThanOrEqual(0);
    });

    it("should call debug hook on API error with response info", async () => {
      const debugSpy = vi.fn<[DebugContext], void>();
      const debugClient = new LumaClient({
        apiKey: "test-api-key",
        debug: debugSpy,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ message: "Invalid API key" }),
      });

      await expect(debugClient.user.getSelf()).rejects.toThrow(LumaAuthenticationError);

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const context = debugSpy.mock.calls[0]![0];
      expect(context.outcome.type).toBe("success");
      if (context.outcome.type === "success") {
        expect(context.outcome.response.status).toBe(401);
        expect(context.outcome.response.ok).toBe(false);
      }
    });

    it("should call debug hook on 404 error", async () => {
      const debugSpy = vi.fn<[DebugContext], void>();
      const debugClient = new LumaClient({
        apiKey: "test-api-key",
        debug: debugSpy,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ message: "Not found" }),
      });

      await expect(
        debugClient.event.get({ event_api_id: "nonexistent" })
      ).rejects.toThrow(LumaNotFoundError);

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const context = debugSpy.mock.calls[0]![0];
      expect(context.outcome.type).toBe("success");
      if (context.outcome.type === "success") {
        expect(context.outcome.response.status).toBe(404);
      }
    });

    it("should call debug hook on 429 rate limit error", async () => {
      const debugSpy = vi.fn<[DebugContext], void>();
      const debugClient = new LumaClient({
        apiKey: "test-api-key",
        debug: debugSpy,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({
          "content-type": "application/json",
          "retry-after": "60",
        }),
        text: async () => JSON.stringify({ message: "Rate limit exceeded" }),
      });

      await expect(debugClient.user.getSelf()).rejects.toThrow(LumaRateLimitError);

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const context = debugSpy.mock.calls[0]![0];
      expect(context.outcome.type).toBe("success");
      if (context.outcome.type === "success") {
        expect(context.outcome.response.status).toBe(429);
        expect(context.outcome.response.headers["retry-after"]).toBe("60");
      }
    });

    it("should call debug hook with error outcome on network failure", async () => {
      const debugSpy = vi.fn<[DebugContext], void>();
      const debugClient = new LumaClient({
        apiKey: "test-api-key",
        debug: debugSpy,
      });

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(debugClient.user.getSelf()).rejects.toThrow(LumaNetworkError);

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const context = debugSpy.mock.calls[0]![0];
      expect(context.outcome.type).toBe("error");
      if (context.outcome.type === "error") {
        expect(context.outcome.error).toBeInstanceOf(LumaNetworkError);
        expect(context.outcome.error.message).toBe("Network error");
      }
    });

    it("should call debug hook with error outcome on timeout", async () => {
      const debugSpy = vi.fn<[DebugContext], void>();
      const debugClient = new LumaClient({
        apiKey: "test-api-key",
        timeout: 1,
        debug: debugSpy,
      });

      // Properly simulate an aborted fetch by checking the signal
      mockFetch.mockImplementationOnce(
        (_url: string, options?: { signal?: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            const checkAbort = () => {
              if (options?.signal?.aborted) {
                const abortError = new Error("The operation was aborted");
                abortError.name = "AbortError";
                reject(abortError);
                return true;
              }
              return false;
            };

            // Check immediately and then on abort event
            if (!checkAbort() && options?.signal) {
              options.signal.addEventListener("abort", () => checkAbort());
            }
          })
      );

      await expect(debugClient.user.getSelf()).rejects.toThrow(LumaNetworkError);

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const context = debugSpy.mock.calls[0]![0];
      expect(context.outcome.type).toBe("error");
      if (context.outcome.type === "error") {
        expect(context.outcome.error).toBeInstanceOf(LumaNetworkError);
        expect(context.outcome.error.message).toContain("timed out");
      }
    });

    it("should include request body in debug context for POST requests", async () => {
      const debugSpy = vi.fn<[DebugContext], void>();
      const debugClient = new LumaClient({
        apiKey: "test-api-key",
        debug: debugSpy,
      });

      const mockResponse = {
        event: {
          api_id: "evt-new",
          name: "New Event",
          start_at: "2024-02-01T14:00:00Z",
          end_at: "2024-02-01T16:00:00Z",
          timezone: "UTC",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockResponse),
      });

      const requestBody = {
        name: "New Event",
        start_at: "2024-02-01T14:00:00Z",
        end_at: "2024-02-01T16:00:00Z",
        timezone: "UTC",
      };

      await debugClient.event.create(requestBody);

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const context = debugSpy.mock.calls[0]![0];
      expect(context.request.method).toBe("POST");
      expect(context.request.body).toEqual(requestBody);
      expect(context.request.headers["Content-Type"]).toBe("application/json");
    });

    it("should not include body property for GET requests", async () => {
      const debugSpy = vi.fn<[DebugContext], void>();
      const debugClient = new LumaClient({
        apiKey: "test-api-key",
        debug: debugSpy,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({
          user: { api_id: "user-123", email: "test@example.com", name: "Test" },
        }),
      });

      await debugClient.user.getSelf();

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const context = debugSpy.mock.calls[0]![0];
      expect(context.request).not.toHaveProperty("body");
    });

    it("should not call debug hook when not provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({
          user: { api_id: "user-123", email: "test@example.com", name: "Test" },
        }),
      });

      // Using the client without debug option
      await client.user.getSelf();

      // No debug spy was set up, so we just verify the request succeeded
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should measure duration accurately", async () => {
      const debugSpy = vi.fn<[DebugContext], void>();
      const debugClient = new LumaClient({
        apiKey: "test-api-key",
        debug: debugSpy,
      });

      const delay = 50;
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                status: 200,
                headers: new Headers({ "content-type": "application/json" }),
                text: async () => JSON.stringify({
                  user: { api_id: "user-123", email: "test@example.com", name: "Test" },
                }),
              });
            }, delay);
          })
      );

      await debugClient.user.getSelf();

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const context = debugSpy.mock.calls[0]![0];
      // Allow some tolerance for test execution overhead
      expect(context.durationMs).toBeGreaterThanOrEqual(delay - 10);
      expect(context.durationMs).toBeLessThan(delay + 100);
    });
  });
});

describe("parseRetryAfter", () => {
  describe("numeric seconds format", () => {
    it("should parse valid numeric seconds", () => {
      expect(parseRetryAfter("60")).toBe(60);
      expect(parseRetryAfter("120")).toBe(120);
      expect(parseRetryAfter("0")).toBe(0);
      expect(parseRetryAfter("3600")).toBe(3600);
    });

    it("should return undefined for negative numbers", () => {
      expect(parseRetryAfter("-1")).toBeUndefined();
      expect(parseRetryAfter("-60")).toBeUndefined();
    });

    it("should return undefined for non-numeric strings", () => {
      expect(parseRetryAfter("abc")).toBeUndefined();
      expect(parseRetryAfter("")).toBeUndefined();
      expect(parseRetryAfter("60abc")).toBeUndefined();
    });
  });

  describe("HTTP-date format", () => {
    it("should parse valid HTTP-date and return seconds until that time", () => {
      // Create a date 120 seconds in the future
      const futureDate = new Date(Date.now() + 120000);
      const httpDate = futureDate.toUTCString();

      const result = parseRetryAfter(httpDate);
      expect(result).toBeDefined();
      // Allow some tolerance for test execution time
      expect(result).toBeGreaterThanOrEqual(119);
      expect(result).toBeLessThanOrEqual(121);
    });

    it("should return 0 for dates in the past", () => {
      const pastDate = new Date(Date.now() - 60000);
      const httpDate = pastDate.toUTCString();

      expect(parseRetryAfter(httpDate)).toBe(0);
    });

    it("should handle standard HTTP-date format", () => {
      // Create a date 60 seconds in the future
      const futureDate = new Date(Date.now() + 60000);
      const httpDate = futureDate.toUTCString(); // e.g., "Wed, 21 Oct 2015 07:28:00 GMT"

      const result = parseRetryAfter(httpDate);
      expect(result).toBeDefined();
      expect(result).toBeGreaterThanOrEqual(59);
      expect(result).toBeLessThanOrEqual(61);
    });
  });

  describe("null and invalid input", () => {
    it("should return undefined for null", () => {
      expect(parseRetryAfter(null)).toBeUndefined();
    });

    it("should return undefined for invalid date strings", () => {
      expect(parseRetryAfter("not-a-date")).toBeUndefined();
      expect(parseRetryAfter("2024-13-45")).toBeUndefined();
    });
  });

  describe("integration with rate limit error", () => {
    it("should handle HTTP-date Retry-After header in 429 response", async () => {
      const localMockFetch = vi.fn();
      global.fetch = localMockFetch;
      const client = new LumaClient({ apiKey: "test-key" });
      const futureDate = new Date(Date.now() + 30000);

      localMockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({
          "content-type": "application/json",
          "retry-after": futureDate.toUTCString(),
        }),
        text: async () => JSON.stringify({ message: "Rate limit exceeded" }),
      });

      try {
        await client.user.getSelf();
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(LumaRateLimitError);
        if (error instanceof LumaRateLimitError) {
          expect(error.retryAfter).toBeDefined();
          expect(error.retryAfter).toBeGreaterThanOrEqual(29);
          expect(error.retryAfter).toBeLessThanOrEqual(31);
        }
      }
    });

    it("should handle missing Retry-After header", async () => {
      const localMockFetch = vi.fn();
      global.fetch = localMockFetch;
      const client = new LumaClient({ apiKey: "test-key" });

      localMockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({
          "content-type": "application/json",
        }),
        text: async () => JSON.stringify({ message: "Rate limit exceeded" }),
      });

      try {
        await client.user.getSelf();
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(LumaRateLimitError);
        if (error instanceof LumaRateLimitError) {
          expect(error.retryAfter).toBeUndefined();
        }
      }
    });

    it("should handle invalid Retry-After header", async () => {
      const localMockFetch = vi.fn();
      global.fetch = localMockFetch;
      const client = new LumaClient({ apiKey: "test-key" });

      localMockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({
          "content-type": "application/json",
          "retry-after": "invalid-value",
        }),
        text: async () => JSON.stringify({ message: "Rate limit exceeded" }),
      });

      try {
        await client.user.getSelf();
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(LumaRateLimitError);
        if (error instanceof LumaRateLimitError) {
          expect(error.retryAfter).toBeUndefined();
        }
      }
    });
  });
});