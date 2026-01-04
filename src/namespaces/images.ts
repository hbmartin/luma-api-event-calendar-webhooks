/**
 * Images namespace - bundles ImagesResource with images-related types
 */

// Re-export the resource class
export { ImagesResource } from '../client/resources/images.js'

// Re-export images types
export type { CreateUploadUrlRequest, CreateUploadUrlResponse } from '../schemas/images.js'
