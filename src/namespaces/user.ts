/**
 * User namespace - bundles UserResource with user-related schemas
 */

// Re-export the resource class
export { UserResource } from '../client/resources/user.js'

// Re-export user schemas
export { UserSchema, GetSelfResponseSchema } from '../schemas/user.js'

// Re-export user types
export type { User, GetSelfResponse } from '../schemas/user.js'
