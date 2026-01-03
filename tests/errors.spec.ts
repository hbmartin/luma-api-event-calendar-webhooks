import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  LumaError,
  LumaValidationError,
  LumaApiError,
  LumaNetworkError,
  LumaRateLimitError,
  LumaAuthenticationError,
  LumaNotFoundError,
} from "../src/errors.js";

describe("LumaError", () => {
  it("should create base error with message", () => {
    const error = new LumaError("Test error");
    expect(error.message).toBe("Test error");
    expect(error.name).toBe("LumaError");
    expect(error instanceof Error).toBe(true);
  });
});

describe("LumaValidationError", () => {
  it("should create validation error from ZodError", () => {
    const zodError = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["field"],
        message: "Expected string, received number",
      },
    ]);

    const error = new LumaValidationError(zodError);
    expect(error.name).toBe("LumaValidationError");
    expect(error.issues).toEqual(zodError.issues);
    expect(error.message).toContain("Validation failed");
    expect(error instanceof LumaError).toBe(true);
  });

  it("should include field path in message", () => {
    const zodError = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["user", "email"],
        message: "Required",
      },
    ]);

    const error = new LumaValidationError(zodError);
    expect(error.message).toContain("user.email");
  });
});

describe("LumaApiError", () => {
  it("should create API error with status code", () => {
    const error = new LumaApiError("Bad request", 400);
    expect(error.message).toBe("Bad request");
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("LumaApiError");
    expect(error instanceof LumaError).toBe(true);
  });

  it("should include response data", () => {
    const responseData = { error: "Invalid input", details: { field: "name" } };
    const error = new LumaApiError("Bad request", 400, responseData);
    expect(error.response).toEqual(responseData);
  });

  it("should handle undefined response data", () => {
    const error = new LumaApiError("Server error", 500);
    expect(error.response).toBeUndefined();
  });
});

describe("LumaNetworkError", () => {
  it("should create network error with message", () => {
    const error = new LumaNetworkError("Connection refused");
    expect(error.message).toBe("Connection refused");
    expect(error.name).toBe("LumaNetworkError");
    expect(error instanceof LumaError).toBe(true);
  });

  it("should include original error cause", () => {
    const originalError = new Error("ECONNREFUSED");
    const error = new LumaNetworkError("Connection refused", originalError);
    expect(error.cause).toBe(originalError);
  });
});

describe("LumaRateLimitError", () => {
  it("should create rate limit error", () => {
    const error = new LumaRateLimitError("Rate limit exceeded");
    expect(error.message).toBe("Rate limit exceeded");
    expect(error.name).toBe("LumaRateLimitError");
    expect(error.statusCode).toBe(429);
    expect(error instanceof LumaApiError).toBe(true);
  });

  it("should include retry-after value", () => {
    const error = new LumaRateLimitError("Rate limit exceeded", 60);
    expect(error.retryAfter).toBe(60);
  });

  it("should handle undefined retry-after", () => {
    const error = new LumaRateLimitError("Rate limit exceeded");
    expect(error.retryAfter).toBeUndefined();
  });

  it("should include response data", () => {
    const responseData = { message: "Too many requests" };
    const error = new LumaRateLimitError("Rate limit exceeded", 30, responseData);
    expect(error.response).toEqual(responseData);
    expect(error.retryAfter).toBe(30);
  });
});

describe("LumaAuthenticationError", () => {
  it("should create authentication error", () => {
    const error = new LumaAuthenticationError("Invalid API key");
    expect(error.message).toBe("Invalid API key");
    expect(error.name).toBe("LumaAuthenticationError");
    expect(error.statusCode).toBe(401);
    expect(error instanceof LumaApiError).toBe(true);
  });

  it("should include response data", () => {
    const responseData = { error: "Unauthorized" };
    const error = new LumaAuthenticationError("Invalid API key", responseData);
    expect(error.response).toEqual(responseData);
  });
});

describe("LumaNotFoundError", () => {
  it("should create not found error", () => {
    const error = new LumaNotFoundError("Event not found");
    expect(error.message).toBe("Event not found");
    expect(error.name).toBe("LumaNotFoundError");
    expect(error.statusCode).toBe(404);
    expect(error instanceof LumaApiError).toBe(true);
  });

  it("should include response data", () => {
    const responseData = { error: "Resource not found" };
    const error = new LumaNotFoundError("Event not found", responseData);
    expect(error.response).toEqual(responseData);
  });
});

describe("Error hierarchy", () => {
  it("should maintain proper inheritance chain", () => {
    const validationError = new LumaValidationError(
      new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          path: [],
          message: "test",
        },
      ])
    );
    const apiError = new LumaApiError("test", 400);
    const networkError = new LumaNetworkError("test");
    const rateLimitError = new LumaRateLimitError("test");
    const authError = new LumaAuthenticationError("test");
    const notFoundError = new LumaNotFoundError("test");

    // All should be instances of Error
    expect(validationError instanceof Error).toBe(true);
    expect(apiError instanceof Error).toBe(true);
    expect(networkError instanceof Error).toBe(true);
    expect(rateLimitError instanceof Error).toBe(true);
    expect(authError instanceof Error).toBe(true);
    expect(notFoundError instanceof Error).toBe(true);

    // All should be instances of LumaError
    expect(validationError instanceof LumaError).toBe(true);
    expect(apiError instanceof LumaError).toBe(true);
    expect(networkError instanceof LumaError).toBe(true);
    expect(rateLimitError instanceof LumaError).toBe(true);
    expect(authError instanceof LumaError).toBe(true);
    expect(notFoundError instanceof LumaError).toBe(true);

    // Specific inheritance
    expect(rateLimitError instanceof LumaApiError).toBe(true);
    expect(authError instanceof LumaApiError).toBe(true);
    expect(notFoundError instanceof LumaApiError).toBe(true);
  });

  it("should be catchable by type", () => {
    const errors = [
      new LumaValidationError(
        new ZodError([
          {
            code: "invalid_type",
            expected: "string",
            received: "number",
            path: [],
            message: "test",
          },
        ])
      ),
      new LumaApiError("test", 400),
      new LumaNetworkError("test"),
      new LumaRateLimitError("test"),
      new LumaAuthenticationError("test"),
      new LumaNotFoundError("test"),
    ];

    let caughtCount = 0;
    for (const error of errors) {
      try {
        throw error;
      } catch (e) {
        if (e instanceof LumaError) {
          caughtCount++;
        }
      }
    }

    expect(caughtCount).toBe(6);
  });
});
