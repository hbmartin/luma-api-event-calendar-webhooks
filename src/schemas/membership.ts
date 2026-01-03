import { z } from "zod";
import { MembershipStatusSchema, PaginatedResponseSchema } from "./common.js";

// Membership tier schema
export const MembershipTierSchema = z.object({
  api_id: z.string(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  billing_period: z.enum(["monthly", "yearly", "one_time"]).nullable().optional(),
  is_free: z.boolean().nullable().optional(),
  is_default: z.boolean().nullable().optional(),
  member_count: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export type MembershipTier = z.infer<typeof MembershipTierSchema>;

// List membership tiers params
export const ListMembershipTiersParamsSchema = z.object({
  pagination_cursor: z.string().optional(),
  pagination_limit: z.number().int().positive().max(100).optional(),
});

export type ListMembershipTiersParams = z.infer<typeof ListMembershipTiersParamsSchema>;

// List membership tiers response
export const ListMembershipTiersResponseSchema = PaginatedResponseSchema(MembershipTierSchema);

export type ListMembershipTiersResponse = z.infer<typeof ListMembershipTiersResponseSchema>;

// Member schema
export const MemberSchema = z.object({
  api_id: z.string(),
  user_api_id: z.string().nullable().optional(),
  tier_api_id: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  status: MembershipStatusSchema.nullable().optional(),
  joined_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export type Member = z.infer<typeof MemberSchema>;

// Add member to tier request
export const AddMemberToTierRequestSchema = z.object({
  tier_api_id: z.string(),
  email: z.string(),
  name: z.string().optional(),
});

export type AddMemberToTierRequest = z.infer<typeof AddMemberToTierRequestSchema>;

// Add member to tier response
export const AddMemberToTierResponseSchema = z.object({
  member: MemberSchema,
});

export type AddMemberToTierResponse = z.infer<typeof AddMemberToTierResponseSchema>;

// Update member status request
export const UpdateMemberStatusRequestSchema = z.object({
  tier_api_id: z.string(),
  user_api_id: z.string().optional(),
  email: z.string().optional(),
  status: z.enum(["approved", "declined"]),
});

export type UpdateMemberStatusRequest = z.infer<typeof UpdateMemberStatusRequestSchema>;

// Update member status response
export const UpdateMemberStatusResponseSchema = z.object({
  member: MemberSchema,
});

export type UpdateMemberStatusResponse = z.infer<typeof UpdateMemberStatusResponseSchema>;
