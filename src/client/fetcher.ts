import type { ZodType } from 'zod'
import {
  LumaError,
  LumaApiError,
  LumaAuthenticationError,
  LumaNetworkError,
  LumaNotFoundError,
  LumaRateLimitError,
  LumaValidationError,
} from '../errors.js'

export const BASE_URL = 'https://public-api.luma.com'

export interface FetcherOptions {
  apiKey: string
  baseUrl?: string
  timeout?: number
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
}

export interface FetcherConfig {
  apiKey: string
  baseUrl: string
  timeout: number
}

interface ErrorPayload {
  message: unknown
}

const hasMessage = (value: unknown): value is ErrorPayload => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  return 'message' in value
}

const normalizeQueryKey = (key: string): string => {
  if (key === 'cursor') {
    return 'pagination_cursor'
  }
  if (key === 'limit') {
    return 'pagination_limit'
  }
  return key
}

/**
 * Parses a Retry-After header value, supporting both numeric seconds and HTTP-date formats.
 * @param header - The Retry-After header value
 * @returns The number of seconds to wait, or undefined if the header is invalid
 */
export function parseRetryAfter(header: string | null): number | undefined {
  if (!header) {
    return undefined
  }

  const trimmed = header.trim()

  // Check if it looks like a numeric value (digits only, optionally with leading sign)
  if (/^-?\d+$/.test(trimmed)) {
    const numericValue = parseInt(trimmed, 10)
    if (Number.isFinite(numericValue) && numericValue >= 0) {
      return numericValue
    }
    // Negative numbers are invalid for Retry-After
    return undefined
  }

  // Try parsing as HTTP-date (e.g., "Wed, 21 Oct 2015 07:28:00 GMT")
  const dateValue = Date.parse(header)
  if (Number.isFinite(dateValue)) {
    const delayMs = dateValue - Date.now()
    const delaySeconds = Math.ceil(delayMs / 1000)
    return delaySeconds > 0 ? delaySeconds : 0
  }

  return undefined
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(path, baseUrl)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(normalizeQueryKey(key), String(value))
      }
    }
  }
  return url.toString()
}

async function handleResponse<T>(response: Response, schema: ZodType<T>): Promise<T> {
  let data: unknown

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const message = hasMessage(data)
      ? String(data.message)
      : `Request failed with status ${response.status}`

    switch (response.status) {
      case 401:
        throw new LumaAuthenticationError(message, data)
      case 404:
        throw new LumaNotFoundError(message, data)
      case 429: {
        const retryAfter = parseRetryAfter(response.headers.get('retry-after'))
        throw new LumaRateLimitError(message, retryAfter, data)
      }
      default:
        throw new LumaApiError(message, response.status, data)
    }
  }

  const result = schema.safeParse(data)
  if (!result.success) {
    throw new LumaValidationError(result.error)
  }
  return result.data
}

export function createFetcher(options: FetcherOptions) {
  const config: FetcherConfig = {
    apiKey: options.apiKey,
    baseUrl: options.baseUrl ?? BASE_URL,
    timeout: options.timeout ?? 30000,
  }

  async function request<T>(requestOptions: RequestOptions, schema: ZodType<T>): Promise<T> {
    const { method, path, query, body } = requestOptions
    const url = buildUrl(config.baseUrl, path, query)

    const headers: HeadersInit = {
      'x-luma-api-key': config.apiKey,
      'Content-Type': 'application/json',
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      return await handleResponse(response, schema)
    } catch (error) {
      if (error instanceof LumaError) {
        throw error
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new LumaNetworkError(`Request timed out after ${config.timeout}ms`, error)
        }
        throw new LumaNetworkError(error.message, error)
      }
      throw new LumaNetworkError('An unknown error occurred')
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async function get<T>(
    path: string,
    query: Record<string, string | number | boolean | undefined> | undefined,
    schema: ZodType<T>
  ): Promise<T> {
    return request({ method: 'GET', path, query }, schema)
  }

  async function post<T>(path: string, body: unknown | undefined, schema: ZodType<T>): Promise<T> {
    return request({ method: 'POST', path, body }, schema)
  }

  return {
    request,
    get,
    post,
    config,
  }
}

export type Fetcher = ReturnType<typeof createFetcher>
