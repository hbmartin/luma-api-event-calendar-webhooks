import { LumaAbortError, LumaApiError, LumaNetworkError, LumaRateLimitError } from '../errors.js'

/**
 * Opt-in retry policy. When configured, requests that fail with a rate limit
 * (429), a server error (5xx), or a network error are retried with
 * exponential backoff and jitter. 429 responses honor the `Retry-After`
 * header when present.
 */
export interface RetryOptions {
  /** Maximum number of retries after the initial attempt. Defaults to 2. */
  maxRetries?: number
  /** Base delay for exponential backoff, in milliseconds. Defaults to 500. */
  initialDelayMs?: number
  /** Upper bound for any single delay, in milliseconds. Defaults to 30_000. */
  maxDelayMs?: number
  /** Multiplier applied to the delay after each attempt. Defaults to 2. */
  backoffMultiplier?: number
}

export interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

const DEFAULT_MAX_RETRIES = 2
const DEFAULT_INITIAL_DELAY_MS = 500
const DEFAULT_MAX_DELAY_MS = 30_000
const DEFAULT_BACKOFF_MULTIPLIER = 2
const MILLISECONDS_PER_SECOND = 1000
const SERVER_ERROR_MIN_STATUS = 500

export const resolveRetryConfig = (options: RetryOptions): RetryConfig => ({
  maxRetries: options.maxRetries ?? DEFAULT_MAX_RETRIES,
  initialDelayMs: options.initialDelayMs ?? DEFAULT_INITIAL_DELAY_MS,
  maxDelayMs: options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS,
  backoffMultiplier: options.backoffMultiplier ?? DEFAULT_BACKOFF_MULTIPLIER,
})

const isServerError = (error: unknown): boolean =>
  error instanceof LumaApiError &&
  error.statusCode !== undefined &&
  error.statusCode >= SERVER_ERROR_MIN_STATUS

export const isRetryableError = (error: unknown): boolean =>
  error instanceof LumaNetworkError || error instanceof LumaRateLimitError || isServerError(error)

const retryAfterDelayMs = (error: unknown): number | undefined =>
  error instanceof LumaRateLimitError && error.retryAfter !== undefined
    ? error.retryAfter * MILLISECONDS_PER_SECOND
    : undefined

const exponentialDelayWithJitterMs = (attempt: number, config: RetryConfig): number => {
  const base = config.initialDelayMs * config.backoffMultiplier ** attempt
  const capped = Math.min(base, config.maxDelayMs)
  const half = capped / 2
  return half + Math.random() * half
}

export interface ComputeRetryDelayParams {
  error: unknown
  /** Zero-based index of the attempt that just failed. */
  attempt: number
  config: RetryConfig
}

/**
 * Computes how long to wait before retrying a failed request.
 * @returns The delay in milliseconds, or undefined when the error should not be retried.
 */
export const computeRetryDelayMs = ({
  error,
  attempt,
  config,
}: ComputeRetryDelayParams): number | undefined => {
  if (attempt >= config.maxRetries || !isRetryableError(error)) {
    return undefined
  }

  const delayMs = retryAfterDelayMs(error) ?? exponentialDelayWithJitterMs(attempt, config)
  return Math.min(delayMs, config.maxDelayMs)
}

/**
 * Waits for the given delay, rejecting with a LumaAbortError as soon as the
 * signal aborts so callers never wait out a backoff for a cancelled request.
 */
export const waitBeforeRetry = (delayMs: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted === true) {
      reject(new LumaAbortError(signal.reason))
      return
    }

    const onAbort = (): void => {
      clearTimeout(timer)
      reject(new LumaAbortError(signal?.reason))
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, delayMs)

    signal?.addEventListener('abort', onAbort, { once: true })
  })
