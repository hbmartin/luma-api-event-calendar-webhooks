/**
 * Webhook namespace - bundles WebhookResource with webhook-related types
 */

// Re-export the resource class
export { WebhookResource } from '../client/resources/webhook.js'

// Re-export utility functions
export { parseWebhookPayload } from '../schemas/webhook.js'

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
