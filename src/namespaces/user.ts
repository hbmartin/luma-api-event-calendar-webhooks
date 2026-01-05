/**
 * User namespace - bundles UserResource with user-related types
 */

// Re-export the resource class
export { UserResource } from '../client/resources/user.js'

// Re-export user types
export type { User, GetSelfResponse } from '../schemas/user.js'
