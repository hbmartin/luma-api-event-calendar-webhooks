import type { VerifyWebhookSignatureParams } from './signature.js'
import type {
  CalendarEventAddedPayload,
  CalendarPersonSubscribedPayload,
  EventCreatedPayload,
  EventUpdatedPayload,
  GuestRegisteredPayload,
  GuestUpdatedPayload,
  TicketRegisteredPayload,
  WebhookPayload,
} from '../schemas/webhook.js'
import { verifyWebhookSignature } from './signature.js'
import { LumaWebhookConfigurationError, LumaWebhookSignatureError } from '../errors.js'
import { parseWebhookPayload, parseWebhookPayloadFromRawBody } from '../schemas/webhook.js'

export type WebhookCallback<Payload> = (payload: Payload) => void | Promise<void>

export interface WebhookHandlerCallbacks {
  onEventCreated?: WebhookCallback<EventCreatedPayload>
  onEventUpdated?: WebhookCallback<EventUpdatedPayload>
  onGuestRegistered?: WebhookCallback<GuestRegisteredPayload>
  onGuestUpdated?: WebhookCallback<GuestUpdatedPayload>
  onTicketRegistered?: WebhookCallback<TicketRegisteredPayload>
  onCalendarEventAdded?: WebhookCallback<CalendarEventAddedPayload>
  onCalendarPersonSubscribed?: WebhookCallback<CalendarPersonSubscribedPayload>
  /** Called for payload types that have no dedicated callback registered. */
  onUnhandled?: WebhookCallback<WebhookPayload>
}

interface InvokeCallbackParams<Payload extends WebhookPayload> {
  callback: WebhookCallback<Payload> | undefined
  payload: Payload
  onUnhandled: WebhookCallback<WebhookPayload> | undefined
}

const invokeCallback = async <Payload extends WebhookPayload>({
  callback,
  payload,
  onUnhandled,
}: InvokeCallbackParams<Payload>): Promise<void> => {
  if (callback !== undefined) {
    await callback(payload)
    return
  }

  if (onUnhandled !== undefined) {
    await onUnhandled(payload)
  }
}

const dispatchPayload = async (
  callbacks: WebhookHandlerCallbacks,
  payload: WebhookPayload
): Promise<void> => {
  const { onUnhandled } = callbacks

  switch (payload.type) {
    case 'event.created': {
      return invokeCallback({ callback: callbacks.onEventCreated, payload, onUnhandled })
    }
    case 'event.updated': {
      return invokeCallback({ callback: callbacks.onEventUpdated, payload, onUnhandled })
    }
    case 'guest.registered': {
      return invokeCallback({ callback: callbacks.onGuestRegistered, payload, onUnhandled })
    }
    case 'guest.updated': {
      return invokeCallback({ callback: callbacks.onGuestUpdated, payload, onUnhandled })
    }
    case 'ticket.registered': {
      return invokeCallback({ callback: callbacks.onTicketRegistered, payload, onUnhandled })
    }
    case 'calendar.event.added': {
      return invokeCallback({ callback: callbacks.onCalendarEventAdded, payload, onUnhandled })
    }
    case 'calendar.person.subscribed': {
      return invokeCallback({
        callback: callbacks.onCalendarPersonSubscribed,
        payload,
        onUnhandled,
      })
    }
  }
}

export interface WebhookRequestInput {
  /** Raw request body, exactly as received. */
  body: string
  /** Value of the `webhook-signature` header, if present. */
  signatureHeader: string | null | undefined
}

export interface WebhookHandler {
  /**
   * Validates an already-parsed payload and dispatches it to the matching
   * callback. Performs no signature verification.
   * @returns The parsed, narrowed payload.
   * @throws ZodError when the payload does not match any known webhook type.
   */
  handle(payload: unknown): Promise<WebhookPayload>
}

export interface VerifyingWebhookHandler extends WebhookHandler {
  /**
   * Verifies the `webhook-signature` header against the raw body, then parses
   * and dispatches the payload.
   * @throws LumaWebhookSignatureError when verification fails.
   * @throws LumaWebhookConfigurationError when no signing secret is configured.
   */
  handleRequest(input: WebhookRequestInput): Promise<WebhookPayload>
}

export interface CreateWebhookHandlerOptions extends WebhookHandlerCallbacks {
  /** Webhook signing secret from Luma (starts with `whsec_`). Enables handleRequest(). */
  secret?: string
  /** Clock-skew tolerance for signature timestamps, in seconds. Defaults to 300. */
  toleranceInSeconds?: number
}

const requireSecret = (value: string | undefined): string => {
  if (value === undefined) {
    throw new LumaWebhookConfigurationError('missing-secret')
  }

  return value
}

const verifyRequestOrThrow = async (params: VerifyWebhookSignatureParams): Promise<void> => {
  const verification = await verifyWebhookSignature(params)
  if (!verification.valid) {
    throw new LumaWebhookSignatureError(verification.reason)
  }
}

/**
 * Creates a typed webhook dispatcher. Each callback receives the payload
 * narrowed to its event type, so no manual switching on `payload.type` is
 * needed. When a `secret` is provided, the returned handler also exposes
 * `handleRequest()` which verifies Luma's webhook signature before dispatching.
 */
export function createWebhookHandler(
  options: CreateWebhookHandlerOptions & { secret: string }
): VerifyingWebhookHandler
export function createWebhookHandler(options: CreateWebhookHandlerOptions): WebhookHandler
export function createWebhookHandler(
  options: CreateWebhookHandlerOptions
): VerifyingWebhookHandler {
  const dispatch = async (parsed: WebhookPayload): Promise<WebhookPayload> => {
    await dispatchPayload(options, parsed)
    return parsed
  }

  const handle = async (payload: unknown): Promise<WebhookPayload> =>
    dispatch(parseWebhookPayload(payload))

  const handleRequest = async ({
    body,
    signatureHeader,
  }: WebhookRequestInput): Promise<WebhookPayload> => {
    await verifyRequestOrThrow({
      payload: body,
      header: signatureHeader,
      secret: requireSecret(options.secret),
      toleranceInSeconds: options.toleranceInSeconds,
    })

    return dispatch(parseWebhookPayloadFromRawBody(body))
  }

  return { handle, handleRequest }
}
