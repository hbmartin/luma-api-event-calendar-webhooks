import { z } from "zod";
import {
  PaginatedResponseSchema,
  TagColorSchema,
  CouponDiscountTypeSchema,
} from "./common.js";
import { EventSchema, CouponSchema } from "./event.js";

// Calendar event entry (slightly different from Event)
export const CalendarEventEntrySchema = z.object({
  api_id: z.string(),
  event: EventSchema,
});

export type CalendarEventEntry = z.infer<typeof CalendarEventEntrySchema>;

// List calendar events params
export const ListCalendarEventsParamsSchema = z.object({
  after: z.string().optional(),
  before: z.string().optional(),
  pagination_cursor: z.string().optional(),
  pagination_limit: z.number().int().positive().max(100).optional(),
  sort_column: z.enum(["start_at", "created_at"]).optional(),
  sort_direction: z.enum(["asc", "desc"]).optional(),
});

export type ListCalendarEventsParams = z.infer<typeof ListCalendarEventsParamsSchema>;

// List calendar events response
export const ListCalendarEventsResponseSchema = PaginatedResponseSchema(CalendarEventEntrySchema);

export type ListCalendarEventsResponse = z.infer<typeof ListCalendarEventsResponseSchema>;

// Person tag schema
export const PersonTagSchema = z.object({
  api_id: z.string(),
  name: z.string(),
  color: TagColorSchema.nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export type PersonTag = z.infer<typeof PersonTagSchema>;

// List person tags params
export const ListPersonTagsParamsSchema = z.object({
  pagination_cursor: z.string().optional(),
  pagination_limit: z.number().int().positive().max(100).optional(),
  sort_column: z.enum(["name", "created_at"]).optional(),
  sort_direction: z.enum(["asc", "desc"]).optional(),
});

export type ListPersonTagsParams = z.infer<typeof ListPersonTagsParamsSchema>;

// List person tags response
export const ListPersonTagsResponseSchema = PaginatedResponseSchema(PersonTagSchema);

export type ListPersonTagsResponse = z.infer<typeof ListPersonTagsResponseSchema>;

// Lookup event params
export const LookupCalendarEventParamsSchema = z.object({
  event_api_id: z.string().optional(),
  url: z.string().optional(),
});

export type LookupCalendarEventParams = z.infer<typeof LookupCalendarEventParamsSchema>;

// Lookup event response
export const LookupCalendarEventResponseSchema = z.object({
  event: EventSchema.nullable(),
  is_managed: z.boolean().nullable().optional(),
});

export type LookupCalendarEventResponse = z.infer<typeof LookupCalendarEventResponseSchema>;

// Person schema (people in calendar)
export const PersonSchema = z.object({
  api_id: z.string(),
  user_api_id: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  twitter_handle: z.string().nullable().optional(),
  instagram_handle: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  job_title: z.string().nullable().optional(),
  tags: z.array(PersonTagSchema).nullable().optional(),
  membership_tier_api_id: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export type Person = z.infer<typeof PersonSchema>;

// List people params
export const ListPeopleParamsSchema = z.object({
  search: z.string().optional(),
  tag_api_id: z.string().optional(),
  membership_tier_api_id: z.string().optional(),
  pagination_cursor: z.string().optional(),
  pagination_limit: z.number().int().positive().max(100).optional(),
  sort_column: z.enum(["name", "created_at", "updated_at"]).optional(),
  sort_direction: z.enum(["asc", "desc"]).optional(),
});

export type ListPeopleParams = z.infer<typeof ListPeopleParamsSchema>;

// List people response
export const ListPeopleResponseSchema = PaginatedResponseSchema(PersonSchema);

export type ListPeopleResponse = z.infer<typeof ListPeopleResponseSchema>;

// List calendar coupons params
export const ListCalendarCouponsParamsSchema = z.object({
  pagination_cursor: z.string().optional(),
  pagination_limit: z.number().int().positive().max(100).optional(),
});

export type ListCalendarCouponsParams = z.infer<typeof ListCalendarCouponsParamsSchema>;

// List calendar coupons response
export const ListCalendarCouponsResponseSchema = PaginatedResponseSchema(CouponSchema);

export type ListCalendarCouponsResponse = z.infer<typeof ListCalendarCouponsResponseSchema>;

// Create calendar coupon request
export const CreateCalendarCouponRequestSchema = z.object({
  code: z.string(),
  discount_type: CouponDiscountTypeSchema,
  discount_amount: z.number().optional(),
  discount_percentage: z.number().optional(),
  max_uses: z.number().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
});

export type CreateCalendarCouponRequest = z.infer<typeof CreateCalendarCouponRequestSchema>;

// Create calendar coupon response
export const CreateCalendarCouponResponseSchema = z.object({
  coupon: CouponSchema,
});

export type CreateCalendarCouponResponse = z.infer<typeof CreateCalendarCouponResponseSchema>;

// Update calendar coupon request
export const UpdateCalendarCouponRequestSchema = z.object({
  coupon_api_id: z.string(),
  max_uses: z.number().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
});

export type UpdateCalendarCouponRequest = z.infer<typeof UpdateCalendarCouponRequestSchema>;

// Update calendar coupon response
export const UpdateCalendarCouponResponseSchema = z.object({
  coupon: CouponSchema,
});

export type UpdateCalendarCouponResponse = z.infer<typeof UpdateCalendarCouponResponseSchema>;

// Import person input
export const ImportPersonInputSchema = z.object({
  name: z.string().optional(),
  email: z.string(),
  phone_number: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  bio: z.string().optional(),
});

export type ImportPersonInput = z.infer<typeof ImportPersonInputSchema>;

// Import people request
export const ImportPeopleRequestSchema = z.object({
  people: z.array(ImportPersonInputSchema),
  tag_api_ids: z.array(z.string()).optional(),
});

export type ImportPeopleRequest = z.infer<typeof ImportPeopleRequestSchema>;

// Import people response
export const ImportPeopleResponseSchema = z.object({
  imported_count: z.number(),
  people: z.array(PersonSchema).optional(),
});

export type ImportPeopleResponse = z.infer<typeof ImportPeopleResponseSchema>;

// Create person tag request
export const CreatePersonTagRequestSchema = z.object({
  name: z.string(),
  color: TagColorSchema.optional(),
});

export type CreatePersonTagRequest = z.infer<typeof CreatePersonTagRequestSchema>;

// Create person tag response
export const CreatePersonTagResponseSchema = z.object({
  tag: PersonTagSchema,
});

export type CreatePersonTagResponse = z.infer<typeof CreatePersonTagResponseSchema>;

// Update person tag request
export const UpdatePersonTagRequestSchema = z.object({
  tag_api_id: z.string(),
  name: z.string().optional(),
  color: TagColorSchema.optional(),
});

export type UpdatePersonTagRequest = z.infer<typeof UpdatePersonTagRequestSchema>;

// Update person tag response
export const UpdatePersonTagResponseSchema = z.object({
  tag: PersonTagSchema,
});

export type UpdatePersonTagResponse = z.infer<typeof UpdatePersonTagResponseSchema>;

// Delete person tag request
export const DeletePersonTagRequestSchema = z.object({
  tag_api_id: z.string(),
});

export type DeletePersonTagRequest = z.infer<typeof DeletePersonTagRequestSchema>;

// Delete person tag response
export const DeletePersonTagResponseSchema = z.object({
  success: z.boolean(),
});

export type DeletePersonTagResponse = z.infer<typeof DeletePersonTagResponseSchema>;

// Add event to calendar request
export const AddEventToCalendarRequestSchema = z.object({
  event_api_id: z.string().optional(),
  url: z.string().optional(),
});

export type AddEventToCalendarRequest = z.infer<typeof AddEventToCalendarRequestSchema>;

// Add event to calendar response
export const AddEventToCalendarResponseSchema = z.object({
  success: z.boolean(),
  event: EventSchema.optional(),
});

export type AddEventToCalendarResponse = z.infer<typeof AddEventToCalendarResponseSchema>;

// Apply person tag request
export const ApplyPersonTagRequestSchema = z.object({
  tag_api_id: z.string(),
  user_api_ids: z.array(z.string()).optional(),
  emails: z.array(z.string()).optional(),
});

export type ApplyPersonTagRequest = z.infer<typeof ApplyPersonTagRequestSchema>;

// Apply person tag response
export const ApplyPersonTagResponseSchema = z.object({
  success: z.boolean(),
  applied_count: z.number().optional(),
});

export type ApplyPersonTagResponse = z.infer<typeof ApplyPersonTagResponseSchema>;

// Remove person tag request
export const RemovePersonTagRequestSchema = z.object({
  tag_api_id: z.string(),
  user_api_ids: z.array(z.string()).optional(),
  emails: z.array(z.string()).optional(),
});

export type RemovePersonTagRequest = z.infer<typeof RemovePersonTagRequestSchema>;

// Remove person tag response
export const RemovePersonTagResponseSchema = z.object({
  success: z.boolean(),
  removed_count: z.number().optional(),
});

export type RemovePersonTagResponse = z.infer<typeof RemovePersonTagResponseSchema>;
