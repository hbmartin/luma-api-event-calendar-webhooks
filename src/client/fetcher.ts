import type { RetryConfig, RetryOptions } from './retry.js'
import type { ZodType } from 'zod'
import { computeRetryDelayMs, resolveRetryConfig, waitBeforeRetry } from './retry.js'
import {
  LumaError,
  LumaAbortError,
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
  requestId: string
  /** Zero-based index of this attempt. 0 is the initial try; 1+ are retries. */
  attempt: number
  request: DebugRequest
  outcome: DebugOutcome
  durationMs: number
}

export type DebugHook = (context: DebugContext) => void | Promise<void>

/** Context passed to the retry hook before each backoff wait. */
export interface RetryContext {
  requestId: string
  request: DebugRequest
  /** Zero-based index of the attempt that just failed and is being retried. */
  attempt: number
  /** Delay in milliseconds the client will wait before the next attempt. */
  delayMs: number
  /** The (retryable) error that triggered this retry. */
  error: LumaError
}

/**
 * Called once per scheduled retry, after the client decides to retry and
 * before it waits out the backoff. Useful for logging or metrics on how often
 * requests are being retried and how long the client is backing off.
 */
export type RetryHook = (context: RetryContext) => void | Promise<void>

/**
 * Minimal fetch signature the client relies on. Compatible with the global
 * fetch in Node.js >= 22, Deno, Bun, browsers, and edge runtimes.
 */
export type FetchImplementation = (input: string | URL, init?: RequestInit) => Promise<Response>

export interface FetcherOptions {
  apiKey: string
  baseUrl?: string
  timeout?: number
  debug?: DebugHook
  /**
   * Custom fetch implementation, useful for proxies, instrumentation, and
   * tests. Defaults to the global fetch.
   */
  fetch?: FetchImplementation
  /** Opt-in retry policy. Requests are never retried when omitted. */
  retry?: RetryOptions
  /** Invoked before each retry backoff, for logging/metrics on retries. */
  onRetry?: RetryHook
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  query?: QueryParams
  body?: unknown
  /**
   * Caller-supplied cancellation signal, combined with the client timeout via
   * AbortSignal.any(). Aborting rejects the request with a LumaAbortError.
   */
  signal?: AbortSignal
}

/** Per-request options accepted by every resource method. */
export interface PerRequestOptions {
  /**
   * Cancels the request when aborted. Combined with the client timeout via
   * AbortSignal.any(); aborting rejects with a LumaAbortError.
   */
  signal?: AbortSignal
}

export interface FetcherConfig {
  apiKey: string
  baseUrl: string
  timeout: number
  debug?: DebugHook
  fetchImplementation: FetchImplementation
  retry?: RetryConfig
  onRetry?: RetryHook
}

interface ErrorPayload {
  message: unknown
}

export type QueryPrimitive = string | number | boolean

export type QueryValue = QueryPrimitive | readonly QueryPrimitive[] | undefined

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

const appendArrayQueryParam = (url: URL, key: string, values: readonly QueryPrimitive[]): void => {
  for (const value of values) {
    url.searchParams.append(key, String(value))
  }
}

const setDefinedQueryParam = (
  url: URL,
  key: string,
  value: QueryPrimitive | readonly QueryPrimitive[]
): void => {
  if (Array.isArray(value)) {
    appendArrayQueryParam(url, key, value)
  } else {
    url.searchParams.set(key, String(value))
  }
}

const setQueryParam = (url: URL, key: string, value: QueryValue): void => {
  if (value !== undefined) {
    setDefinedQueryParam(url, normalizeQueryKey(key), value)
  }
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

const parseSchemaResult = <T>(schema: ZodType<T>, data: unknown, requestId: string): T => {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new LumaValidationError(result.error, requestId)
  }

  return result.data
}

const getResponseMessage = (data: unknown, status: number): string => {
  if (hasMessage(data)) {
    return String(data.message)
  }

  return `Request failed with status ${status}`
}

