import { z } from 'zod'

const createIdSchema = <TBrand extends string>() => z.string().trim().min(1).brand<TBrand>()

export namespace LumaId {
  export const CalendarIdSchema = createIdSchema<'CalendarId'>()
  export type CalendarId = z.infer<typeof CalendarIdSchema>

  export const CalendarEventEntryApiIdSchema = createIdSchema<'CalendarEventEntryApiId'>()
  export type CalendarEventEntryApiId = z.infer<typeof CalendarEventEntryApiIdSchema>

  export const CouponApiIdSchema = createIdSchema<'CouponApiId'>()
  export type CouponApiId = z.infer<typeof CouponApiIdSchema>

  export const EntityApiIdSchema = createIdSchema<'EntityApiId'>()
  export type EntityApiId = z.infer<typeof EntityApiIdSchema>

  export const EventApiIdSchema = createIdSchema<'EventApiId'>()
  export type EventApiId = z.infer<typeof EventApiIdSchema>

  export const GuestApiIdSchema = createIdSchema<'GuestApiId'>()
  export type GuestApiId = z.infer<typeof GuestApiIdSchema>

  export const HostApiIdSchema = createIdSchema<'HostApiId'>()
  export type HostApiId = z.infer<typeof HostApiIdSchema>

  export const MemberApiIdSchema = createIdSchema<'MemberApiId'>()
  export type MemberApiId = z.infer<typeof MemberApiIdSchema>

  export const MembershipTierApiIdSchema = createIdSchema<'MembershipTierApiId'>()
  export type MembershipTierApiId = z.infer<typeof MembershipTierApiIdSchema>

  export const PersonApiIdSchema = createIdSchema<'PersonApiId'>()
  export type PersonApiId = z.infer<typeof PersonApiIdSchema>

  export const PersonTagApiIdSchema = createIdSchema<'PersonTagApiId'>()
  export type PersonTagApiId = z.infer<typeof PersonTagApiIdSchema>

  export const SeriesApiIdSchema = createIdSchema<'SeriesApiId'>()
  export type SeriesApiId = z.infer<typeof SeriesApiIdSchema>

  export const TicketTypeApiIdSchema = createIdSchema<'TicketTypeApiId'>()
  export type TicketTypeApiId = z.infer<typeof TicketTypeApiIdSchema>

  export const UserApiIdSchema = createIdSchema<'UserApiId'>()
  export type UserApiId = z.infer<typeof UserApiIdSchema>

  export const WebhookApiIdSchema = createIdSchema<'WebhookApiId'>()
  export type WebhookApiId = z.infer<typeof WebhookApiIdSchema>
}
