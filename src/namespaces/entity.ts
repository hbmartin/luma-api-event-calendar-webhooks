/**
 * Entity namespace - bundles EntityResource with entity-related types
 */

// Re-export the resource class
export { EntityResource } from '../client/resources/entity.js'

// Re-export entity types
export type { LookupEntityParams, Entity, LookupEntityResponse } from '../schemas/entity.js'
