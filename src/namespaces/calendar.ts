/**
 * Calendar namespace - bundles CalendarResource with calendar-related types
 */

// Re-export the resource class
export { CalendarResource } from '../client/resources/calendar.js'

// Re-export calendar types
export type {
  CalendarEventEntry,
  ListCalendarEventsParams,
  ListCalendarEventsResponse,
  PersonTag,
  ListPersonTagsParams,
  ListPersonTagsResponse,
  LookupCalendarEventParams,
  LookupCalendarEventResponse,
  Person,
  ListPeopleParams,
  ListPeopleResponse,
  ListCalendarCouponsParams,
  ListCalendarCouponsResponse,
  CreateCalendarCouponRequest,
  CreateCalendarCouponResponse,
  UpdateCalendarCouponRequest,
  UpdateCalendarCouponResponse,
  ImportPersonInput,
  ImportPeopleRequest,
  ImportPeopleResponse,
  CreatePersonTagRequest,
  CreatePersonTagResponse,
  UpdatePersonTagRequest,
  UpdatePersonTagResponse,
  DeletePersonTagRequest,
  DeletePersonTagResponse,
  AddEventToCalendarRequest,
  AddEventToCalendarResponse,
  ApplyPersonTagRequest,
  ApplyPersonTagResponse,
  RemovePersonTagRequest,
  RemovePersonTagResponse,
} from '../schemas/calendar.js'
