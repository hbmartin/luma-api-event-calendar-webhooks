import { z } from 'zod'
import { ImagePurposeSchema } from './common.js'

// Create upload URL request
export const CreateUploadUrlRequestSchema = z.object({
  purpose: ImagePurposeSchema,
  content_type: z.string(),
})

export interface CreateUploadUrlRequest extends z.infer<typeof CreateUploadUrlRequestSchema> {}

// Create upload URL response
export const CreateUploadUrlResponseSchema = z.object({
  signed_url: z.string(),
  file_url: z.string(),
})

export interface CreateUploadUrlResponse extends z.infer<typeof CreateUploadUrlResponseSchema> {}
