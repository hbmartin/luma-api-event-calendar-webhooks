import { z } from 'zod'
import {
  PaginationParamsSchema,
  PaginatedResponseSchema,
  SortDirectionSchema,
  TagColorSchema,
} from './common.js'
import { EventSchema, CouponSchema } from './event.js'
import * as LumaId from './ids.js'

// Calendar event entry (slightly different from Event)
export const CalendarEventEntrySchema = z.object({
  api_id: LumaId.CalendarEventEntryApiIdSchema,
  event: EventSchema,
})

export interface CalendarEventEntry extends z.infer<typeof CalendarEventEntrySchema> {}

// List calendar events params
export const ListCalendarEventsParamsSchema = PaginationParamsSchema.extend({
  after: z.string().optional(),
  before: z.string().optional(),
  sort_column: z.enum(['start_at', 'created_at']).optional(),
  sort_direction: SortDirectionSchema.optional(),
})

export interface ListCalendarEventsParams extends z.infer<typeof ListCalendarEventsParamsSchema> {}

// List calendar events response
export const ListCalendarEventsResponseSchema = PaginatedResponseSchema(CalendarEventEntrySchema)

export interface ListCalendarEventsResponse extends z.infer<
  typeof ListCalendarEventsResponseSchema
> {}

// Person tag schema
export const PersonTagSchema = z.object({
  api_id: LumaId.PersonTagApiIdSchema,
  name: z.string(),
  color: TagColorSchema.nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export interface PersonTag extends z.infer<typeof PersonTagSchema> {}

// List person tags params
export const ListPersonTagsParamsSchema = PaginationParamsSchema.extend({
  sort_column: z.enum(['name', 'created_at']).optional(),
  sort_direction: SortDirectionSchema.optional(),
})

export interface ListPersonTagsParams extends z.infer<typeof ListPersonTagsParamsSchema> {}

// List person tags response
export const ListPersonTagsResponseSchema = PaginatedResponseSchema(PersonTagSchema)

export interface ListPersonTagsResponse extends z.infer<typeof ListPersonTagsResponseSchema> {}

// Lookup event params
const CalendarEventLookupByApiIdSchema = z
  .object({
    event_api_id: LumaId.EventApiIdSchema,
  })
  .strict()

const CalendarEventLookupByUrlSchema = z
  .object({
    url: z.string().url(),
  })
  .strict()

export const LookupCalendarEventParamsSchema = z.union([
  CalendarEventLookupByApiIdSchema,
  CalendarEventLookupByUrlSchema,
])

export type LookupCalendarEventParams = z.infer<typeof LookupCalendarEventParamsSchema>

// Lookup event response
export const LookupCalendarEventResponseSchema = z.object({
  event: EventSchema.nullable(),
  is_managed: z.boolean().nullable().optional(),
})

export interface LookupCalendarEventResponse extends z.infer<
  typeof LookupCalendarEventResponseSchema
> {}

// Person schema (people in calendar)
export const PersonSchema = z.object({
  api_id: LumaId.PersonApiIdSchema,
  user_api_id: LumaId.UserApiIdSchema.nullable().optional(),
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
  membership_tier_api_id: LumaId.MembershipTierApiIdSchema.nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export interface Person extends z.infer<typeof PersonSchema> {}

// List people params
export const ListPeopleParamsSchema = PaginationParamsSchema.extend({
  search: z.string().optional(),
  tag_api_id: LumaId.PersonTagApiIdSchema.optional(),
  membership_tier_api_id: LumaId.MembershipTierApiIdSchema.optional(),
  sort_column: z.enum(['name', 'created_at', 'updated_at']).optional(),
  sort_direction: SortDirectionSchema.optional(),
})

export interface ListPeopleParams extends z.infer<typeof ListPeopleParamsSchema> {}

// List people response
export const ListPeopleResponseSchema = PaginatedResponseSchema(PersonSchema)

export interface ListPeopleResponse extends z.infer<typeof ListPeopleResponseSchema> {}

// List calendar coupons params
export const ListCalendarCouponsParamsSchema = PaginationParamsSchema

export interface ListCalendarCouponsParams extends z.infer<
  typeof ListCalendarCouponsParamsSchema
> {}

// List calendar coupons response
export const ListCalendarCouponsResponseSchema = PaginatedResponseSchema(CouponSchema)

export interface ListCalendarCouponsResponse extends z.infer<
  typeof ListCalendarCouponsResponseSchema
> {}

// Create calendar coupon request
const CreateCalendarCouponBaseSchema = z.object({
  code: z.string(),
  max_uses: z.number().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
})

const CreateCalendarCouponPercentageSchema = CreateCalendarCouponBaseSchema.extend({
  discount_type: z.literal('percentage'),
  discount_percentage: z.number(),
})

const CreateCalendarCouponFixedAmountSchema = CreateCalendarCouponBaseSchema.extend({
  discount_type: z.literal('fixed_amount'),
  discount_amount: z.number(),
})

export const CreateCalendarCouponRequestSchema = z.union([
  CreateCalendarCouponPercentageSchema,
  CreateCalendarCouponFixedAmountSchema,
])

export type CreateCalendarCouponRequest = z.infer<typeof CreateCalendarCouponRequestSchema>

// Create calendar coupon response
export const CreateCalendarCouponResponseSchema = z.object({
  coupon: CouponSchema,
})

export interface CreateCalendarCouponResponse extends z.infer<
  typeof CreateCalendarCouponResponseSchema
> {}

// Update calendar coupon request
export const UpdateCalendarCouponRequestSchema = z.object({
  coupon_api_id: LumaId.CouponApiIdSchema,
  max_uses: z.number().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
})

export interface UpdateCalendarCouponRequest extends z.infer<
  typeof UpdateCalendarCouponRequestSchema
> {}

// Update calendar coupon response
export const UpdateCalendarCouponResponseSchema = z.object({
  coupon: CouponSchema,
})

export interface UpdateCalendarCouponResponse extends z.infer<
  typeof UpdateCalendarCouponResponseSchema
> {}

// Import person input
export const ImportPersonInputSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  phone_number: z.string().min(1).optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  bio: z.string().optional(),
})

export interface ImportPersonInput extends z.infer<typeof ImportPersonInputSchema> {}

// Import people request
export const ImportPeopleRequestSchema = z.object({
  people: z.array(ImportPersonInputSchema),
  tag_api_ids: z.array(z.string()).optional(),
})

export interface ImportPeopleRequest extends z.infer<typeof ImportPeopleRequestSchema> {}

// Import people response
export const ImportPeopleResponseSchema = z.object({
  imported_count: z.number(),
  people: z.array(PersonSchema).optional(),
})

export interface ImportPeopleResponse extends z.infer<typeof ImportPeopleResponseSchema> {}

// Create person tag request
export const CreatePersonTagRequestSchema = z.object({
  name: z.string(),
  color: TagColorSchema.optional(),
})

export interface CreatePersonTagRequest extends z.infer<typeof CreatePersonTagRequestSchema> {}

// Create person tag response
export const CreatePersonTagResponseSchema = z.object({
  tag: PersonTagSchema,
})

export interface CreatePersonTagResponse extends z.infer<typeof CreatePersonTagResponseSchema> {}

// Update person tag request
export const UpdatePersonTagRequestSchema = z.object({
  tag_api_id: LumaId.PersonTagApiIdSchema,
  name: z.string().optional(),
  color: TagColorSchema.optional(),
})

export interface UpdatePersonTagRequest extends z.infer<typeof UpdatePersonTagRequestSchema> {}

// Update person tag response
export const UpdatePersonTagResponseSchema = z.object({
  tag: PersonTagSchema,
})

export interface UpdatePersonTagResponse extends z.infer<typeof UpdatePersonTagResponseSchema> {}

// Delete person tag request
export const DeletePersonTagRequestSchema = z.object({
  tag_api_id: LumaId.PersonTagApiIdSchema,
})

export interface DeletePersonTagRequest extends z.infer<typeof DeletePersonTagRequestSchema> {}

// Delete person tag response
export const DeletePersonTagResponseSchema = z.object({
  success: z.boolean(),
})

export interface DeletePersonTagResponse extends z.infer<typeof DeletePersonTagResponseSchema> {}

// Add event to calendar request
const AddEventToCalendarByApiIdSchema = z
  .object({
    event_api_id: LumaId.EventApiIdSchema,
  })
  .strict()

const AddEventToCalendarByUrlSchema = z
  .object({
    url: z.string().url(),
  })
  .strict()

export const AddEventToCalendarRequestSchema = z.union([
  AddEventToCalendarByApiIdSchema,
  AddEventToCalendarByUrlSchema,
])

export type AddEventToCalendarRequest = z.infer<typeof AddEventToCalendarRequestSchema>

// Add event to calendar response
export const AddEventToCalendarResponseSchema = z.object({
  success: z.boolean(),
  event: EventSchema.optional(),
})

export interface AddEventToCalendarResponse extends z.infer<
  typeof AddEventToCalendarResponseSchema
> {}

// Apply person tag request
export const ApplyPersonTagRequestSchema = z
  .object({
    tag_api_id: LumaId.PersonTagApiIdSchema,
    user_api_ids: z.array(LumaId.UserApiIdSchema).min(1).optional(),
    emails: z.array(z.string().email()).min(1).optional(),
  })
  .refine((value) => value.user_api_ids !== undefined || value.emails !== undefined, {
    message: 'Either user_api_ids or emails must be provided.',
  })

export interface ApplyPersonTagRequest extends z.infer<typeof ApplyPersonTagRequestSchema> {}

// Apply person tag response
export const ApplyPersonTagResponseSchema = z.object({
  success: z.boolean(),
  applied_count: z.number().optional(),
})

export interface ApplyPersonTagResponse extends z.infer<typeof ApplyPersonTagResponseSchema> {}

// Remove person tag request
export const RemovePersonTagRequestSchema = z
  .object({
    tag_api_id: LumaId.PersonTagApiIdSchema,
    user_api_ids: z.array(LumaId.UserApiIdSchema).min(1).optional(),
    emails: z.array(z.string().email()).min(1).optional(),
  })
  .refine((value) => value.user_api_ids !== undefined || value.emails !== undefined, {
    message: 'Either user_api_ids or emails must be provided.',
  })

export interface RemovePersonTagRequest extends z.infer<typeof RemovePersonTagRequestSchema> {}

// Remove person tag response
export const RemovePersonTagResponseSchema = z.object({
  success: z.boolean(),
  removed_count: z.number().optional(),
})

export interface RemovePersonTagResponse extends z.infer<typeof RemovePersonTagResponseSchema> {}
