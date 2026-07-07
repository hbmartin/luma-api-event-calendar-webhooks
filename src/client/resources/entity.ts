import type { PerRequestOptions } from '../fetcher.js'
import { Resource } from './base.js'
import {
  type LookupEntityParams,
  LookupEntityParamsSchema,
  LookupEntityResponseSchema,
  type LookupEntityResponse,
} from '../../schemas/index.js'

export class EntityResource extends Resource {
  /**
   * Resolve a Luma entity by its slug
   * GET /v1/entity/lookup
   */
  async lookup(
    params: LookupEntityParams,
    options?: PerRequestOptions
  ): Promise<LookupEntityResponse> {
    return this.getValidated(
      '/v1/entity/lookup',
      params,
      LookupEntityParamsSchema,
      LookupEntityResponseSchema,
      options
    )
  }
}
