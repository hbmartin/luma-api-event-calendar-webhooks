/**
 * Event namespace - bundles EventResource with event-related types
 */

// Re-export the resource class
export { EventResource } from '../client/resources/event.js'

// Re-export event types
export type {
  Host,
  Event,
  GetEventParams,
  GetEventResponse,
  Guest,
  GetGuestParams,
  GetGuestResponse,
  GetGuestsParams,
  GetGuestsResponse,
  CreateEventRequest,
  CreateEventResponse,
  UpdateEventRequest,
  UpdateEventResponse,
  UpdateGuestStatusRequest,
  UpdateGuestStatusResponse,
  AddGuestInput,
  AddGuestsRequest,
  AddGuestsResponse,
  SendInvitesRequest,
  SendInvitesResponse,
  AddHostRequest,
  AddHostResponse,
  Coupon,
  GetEventCouponsParams,
  GetEventCouponsResponse,
  CreateEventCouponRequest,
  CreateEventCouponResponse,
  UpdateEventCouponRequest,
  UpdateEventCouponResponse,
  TicketType,
  ListTicketTypesParams,
  ListTicketTypesResponse,
  GetTicketTypeParams,
  GetTicketTypeResponse,
  CreateTicketTypeRequest,
  CreateTicketTypeResponse,
  UpdateTicketTypeRequest,
  UpdateTicketTypeResponse,
  DeleteTicketTypeRequest,
  DeleteTicketTypeResponse,
} from '../schemas/event.js'
