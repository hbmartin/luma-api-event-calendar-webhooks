/**
 * Images namespace - bundles ImagesResource with images-related schemas
 */

// Re-export the resource class
export { ImagesResource } from '../client/resources/images.js'

// Re-export images schemas
export { CreateUploadUrlRequestSchema, CreateUploadUrlResponseSchema } from '../schemas/images.js'

// Re-export images types
export type { CreateUploadUrlRequest, CreateUploadUrlResponse } from '../schemas/images.js'
