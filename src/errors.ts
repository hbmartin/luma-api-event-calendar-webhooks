import type { ZodError, ZodIssue } from 'zod'

export interface LumaErrorDetails {
  message: string
  statusCode?: number
  code?: string
  issues?: ZodIssue[]
  requestId?: string
}

export interface LumaErrorOptions extends ErrorOptions {
  requestId?: string
}

export class LumaError extends Error {
  public readonly statusCode?: number
  public readonly code?: string
  public readonly requestId?: string

  constructor(message: string, statusCode?: number, code?: string, options?: LumaErrorOptions) {
    super(message, options)
    this.name = 'LumaError'
    this.statusCode = statusCode
    this.code = code
    this.requestId = options?.requestId
    Object.setPrototypeOf(this, LumaError.prototype)
  }
}

export class LumaValidationError extends LumaError {
  public readonly issues: ZodIssue[]

  constructor(zodError: ZodError, requestId?: string) {
    const message = LumaValidationError.formatZodError(zodError)
    super(message, undefined, 'VALIDATION_ERROR', { requestId })
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

  constructor(message: string, statusCode: number, response?: unknown, requestId?: string) {
    super(message, statusCode, 'API_ERROR', { requestId })
    this.name = 'LumaApiError'
    this.response = response
    Object.setPrototypeOf(this, LumaApiError.prototype)
  }
}

export class LumaNetworkError extends LumaError {
  constructor(message: string, cause?: unknown, requestId?: string) {
    super(message, undefined, 'NETWORK_ERROR', { cause, requestId })
    this.name = 'LumaNetworkError'
    Object.setPrototypeOf(this, LumaNetworkError.prototype)
  }
}

export class LumaRateLimitError extends LumaApiError {
  public readonly retryAfter?: number

  constructor(message: string, retryAfter?: number, response?: unknown, requestId?: string) {
    super(message, 429, response, requestId)
    this.name = 'LumaRateLimitError'
    this.retryAfter = retryAfter
    Object.setPrototypeOf(this, LumaRateLimitError.prototype)
  }
}

export class LumaAuthenticationError extends LumaApiError {
  constructor(message: string, response?: unknown, requestId?: string) {
    super(message, 401, response, requestId)
    this.name = 'LumaAuthenticationError'
    Object.setPrototypeOf(this, LumaAuthenticationError.prototype)
  }
}

export class LumaNotFoundError extends LumaApiError {
  constructor(message: string, response?: unknown, requestId?: string) {
    super(message, 404, response, requestId)
    this.name = 'LumaNotFoundError'
    Object.setPrototypeOf(this, LumaNotFoundError.prototype)
  }
}
