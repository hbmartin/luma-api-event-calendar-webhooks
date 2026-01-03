import { Resource } from './base.js'
import {
  type LookupEntityParams,
  LookupEntityResponseSchema,
  type LookupEntityResponse,
} from '../../schemas/index.js'

export class EntityResource extends Resource {
  /**
   * Resolve a Luma entity by its slug
   * GET /v1/entity/lookup
   */
  async lookup(params: LookupEntityParams): Promise<LookupEntityResponse> {
    return this.fetcher.get('/v1/entity/lookup', { slug: params.slug }, LookupEntityResponseSchema)
  }
}
