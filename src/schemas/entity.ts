import { z } from 'zod'
import { EntityTypeSchema } from './common.js'
import { LumaId } from './ids.js'

// Entity lookup request params
export const LookupEntityParamsSchema = z.object({
  slug: z.string(),
})

export type LookupEntityParams = z.infer<typeof LookupEntityParamsSchema>

// Entity schema
export const EntitySchema = z.object({
  api_id: LumaId.EntityApiIdSchema,
  type: EntityTypeSchema,
  name: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
})

export type Entity = z.infer<typeof EntitySchema>

// Lookup entity response
export const LookupEntityResponseSchema = z.object({
  entity: EntitySchema.nullable(),
})

export type LookupEntityResponse = z.infer<typeof LookupEntityResponseSchema>
