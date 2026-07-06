import { z } from 'zod'
import { PersonSchema } from './calendar.js'
import {
  PaginatedResponseSchema,
  PaginationParamsSchema,
  WebhookEventTypeSchema,
  WebhookStatusSchema,
} from './common.js'
import { EventSchema, GuestSchema, TicketTypeSchema } from './event.js'
import * as LumaId from './ids.js'

// Webhook schema
export const WebhookSchema = z.object({
  api_id: LumaId.WebhookApiIdSchema,
  calendar_id: LumaId.CalendarIdSchema.nullable().optional(),
  url: z.string().url({ message: 'Invalid URL' }),
  event_types: z.array(WebhookEventTypeSchema),
  status: WebhookStatusSchema.nullable().optional(),
  secret: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export interface Webhook extends z.infer<typeof WebhookSchema> {}

// List webhooks params
export const ListWebhooksParamsSchema = PaginationParamsSchema.extend({
  calendar_api_id: LumaId.CalendarIdSchema.optional(),
})

export interface ListWebhooksParams extends z.input<typeof ListWebhooksParamsSchema> {}

// List webhooks response
export const ListWebhooksResponseSchema = PaginatedResponseSchema(WebhookSchema)

export interface ListWebhooksResponse extends z.infer<typeof ListWebhooksResponseSchema> {}

// Get webhook params
export const GetWebhookParamsSchema = z.object({
  webhook_api_id: LumaId.WebhookApiIdSchema,
})

export interface GetWebhookParams extends z.input<typeof GetWebhookParamsSchema> {}

// Get webhook response
export const GetWebhookResponseSchema = z.object({
  webhook: WebhookSchema,
})

export interface GetWebhookResponse extends z.infer<typeof GetWebhookResponseSchema> {}

// Create webhook request
export const CreateWebhookRequestSchema = z.object({
  calendar_id: LumaId.CalendarIdSchema,
  url: z.string().url({ message: 'Invalid URL' }),
  event_types: z.array(WebhookEventTypeSchema),
})

export interface CreateWebhookRequest extends z.input<typeof CreateWebhookRequestSchema> {}

// Create webhook response
export const CreateWebhookResponseSchema = z.object({
  webhook: WebhookSchema,
})

export interface CreateWebhookResponse extends z.infer<typeof CreateWebhookResponseSchema> {}

// Update webhook request
export const UpdateWebhookRequestSchema = z.object({
  webhook_api_id: LumaId.WebhookApiIdSchema,
  url: z.string().url({ message: 'Invalid URL' }).optional(),
  event_types: z.array(WebhookEventTypeSchema).optional(),
  status: WebhookStatusSchema.optional(),
})

export interface UpdateWebhookRequest extends z.input<typeof UpdateWebhookRequestSchema> {}

// Update webhook response
export const UpdateWebhookResponseSchema = z.object({
  webhook: WebhookSchema,
})

export interface UpdateWebhookResponse extends z.infer<typeof UpdateWebhookResponseSchema> {}

// Delete webhook request
export const DeleteWebhookRequestSchema = z.object({
  webhook_api_id: LumaId.WebhookApiIdSchema,
})

export interface DeleteWebhookRequest extends z.input<typeof DeleteWebhookRequestSchema> {}

// Delete webhook response
export const DeleteWebhookResponseSchema = z.object({
  success: z.boolean(),
})

export interface DeleteWebhookResponse extends z.infer<typeof DeleteWebhookResponseSchema> {}

// Webhook payload base schema
export const WebhookPayloadBaseSchema = z.object({
  type: WebhookEventTypeSchema,
  created_at: z.string(),
})

// Event created webhook payload
export const EventCreatedPayloadSchema = WebhookPayloadBaseSchema.extend({
  type: z.literal('event.created'),
  data: z.object({
    event: EventSchema,
  }),
})

export interface EventCreatedPayload extends z.infer<typeof EventCreatedPayloadSchema> {}

// Event updated webhook payload
export const EventUpdatedPayloadSchema = WebhookPayloadBaseSchema.extend({
  type: z.literal('event.updated'),
  data: z.object({
    event: EventSchema,
  }),
})

export interface EventUpdatedPayload extends z.infer<typeof EventUpdatedPayloadSchema> {}

// Guest registered webhook payload
export const GuestRegisteredPayloadSchema = WebhookPayloadBaseSchema.extend({
  type: z.literal('guest.registered'),
  data: z.object({
    guest: GuestSchema,
    event: EventSchema,
  }),
})

export interface GuestRegisteredPayload extends z.infer<typeof GuestRegisteredPayloadSchema> {}

// Guest updated webhook payload
export const GuestUpdatedPayloadSchema = WebhookPayloadBaseSchema.extend({
  type: z.literal('guest.updated'),
  data: z.object({
    guest: GuestSchema,
    event: EventSchema,
  }),
})

export interface GuestUpdatedPayload extends z.infer<typeof GuestUpdatedPayloadSchema> {}

// Ticket registered webhook payload
export const TicketRegisteredPayloadSchema = WebhookPayloadBaseSchema.extend({
  type: z.literal('ticket.registered'),
  data: z.object({
    guest: GuestSchema,
    event: EventSchema,
    ticket_type: TicketTypeSchema.optional(),
  }),
})

export interface TicketRegisteredPayload extends z.infer<typeof TicketRegisteredPayloadSchema> {}

// Calendar event added webhook payload
export const CalendarEventAddedPayloadSchema = WebhookPayloadBaseSchema.extend({
  type: z.literal('calendar.event.added'),
  data: z.object({
    event: EventSchema,
  }),
})

export interface CalendarEventAddedPayload extends z.infer<
  typeof CalendarEventAddedPayloadSchema
> {}

// Calendar person subscribed webhook payload
export const CalendarPersonSubscribedPayloadSchema = WebhookPayloadBaseSchema.extend({
  type: z.literal('calendar.person.subscribed'),
  data: z.object({
    person: PersonSchema,
  }),
})

export interface CalendarPersonSubscribedPayload extends z.infer<
  typeof CalendarPersonSubscribedPayloadSchema
> {}

// Union of all webhook payloads
export const WebhookPayloadSchema = z.discriminatedUnion('type', [
  EventCreatedPayloadSchema,
  EventUpdatedPayloadSchema,
  GuestRegisteredPayloadSchema,
  GuestUpdatedPayloadSchema,
  TicketRegisteredPayloadSchema,
  CalendarEventAddedPayloadSchema,
  CalendarPersonSubscribedPayloadSchema,
])

export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>

// Function to parse and validate webhook payloads
export function parseWebhookPayload(payload: unknown): WebhookPayload {
  return WebhookPayloadSchema.parse(payload)
}

// Decodes a raw JSON string within the Zod pipeline, surfacing malformed JSON
// as a Zod issue instead of a thrown SyntaxError.
const RawJsonSchema = z.string().transform((value, context): unknown => {
  try {
    return JSON.parse(value)
  } catch {
    context.addIssue({ code: 'custom', message: 'Invalid JSON payload' })
    return z.NEVER
  }
})

// Parses and validates a webhook payload straight from the raw request body.
export const WebhookPayloadFromStringSchema = RawJsonSchema.pipe(WebhookPayloadSchema)

/**
 * Parses and validates a webhook payload from the raw request body string.
 * Decoding runs through Zod, so a malformed body raises a ZodError rather than
 * a bare SyntaxError, keeping webhook handling on a single validation path.
 */
export function parseWebhookPayloadFromRawBody(rawBody: string): WebhookPayload {
  return WebhookPayloadFromStringSchema.parse(rawBody)
}
