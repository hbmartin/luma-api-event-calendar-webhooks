/**
 * Webhook namespace - bundles WebhookResource with webhook-related types
 */

// Re-export the resource class
export { WebhookResource } from '../client/resources/webhook.js'

// Re-export utility functions
export { parseWebhookPayload } from '../schemas/webhook.js'

// Re-export signature verification helpers
export {
  parseWebhookSignatureHeader,
  verifyWebhookSignature,
  WEBHOOK_SIGNATURE_HEADER,
} from '../webhooks/signature.js'
export type {
  VerifyWebhookSignatureParams,
  WebhookSignatureFailureReason,
  WebhookSignatureHeader,
  WebhookSignatureVerification,
} from '../webhooks/signature.js'

// Re-export the typed webhook handler
export { createWebhookHandler } from '../webhooks/handler.js'
export type {
  CreateWebhookHandlerOptions,
  VerifyingWebhookHandler,
  WebhookCallback,
  WebhookHandler,
  WebhookHandlerCallbacks,
  WebhookRequestInput,
} from '../webhooks/handler.js'

// Re-export webhook types
export type {
  Webhook,
  ListWebhooksParams,
  ListWebhooksResponse,
  GetWebhookParams,
  GetWebhookResponse,
  CreateWebhookRequest,
  CreateWebhookResponse,
  UpdateWebhookRequest,
  UpdateWebhookResponse,
  DeleteWebhookRequest,
  DeleteWebhookResponse,
  EventCreatedPayload,
  EventUpdatedPayload,
  GuestRegisteredPayload,
  GuestUpdatedPayload,
  TicketRegisteredPayload,
  CalendarEventAddedPayload,
  CalendarPersonSubscribedPayload,
  WebhookPayload,
} from '../schemas/webhook.js'
