import { createFetcher, type FetcherOptions, type Fetcher } from './fetcher.js'
import {
  // User schemas
  GetSelfResponseSchema,
  type GetSelfResponse,
  // Entity schemas
  type LookupEntityParams,
  LookupEntityResponseSchema,
  type LookupEntityResponse,
  // Images schemas
  type CreateUploadUrlRequest,
  CreateUploadUrlResponseSchema,
  type CreateUploadUrlResponse,
  // Event schemas
  type GetEventParams,
  GetEventResponseSchema,
  type GetEventResponse,
  type GetGuestParams,
  GetGuestResponseSchema,
  type GetGuestResponse,
  type GetGuestsParams,
  GetGuestsResponseSchema,
  type GetGuestsResponse,
  type CreateEventRequest,
  CreateEventResponseSchema,
  type CreateEventResponse,
  type UpdateEventRequest,
  UpdateEventResponseSchema,
  type UpdateEventResponse,
  type UpdateGuestStatusRequest,
  UpdateGuestStatusResponseSchema,
  type UpdateGuestStatusResponse,
  type AddGuestsRequest,
  AddGuestsResponseSchema,
  type AddGuestsResponse,
  type SendInvitesRequest,
  SendInvitesResponseSchema,
  type SendInvitesResponse,
  type AddHostRequest,
  AddHostResponseSchema,
  type AddHostResponse,
  type GetEventCouponsParams,
  GetEventCouponsResponseSchema,
  type GetEventCouponsResponse,
  type CreateEventCouponRequest,
  CreateEventCouponResponseSchema,
  type CreateEventCouponResponse,
  type UpdateEventCouponRequest,
  UpdateEventCouponResponseSchema,
  type UpdateEventCouponResponse,
  type ListTicketTypesParams,
  ListTicketTypesResponseSchema,
  type ListTicketTypesResponse,
  type GetTicketTypeParams,
  GetTicketTypeResponseSchema,
  type GetTicketTypeResponse,
  type CreateTicketTypeRequest,
  CreateTicketTypeResponseSchema,
  type CreateTicketTypeResponse,
  type UpdateTicketTypeRequest,
  UpdateTicketTypeResponseSchema,
  type UpdateTicketTypeResponse,
  type DeleteTicketTypeRequest,
  DeleteTicketTypeResponseSchema,
  type DeleteTicketTypeResponse,
  // Calendar schemas
  type ListCalendarEventsParams,
  ListCalendarEventsResponseSchema,
  type ListCalendarEventsResponse,
  type ListPersonTagsParams,
  ListPersonTagsResponseSchema,
  type ListPersonTagsResponse,
  type LookupCalendarEventParams,
  LookupCalendarEventResponseSchema,
  type LookupCalendarEventResponse,
  type ListPeopleParams,
  ListPeopleResponseSchema,
  type ListPeopleResponse,
  type ListCalendarCouponsParams,
  ListCalendarCouponsResponseSchema,
  type ListCalendarCouponsResponse,
  type CreateCalendarCouponRequest,
  CreateCalendarCouponResponseSchema,
  type CreateCalendarCouponResponse,
  type UpdateCalendarCouponRequest,
  UpdateCalendarCouponResponseSchema,
  type UpdateCalendarCouponResponse,
  type ImportPeopleRequest,
  ImportPeopleResponseSchema,
  type ImportPeopleResponse,
  type CreatePersonTagRequest,
  CreatePersonTagResponseSchema,
  type CreatePersonTagResponse,
  type UpdatePersonTagRequest,
  UpdatePersonTagResponseSchema,
  type UpdatePersonTagResponse,
  type DeletePersonTagRequest,
  DeletePersonTagResponseSchema,
  type DeletePersonTagResponse,
  type AddEventToCalendarRequest,
  AddEventToCalendarResponseSchema,
  type AddEventToCalendarResponse,
  type ApplyPersonTagRequest,
  ApplyPersonTagResponseSchema,
  type ApplyPersonTagResponse,
  type RemovePersonTagRequest,
  RemovePersonTagResponseSchema,
  type RemovePersonTagResponse,
  // Membership schemas
  type ListMembershipTiersParams,
  ListMembershipTiersResponseSchema,
  type ListMembershipTiersResponse,
  type AddMemberToTierRequest,
  AddMemberToTierResponseSchema,
  type AddMemberToTierResponse,
  type UpdateMemberStatusRequest,
  UpdateMemberStatusResponseSchema,
  type UpdateMemberStatusResponse,
  // Webhook schemas
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
} from '../schemas/index.js'

export interface LumaClientOptions extends FetcherOptions {}

