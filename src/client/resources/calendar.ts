import { Resource } from './base.js'
import {
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
} from '../../schemas/index.js'

export class CalendarResource extends Resource {
  /**
   * List events managed by a calendar
   * GET /v1/calendar/list-events
   */
  async listEvents(params?: ListCalendarEventsParams): Promise<ListCalendarEventsResponse> {
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
  async lookupEvent(params: LookupCalendarEventParams): Promise<LookupCalendarEventResponse> {
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
  async listCoupons(params?: ListCalendarCouponsParams): Promise<ListCalendarCouponsResponse> {
    return this.fetcher.get('/v1/calendar/coupons', params, ListCalendarCouponsResponseSchema)
  }

  /**
   * Create a coupon for events on a calendar
   * POST /v1/calendar/coupons/create
   */
  async createCoupon(request: CreateCalendarCouponRequest): Promise<CreateCalendarCouponResponse> {
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
  async updateCoupon(request: UpdateCalendarCouponRequest): Promise<UpdateCalendarCouponResponse> {
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
  async addEvent(request: AddEventToCalendarRequest): Promise<AddEventToCalendarResponse> {
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
}
