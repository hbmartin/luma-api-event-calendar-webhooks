import type { PerRequestOptions } from '../fetcher.js'
import { Resource } from './base.js'
import {
  type CalendarEventEntry,
  type Coupon,
  type Person,
  type PersonTag,
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
import { paginateItems } from '../pagination.js'

export class CalendarResource extends Resource {
  /**
   * List events managed by a calendar
   * GET /v1/calendar/list-events
   */
  async listEvents(
    params?: ListCalendarEventsParams,
    options?: PerRequestOptions
  ): Promise<ListCalendarEventsResponse> {
    return this.fetcher.get(
      '/v1/calendar/list-events',
      params,
      ListCalendarEventsResponseSchema,
      options
    )
  }

  /**
   * Iterate over every event managed by a calendar, fetching pages lazily
   */
  listEventsIterator(
    params?: ListCalendarEventsParams,
    options?: PerRequestOptions
  ): AsyncGenerator<CalendarEventEntry, void, undefined> {
    return paginateItems(
      (cursor) => this.listEvents({ ...params, cursor }, options),
      params?.cursor
    )
  }

  /**
   * List all tags attached to people on the calendar
   * GET /v1/calendar/list-person-tags
   */
  async listPersonTags(
    params?: ListPersonTagsParams,
    options?: PerRequestOptions
  ): Promise<ListPersonTagsResponse> {
    return this.fetcher.get(
      '/v1/calendar/list-person-tags',
      params,
      ListPersonTagsResponseSchema,
      options
    )
  }

  /**
   * Iterate over every person tag on the calendar, fetching pages lazily
   */
  listPersonTagsIterator(
    params?: ListPersonTagsParams,
    options?: PerRequestOptions
  ): AsyncGenerator<PersonTag, void, undefined> {
    return paginateItems(
      (cursor) => this.listPersonTags({ ...params, cursor }, options),
      params?.cursor
    )
  }

  /**
   * Check whether an event exists on a calendar
   * GET /v1/calendar/lookup-event
   */
  async lookupEvent(
    params: LookupCalendarEventParams,
    options?: PerRequestOptions
  ): Promise<LookupCalendarEventResponse> {
    return this.fetcher.get(
      '/v1/calendar/lookup-event',
      params,
      LookupCalendarEventResponseSchema,
      options
    )
  }

  /**
   * Search people on a calendar
   * GET /v1/calendar/list-people
   */
  async listPeople(
    params?: ListPeopleParams,
    options?: PerRequestOptions
  ): Promise<ListPeopleResponse> {
    return this.fetcher.get('/v1/calendar/list-people', params, ListPeopleResponseSchema, options)
  }

  /**
   * Iterate over every person on the calendar, fetching pages lazily
   */
  listPeopleIterator(
    params?: ListPeopleParams,
    options?: PerRequestOptions
  ): AsyncGenerator<Person, void, undefined> {
    return paginateItems(
      (cursor) => this.listPeople({ ...params, cursor }, options),
      params?.cursor
    )
  }

  /**
   * List all coupon codes for events managed by the calendar
   * GET /v1/calendar/coupons
   */
  async listCoupons(
    params?: ListCalendarCouponsParams,
    options?: PerRequestOptions
  ): Promise<ListCalendarCouponsResponse> {
    return this.fetcher.get(
      '/v1/calendar/coupons',
      params,
      ListCalendarCouponsResponseSchema,
      options
    )
  }

  /**
   * Iterate over every calendar coupon, fetching pages lazily
   */
  listCouponsIterator(
    params?: ListCalendarCouponsParams,
    options?: PerRequestOptions
  ): AsyncGenerator<Coupon, void, undefined> {
    return paginateItems(
      (cursor) => this.listCoupons({ ...params, cursor }, options),
      params?.cursor
    )
  }

  /**
   * Create a coupon for events on a calendar
   * POST /v1/calendar/coupons/create
   */
  async createCoupon(
    request: CreateCalendarCouponRequest,
    options?: PerRequestOptions
  ): Promise<CreateCalendarCouponResponse> {
    return this.fetcher.post(
      '/v1/calendar/coupons/create',
      request,
      CreateCalendarCouponResponseSchema,
      options
    )
  }

  /**
   * Update a calendar coupon
   * POST /v1/calendar/coupons/update
   */
  async updateCoupon(
    request: UpdateCalendarCouponRequest,
    options?: PerRequestOptions
  ): Promise<UpdateCalendarCouponResponse> {
    return this.fetcher.post(
      '/v1/calendar/coupons/update',
      request,
      UpdateCalendarCouponResponseSchema,
      options
    )
  }

  /**
   * Bulk-import people to a calendar
   * POST /v1/calendar/import-people
   */
  async importPeople(
    request: ImportPeopleRequest,
    options?: PerRequestOptions
  ): Promise<ImportPeopleResponse> {
    return this.fetcher.post(
      '/v1/calendar/import-people',
      request,
      ImportPeopleResponseSchema,
      options
    )
  }

  /**
   * Create a new tag for people on the calendar
   * POST /v1/calendar/create-person-tag
   */
  async createPersonTag(
    request: CreatePersonTagRequest,
    options?: PerRequestOptions
  ): Promise<CreatePersonTagResponse> {
    return this.fetcher.post(
      '/v1/calendar/create-person-tag',
      request,
      CreatePersonTagResponseSchema,
      options
    )
  }

  /**
   * Update an existing person tag
   * POST /v1/calendar/update-person-tag
   */
  async updatePersonTag(
    request: UpdatePersonTagRequest,
    options?: PerRequestOptions
  ): Promise<UpdatePersonTagResponse> {
    return this.fetcher.post(
      '/v1/calendar/update-person-tag',
      request,
      UpdatePersonTagResponseSchema,
      options
    )
  }

  /**
   * Delete a person tag
   * POST /v1/calendar/delete-person-tag
   */
  async deletePersonTag(
    request: DeletePersonTagRequest,
    options?: PerRequestOptions
  ): Promise<DeletePersonTagResponse> {
    return this.fetcher.post(
      '/v1/calendar/delete-person-tag',
      request,
      DeletePersonTagResponseSchema,
      options
    )
  }

  /**
   * Add an existing event to a calendar
   * POST /v1/calendar/add-event
   */
  async addEvent(
    request: AddEventToCalendarRequest,
    options?: PerRequestOptions
  ): Promise<AddEventToCalendarResponse> {
    return this.fetcher.post(
      '/v1/calendar/add-event',
      request,
      AddEventToCalendarResponseSchema,
      options
    )
  }

  /**
   * Apply a tag to specific people in the calendar
   * POST /v1/calendar/person-tags/apply
   */
  async applyPersonTag(
    request: ApplyPersonTagRequest,
    options?: PerRequestOptions
  ): Promise<ApplyPersonTagResponse> {
    return this.fetcher.post(
      '/v1/calendar/person-tags/apply',
      request,
      ApplyPersonTagResponseSchema,
      options
    )
  }

  /**
   * Remove a tag from specified people in the calendar
   * POST /v1/calendar/person-tags/unapply
   */
  async removePersonTag(
    request: RemovePersonTagRequest,
    options?: PerRequestOptions
  ): Promise<RemovePersonTagResponse> {
    return this.fetcher.post(
      '/v1/calendar/person-tags/unapply',
      request,
      RemovePersonTagResponseSchema,
      options
    )
  }
}
