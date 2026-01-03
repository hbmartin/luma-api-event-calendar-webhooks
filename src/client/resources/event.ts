import { Resource } from './base.js'
import {
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
} from '../../schemas/index.js'

export class EventResource extends Resource {
  /**
   * Get admin-level details about a specific event
   * GET /v1/event/get
   */
  async get(params: GetEventParams): Promise<GetEventResponse> {
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
  async create(request: CreateEventRequest): Promise<CreateEventResponse> {
    return this.fetcher.post('/v1/event/create', request, CreateEventResponseSchema)
  }

  /**
   * Update details of an existing event
   * POST /v1/event/update
   */
  async update(request: UpdateEventRequest): Promise<UpdateEventResponse> {
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
  async getCoupons(params: GetEventCouponsParams): Promise<GetEventCouponsResponse> {
    return this.fetcher.get('/v1/event/coupons', params, GetEventCouponsResponseSchema)
  }

  /**
   * Create a coupon code for an event
   * POST /v1/event/create-coupon
   */
  async createCoupon(request: CreateEventCouponRequest): Promise<CreateEventCouponResponse> {
    return this.fetcher.post('/v1/event/create-coupon', request, CreateEventCouponResponseSchema)
  }

  /**
   * Update coupon limits or validity dates
   * POST /v1/event/update-coupon
   */
  async updateCoupon(request: UpdateEventCouponRequest): Promise<UpdateEventCouponResponse> {
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
}