export class LumaClient {
  private readonly fetcher: Fetcher

  constructor(options: LumaClientOptions) {
    this.fetcher = createFetcher(options)
  }

  // ==================== User Endpoints ====================

  /**
   * Get details about the authenticated API user
   * GET /v1/user/get-self
   */
  async getSelf(): Promise<GetSelfResponse> {
    return this.fetcher.get('/v1/user/get-self', undefined, GetSelfResponseSchema)
  }

  // ==================== Entity Endpoints ====================

  /**
   * Resolve a Luma entity by its slug
   * GET /v1/entity/lookup
   */
  async lookupEntity(params: LookupEntityParams): Promise<LookupEntityResponse> {
    return this.fetcher.get('/v1/entity/lookup', { slug: params.slug }, LookupEntityResponseSchema)
  }

  // ==================== Images Endpoints ====================

  /**
   * Create a temporary S3 URL for uploading an image
   * POST /v1/images/create-upload-url
   */
  async createUploadUrl(request: CreateUploadUrlRequest): Promise<CreateUploadUrlResponse> {
    return this.fetcher.post('/v1/images/create-upload-url', request, CreateUploadUrlResponseSchema)
  }

  // ==================== Event Endpoints ====================

  /**
   * Get admin-level details about a specific event
   * GET /v1/event/get
   */
  async getEvent(params: GetEventParams): Promise<GetEventResponse> {
    return this.fetcher.get(
      '/v1/event/get',
      { event_api_id: params.event_api_id },
      GetEventResponseSchema
    )
  }

  /**
   * Look up a guest by event and guest identifiers
   * GET /v1/event/get-guest
   */
  async getGuest(params: GetGuestParams): Promise<GetGuestResponse> {
    return this.fetcher.get('/v1/event/get-guest', params, GetGuestResponseSchema)
  }

  /**
   * List guests who have registered or been invited to an event
   * GET /v1/event/get-guests
   */
  async getGuests(params: GetGuestsParams): Promise<GetGuestsResponse> {
    return this.fetcher.get('/v1/event/get-guests', params, GetGuestsResponseSchema)
  }

  /**
   * Create a new event
   * POST /v1/event/create
   */
  async createEvent(request: CreateEventRequest): Promise<CreateEventResponse> {
    return this.fetcher.post('/v1/event/create', request, CreateEventResponseSchema)
  }

  /**
   * Update details of an existing event
   * POST /v1/event/update
   */
  async updateEvent(request: UpdateEventRequest): Promise<UpdateEventResponse> {
    return this.fetcher.post('/v1/event/update', request, UpdateEventResponseSchema)
  }

  /**
   * Update a guest's status to "declined" or "approved"
   * POST /v1/event/update-guest-status
   */
  async updateGuestStatus(request: UpdateGuestStatusRequest): Promise<UpdateGuestStatusResponse> {
    return this.fetcher.post(
      '/v1/event/update-guest-status',
      request,
      UpdateGuestStatusResponseSchema
    )
  }

  /**
   * Send email (and optional SMS) invites to guests
   * POST /v1/event/send-invites
   */
  async sendInvites(request: SendInvitesRequest): Promise<SendInvitesResponse> {
    return this.fetcher.post('/v1/event/send-invites', request, SendInvitesResponseSchema)
  }

  /**
   * Add one or more guests to an event
   * POST /v1/event/add-guests
   */
  async addGuests(request: AddGuestsRequest): Promise<AddGuestsResponse> {
    return this.fetcher.post('/v1/event/add-guests', request, AddGuestsResponseSchema)
  }

  /**
   * Add a host to an event
   * POST /v1/event/add-host
   */
  async addHost(request: AddHostRequest): Promise<AddHostResponse> {
    return this.fetcher.post('/v1/event/add-host', request, AddHostResponseSchema)
  }

  /**
   * Retrieve all coupon codes created for an event
   * GET /v1/event/coupons
   */
  async getEventCoupons(params: GetEventCouponsParams): Promise<GetEventCouponsResponse> {
    return this.fetcher.get('/v1/event/coupons', params, GetEventCouponsResponseSchema)
  }

  /**
   * Create a coupon code for an event
   * POST /v1/event/create-coupon
   */
  async createEventCoupon(request: CreateEventCouponRequest): Promise<CreateEventCouponResponse> {
    return this.fetcher.post('/v1/event/create-coupon', request, CreateEventCouponResponseSchema)
  }

  /**
   * Update coupon limits or validity dates
   * POST /v1/event/update-coupon
   */
  async updateEventCoupon(request: UpdateEventCouponRequest): Promise<UpdateEventCouponResponse> {
    return this.fetcher.post('/v1/event/update-coupon', request, UpdateEventCouponResponseSchema)
  }

