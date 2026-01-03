// Main client export
export { LumaClient, BASE_URL, createFetcher, parseRetryAfter } from './client/index.js'
export type {
  LumaClientOptions,
  Fetcher,
  FetcherOptions,
  RequestOptions,
  FetcherConfig,
} from './client/index.js'

// Resource exports
export { UserResource } from './client/resources/user.js'
export { EntityResource } from './client/resources/entity.js'
export { ImagesResource } from './client/resources/images.js'
export { EventResource } from './client/resources/event.js'
export { CalendarResource } from './client/resources/calendar.js'
export { MembershipResource } from './client/resources/membership.js'
export { WebhookResource } from './client/resources/webhook.js'

// Error exports
export {
  LumaError,
  LumaValidationError,
  LumaApiError,
  LumaNetworkError,
  LumaRateLimitError,
  LumaAuthenticationError,
  LumaNotFoundError,
} from './errors.js'
export type { LumaErrorDetails } from './errors.js'

// Schema exports
export * as Schemas from './schemas/index.js'
