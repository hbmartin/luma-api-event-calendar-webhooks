import type { PerRequestOptions } from '../fetcher.js'
import { Resource } from './base.js'
import {
  type Webhook,
  type ListWebhooksParams,
  ListWebhooksParamsSchema,
  ListWebhooksResponseSchema,
  type ListWebhooksResponse,
  type GetWebhookParams,
  GetWebhookParamsSchema,
  GetWebhookResponseSchema,
  type GetWebhookResponse,
  type CreateWebhookRequest,
  CreateWebhookRequestSchema,
  CreateWebhookResponseSchema,
  type CreateWebhookResponse,
  type UpdateWebhookRequest,
  UpdateWebhookRequestSchema,
  UpdateWebhookResponseSchema,
  type UpdateWebhookResponse,
  type DeleteWebhookRequest,
  DeleteWebhookRequestSchema,
  DeleteWebhookResponseSchema,
  type DeleteWebhookResponse,
} from '../../schemas/index.js'
import { paginateItems } from '../pagination.js'

export class WebhookResource extends Resource {
  /**
   * List existing webhook endpoints
   * GET /v1/webhooks/list
   */
  async list(
    params?: ListWebhooksParams,
    options?: PerRequestOptions
  ): Promise<ListWebhooksResponse> {
    return this.getValidated(
      '/v1/webhooks/list',
      params,
      ListWebhooksParamsSchema,
      ListWebhooksResponseSchema,
      options
    )
  }

  /**
   * Iterate over every webhook endpoint, fetching pages lazily
   */
  listIterator(
    params?: ListWebhooksParams,
    options?: PerRequestOptions
  ): AsyncGenerator<Webhook, void, undefined> {
    return paginateItems((cursor) => this.list({ ...params, cursor }, options), params?.cursor)
  }

  /**
   * Get details about a single webhook
   * GET /v1/webhooks/get
   */
  async get(params: GetWebhookParams, options?: PerRequestOptions): Promise<GetWebhookResponse> {
    return this.getValidated(
      '/v1/webhooks/get',
      params,
      GetWebhookParamsSchema,
      GetWebhookResponseSchema,
      options
    )
  }

  /**
   * Create a new webhook endpoint
   * POST /v1/webhooks/create
   */
  async create(
    request: CreateWebhookRequest,
    options?: PerRequestOptions
  ): Promise<CreateWebhookResponse> {
    return this.postValidated(
      '/v1/webhooks/create',
      request,
      CreateWebhookRequestSchema,
      CreateWebhookResponseSchema,
      options
    )
  }

  /**
   * Update an existing webhook
   * POST /v1/webhooks/update
   */
  async update(
    request: UpdateWebhookRequest,
    options?: PerRequestOptions
  ): Promise<UpdateWebhookResponse> {
    return this.postValidated(
      '/v1/webhooks/update',
      request,
      UpdateWebhookRequestSchema,
      UpdateWebhookResponseSchema,
      options
    )
  }

  /**
   * Delete a webhook endpoint
   * POST /v1/webhooks/delete
   */
  async delete(
    request: DeleteWebhookRequest,
    options?: PerRequestOptions
  ): Promise<DeleteWebhookResponse> {
    return this.postValidated(
      '/v1/webhooks/delete',
      request,
      DeleteWebhookRequestSchema,
      DeleteWebhookResponseSchema,
      options
    )
  }
}
