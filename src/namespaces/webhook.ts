/**
 * Webhook namespace - bundles WebhookResource with webhook-related schemas
 */

// Re-export the resource class
export { WebhookResource } from '../client/resources/webhook.js'

// Re-export webhook schemas
export {
  WebhookSchema,
  ListWebhooksParamsSchema,
  ListWebhooksResponseSchema,
  GetWebhookParamsSchema,
  GetWebhookResponseSchema,
  CreateWebhookRequestSchema,
  CreateWebhookResponseSchema,
  UpdateWebhookRequestSchema,
  UpdateWebhookResponseSchema,
  DeleteWebhookRequestSchema,
  DeleteWebhookResponseSchema,
  WebhookPayloadBaseSchema,
  EventCreatedPayloadSchema,
  EventUpdatedPayloadSchema,
  GuestRegisteredPayloadSchema,
  GuestUpdatedPayloadSchema,
  TicketRegisteredPayloadSchema,
  CalendarEventAddedPayloadSchema,
  CalendarPersonSubscribedPayloadSchema,
  WebhookPayloadSchema,
  parseWebhookPayload,
} from '../schemas/webhook.js'

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
