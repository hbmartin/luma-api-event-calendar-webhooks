import { z } from "zod";
import {
  ApprovalStatusSchema,
  GeoAddressJsonSchema,
  GuestStatusSchema,
  LocationTypeSchema,
  PaginatedResponseSchema,
  TicketVisibilitySchema,
  CouponDiscountTypeSchema,
} from "./common.js";

// Host schema
export const HostSchema = z.object({
  api_id: z.string(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
});

export type Host = z.infer<typeof HostSchema>;

// Event schema
export const EventSchema = z.object({
  api_id: z.string(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  description_md: z.string().nullable().optional(),
  cover_url: z.string().nullable().optional(),
  start_at: z.string().nullable().optional(),
  end_at: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  event_type: z.string().nullable().optional(),
  location_type: LocationTypeSchema.nullable().optional(),
  geo_address_json: GeoAddressJsonSchema.nullable().optional(),
  geo_latitude: z.number().nullable().optional(),
  geo_longitude: z.number().nullable().optional(),
  url: z.string().nullable().optional(),
  meeting_url: z.string().nullable().optional(),
  zoom_meeting_url: z.string().nullable().optional(),
  require_rsvp_approval: z.boolean().nullable().optional(),
  series_api_id: z.string().nullable().optional(),
  visibility: z.string().nullable().optional(),
  ticket_count: z.number().nullable().optional(),
  guest_count: z.number().nullable().optional(),
  hosts: z.array(HostSchema).nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export type Event = z.infer<typeof EventSchema>;

// Get event params
export const GetEventParamsSchema = z.object({
  event_api_id: z.string(),
});

export type GetEventParams = z.infer<typeof GetEventParamsSchema>;

// Get event response
export const GetEventResponseSchema = z.object({
  event: EventSchema,
});

export type GetEventResponse = z.infer<typeof GetEventResponseSchema>;

// Guest schema
export const GuestSchema = z.object({
  api_id: z.string(),
  event_api_id: z.string().nullable().optional(),
  user_api_id: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  approval_status: ApprovalStatusSchema.nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  registered_at: z.string().nullable().optional(),
  checked_in_at: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  twitter_handle: z.string().nullable().optional(),
  instagram_handle: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  job_title: z.string().nullable().optional(),
  dietary_restrictions: z.string().nullable().optional(),
  event_start_at: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  custom_source: z.string().nullable().optional(),
  questions_and_answers: z.array(z.object({
    question: z.string(),
    answer: z.string().nullable(),
  })).nullable().optional(),
});

export type Guest = z.infer<typeof GuestSchema>;

// Get guest params
export const GetGuestParamsSchema = z.object({
  event_api_id: z.string().optional(),
  guest_api_id: z.string().optional(),
  email: z.string().optional(),
  phone_number: z.string().optional(),
});

export type GetGuestParams = z.infer<typeof GetGuestParamsSchema>;

// Get guest response
export const GetGuestResponseSchema = z.object({
  guest: GuestSchema,
});

export type GetGuestResponse = z.infer<typeof GetGuestResponseSchema>;

// Get guests params
export const GetGuestsParamsSchema = z.object({
  event_api_id: z.string(),
  approval_status: ApprovalStatusSchema.optional(),
  pagination_cursor: z.string().optional(),
  pagination_limit: z.number().int().positive().max(100).optional(),
  sort_column: z.enum(["created_at", "updated_at", "name"]).optional(),
  sort_direction: z.enum(["asc", "desc"]).optional(),
});

export type GetGuestsParams = z.infer<typeof GetGuestsParamsSchema>;

// Get guests response (paginated)
export const GetGuestsResponseSchema = PaginatedResponseSchema(GuestSchema);

export type GetGuestsResponse = z.infer<typeof GetGuestsResponseSchema>;

// Create event request
export const CreateEventRequestSchema = z.object({
  name: z.string(),
  start_at: z.string(),
  timezone: z.string(),
  end_at: z.string().optional(),
  description: z.string().optional(),
  require_rsvp_approval: z.boolean().optional(),
  meeting_url: z.string().optional(),
  geo_address_json: GeoAddressJsonSchema.optional(),
  geo_latitude: z.number().optional(),
  geo_longitude: z.number().optional(),
  cover_url: z.string().optional(),
  visibility: z.enum(["public", "private"]).optional(),
  event_type: z.string().optional(),
});

export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>;

// Create event response
export const CreateEventResponseSchema = z.object({
  event: EventSchema,
});

export type CreateEventResponse = z.infer<typeof CreateEventResponseSchema>;

// Update event request
export const UpdateEventRequestSchema = z.object({
  event_api_id: z.string(),
  name: z.string().optional(),
  start_at: z.string().optional(),
  end_at: z.string().optional(),
  timezone: z.string().optional(),
  description: z.string().optional(),
  require_rsvp_approval: z.boolean().optional(),
  meeting_url: z.string().optional(),
  geo_address_json: GeoAddressJsonSchema.optional(),
  geo_latitude: z.number().optional(),
  geo_longitude: z.number().optional(),
  cover_url: z.string().optional(),
  visibility: z.enum(["public", "private"]).optional(),
});

export type UpdateEventRequest = z.infer<typeof UpdateEventRequestSchema>;

// Update event response
export const UpdateEventResponseSchema = z.object({
  event: EventSchema,
});

export type UpdateEventResponse = z.infer<typeof UpdateEventResponseSchema>;

// Update guest status request
export const UpdateGuestStatusRequestSchema = z.object({
  event_api_id: z.string(),
  guest_api_id: z.string(),
  status: GuestStatusSchema,
});

export type UpdateGuestStatusRequest = z.infer<typeof UpdateGuestStatusRequestSchema>;

// Update guest status response
export const UpdateGuestStatusResponseSchema = z.object({
  guest: GuestSchema,
});

export type UpdateGuestStatusResponse = z.infer<typeof UpdateGuestStatusResponseSchema>;

// Add guest input
export const AddGuestInputSchema = z.object({
  name: z.string().optional(),
  email: z.string(),
  phone_number: z.string().optional(),
});

export type AddGuestInput = z.infer<typeof AddGuestInputSchema>;

// Add guests request
export const AddGuestsRequestSchema = z.object({
  event_api_id: z.string(),
  guests: z.array(AddGuestInputSchema),
  send_invite_email: z.boolean().optional(),
});

export type AddGuestsRequest = z.infer<typeof AddGuestsRequestSchema>;

// Add guests response
export const AddGuestsResponseSchema = z.object({
  guests: z.array(GuestSchema),
});

export type AddGuestsResponse = z.infer<typeof AddGuestsResponseSchema>;

// Send invites request
export const SendInvitesRequestSchema = z.object({
  event_api_id: z.string(),
  guest_api_ids: z.array(z.string()),
  send_sms: z.boolean().optional(),
});

export type SendInvitesRequest = z.infer<typeof SendInvitesRequestSchema>;

// Send invites response
export const SendInvitesResponseSchema = z.object({
  success: z.boolean(),
});

export type SendInvitesResponse = z.infer<typeof SendInvitesResponseSchema>;

// Add host request
export const AddHostRequestSchema = z.object({
  event_api_id: z.string(),
  email: z.string(),
  name: z.string().optional(),
  phone_number: z.string().optional(),
});

export type AddHostRequest = z.infer<typeof AddHostRequestSchema>;

// Add host response
export const AddHostResponseSchema = z.object({
  host: HostSchema,
});

export type AddHostResponse = z.infer<typeof AddHostResponseSchema>;

// Coupon schema
export const CouponSchema = z.object({
  api_id: z.string(),
  code: z.string(),
  discount_type: CouponDiscountTypeSchema.nullable().optional(),
  discount_amount: z.number().nullable().optional(),
  discount_percentage: z.number().nullable().optional(),
  max_uses: z.number().nullable().optional(),
  uses: z.number().nullable().optional(),
  valid_from: z.string().nullable().optional(),
  valid_until: z.string().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

export type Coupon = z.infer<typeof CouponSchema>;

// Get event coupons params
export const GetEventCouponsParamsSchema = z.object({
  event_api_id: z.string(),
  pagination_cursor: z.string().optional(),
  pagination_limit: z.number().int().positive().max(100).optional(),
});

export type GetEventCouponsParams = z.infer<typeof GetEventCouponsParamsSchema>;

// Get event coupons response
export const GetEventCouponsResponseSchema = PaginatedResponseSchema(CouponSchema);

export type GetEventCouponsResponse = z.infer<typeof GetEventCouponsResponseSchema>;

// Create event coupon request
export const CreateEventCouponRequestSchema = z.object({
  event_api_id: z.string(),
  code: z.string(),
  discount_type: CouponDiscountTypeSchema,
  discount_amount: z.number().optional(),
  discount_percentage: z.number().optional(),
  max_uses: z.number().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
});

export type CreateEventCouponRequest = z.infer<typeof CreateEventCouponRequestSchema>;

// Create event coupon response
export const CreateEventCouponResponseSchema = z.object({
  coupon: CouponSchema,
});

export type CreateEventCouponResponse = z.infer<typeof CreateEventCouponResponseSchema>;

// Update event coupon request
export const UpdateEventCouponRequestSchema = z.object({
  coupon_api_id: z.string(),
  max_uses: z.number().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
});

export type UpdateEventCouponRequest = z.infer<typeof UpdateEventCouponRequestSchema>;

// Update event coupon response
export const UpdateEventCouponResponseSchema = z.object({
  coupon: CouponSchema,
});

export type UpdateEventCouponResponse = z.infer<typeof UpdateEventCouponResponseSchema>;

// Ticket type schema
export const TicketTypeSchema = z.object({
  api_id: z.string(),
  event_api_id: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  quantity: z.number().nullable().optional(),
  quantity_sold: z.number().nullable().optional(),
  quantity_remaining: z.number().nullable().optional(),
  min_per_order: z.number().nullable().optional(),
  max_per_order: z.number().nullable().optional(),
  visibility: TicketVisibilitySchema.nullable().optional(),
  sales_start_at: z.string().nullable().optional(),
  sales_end_at: z.string().nullable().optional(),
  is_free: z.boolean().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export type TicketType = z.infer<typeof TicketTypeSchema>;

// List ticket types params
export const ListTicketTypesParamsSchema = z.object({
  event_api_id: z.string(),
  include_hidden: z.boolean().optional(),
});

export type ListTicketTypesParams = z.infer<typeof ListTicketTypesParamsSchema>;

// List ticket types response
export const ListTicketTypesResponseSchema = z.object({
  ticket_types: z.array(TicketTypeSchema),
});

export type ListTicketTypesResponse = z.infer<typeof ListTicketTypesResponseSchema>;

// Get ticket type params
export const GetTicketTypeParamsSchema = z.object({
  ticket_type_api_id: z.string(),
});

export type GetTicketTypeParams = z.infer<typeof GetTicketTypeParamsSchema>;

// Get ticket type response
export const GetTicketTypeResponseSchema = z.object({
  ticket_type: TicketTypeSchema,
});

export type GetTicketTypeResponse = z.infer<typeof GetTicketTypeResponseSchema>;

// Create ticket type request
export const CreateTicketTypeRequestSchema = z.object({
  event_api_id: z.string(),
  name: z.string(),
  price: z.number().optional(),
  currency: z.string().optional(),
  quantity: z.number().optional(),
  description: z.string().optional(),
  min_per_order: z.number().optional(),
  max_per_order: z.number().optional(),
  visibility: TicketVisibilitySchema.optional(),
  sales_start_at: z.string().optional(),
  sales_end_at: z.string().optional(),
});

export type CreateTicketTypeRequest = z.infer<typeof CreateTicketTypeRequestSchema>;

// Create ticket type response
export const CreateTicketTypeResponseSchema = z.object({
  ticket_type: TicketTypeSchema,
});

export type CreateTicketTypeResponse = z.infer<typeof CreateTicketTypeResponseSchema>;

// Update ticket type request
export const UpdateTicketTypeRequestSchema = z.object({
  ticket_type_api_id: z.string(),
  name: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  quantity: z.number().optional(),
  description: z.string().optional(),
  min_per_order: z.number().optional(),
  max_per_order: z.number().optional(),
  visibility: TicketVisibilitySchema.optional(),
  sales_start_at: z.string().optional(),
  sales_end_at: z.string().optional(),
});

export type UpdateTicketTypeRequest = z.infer<typeof UpdateTicketTypeRequestSchema>;

// Update ticket type response
export const UpdateTicketTypeResponseSchema = z.object({
  ticket_type: TicketTypeSchema,
});

export type UpdateTicketTypeResponse = z.infer<typeof UpdateTicketTypeResponseSchema>;

// Delete ticket type request
export const DeleteTicketTypeRequestSchema = z.object({
  ticket_type_api_id: z.string(),
});

export type DeleteTicketTypeRequest = z.infer<typeof DeleteTicketTypeRequestSchema>;

// Delete ticket type response
export const DeleteTicketTypeResponseSchema = z.object({
  success: z.boolean(),
});

export type DeleteTicketTypeResponse = z.infer<typeof DeleteTicketTypeResponseSchema>;
