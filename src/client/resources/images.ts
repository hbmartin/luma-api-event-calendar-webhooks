import type { PerRequestOptions } from '../fetcher.js'
import { Resource } from './base.js'
import {
  type CreateUploadUrlRequest,
  CreateUploadUrlResponseSchema,
  type CreateUploadUrlResponse,
} from '../../schemas/index.js'

export class ImagesResource extends Resource {
  /**
   * Create a temporary S3 URL for uploading an image
   * POST /v1/images/create-upload-url
   */
  async createUploadUrl(
    request: CreateUploadUrlRequest,
    options?: PerRequestOptions
  ): Promise<CreateUploadUrlResponse> {
    return this.fetcher.post(
      '/v1/images/create-upload-url',
      request,
      CreateUploadUrlResponseSchema,
      options
    )
  }
}
