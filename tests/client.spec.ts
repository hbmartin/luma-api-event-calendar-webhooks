import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LumaClient, BASE_URL, parseRetryAfter, LumaError, LumaRateLimitError, LumaApiError, LumaNetworkError, LumaAuthenticationError, LumaNotFoundError, LumaValidationError } from "../src/index.js";

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
        json: async () => mockResponse,
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
        json: async () => mockEvent,
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
        json: async () => mockResponse,
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
        json: async () => mockResponse,
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
        json: async () => mockResponse,
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
        json: async () => ({ message: "Invalid API key" }),
      });

      await expect(client.user.getSelf()).rejects.toThrow(LumaAuthenticationError);
    });

    it("should throw LumaNotFoundError on 404", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Event not found" }),
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
        json: async () => ({ message: "Rate limit exceeded" }),
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
        json: async () => ({ message: "Internal server error" }),
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
        json: async () => ({ user: {} }),
      });

      await expect(client.user.getSelf()).rejects.toThrow(LumaValidationError);
    });
  });

  describe("query parameters", () => {
    it("should handle undefined query parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
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
        json: async () => ({
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
        json: async () => ({ user: { api_id: "user-123" } }),
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

    it("should include content-type header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ user: { api_id: "user-123" } }),
      });

      await client.user.getSelf();

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
        json: async () => ({ message: "Rate limit exceeded" }),
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
        json: async () => ({ message: "Rate limit exceeded" }),
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
        json: async () => ({ message: "Rate limit exceeded" }),
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