/**
 * Membership namespace - bundles MembershipResource with membership-related schemas
 */

// Re-export the resource class
export { MembershipResource } from '../client/resources/membership.js'

// Re-export membership schemas
export {
  MembershipTierSchema,
  ListMembershipTiersParamsSchema,
  ListMembershipTiersResponseSchema,
  MemberSchema,
  AddMemberToTierRequestSchema,
  AddMemberToTierResponseSchema,
  UpdateMemberStatusRequestSchema,
  UpdateMemberStatusResponseSchema,
} from '../schemas/membership.js'

// Re-export membership types
export type {
  MembershipTier,
  ListMembershipTiersParams,
  ListMembershipTiersResponse,
  Member,
  AddMemberToTierRequest,
  AddMemberToTierResponse,
  UpdateMemberStatusRequest,
  UpdateMemberStatusResponse,
} from '../schemas/membership.js'
