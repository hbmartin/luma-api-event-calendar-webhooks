// Main client export
export {
  LumaClient,
  BASE_URL,
  createFetcher,
  paginateItems,
  paginatePages,
  parseRetryAfter,
} from './client/index.js'
export type {
  LumaClientOptions,
  Fetcher,
  FetcherOptions,
  FetchImplementation,
  PageFetcher,
  PaginatedPage,
  PerRequestOptions,
  QueryParams,
  QueryPrimitive,
  QueryValue,
  RequestOptions,
  RetryConfig,
  RetryOptions,
  FetcherConfig,
  DebugContext,
  DebugHook,
  DebugRequest,
  DebugResponse,
  DebugOutcome,
  RetryContext,
  RetryHook,
} from './client/index.js'

// Error exports
export {
  LumaError,
  LumaAbortError,
  LumaValidationError,
  LumaApiError,
  LumaNetworkError,
  LumaRateLimitError,
  LumaAuthenticationError,
  LumaNotFoundError,
  LumaWebhookConfigurationError,
  LumaWebhookSignatureError,
} from './errors.js'
export type {
  LumaErrorDetails,
  WebhookConfigurationFailureReason,
  WebhookVerificationFailureReason,
} from './errors.js'

// Resource namespace exports - each namespace bundles a resource class with its schemas
export * as User from './namespaces/user.js'
export * as Event from './namespaces/event.js'
export * as Calendar from './namespaces/calendar.js'
export * as Entity from './namespaces/entity.js'
export * as Images from './namespaces/images.js'
export * as Membership from './namespaces/membership.js'
export * as Webhook from './namespaces/webhook.js'
export * as Common from './namespaces/common.js'

// Legacy: Keep Schemas export for backwards compatibility
export * as Schemas from './schemas/index.js'
