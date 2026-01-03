import { z } from "zod";

// User schema
export const UserSchema = z.object({
  api_id: z.string(),
  email: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  bio_short: z.string().nullable().optional(),
  instagram_handle: z.string().nullable().optional(),
  twitter_handle: z.string().nullable().optional(),
  linkedin_handle: z.string().nullable().optional(),
  youtube_handle: z.string().nullable().optional(),
  tiktok_handle: z.string().nullable().optional(),
  website_url: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Get Self response schema
export const GetSelfResponseSchema = z.object({
  user: UserSchema,
});

export type GetSelfResponse = z.infer<typeof GetSelfResponseSchema>;