const throwForResponseStatus = (response: Response, data: unknown, requestId: string): never => {
  const message = getResponseMessage(data, response.status)

  switch (response.status) {
    case 401: {
      throw new LumaAuthenticationError(message, data, requestId)
    }
    case 404: {
      throw new LumaNotFoundError(message, data, requestId)
    }
    case 429: {
      const retryAfter = parseRetryAfter(response.headers.get('retry-after'))
      throw new LumaRateLimitError(message, retryAfter, data, requestId)
    }
    default: {
      throw new LumaApiError(message, response.status, data, requestId)
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

interface WithTimeoutParams {
  timeoutMs: number
  signal?: AbortSignal
}

const combineWithTimeoutSignal = (
  timeoutSignal: AbortSignal,
  signal: AbortSignal | undefined
): AbortSignal => (signal === undefined ? timeoutSignal : AbortSignal.any([timeoutSignal, signal]))

const withTimeout = async <T>(
  { timeoutMs, signal }: WithTimeoutParams,
  execute: (signal: AbortSignal) => Promise<T>
): Promise<T> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await execute(combineWithTimeoutSignal(controller.signal, signal))
  } finally {
    clearTimeout(timeoutId)
  }
}

interface MapRequestErrorParams {
  error: unknown
  timeoutMs: number
  requestId: string
  signal?: AbortSignal
}

const isAbortLikeError = (error: unknown): boolean =>
  error instanceof Error && error.name === 'AbortError'

const mapRequestError = ({
  error,
  timeoutMs,
  requestId,
  signal,
}: MapRequestErrorParams): LumaError =>
  error instanceof LumaError
    ? error
    : signal?.aborted === true
      ? new LumaAbortError(signal.reason, requestId)
      : isAbortLikeError(error)
        ? new LumaNetworkError(`Request timed out after ${timeoutMs}ms`, error, requestId)
        : error instanceof Error
          ? new LumaNetworkError(error.message, error, requestId)
          : new LumaNetworkError('An unknown error occurred', error, requestId)

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
  requestId: string
  attempt: number
  request: DebugRequest
  response: Response
  data: unknown
  durationMs: number
}

