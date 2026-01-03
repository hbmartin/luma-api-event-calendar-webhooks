import { Resource } from './base.js'
import {
  type ListMembershipTiersParams,
  ListMembershipTiersResponseSchema,
  type ListMembershipTiersResponse,
  type AddMemberToTierRequest,
  AddMemberToTierResponseSchema,
  type AddMemberToTierResponse,
  type UpdateMemberStatusRequest,
  UpdateMemberStatusResponseSchema,
  type UpdateMemberStatusResponse,
} from '../../schemas/index.js'

export class MembershipResource extends Resource {
  /**
   * List membership tiers available on a calendar
   * GET /v1/memberships/tiers/list
   */
  async listTiers(params?: ListMembershipTiersParams): Promise<ListMembershipTiersResponse> {
    return this.fetcher.get('/v1/memberships/tiers/list', params, ListMembershipTiersResponseSchema)
  }

  /**
   * Add a person to a membership tier
   * POST /v1/memberships/members/add
   */
  async addMemberToTier(request: AddMemberToTierRequest): Promise<AddMemberToTierResponse> {
    return this.fetcher.post('/v1/memberships/members/add', request, AddMemberToTierResponseSchema)
  }

  /**
   * Approve or decline a membership application
   * POST /v1/memberships/members/update-status
   */
  async updateMemberStatus(
    request: UpdateMemberStatusRequest
  ): Promise<UpdateMemberStatusResponse> {
    return this.fetcher.post(
      '/v1/memberships/members/update-status',
      request,
      UpdateMemberStatusResponseSchema
    )
  }
}
