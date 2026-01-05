/**
 * Membership namespace - bundles MembershipResource with membership-related types
 */

// Re-export the resource class
export { MembershipResource } from '../client/resources/membership.js'

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