const buildDebugResponseContext = ({
  requestId,
  attempt,
  request,
  response,
  data,
  durationMs,
}: DebugResponseContextParams): DebugContext => ({
  requestId,
  attempt,
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
  requestId: string
  attempt: number
  request: DebugRequest
  error: LumaNetworkError
  durationMs: number
}

const buildDebugNetworkErrorContext = ({
  requestId,
  attempt,
  request,
  error,
  durationMs,
}: DebugNetworkErrorContextParams): DebugContext => ({
  requestId,
  attempt,
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

const noOpDebugHook: DebugHook = () => undefined

const invokeDebugHook = async (debug: DebugHook, context: DebugContext): Promise<void> => {
  try {
    await Promise.resolve(debug(context))
  } catch (error) {
    logDebugHookError(error)
  }
}

const safelyInvokeDebug = async (
  debug: DebugHook | undefined,
  context: DebugContext
): Promise<void> => {
  const debugHandler = debug ?? noOpDebugHook
  await invokeDebugHook(debugHandler, context)
}

const logRetryHookError = (error: unknown): void => {
  console.error('Luma retry hook error', error)
}

const noOpRetryHook: RetryHook = () => undefined

const invokeRetryHook = async (onRetry: RetryHook, context: RetryContext): Promise<void> => {
  try {
    await Promise.resolve(onRetry(context))
  } catch (error) {
    logRetryHookError(error)
  }
}

const safelyInvokeRetry = async (
  onRetry: RetryHook | undefined,
  context: RetryContext
): Promise<void> => {
  const retryHandler = onRetry ?? noOpRetryHook
  await invokeRetryHook(retryHandler, context)
}

interface ExecuteRequestParams<T> {
  requestId: string
  attempt: number
  url: string
  init: RequestInit
  timeoutMs: number
  schema: ZodType<T>
  debugRequest: DebugRequest
  debug?: DebugHook
  startTimeMs: number
  fetchImplementation: FetchImplementation
  signal?: AbortSignal
}

const executeRequest = async <T>({
  requestId,
  attempt,
  url,
  init,
  timeoutMs,
  schema,
  debugRequest,
  debug,
  startTimeMs,
  fetchImplementation,
  signal,
}: ExecuteRequestParams<T>): Promise<T> =>
  withTimeout({ timeoutMs, signal }, async (combinedSignal) => {
    const response = await fetchImplementation(url, { ...init, signal: combinedSignal })
    const data = await parseResponsePayload(response)

    await safelyInvokeDebug(
      debug,
      buildDebugResponseContext({
        requestId,
        attempt,
        request: debugRequest,
        response,
        data,
        durationMs: Date.now() - startTimeMs,
      })
    )

    if (response.ok) {
      return parseSchemaResult(schema, data, requestId)
    }

    return throwForResponseStatus(response, data, requestId)
  })

interface HandleRequestErrorParams {
  requestId: string
  attempt: number
  error: unknown
  timeoutMs: number
  debugRequest: DebugRequest
  debug?: DebugHook
  startTimeMs: number
  signal?: AbortSignal
}

const handleRequestError = async ({
  requestId,
  attempt,
  error,
  timeoutMs,
  debugRequest,
  debug,
  startTimeMs,
  signal,
}: HandleRequestErrorParams): Promise<never> => {
  const mappedError = mapRequestError({ error, timeoutMs, requestId, signal })

  // Only call debug for actual network/timeout errors, not HTTP errors.
  // (HTTP errors already triggered a debug call with the response.)
  if (mappedError instanceof LumaNetworkError) {
    await safelyInvokeDebug(
      debug,
      buildDebugNetworkErrorContext({
        requestId,
        attempt,
        request: debugRequest,
        error: mappedError,
        durationMs: Date.now() - startTimeMs,
      })
    )
  }

  throw mappedError
}

const defaultFetchImplementation: FetchImplementation = (input, init) =>
  globalThis.fetch(input, init)

/**
 * Everything derived once per logical request and reused across retry
 * attempts, so the request id and debug request stay stable while retrying.
 */
interface PreparedRequest {
  requestId: string
  url: string
  init: RequestInit
  debugRequest: DebugRequest
  signal?: AbortSignal
}

export function createFetcher(options: FetcherOptions) {
  const config: FetcherConfig = {
    apiKey: options.apiKey,
    baseUrl: options.baseUrl ?? BASE_URL,
    timeout: options.timeout ?? 30_000,
    debug: options.debug,
    fetchImplementation: options.fetch ?? defaultFetchImplementation,
    retry: options.retry === undefined ? undefined : resolveRetryConfig(options.retry),
    onRetry: options.onRetry,
  }

  function prepareRequest(requestOptions: RequestOptions): PreparedRequest {
    const { method, path, query, body, signal } = requestOptions
    const url = buildUrl(config.baseUrl, path, query)
    const init = buildRequestInit(config.apiKey, { method, body })
    const debugRequest = buildDebugRequest({ method, url, headers: init.headers, body })

    return {
      requestId: globalThis.crypto.randomUUID(),
      url,
      init,
      debugRequest,
      signal,
    }
  }

  async function attemptRequest<T>(
    prepared: PreparedRequest,
    attempt: number,
    schema: ZodType<T>
  ): Promise<T> {
    const { requestId, url, init, debugRequest, signal } = prepared
    const startTimeMs = Date.now()

    try {
      return await executeRequest({
        requestId,
        attempt,
        url,
        init,
        timeoutMs: config.timeout,
        schema,
        debugRequest,
        debug: config.debug,
        startTimeMs,
        fetchImplementation: config.fetchImplementation,
        signal,
      })
    } catch (error: unknown) {
      return await handleRequestError({
        requestId,
        attempt,
        error,
        timeoutMs: config.timeout,
        debugRequest,
        debug: config.debug,
        startTimeMs,
        signal,
      })
    }
  }

  interface WaitBeforeRetryParams {
    error: unknown
    attempt: number
    prepared: PreparedRequest
  }

  interface BackoffParams {
    prepared: PreparedRequest
    attempt: number
    delayMs: number
    error: LumaError
  }

  /** Notifies the retry hook, then waits out the backoff before the next attempt. */
  async function backoffBeforeRetry({
    prepared,
    attempt,
    delayMs,
    error,
  }: BackoffParams): Promise<void> {
    await safelyInvokeRetry(config.onRetry, {
      requestId: prepared.requestId,
      request: prepared.debugRequest,
      attempt,
      delayMs,
      error,
    })
    await waitBeforeRetry(delayMs, prepared.signal)
  }

  /** Waits out the backoff for a retryable failure, or rethrows the error. */
  async function waitBeforeRetryOrRethrow({
    error,
    attempt,
    prepared,
  }: WaitBeforeRetryParams): Promise<void> {
    const delayMs =
      config.retry === undefined
        ? undefined
        : computeRetryDelayMs({ error, attempt, config: config.retry })

    // A computed delay implies isRetryableError(error), which is always a
    // LumaError; the instanceof narrows the type for the retry hook.
    if (delayMs === undefined || !(error instanceof LumaError)) {
      throw error
    }

    await backoffBeforeRetry({ prepared, attempt, delayMs, error })
  }

  async function runWithRetries<T>(prepared: PreparedRequest, schema: ZodType<T>): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await attemptRequest(prepared, attempt, schema)
      } catch (error: unknown) {
        await waitBeforeRetryOrRethrow({ error, attempt, prepared })
      }
    }
  }

  async function request<T>(requestOptions: RequestOptions, schema: ZodType<T>): Promise<T> {
    return runWithRetries(prepareRequest(requestOptions), schema)
  }

  async function get<T>(
    path: string,
    query: QueryParams | undefined,
    schema: ZodType<T>,
    options?: PerRequestOptions
  ): Promise<T> {
    return request({ method: 'GET', path, query, signal: options?.signal }, schema)
  }

  async function post<T>(
    path: string,
    body: unknown,
    schema: ZodType<T>,
    options?: PerRequestOptions
  ): Promise<T> {
    return request({ method: 'POST', path, body, signal: options?.signal }, schema)
  }

  return {
    request,
    get,
    post,
    config,
  }
}

export type Fetcher = ReturnType<typeof createFetcher>
