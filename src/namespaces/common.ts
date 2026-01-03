/**
 * Common namespace - shared schemas, types, and utilities
 */

// Re-export common schemas and utilities
export {
  Pagination,
  PaginationParamsSchema,
  PaginatedResponseSchema,
  GeoAddressJsonSchema,
  SocialLinksSchema,
  ThemeSchema,
  PriceSchema,
  ApiResponseSchema,
  ApprovalStatusSchema,
  GuestStatusSchema,
  WebhookEventTypeSchema,
  WebhookStatusSchema,
  ImagePurposeSchema,
  EntityTypeSchema,
  SortDirectionSchema,
  CouponDiscountTypeSchema,
  LocationTypeSchema,
  TicketVisibilitySchema,
  TagColorSchema,
  MembershipStatusSchema,
  SuccessResponseSchema,
} from '../schemas/common.js'

// Re-export common types
export type {
  PaginationParams,
  GeoAddressJson,
  SocialLinks,
  Theme,
  Price,
  ApprovalStatus,
  GuestStatus,
  WebhookEventType,
  WebhookStatus,
  ImagePurpose,
  EntityType,
  SortDirection,
  CouponDiscountType,
  LocationType,
  TicketVisibility,
  TagColor,
  MembershipStatus,
  SuccessResponse,
} from '../schemas/common.js'

// Re-export ID schemas and types
export { LumaId } from '../schemas/ids.js'
