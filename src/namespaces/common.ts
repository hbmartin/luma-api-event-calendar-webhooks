/**
 * Common namespace - shared types and utilities
 */

// Re-export utility namespaces (contain both schemas and types for branded IDs and pagination)
export { Pagination } from '../schemas/common.js'
export { LumaId } from '../schemas/ids.js'

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
