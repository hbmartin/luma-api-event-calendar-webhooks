import type { ZodError, ZodIssue } from 'zod'

export interface LumaErrorDetails {
  message: string
  statusCode?: number
  code?: string
  issues?: ZodIssue[]
}

export class LumaError extends Error {
  public readonly statusCode?: number
  public readonly code?: string

  constructor(message: string, statusCode?: number, code?: string) {
    super(message)
    this.name = 'LumaError'
    this.statusCode = statusCode
    this.code = code
    Object.setPrototypeOf(this, LumaError.prototype)
  }
}

export class LumaValidationError extends LumaError {
  public readonly issues: ZodIssue[]

  constructor(zodError: ZodError) {
    const message = LumaValidationError.formatZodError(zodError)
    super(message, undefined, 'VALIDATION_ERROR')
    this.name = 'LumaValidationError'
    this.issues = zodError.issues
    Object.setPrototypeOf(this, LumaValidationError.prototype)
  }

  private static formatZodError(error: ZodError): string {
    const messages = error.issues.map((issue) => {
      const path = issue.path.join('.')
      return path ? `${path}: ${issue.message}` : issue.message
    })
    return `Validation failed: ${messages.join('; ')}`
  }
}

export class LumaApiError extends LumaError {
  public readonly response?: unknown

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message, statusCode, 'API_ERROR')
    this.name = 'LumaApiError'
    this.response = response
    Object.setPrototypeOf(this, LumaApiError.prototype)
  }
}

export class LumaNetworkError extends LumaError {
  public readonly cause?: Error

  constructor(message: string, cause?: Error) {
    super(message, undefined, 'NETWORK_ERROR')
    this.name = 'LumaNetworkError'
    this.cause = cause
    Object.setPrototypeOf(this, LumaNetworkError.prototype)
  }
}

export class LumaRateLimitError extends LumaApiError {
  public readonly retryAfter?: number

  constructor(message: string, retryAfter?: number, response?: unknown) {
    super(message, 429, response)
    this.name = 'LumaRateLimitError'
    this.retryAfter = retryAfter
    Object.setPrototypeOf(this, LumaRateLimitError.prototype)
  }
}

export class LumaAuthenticationError extends LumaApiError {
  constructor(message: string, response?: unknown) {
    super(message, 401, response)
    this.name = 'LumaAuthenticationError'
    Object.setPrototypeOf(this, LumaAuthenticationError.prototype)
  }
}

export class LumaNotFoundError extends LumaApiError {
  constructor(message: string, response?: unknown) {
    super(message, 404, response)
    this.name = 'LumaNotFoundError'
    Object.setPrototypeOf(this, LumaNotFoundError.prototype)
  }
}