  /**
   * List all ticket types for an event
   * GET /v1/event/ticket-types/list
   */
  async listTicketTypes(params: ListTicketTypesParams): Promise<ListTicketTypesResponse> {
    return this.fetcher.get('/v1/event/ticket-types/list', params, ListTicketTypesResponseSchema)
  }

  /**
   * Get a single ticket type by its ID
   * GET /v1/event/ticket-types/get
   */
  async getTicketType(params: GetTicketTypeParams): Promise<GetTicketTypeResponse> {
    return this.fetcher.get('/v1/event/ticket-types/get', params, GetTicketTypeResponseSchema)
  }

  /**
   * Create a new ticket type for an event
   * POST /v1/event/ticket-types/create
   */
  async createTicketType(request: CreateTicketTypeRequest): Promise<CreateTicketTypeResponse> {
    return this.fetcher.post(
      '/v1/event/ticket-types/create',
      request,
      CreateTicketTypeResponseSchema
    )
  }

  /**
   * Update an existing ticket type
   * POST /v1/event/ticket-types/update
   */
  async updateTicketType(request: UpdateTicketTypeRequest): Promise<UpdateTicketTypeResponse> {
    return this.fetcher.post(
      '/v1/event/ticket-types/update',
      request,
      UpdateTicketTypeResponseSchema
    )
  }

  /**
   * Soft-delete a ticket type
   * POST /v1/event/ticket-types/delete
   */
  async deleteTicketType(request: DeleteTicketTypeRequest): Promise<DeleteTicketTypeResponse> {
    return this.fetcher.post(
      '/v1/event/ticket-types/delete',
      request,
      DeleteTicketTypeResponseSchema
    )
  }

  // ==================== Calendar Endpoints ====================

  /**
   * List events managed by a calendar
   * GET /v1/calendar/list-events
   */
  async listCalendarEvents(params?: ListCalendarEventsParams): Promise<ListCalendarEventsResponse> {
    return this.fetcher.get('/v1/calendar/list-events', params, ListCalendarEventsResponseSchema)
  }

  /**
   * List all tags attached to people on the calendar
   * GET /v1/calendar/list-person-tags
   */
  async listPersonTags(params?: ListPersonTagsParams): Promise<ListPersonTagsResponse> {
    return this.fetcher.get('/v1/calendar/list-person-tags', params, ListPersonTagsResponseSchema)
  }

  /**
   * Check whether an event exists on a calendar
   * GET /v1/calendar/lookup-event
   */
  async lookupCalendarEvent(
    params: LookupCalendarEventParams
  ): Promise<LookupCalendarEventResponse> {
    return this.fetcher.get('/v1/calendar/lookup-event', params, LookupCalendarEventResponseSchema)
  }

  /**
   * Search people on a calendar
   * GET /v1/calendar/list-people
   */
  async listPeople(params?: ListPeopleParams): Promise<ListPeopleResponse> {
    return this.fetcher.get('/v1/calendar/list-people', params, ListPeopleResponseSchema)
  }

  /**
   * List all coupon codes for events managed by the calendar
   * GET /v1/calendar/coupons
   */
  async listCalendarCoupons(
    params?: ListCalendarCouponsParams
  ): Promise<ListCalendarCouponsResponse> {
    return this.fetcher.get('/v1/calendar/coupons', params, ListCalendarCouponsResponseSchema)
  }

  /**
   * Create a coupon for events on a calendar
   * POST /v1/calendar/coupons/create
   */
  async createCalendarCoupon(
    request: CreateCalendarCouponRequest
  ): Promise<CreateCalendarCouponResponse> {
    return this.fetcher.post(
      '/v1/calendar/coupons/create',
      request,
      CreateCalendarCouponResponseSchema
    )
  }

  /**
   * Update a calendar coupon
   * POST /v1/calendar/coupons/update
   */
  async updateCalendarCoupon(
    request: UpdateCalendarCouponRequest
  ): Promise<UpdateCalendarCouponResponse> {
    return this.fetcher.post(
      '/v1/calendar/coupons/update',
      request,
      UpdateCalendarCouponResponseSchema
    )
  }

  /**
   * Bulk-import people to a calendar
   * POST /v1/calendar/import-people
   */
  async importPeople(request: ImportPeopleRequest): Promise<ImportPeopleResponse> {
    return this.fetcher.post('/v1/calendar/import-people', request, ImportPeopleResponseSchema)
  }

