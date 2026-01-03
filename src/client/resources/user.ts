import { Resource } from './base.js'
import { GetSelfResponseSchema, type GetSelfResponse } from '../../schemas/index.js'

export class UserResource extends Resource {
  /**
   * Get details about the authenticated API user
   * GET /v1/user/get-self
   */
  async getSelf(): Promise<GetSelfResponse> {
    return this.fetcher.get('/v1/user/get-self', undefined, GetSelfResponseSchema)
  }
}
