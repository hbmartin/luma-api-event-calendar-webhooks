import type { PerRequestOptions } from '../fetcher.js'
import { Resource } from './base.js'
import {
  type Webhook,
  type ListWebhooksParams,
  ListWebhooksResponseSchema,
  type ListWebhooksResponse,
  type GetWebhookParams,
  GetWebhookResponseSchema,
  type GetWebhookResponse,
  type CreateWebhookRequest,
  CreateWebhookResponseSchema,
  type CreateWebhookResponse,
  type UpdateWebhookRequest,
  UpdateWebhookResponseSchema,
  type UpdateWebhookResponse,
  type DeleteWebhookRequest,
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
    return this.fetcher.get('/v1/webhooks/list', params, ListWebhooksResponseSchema, options)
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
    return this.fetcher.get(
      '/v1/webhooks/get',
      { webhook_api_id: params.webhook_api_id },
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
    return this.fetcher.post('/v1/webhooks/create', request, CreateWebhookResponseSchema, options)
  }

  /**
   * Update an existing webhook
   * POST /v1/webhooks/update
   */
  async update(
    request: UpdateWebhookRequest,
    options?: PerRequestOptions
  ): Promise<UpdateWebhookResponse> {
    return this.fetcher.post('/v1/webhooks/update', request, UpdateWebhookResponseSchema, options)
  }

  /**
   * Delete a webhook endpoint
   * POST /v1/webhooks/delete
   */
  async delete(
    request: DeleteWebhookRequest,
    options?: PerRequestOptions
  ): Promise<DeleteWebhookResponse> {
    return this.fetcher.post('/v1/webhooks/delete', request, DeleteWebhookResponseSchema, options)
  }
}
