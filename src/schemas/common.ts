import { z } from 'zod'

// Pagination schemas
export namespace Pagination {
  export const ParamsSchema = z.object({
    cursor: z.string().optional(),
    limit: z.number().int().positive().max(100).optional(),
  })

  export interface Params extends z.infer<typeof ParamsSchema> {}
}

export const PaginationParamsSchema = Pagination.ParamsSchema
export interface PaginationParams extends z.infer<typeof PaginationParamsSchema> {}

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    entries: z.array(itemSchema),
    has_more: z.boolean(),
    next_cursor: z.string().nullable(),
  })

// Geo address schema
export const GeoAddressJsonSchema = z.object({
  type: z.enum(['google', 'manual']).optional(),
  place_id: z.string().optional(),
  description: z.string().optional(),
  city: z.string().optional(),
  city_state: z.string().optional(),
  address: z.string().optional(),
  full_address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export type GeoAddressJson = z.infer<typeof GeoAddressJsonSchema>

// Social links schemas
export const SocialLinksSchema = z.object({
  instagram: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  youtube: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
})

export type SocialLinks = z.infer<typeof SocialLinksSchema>

// Theme schemas
export const ThemeSchema = z.object({
  primary_color: z.string().nullable().optional(),
  font: z.string().nullable().optional(),
})

export type Theme = z.infer<typeof ThemeSchema>

// Price schema
export const PriceSchema = z.object({
  amount: z.number(),
  currency: z.string(),
})

export type Price = z.infer<typeof PriceSchema>

// Common response wrapper
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
  })

// Approval status enum
export const ApprovalStatusSchema = z.enum([
  'pending_approval',
  'approved',
  'declined',
  'invited',
  'waitlisted',
])

export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>

// Guest status enum
export const GuestStatusSchema = z.enum(['approved', 'declined'])

export type GuestStatus = z.infer<typeof GuestStatusSchema>

// Webhook event types
export const WebhookEventTypeSchema = z.enum([
  'event.created',
  'event.updated',
  'guest.registered',
  'guest.updated',
  'ticket.registered',
  'calendar.event.added',
  'calendar.person.subscribed',
])

export type WebhookEventType = z.infer<typeof WebhookEventTypeSchema>

// Webhook status
export const WebhookStatusSchema = z.enum(['active', 'paused'])

export type WebhookStatus = z.infer<typeof WebhookStatusSchema>

// Image purpose enum
export const ImagePurposeSchema = z.enum(['event_cover', 'calendar_cover', 'user_avatar'])

export type ImagePurpose = z.infer<typeof ImagePurposeSchema>

// Entity type enum
export const EntityTypeSchema = z.enum(['event', 'calendar', 'membership_tier'])

export type EntityType = z.infer<typeof EntityTypeSchema>

// Sort direction
export const SortDirectionSchema = z.enum(['asc', 'desc'])

export type SortDirection = z.infer<typeof SortDirectionSchema>

// Coupon discount type
export const CouponDiscountTypeSchema = z.enum(['percentage', 'fixed_amount'])

export type CouponDiscountType = z.infer<typeof CouponDiscountTypeSchema>

// Location type
export const LocationTypeSchema = z.enum(['offline', 'online', 'tba'])

export type LocationType = z.infer<typeof LocationTypeSchema>

// Ticket visibility
export const TicketVisibilitySchema = z.enum(['visible', 'hidden'])

export type TicketVisibility = z.infer<typeof TicketVisibilitySchema>

// Tag color enum (common colors)
export const TagColorSchema = z.enum([
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'purple',
  'pink',
])

export type TagColor = z.infer<typeof TagColorSchema>

// Membership status
export const MembershipStatusSchema = z.enum([
  'pending',
  'approved',
  'declined',
  'active',
  'expired',
  'cancelled',
])

export type MembershipStatus = z.infer<typeof MembershipStatusSchema>

// Success response schema for operations that return no data
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
})

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>
