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

export interface DebugRequest {
  method: RequestOptions['method']
  url: string
  headers: Record<string, string>
  body?: unknown
}

export interface DebugResponse {
  status: number
  ok: boolean
  headers: Record<string, string>
  body: unknown
}

export type DebugOutcome =
  | { type: 'success'; response: DebugResponse }
  | { type: 'error'; error: Error }

export interface DebugContext {
  request: DebugRequest
  outcome: DebugOutcome
  durationMs: number
}

export type DebugHook = (context: DebugContext) => void

export interface FetcherOptions {
  apiKey: string
  baseUrl?: string
  timeout?: number
  debug?: DebugHook
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  query?: QueryParams
  body?: unknown
}

export interface FetcherConfig {
  apiKey: string
  baseUrl: string
  timeout: number
  debug?: DebugHook
}

interface ErrorPayload {
  message: unknown
}

export type QueryValue = string | number | boolean | undefined

export interface QueryParams {
  [key: string]: QueryValue
}

const hasMessage = (value: unknown): value is ErrorPayload => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  return 'message' in value
}

const headersToRecord = (headers: Headers): Record<string, string> => {
  const record: Record<string, string> = {}
  headers.forEach((value, key) => {
    record[key] = value
  })
  return record
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

const getTrimmedHeader = (header: string | null): string | undefined => {
  if (header === null) {
    return undefined
  }

  const trimmed = header.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const isNumericRetryAfter = (value: string): boolean => /^\d+$/.test(value)

const isNegativeNumber = (value: string): boolean => /^-\d+$/.test(value)

const parseNumericRetryAfter = (value: string): number | undefined => {
  const trimmed = value.trim()

  if (!isNumericRetryAfter(trimmed)) {
    return undefined
  }

  const numericValue = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(numericValue)) {
    return undefined
  }

  return numericValue
}

const parseDateRetryAfter = (value: string, nowMs: number): number | undefined => {
  const dateValue = Date.parse(value)
  if (!Number.isFinite(dateValue)) {
    return undefined
  }

  const delayMs = dateValue - nowMs
  const delaySeconds = Math.ceil(delayMs / 1000)
  return Math.max(delaySeconds, 0)
}

const setQueryParam = (url: URL, key: string, value: QueryValue): void => {
  if (value === undefined) {
    return
  }

  url.searchParams.set(normalizeQueryKey(key), String(value))
}

const applyQueryParams = (url: URL, query: QueryParams): void => {
  for (const [key, value] of Object.entries(query)) {
    setQueryParam(url, key, value)
  }
}

const parseJsonSafe = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const JSON_CONTENT_TYPE_PATTERN = /application\/(?:json|[^;]*\+json)/

const parseResponsePayload = async (response: Response): Promise<unknown> => {
  const text = await response.text()

  if (text.length === 0) {
    return null
  }

  const contentType = response.headers.get('content-type')

  if (contentType !== null && JSON_CONTENT_TYPE_PATTERN.test(contentType)) {
    return parseJsonSafe(text)
  }

  return text
}

const parseSchemaResult = <T>(schema: ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new LumaValidationError(result.error)
  }

  return result.data
}

const getResponseMessage = (data: unknown, status: number): string => {
  if (hasMessage(data)) {
    return String(data.message)
  }

  return `Request failed with status ${status}`
}

const throwForResponseStatus = (response: Response, data: unknown): never => {
  const message = getResponseMessage(data, response.status)

  switch (response.status) {
    case 401: {
      throw new LumaAuthenticationError(message, data)
    }
    case 404: {
      throw new LumaNotFoundError(message, data)
    }
    case 429: {
      const retryAfter = parseRetryAfter(response.headers.get('retry-after'))
      throw new LumaRateLimitError(message, retryAfter, data)
    }
    default: {
      throw new LumaApiError(message, response.status, data)
    }
  }
}

interface BuildRequestInitOptions {
  method: RequestOptions['method']
  body: RequestOptions['body']
}

