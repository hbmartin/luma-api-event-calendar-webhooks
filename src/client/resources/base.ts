import type { Fetcher, PerRequestOptions, QueryParams } from '../fetcher.js'
import type { z } from 'zod'
import { LumaValidationError } from '../../errors.js'

/**
 * Validates request input against its schema, throwing a LumaValidationError
 * (matching the client's error model) instead of a raw ZodError. Branded ids
 * accept plain strings on input and come out branded for internal use.
 */
const parseRequestInput = <ReqSchema extends z.ZodType>(
  requestSchema: ReqSchema,
  input: unknown
): z.output<ReqSchema> => {
  const result = requestSchema.safeParse(input)
  if (!result.success) {
    throw new LumaValidationError(result.error)
  }

  return result.data
}

export class Resource {
  constructor(protected readonly fetcher: Fetcher) {}

  /**
   * Validates GET params through their request schema (accepting plain-string
   * ids and branding them internally), then issues the request. Undefined
   * params validate as an empty object so paginated list endpoints work.
   */
  protected async getValidated<ReqSchema extends z.ZodType<QueryParams>, TRes>(
    path: string,
    params: z.input<ReqSchema> | undefined,
    requestSchema: ReqSchema,
    responseSchema: z.ZodType<TRes>,
    options?: PerRequestOptions
  ): Promise<TRes> {
    return this.fetcher.get(
      path,
      parseRequestInput(requestSchema, params ?? {}),
      responseSchema,
      options
    )
  }

  /**
   * Validates a POST body through its request schema (accepting plain-string
   * ids and branding them internally), then issues the request.
   */
  protected async postValidated<ReqSchema extends z.ZodType, TRes>(
    path: string,
    body: z.input<ReqSchema>,
    requestSchema: ReqSchema,
    responseSchema: z.ZodType<TRes>,
    options?: PerRequestOptions
  ): Promise<TRes> {
    return this.fetcher.post(path, parseRequestInput(requestSchema, body), responseSchema, options)
  }
}