  /**
   * Create a new tag for people on the calendar
   * POST /v1/calendar/create-person-tag
   */
  async createPersonTag(request: CreatePersonTagRequest): Promise<CreatePersonTagResponse> {
    return this.fetcher.post(
      '/v1/calendar/create-person-tag',
      request,
      CreatePersonTagResponseSchema
    )
  }

  /**
   * Update an existing person tag
   * POST /v1/calendar/update-person-tag
   */
  async updatePersonTag(request: UpdatePersonTagRequest): Promise<UpdatePersonTagResponse> {
    return this.fetcher.post(
      '/v1/calendar/update-person-tag',
      request,
      UpdatePersonTagResponseSchema
    )
  }

  /**
   * Delete a person tag
   * POST /v1/calendar/delete-person-tag
   */
  async deletePersonTag(request: DeletePersonTagRequest): Promise<DeletePersonTagResponse> {
    return this.fetcher.post(
      '/v1/calendar/delete-person-tag',
      request,
      DeletePersonTagResponseSchema
    )
  }

  /**
   * Add an existing event to a calendar
   * POST /v1/calendar/add-event
   */
  async addEventToCalendar(
    request: AddEventToCalendarRequest
  ): Promise<AddEventToCalendarResponse> {
    return this.fetcher.post('/v1/calendar/add-event', request, AddEventToCalendarResponseSchema)
  }

  /**
   * Apply a tag to specific people in the calendar
   * POST /v1/calendar/person-tags/apply
   */
  async applyPersonTag(request: ApplyPersonTagRequest): Promise<ApplyPersonTagResponse> {
    return this.fetcher.post(
      '/v1/calendar/person-tags/apply',
      request,
      ApplyPersonTagResponseSchema
    )
  }

  /**
   * Remove a tag from specified people in the calendar
   * POST /v1/calendar/person-tags/unapply
   */
  async removePersonTag(request: RemovePersonTagRequest): Promise<RemovePersonTagResponse> {
    return this.fetcher.post(
      '/v1/calendar/person-tags/unapply',
      request,
      RemovePersonTagResponseSchema
    )
  }

  // ==================== Membership Endpoints ====================

  /**
   * List membership tiers available on a calendar
   * GET /v1/memberships/tiers/list
   */
  async listMembershipTiers(
    params?: ListMembershipTiersParams
  ): Promise<ListMembershipTiersResponse> {
    return this.fetcher.get('/v1/memberships/tiers/list', params, ListMembershipTiersResponseSchema)
  }

  /**
   * Add a person to a membership tier
   * POST /v1/memberships/members/add
   */
  async addMemberToTier(request: AddMemberToTierRequest): Promise<AddMemberToTierResponse> {
    return this.fetcher.post('/v1/memberships/members/add', request, AddMemberToTierResponseSchema)
  }

  /**
   * Approve or decline a membership application
   * POST /v1/memberships/members/update-status
   */
  async updateMemberStatus(
    request: UpdateMemberStatusRequest
  ): Promise<UpdateMemberStatusResponse> {
    return this.fetcher.post(
      '/v1/memberships/members/update-status',
      request,
      UpdateMemberStatusResponseSchema
    )
  }

  // ==================== Webhook Endpoints ====================

  /**
   * List existing webhook endpoints
   * GET /v1/webhooks/list
   */
  async listWebhooks(params?: ListWebhooksParams): Promise<ListWebhooksResponse> {
    return this.fetcher.get('/v1/webhooks/list', params, ListWebhooksResponseSchema)
  }

  /**
   * Get details about a single webhook
   * GET /v1/webhooks/get
   */
  async getWebhook(params: GetWebhookParams): Promise<GetWebhookResponse> {
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
  async createWebhook(request: CreateWebhookRequest): Promise<CreateWebhookResponse> {
    return this.fetcher.post('/v1/webhooks/create', request, CreateWebhookResponseSchema)
  }

  /**
   * Update an existing webhook
   * POST /v1/webhooks/update
   */
  async updateWebhook(request: UpdateWebhookRequest): Promise<UpdateWebhookResponse> {
    return this.fetcher.post('/v1/webhooks/update', request, UpdateWebhookResponseSchema)
  }

  /**
   * Delete a webhook endpoint
   * POST /v1/webhooks/delete
   */
  async deleteWebhook(request: DeleteWebhookRequest): Promise<DeleteWebhookResponse> {
    return this.fetcher.post('/v1/webhooks/delete', request, DeleteWebhookResponseSchema)
  }
}

// Re-export fetcher utilities
export { createFetcher, BASE_URL } from './fetcher.js'
export type { FetcherOptions, Fetcher, RequestOptions, FetcherConfig } from './fetcher.js'
