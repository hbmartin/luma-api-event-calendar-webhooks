import type { PerRequestOptions } from '../fetcher.js'
import { Resource } from './base.js'
import {
  type CalendarEventEntry,
  type Coupon,
  type Person,
  type PersonTag,
  type ListCalendarEventsParams,
  ListCalendarEventsParamsSchema,
  ListCalendarEventsResponseSchema,
  type ListCalendarEventsResponse,
  type ListPersonTagsParams,
  ListPersonTagsParamsSchema,
  ListPersonTagsResponseSchema,
  type ListPersonTagsResponse,
  type LookupCalendarEventParams,
  LookupCalendarEventParamsSchema,
  LookupCalendarEventResponseSchema,
  type LookupCalendarEventResponse,
  type ListPeopleParams,
  ListPeopleParamsSchema,
  ListPeopleResponseSchema,
  type ListPeopleResponse,
  type ListCalendarCouponsParams,
  ListCalendarCouponsParamsSchema,
  ListCalendarCouponsResponseSchema,
  type ListCalendarCouponsResponse,
  type CreateCalendarCouponRequest,
  CreateCalendarCouponRequestSchema,
  CreateCalendarCouponResponseSchema,
  type CreateCalendarCouponResponse,
  type UpdateCalendarCouponRequest,
  UpdateCalendarCouponRequestSchema,
  UpdateCalendarCouponResponseSchema,
  type UpdateCalendarCouponResponse,
  type ImportPeopleRequest,
  ImportPeopleRequestSchema,
  ImportPeopleResponseSchema,
  type ImportPeopleResponse,
  type CreatePersonTagRequest,
  CreatePersonTagRequestSchema,
  CreatePersonTagResponseSchema,
  type CreatePersonTagResponse,
  type UpdatePersonTagRequest,
  UpdatePersonTagRequestSchema,
  UpdatePersonTagResponseSchema,
  type UpdatePersonTagResponse,
  type DeletePersonTagRequest,
  DeletePersonTagRequestSchema,
  DeletePersonTagResponseSchema,
  type DeletePersonTagResponse,
  type AddEventToCalendarRequest,
  AddEventToCalendarRequestSchema,
  AddEventToCalendarResponseSchema,
  type AddEventToCalendarResponse,
  type ApplyPersonTagRequest,
  ApplyPersonTagRequestSchema,
  ApplyPersonTagResponseSchema,
  type ApplyPersonTagResponse,
  type RemovePersonTagRequest,
  RemovePersonTagRequestSchema,
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
    return this.getValidated(
      '/v1/calendar/list-events',
      params,
      ListCalendarEventsParamsSchema,
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
    return this.getValidated(
      '/v1/calendar/list-person-tags',
      params,
      ListPersonTagsParamsSchema,
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
    return this.getValidated(
      '/v1/calendar/lookup-event',
      params,
      LookupCalendarEventParamsSchema,
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
    return this.getValidated(
      '/v1/calendar/list-people',
      params,
      ListPeopleParamsSchema,
      ListPeopleResponseSchema,
      options
    )
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
    return this.getValidated(
      '/v1/calendar/coupons',
      params,
      ListCalendarCouponsParamsSchema,
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
    return this.postValidated(
      '/v1/calendar/coupons/create',
      request,
      CreateCalendarCouponRequestSchema,
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
    return this.postValidated(
      '/v1/calendar/coupons/update',
      request,
      UpdateCalendarCouponRequestSchema,
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
    return this.postValidated(
      '/v1/calendar/import-people',
      request,
      ImportPeopleRequestSchema,
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
    return this.postValidated(
      '/v1/calendar/create-person-tag',
      request,
      CreatePersonTagRequestSchema,
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
    return this.postValidated(
      '/v1/calendar/update-person-tag',
      request,
      UpdatePersonTagRequestSchema,
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
    return this.postValidated(
      '/v1/calendar/delete-person-tag',
      request,
      DeletePersonTagRequestSchema,
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
    return this.postValidated(
      '/v1/calendar/add-event',
      request,
      AddEventToCalendarRequestSchema,
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
    return this.postValidated(
      '/v1/calendar/person-tags/apply',
      request,
      ApplyPersonTagRequestSchema,
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
    return this.postValidated(
      '/v1/calendar/person-tags/unapply',
      request,
      RemovePersonTagRequestSchema,
      RemovePersonTagResponseSchema,
      options
    )
  }
}
