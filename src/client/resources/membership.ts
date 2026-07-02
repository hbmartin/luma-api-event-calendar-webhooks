import type { PerRequestOptions } from '../fetcher.js'
import { Resource } from './base.js'
import {
  type MembershipTier,
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
import { paginateItems } from '../pagination.js'

export class MembershipResource extends Resource {
  /**
   * List membership tiers available on a calendar
   * GET /v1/memberships/tiers/list
   */
  async listTiers(
    params?: ListMembershipTiersParams,
    options?: PerRequestOptions
  ): Promise<ListMembershipTiersResponse> {
    return this.fetcher.get(
      '/v1/memberships/tiers/list',
      params,
      ListMembershipTiersResponseSchema,
      options
    )
  }

  /**
   * Iterate over every membership tier, fetching pages lazily
   */
  listTiersIterator(
    params?: ListMembershipTiersParams,
    options?: PerRequestOptions
  ): AsyncGenerator<MembershipTier, void, undefined> {
    return paginateItems((cursor) => this.listTiers({ ...params, cursor }, options), params?.cursor)
  }

  /**
   * Add a person to a membership tier
   * POST /v1/memberships/members/add
   */
  async addMemberToTier(
    request: AddMemberToTierRequest,
    options?: PerRequestOptions
  ): Promise<AddMemberToTierResponse> {
    return this.fetcher.post(
      '/v1/memberships/members/add',
      request,
      AddMemberToTierResponseSchema,
      options
    )
  }

  /**
   * Approve or decline a membership application
   * POST /v1/memberships/members/update-status
   */
  async updateMemberStatus(
    request: UpdateMemberStatusRequest,
    options?: PerRequestOptions
  ): Promise<UpdateMemberStatusResponse> {
    return this.fetcher.post(
      '/v1/memberships/members/update-status',
      request,
      UpdateMemberStatusResponseSchema,
      options
    )
  }
}