const formatRequestBody = (body: unknown): string | undefined => {
  if (body === undefined) {
    return undefined
  }

  return JSON.stringify(body)
}

const buildRequestInit = (apiKey: string, options: BuildRequestInitOptions): RequestInit => {
  const headers: HeadersInit = {
    'x-luma-api-key': apiKey,
    ...(options.body !== undefined && { 'Content-Type': 'application/json' }),
  }

  return {
    method: options.method,
    headers,
    body: formatRequestBody(options.body),
  }
}

const withTimeout = async <T>(
  timeoutMs: number,
  execute: (signal: AbortSignal) => Promise<T>
): Promise<T> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await execute(controller.signal)
  } finally {
    clearTimeout(timeoutId)
  }
}

const mapRequestError = (error: unknown, timeoutMs: number): LumaError =>
  error instanceof LumaError
    ? error
    : error instanceof Error
      ? error.name === 'AbortError'
        ? new LumaNetworkError(`Request timed out after ${timeoutMs}ms`, error)
        : new LumaNetworkError(error.message, error)
      : new LumaNetworkError('An unknown error occurred', error)

/**
 * Parses a Retry-After header value, supporting both numeric seconds and HTTP-date formats.
 * @param header - The Retry-After header value
 * @returns The number of seconds to wait, or undefined if the header is invalid
 */
export function parseRetryAfter(header: string | null): number | undefined {
  const trimmed = getTrimmedHeader(header)

  if (trimmed === undefined || isNegativeNumber(trimmed)) {
    return undefined
  }

  return isNumericRetryAfter(trimmed)
    ? parseNumericRetryAfter(trimmed)
    : parseDateRetryAfter(trimmed, Date.now())
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const url = new URL(path, baseUrl)
  if (query !== undefined) {
    applyQueryParams(url, query)
  }
  return url.toString()
}

export function createFetcher(options: FetcherOptions) {
  const config: FetcherConfig = {
    apiKey: options.apiKey,
    baseUrl: options.baseUrl ?? BASE_URL,
    timeout: options.timeout ?? 30_000,
    debug: options.debug,
  }

  async function request<T>(requestOptions: RequestOptions, schema: ZodType<T>): Promise<T> {
    const { method, path, query, body } = requestOptions
    const url = buildUrl(config.baseUrl, path, query)
    const init = buildRequestInit(config.apiKey, { method, body })

    const debugRequest: DebugRequest = {
      method,
      url,
      headers: init.headers as Record<string, string>,
      ...(body !== undefined && { body }),
    }

    const startTime = Date.now()

    try {
      return await withTimeout(config.timeout, async (signal) => {
        const response = await fetch(url, { ...init, signal })
        const data = await parseResponsePayload(response)

        config.debug?.({
          request: debugRequest,
          outcome: {
            type: 'success',
            response: {
              status: response.status,
              ok: response.ok,
              headers: headersToRecord(response.headers),
              body: data,
            },
          },
          durationMs: Date.now() - startTime,
        })

        if (response.ok) {
          return parseSchemaResult(schema, data)
        }

        return throwForResponseStatus(response, data)
      })
    } catch (error: unknown) {
      const mappedError = mapRequestError(error, config.timeout)

      // Only call debug for actual network/timeout errors, not API errors
      // (API errors already triggered a debug call with the response)
      if (mappedError instanceof LumaNetworkError) {
        config.debug?.({
          request: debugRequest,
          outcome: {
            type: 'error',
            error: mappedError,
          },
          durationMs: Date.now() - startTime,
        })
      }

      throw mappedError
    }
  }

  async function get<T>(
    path: string,
    query: QueryParams | undefined,
    schema: ZodType<T>
  ): Promise<T> {
    return request({ method: 'GET', path, query }, schema)
  }

  async function post<T>(path: string, body: unknown, schema: ZodType<T>): Promise<T> {
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
