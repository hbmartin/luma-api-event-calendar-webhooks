import type { PerRequestOptions } from '../fetcher.js'
import { Resource } from './base.js'
import {
  type Coupon,
  type Guest,
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
import { paginateItems } from '../pagination.js'

export class EventResource extends Resource {
  /**
   * Get admin-level details about a specific event
   * GET /v1/event/get
   */
  async get(params: GetEventParams, options?: PerRequestOptions): Promise<GetEventResponse> {
    return this.fetcher.get(
      '/v1/event/get',
      { event_api_id: params.event_api_id },
      GetEventResponseSchema,
      options
    )
  }

  /**
   * Look up a guest by event and guest identifiers
   * GET /v1/event/get-guest
   */
  async getGuest(params: GetGuestParams, options?: PerRequestOptions): Promise<GetGuestResponse> {
    return this.fetcher.get('/v1/event/get-guest', params, GetGuestResponseSchema, options)
  }

  /**
   * List guests who have registered or been invited to an event
   * GET /v1/event/get-guests
   */
  async getGuests(
    params: GetGuestsParams,
    options?: PerRequestOptions
  ): Promise<GetGuestsResponse> {
    return this.fetcher.get('/v1/event/get-guests', params, GetGuestsResponseSchema, options)
  }

  /**
   * Iterate over every guest of an event, fetching pages lazily
   */
  getGuestsIterator(
    params: GetGuestsParams,
    options?: PerRequestOptions
  ): AsyncGenerator<Guest, void, undefined> {
    return paginateItems((cursor) => this.getGuests({ ...params, cursor }, options), params.cursor)
  }

  /**
   * Create a new event
   * POST /v1/event/create
   */
  async create(
    request: CreateEventRequest,
    options?: PerRequestOptions
  ): Promise<CreateEventResponse> {
    return this.fetcher.post('/v1/event/create', request, CreateEventResponseSchema, options)
  }

  /**
   * Update details of an existing event
   * POST /v1/event/update
   */
  async update(
    request: UpdateEventRequest,
    options?: PerRequestOptions
  ): Promise<UpdateEventResponse> {
    return this.fetcher.post('/v1/event/update', request, UpdateEventResponseSchema, options)
  }

  /**
   * Update a guest's status to "declined" or "approved"
   * POST /v1/event/update-guest-status
   */
  async updateGuestStatus(
    request: UpdateGuestStatusRequest,
    options?: PerRequestOptions
  ): Promise<UpdateGuestStatusResponse> {
    return this.fetcher.post(
      '/v1/event/update-guest-status',
      request,
      UpdateGuestStatusResponseSchema,
      options
    )
  }

  /**
   * Send email (and optional SMS) invites to guests
   * POST /v1/event/send-invites
   */
  async sendInvites(
    request: SendInvitesRequest,
    options?: PerRequestOptions
  ): Promise<SendInvitesResponse> {
    return this.fetcher.post('/v1/event/send-invites', request, SendInvitesResponseSchema, options)
  }

  /**
   * Add one or more guests to an event
   * POST /v1/event/add-guests
   */
  async addGuests(
    request: AddGuestsRequest,
    options?: PerRequestOptions
  ): Promise<AddGuestsResponse> {
    return this.fetcher.post('/v1/event/add-guests', request, AddGuestsResponseSchema, options)
  }

  /**
   * Add a host to an event
   * POST /v1/event/add-host
   */
  async addHost(request: AddHostRequest, options?: PerRequestOptions): Promise<AddHostResponse> {
    return this.fetcher.post('/v1/event/add-host', request, AddHostResponseSchema, options)
  }

  /**
   * Retrieve all coupon codes created for an event
   * GET /v1/event/coupons
   */
  async getCoupons(
    params: GetEventCouponsParams,
    options?: PerRequestOptions
  ): Promise<GetEventCouponsResponse> {
    return this.fetcher.get('/v1/event/coupons', params, GetEventCouponsResponseSchema, options)
  }

  /**
   * Iterate over every coupon of an event, fetching pages lazily
   */
  getCouponsIterator(
    params: GetEventCouponsParams,
    options?: PerRequestOptions
  ): AsyncGenerator<Coupon, void, undefined> {
    return paginateItems((cursor) => this.getCoupons({ ...params, cursor }, options), params.cursor)
  }

  /**
   * Create a coupon code for an event
   * POST /v1/event/create-coupon
   */
  async createCoupon(
    request: CreateEventCouponRequest,
    options?: PerRequestOptions
  ): Promise<CreateEventCouponResponse> {
    return this.fetcher.post(
      '/v1/event/create-coupon',
      request,
      CreateEventCouponResponseSchema,
      options
    )
  }

  /**
   * Update coupon limits or validity dates
   * POST /v1/event/update-coupon
   */
  async updateCoupon(
    request: UpdateEventCouponRequest,
    options?: PerRequestOptions
  ): Promise<UpdateEventCouponResponse> {
    return this.fetcher.post(
      '/v1/event/update-coupon',
      request,
      UpdateEventCouponResponseSchema,
      options
    )
  }

  /**
   * List all ticket types for an event
   * GET /v1/event/ticket-types/list
   */
  async listTicketTypes(
    params: ListTicketTypesParams,
    options?: PerRequestOptions
  ): Promise<ListTicketTypesResponse> {
    return this.fetcher.get(
      '/v1/event/ticket-types/list',
      params,
      ListTicketTypesResponseSchema,
      options
    )
  }

  /**
   * Get a single ticket type by its ID
   * GET /v1/event/ticket-types/get
   */
  async getTicketType(
    params: GetTicketTypeParams,
    options?: PerRequestOptions
  ): Promise<GetTicketTypeResponse> {
    return this.fetcher.get(
      '/v1/event/ticket-types/get',
      params,
      GetTicketTypeResponseSchema,
      options
    )
  }

  /**
   * Create a new ticket type for an event
   * POST /v1/event/ticket-types/create
   */
  async createTicketType(
    request: CreateTicketTypeRequest,
    options?: PerRequestOptions
  ): Promise<CreateTicketTypeResponse> {
    return this.fetcher.post(
      '/v1/event/ticket-types/create',
      request,
      CreateTicketTypeResponseSchema,
      options
    )
  }

  /**
   * Update an existing ticket type
   * POST /v1/event/ticket-types/update
   */
  async updateTicketType(
    request: UpdateTicketTypeRequest,
    options?: PerRequestOptions
  ): Promise<UpdateTicketTypeResponse> {
    return this.fetcher.post(
      '/v1/event/ticket-types/update',
      request,
      UpdateTicketTypeResponseSchema,
      options
    )
  }

  /**
   * Soft-delete a ticket type
   * POST /v1/event/ticket-types/delete
   */
  async deleteTicketType(
    request: DeleteTicketTypeRequest,
    options?: PerRequestOptions
  ): Promise<DeleteTicketTypeResponse> {
    return this.fetcher.post(
      '/v1/event/ticket-types/delete',
      request,
      DeleteTicketTypeResponseSchema,
      options
    )
  }
}
