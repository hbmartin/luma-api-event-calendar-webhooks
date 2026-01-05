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

export interface DebugResponseBase {
  status: number
  headers: Record<string, string>
  body: unknown
}

export interface DebugResponse extends DebugResponseBase {
  ok: boolean
}

export interface DebugSuccessResponse extends DebugResponse {
  ok: true
}

export interface DebugHttpErrorResponse extends DebugResponse {
  ok: false
}

export interface DebugSuccessOutcome {
  type: 'success'
  response: DebugSuccessResponse
}

export interface DebugHttpErrorOutcome {
  type: 'http-error'
  response: DebugHttpErrorResponse
}

export interface DebugNetworkErrorOutcome {
  type: 'network-error'
  error: LumaNetworkError
}

export type DebugOutcome = DebugSuccessOutcome | DebugHttpErrorOutcome | DebugNetworkErrorOutcome

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

const isHeadersInstance = (headers: HeadersInit): headers is Headers => headers instanceof Headers

const isHeadersArray = (headers: HeadersInit): headers is Array<[string, string]> =>
  Array.isArray(headers)

const recordFromHeadersInstance = (headers: Headers): Record<string, string> =>
  Object.fromEntries(headers)

const recordFromHeadersArray = (headers: Array<[string, string]>): Record<string, string> => {
  const record: Record<string, string> = {}
  for (const [key, value] of headers) {
    record[key] = value
  }
  return record
}

const recordFromHeadersRecord = (headers: Record<string, string>): Record<string, string> => ({
  ...headers,
})

const headersToRecord = (headers: HeadersInit): Record<string, string> =>
  isHeadersInstance(headers)
    ? recordFromHeadersInstance(headers)
    : isHeadersArray(headers)
      ? recordFromHeadersArray(headers)
      : recordFromHeadersRecord(headers)

const headersInitToRecord = (headers: HeadersInit | undefined): Record<string, string> =>
  headers === undefined ? {} : headersToRecord(headers)

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
  const numericValue = Number.parseInt(trimmed, 10)
  if (!isNumericRetryAfter(trimmed) || !Number.isFinite(numericValue)) {
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

const isJsonContentType = (contentType: string | null): boolean =>
  contentType !== null && JSON_CONTENT_TYPE_PATTERN.test(contentType)

interface ParsePayloadByContentTypeParams {
  text: string
  contentType: string | null
}

const parsePayloadByContentType = ({
  text,
  contentType,
}: ParsePayloadByContentTypeParams): unknown =>
  isJsonContentType(contentType) ? parseJsonSafe(text) : text

interface ParseResponseTextParams {
  text: string
  contentType: string | null
}

const parseResponseText = ({ text, contentType }: ParseResponseTextParams): unknown => {
  if (text.length === 0) {
    return null
  }

  return parsePayloadByContentType({ text, contentType })
}

const parseResponsePayload = async (response: Response): Promise<unknown> => {
  const text = await response.text()
  return parseResponseText({
    text,
    contentType: response.headers.get('content-type'),
  })
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

interface BuildDebugRequestParams {
  method: RequestOptions['method']
  url: string
  headers: HeadersInit | undefined
  body?: unknown
}

const buildDebugRequest = ({
  method,
  url,
  headers,
  body,
}: BuildDebugRequestParams): DebugRequest => ({
  method,
  url,
  headers: headersInitToRecord(headers),
  ...(body !== undefined && { body }),
})

interface DebugResponseContextParams {
  request: DebugRequest
  response: Response
  data: unknown
  durationMs: number
}

const buildDebugResponseContext = ({
  request,
  response,
  data,
  durationMs,
}: DebugResponseContextParams): DebugContext => ({
  request,
  outcome: response.ok
    ? {
        type: 'success',
        response: {
          status: response.status,
          headers: Object.fromEntries(response.headers),
          body: data,
          ok: true,
        },
      }
    : {
        type: 'http-error',
        response: {
          status: response.status,
          headers: Object.fromEntries(response.headers),
          body: data,
          ok: false,
        },
      },
  durationMs,
})

interface DebugNetworkErrorContextParams {
  request: DebugRequest
  error: LumaNetworkError
  durationMs: number
}

const buildDebugNetworkErrorContext = ({
  request,
  error,
  durationMs,
}: DebugNetworkErrorContextParams): DebugContext => ({
  request,
  outcome: {
    type: 'network-error',
    error,
  },
  durationMs,
})

const logDebugHookError = (error: unknown): void => {
  console.error('Luma debug hook error', error)
}

const invokeDebug = (debug: DebugHook, context: DebugContext): void => {
  try {
    debug(context)
  } catch (error: unknown) {
    logDebugHookError(error)
  }
}

const safelyInvokeDebug = (debug: DebugHook | undefined, context: DebugContext): void => {
  if (debug === undefined) {
    return
  }

  invokeDebug(debug, context)
}

interface ExecuteRequestParams<T> {
  url: string
  init: RequestInit
  timeoutMs: number
  schema: ZodType<T>
  debugRequest: DebugRequest
  debug?: DebugHook
  startTimeMs: number
}

const executeRequest = async <T>({
  url,
  init,
  timeoutMs,
  schema,
  debugRequest,
  debug,
  startTimeMs,
}: ExecuteRequestParams<T>): Promise<T> =>
  withTimeout(timeoutMs, async (signal) => {
    const response = await fetch(url, { ...init, signal })
    const data = await parseResponsePayload(response)

    safelyInvokeDebug(
      debug,
      buildDebugResponseContext({
        request: debugRequest,
        response,
        data,
        durationMs: Date.now() - startTimeMs,
      })
    )

    if (response.ok) {
      return parseSchemaResult(schema, data)
    }

    return throwForResponseStatus(response, data)
  })

interface HandleRequestErrorParams {
  error: unknown
  timeoutMs: number
  debugRequest: DebugRequest
  debug?: DebugHook
  startTimeMs: number
}

const handleRequestError = ({
  error,
  timeoutMs,
  debugRequest,
  debug,
  startTimeMs,
}: HandleRequestErrorParams): never => {
  const mappedError = mapRequestError(error, timeoutMs)

  // Only call debug for actual network/timeout errors, not HTTP errors.
  // (HTTP errors already triggered a debug call with the response.)
  if (mappedError instanceof LumaNetworkError) {
    safelyInvokeDebug(
      debug,
      buildDebugNetworkErrorContext({
        request: debugRequest,
        error: mappedError,
        durationMs: Date.now() - startTimeMs,
      })
    )
  }

  throw mappedError
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

    const debugRequest = buildDebugRequest({
      method,
      url,
      headers: init.headers,
      body,
    })

    const startTimeMs = Date.now()

    try {
      return await executeRequest({
        url,
        init,
        timeoutMs: config.timeout,
        schema,
        debugRequest,
        debug: config.debug,
        startTimeMs,
      })
    } catch (error: unknown) {
      return handleRequestError({
        error,
        timeoutMs: config.timeout,
        debugRequest,
        debug: config.debug,
        startTimeMs,
      })
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
