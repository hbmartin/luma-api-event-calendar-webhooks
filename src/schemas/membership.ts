import { z } from 'zod'
import {
  MembershipStatusSchema,
  PaginatedResponseSchema,
  PaginationParamsSchema,
} from './common.js'
import { LumaId } from './ids.js'

// Membership tier schema
export const MembershipTierSchema = z.object({
  api_id: LumaId.MembershipTierApiIdSchema,
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  billing_period: z.enum(['monthly', 'yearly', 'one_time']).nullable().optional(),
  is_free: z.boolean().nullable().optional(),
  is_default: z.boolean().nullable().optional(),
  member_count: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export type MembershipTier = z.infer<typeof MembershipTierSchema>

// List membership tiers params
export const ListMembershipTiersParamsSchema = PaginationParamsSchema

export type ListMembershipTiersParams = z.infer<typeof ListMembershipTiersParamsSchema>

// List membership tiers response
export const ListMembershipTiersResponseSchema = PaginatedResponseSchema(MembershipTierSchema)

export type ListMembershipTiersResponse = z.infer<typeof ListMembershipTiersResponseSchema>

// Member schema
export const MemberSchema = z.object({
  api_id: LumaId.MemberApiIdSchema,
  user_api_id: LumaId.UserApiIdSchema.nullable().optional(),
  tier_api_id: LumaId.MembershipTierApiIdSchema.nullable().optional(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  status: MembershipStatusSchema.nullable().optional(),
  joined_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export type Member = z.infer<typeof MemberSchema>

// Add member to tier request
export const AddMemberToTierRequestSchema = z.object({
  tier_api_id: LumaId.MembershipTierApiIdSchema,
  email: z.string().email(),
  name: z.string().optional(),
})

export type AddMemberToTierRequest = z.infer<typeof AddMemberToTierRequestSchema>

// Add member to tier response
export const AddMemberToTierResponseSchema = z.object({
  member: MemberSchema,
})

export type AddMemberToTierResponse = z.infer<typeof AddMemberToTierResponseSchema>

// Update member status request
const UpdateMemberStatusByUserApiIdSchema = z
  .object({
    tier_api_id: LumaId.MembershipTierApiIdSchema,
    user_api_id: LumaId.UserApiIdSchema,
    status: z.enum(['approved', 'declined']),
  })
  .strict()

const UpdateMemberStatusByEmailSchema = z
  .object({
    tier_api_id: LumaId.MembershipTierApiIdSchema,
    email: z.string().email(),
    status: z.enum(['approved', 'declined']),
  })
  .strict()

export const UpdateMemberStatusRequestSchema = z.union([
  UpdateMemberStatusByUserApiIdSchema,
  UpdateMemberStatusByEmailSchema,
])

export type UpdateMemberStatusRequest = z.infer<typeof UpdateMemberStatusRequestSchema>

// Update member status response
export const UpdateMemberStatusResponseSchema = z.object({
  member: MemberSchema,
})

export type UpdateMemberStatusResponse = z.infer<typeof UpdateMemberStatusResponseSchema>
