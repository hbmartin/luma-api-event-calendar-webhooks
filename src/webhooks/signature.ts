import type { WebhookVerificationFailureReason } from '../errors.js'

/**
 * Header carrying Luma's webhook signature, formatted as `t=<unix seconds>,v1=<hex hmac>`.
 * See https://help.luma.com/p/webhooks
 */
export const WEBHOOK_SIGNATURE_HEADER = 'webhook-signature'

const DEFAULT_TOLERANCE_IN_SECONDS = 300
const MILLISECONDS_PER_SECOND = 1000

/** Reasons signature verification itself can fail (excludes configuration problems). */
export type WebhookSignatureFailureReason = Exclude<
  WebhookVerificationFailureReason,
  'missing-secret'
>

export interface WebhookSignatureHeader {
  /** Unix timestamp (seconds) taken from the `t` field. */
  timestamp: number
  /** All `v1` signatures present in the header, hex-encoded. */
  signatures: string[]
}

export type WebhookSignatureVerification =
  | { valid: true; timestamp: number }
  | { valid: false; reason: WebhookSignatureFailureReason }

const UNIX_SECONDS_PATTERN = /^\d+$/

const parseTimestamp = (value: string): number | undefined =>
  UNIX_SECONDS_PATTERN.test(value) ? Number.parseInt(value, 10) : undefined

type HeaderField = [key: string, value: string]

const splitHeaderPart = (part: string): HeaderField | undefined => {
  const separatorIndex = part.indexOf('=')
  if (separatorIndex === -1) {
    return undefined
  }

  return [part.slice(0, separatorIndex).trim(), part.slice(separatorIndex + 1).trim()]
}

const findTimestamp = (fields: HeaderField[]): number | undefined => {
  const timestampField = fields.find(([key]) => key === 't')
  return timestampField === undefined ? undefined : parseTimestamp(timestampField[1])
}

const collectSignatures = (fields: HeaderField[]): string[] =>
  fields.filter(([key, value]) => key === 'v1' && value.length > 0).map(([, value]) => value)

/**
 * Parses a `webhook-signature` header of the form `t=<timestamp>,v1=<signature>`.
 * Multiple `v1` entries (e.g. during secret rotation) are all collected.
 * @returns The parsed header, or undefined when it is malformed.
 */
export function parseWebhookSignatureHeader(header: string): WebhookSignatureHeader | undefined {
  const fields = header
    .split(',')
    .map((part) => splitHeaderPart(part))
    .filter((field) => field !== undefined)
  const timestamp = findTimestamp(fields)
  const signatures = collectSignatures(fields)

  return timestamp === undefined || signatures.length === 0 ? undefined : { timestamp, signatures }
}

const HEX_PATTERN = /^[\da-f]+$/i

const isHexString = (hex: string): boolean =>
  hex.length > 0 && hex.length % 2 === 0 && HEX_PATTERN.test(hex)

const parseHexBytes = (hex: string): Uint8Array<ArrayBuffer> => {
  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  }
  return bytes
}

const hexToBytes = (hex: string): Uint8Array<ArrayBuffer> | undefined =>
  isHexString(hex) ? parseHexBytes(hex) : undefined

const importHmacKey = (secret: string): Promise<CryptoKey> =>
  globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )

interface MatchesAnySignatureParams {
  secret: string
  timestamp: number
  payload: string
  signatures: string[]
}

interface MatchesSignatureParams {
  key: CryptoKey
  signedPayload: Uint8Array<ArrayBuffer>
  signature: string
}

const matchesSignature = async ({
  key,
  signedPayload,
  signature,
}: MatchesSignatureParams): Promise<boolean> => {
  const signatureBytes = hexToBytes(signature)
  if (signatureBytes === undefined) {
    return false
  }

  // crypto.subtle.verify performs a constant-time comparison internally.
  return globalThis.crypto.subtle.verify('HMAC', key, signatureBytes, signedPayload)
}

const matchesAnySignature = async ({
  secret,
  timestamp,
  payload,
  signatures,
}: MatchesAnySignatureParams): Promise<boolean> => {
  const key = await importHmacKey(secret)
  const signedPayload = new TextEncoder().encode(`${timestamp}.${payload}`)
  const results = await Promise.all(
    signatures.map((signature) => matchesSignature({ key, signedPayload, signature }))
  )

  return results.includes(true)
}

export interface VerifyWebhookSignatureParams {
  /** Raw request body, exactly as received and before any JSON parsing. */
  payload: string
  /** Value of the `webhook-signature` header, if present. */
  header: string | null | undefined
  /** Webhook signing secret from Luma (starts with `whsec_`). */
  secret: string
  /**
   * Maximum allowed clock skew between the signature timestamp and now, in
   * seconds. Guards against replay attacks. Defaults to 300 (5 minutes).
   */
  toleranceInSeconds?: number
  /** Current unix time in seconds, overridable for tests. Defaults to Date.now() / 1000. */
  nowInSeconds?: number
}

/**
 * Verifies that a webhook delivery was signed by Luma. The signature is an
 * HMAC-SHA256 of `${timestamp}.${payload}` keyed with the webhook secret,
 * carried in the `webhook-signature` header as `t=<timestamp>,v1=<hex digest>`.
 * Uses WebCrypto, so it works in Node.js, Deno, Bun, browsers, and edge runtimes.
 */
export async function verifyWebhookSignature({
  payload,
  header,
  secret,
  toleranceInSeconds = DEFAULT_TOLERANCE_IN_SECONDS,
  nowInSeconds,
}: VerifyWebhookSignatureParams): Promise<WebhookSignatureVerification> {
  if (header === null || header === undefined || header.length === 0) {
    return { valid: false, reason: 'missing-header' }
  }

  const parsedHeader = parseWebhookSignatureHeader(header)
  if (parsedHeader === undefined) {
    return { valid: false, reason: 'malformed-header' }
  }

  const now = nowInSeconds ?? Math.floor(Date.now() / MILLISECONDS_PER_SECOND)
  if (Math.abs(now - parsedHeader.timestamp) > toleranceInSeconds) {
    return { valid: false, reason: 'timestamp-out-of-tolerance' }
  }

  const matched = await matchesAnySignature({
    secret,
    timestamp: parsedHeader.timestamp,
    payload,
    signatures: parsedHeader.signatures,
  })

  return matched
    ? { valid: true, timestamp: parsedHeader.timestamp }
    : { valid: false, reason: 'signature-mismatch' }
}
