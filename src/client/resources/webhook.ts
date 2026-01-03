import { Resource } from './base.js'
import {
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

export class WebhookResource extends Resource {
  /**
   * List existing webhook endpoints
   * GET /v1/webhooks/list
   */
  async list(params?: ListWebhooksParams): Promise<ListWebhooksResponse> {
    return this.fetcher.get('/v1/webhooks/list', params, ListWebhooksResponseSchema)
  }

  /**
   * Get details about a single webhook
   * GET /v1/webhooks/get
   */
  async get(params: GetWebhookParams): Promise<GetWebhookResponse> {
    return this.fetcher.get(
      '/v1/webhooks/get',
      { webhook_api_id: params.webhook_api_id },
      GetWebhookResponseSchema
    )
  }

  /**
   * Create a new webhook endpoint
   * POST /v1/webhooks/create
   */
  async create(request: CreateWebhookRequest): Promise<CreateWebhookResponse> {
    return this.fetcher.post('/v1/webhooks/create', request, CreateWebhookResponseSchema)
  }

  /**
   * Update an existing webhook
   * POST /v1/webhooks/update
   */
  async update(request: UpdateWebhookRequest): Promise<UpdateWebhookResponse> {
    return this.fetcher.post('/v1/webhooks/update', request, UpdateWebhookResponseSchema)
  }

  /**
   * Delete a webhook endpoint
   * POST /v1/webhooks/delete
   */
  async delete(request: DeleteWebhookRequest): Promise<DeleteWebhookResponse> {
    return this.fetcher.post('/v1/webhooks/delete', request, DeleteWebhookResponseSchema)
  }
}
