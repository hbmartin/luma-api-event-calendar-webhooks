/**
 * Entity namespace - bundles EntityResource with entity-related schemas
 */

// Re-export the resource class
export { EntityResource } from '../client/resources/entity.js'

// Re-export entity schemas
export {
  LookupEntityParamsSchema,
  EntitySchema,
  LookupEntityResponseSchema,
} from '../schemas/entity.js'

// Re-export entity types
export type { LookupEntityParams, Entity, LookupEntityResponse } from '../schemas/entity.js'
