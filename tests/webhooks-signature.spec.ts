import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { Webhook } from '../src/index.js'

const { parseWebhookSignatureHeader, verifyWebhookSignature, WEBHOOK_SIGNATURE_HEADER } = Webhook

const SECRET = 'whsec_test_secret_value'
const NOW = 1_700_000_000

const sign = (payload: string, timestamp: number, secret: string = SECRET): string =>
  createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex')

const headerFor = (payload: string, timestamp: number = NOW, secret: string = SECRET): string =>
  `t=${timestamp},v1=${sign(payload, timestamp, secret)}`

describe('WEBHOOK_SIGNATURE_HEADER', () => {
  it('should be the lowercase header name', () => {
    expect(WEBHOOK_SIGNATURE_HEADER).toBe('webhook-signature')
  })
})

describe('parseWebhookSignatureHeader', () => {
  it('should parse timestamp and signature', () => {
    const parsed = parseWebhookSignatureHeader('t=1700000000,v1=abcdef')
    expect(parsed).toEqual({ timestamp: 1_700_000_000, signatures: ['abcdef'] })
  })

  it('should collect multiple v1 signatures', () => {
    const parsed = parseWebhookSignatureHeader('t=1700000000,v1=aaaa,v1=bbbb')
    expect(parsed).toEqual({ timestamp: 1_700_000_000, signatures: ['aaaa', 'bbbb'] })
  })

  it('should cap collected v1 signatures', () => {
    const signatureFields = Array.from(
      { length: 12 },
      (_unused, index) => `v1=${index.toString().padStart(2, '0')}`
    )
    const parsed = parseWebhookSignatureHeader(`t=1700000000,${signatureFields.join(',')}`)

    expect(parsed?.signatures).toEqual(['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'])
  })

  it('should tolerate whitespace around fields', () => {
    const parsed = parseWebhookSignatureHeader(' t=1700000000 , v1=abcdef ')
    expect(parsed).toEqual({ timestamp: 1_700_000_000, signatures: ['abcdef'] })
  })

  it('should return undefined when the timestamp is missing', () => {
    expect(parseWebhookSignatureHeader('v1=abcdef')).toBeUndefined()
  })

  it('should return undefined when no signature is present', () => {
    expect(parseWebhookSignatureHeader('t=1700000000')).toBeUndefined()
  })

  it('should return undefined for a non-numeric timestamp', () => {
    expect(parseWebhookSignatureHeader('t=not-a-number,v1=abcdef')).toBeUndefined()
  })

  it('should return undefined for garbage input', () => {
    expect(parseWebhookSignatureHeader('garbage')).toBeUndefined()
  })
})

describe('verifyWebhookSignature', () => {
  const payload = JSON.stringify({ type: 'event.created', created_at: '2024-01-01T00:00:00Z' })

  it('should accept a valid signature', async () => {
    const result = await verifyWebhookSignature({
      payload,
      header: headerFor(payload),
      secret: SECRET,
      nowInSeconds: NOW,
    })
    expect(result).toEqual({ valid: true, timestamp: NOW })
  })

  it('should accept when any of several v1 signatures matches', async () => {
    const header = `t=${NOW},v1=${'0'.repeat(64)},v1=${sign(payload, NOW)}`
    const result = await verifyWebhookSignature({
      payload,
      header,
      secret: SECRET,
      nowInSeconds: NOW,
    })
    expect(result).toEqual({ valid: true, timestamp: NOW })
  })

  it('should reject a valid signature after the signature cap', async () => {
    const invalidSignatures = Array.from({ length: 10 }, () => `v1=${'0'.repeat(64)}`)
    const header = `t=${NOW},${invalidSignatures.join(',')},v1=${sign(payload, NOW)}`

    const result = await verifyWebhookSignature({
      payload,
      header,
      secret: SECRET,
      nowInSeconds: NOW,
    })

    expect(result).toEqual({ valid: false, reason: 'signature-mismatch' })
  })

  it('should reject a missing header', async () => {
    for (const header of [null, undefined, '']) {
      const result = await verifyWebhookSignature({
        payload,
        header,
        secret: SECRET,
        nowInSeconds: NOW,
      })
      expect(result).toEqual({ valid: false, reason: 'missing-header' })
    }
  })

  it('should reject a malformed header', async () => {
    const result = await verifyWebhookSignature({
      payload,
      header: 'not-a-signature',
      secret: SECRET,
      nowInSeconds: NOW,
    })
    expect(result).toEqual({ valid: false, reason: 'malformed-header' })
  })

  it('should reject a signature computed with the wrong secret', async () => {
    const result = await verifyWebhookSignature({
      payload,
      header: headerFor(payload, NOW, 'whsec_other_secret'),
      secret: SECRET,
      nowInSeconds: NOW,
    })
    expect(result).toEqual({ valid: false, reason: 'signature-mismatch' })
  })

  it('should reject a tampered payload', async () => {
    const result = await verifyWebhookSignature({
      payload: `${payload} `,
      header: headerFor(payload),
      secret: SECRET,
      nowInSeconds: NOW,
    })
    expect(result).toEqual({ valid: false, reason: 'signature-mismatch' })
  })

  it('should reject a non-hex signature', async () => {
    const result = await verifyWebhookSignature({
      payload,
      header: `t=${NOW},v1=zzzz`,
      secret: SECRET,
      nowInSeconds: NOW,
    })
    expect(result).toEqual({ valid: false, reason: 'signature-mismatch' })
  })

  it('should reject timestamps outside the tolerance window', async () => {
    const staleTimestamp = NOW - 301
    const result = await verifyWebhookSignature({
      payload,
      header: headerFor(payload, staleTimestamp),
      secret: SECRET,
      nowInSeconds: NOW,
    })
    expect(result).toEqual({ valid: false, reason: 'timestamp-out-of-tolerance' })
  })

  it('should reject timestamps too far in the future', async () => {
    const futureTimestamp = NOW + 301
    const result = await verifyWebhookSignature({
      payload,
      header: headerFor(payload, futureTimestamp),
      secret: SECRET,
      nowInSeconds: NOW,
    })
    expect(result).toEqual({ valid: false, reason: 'timestamp-out-of-tolerance' })
  })

  it('should default a non-finite tolerance to the replay window', async () => {
    const staleTimestamp = NOW - 301
    const result = await verifyWebhookSignature({
      payload,
      header: headerFor(payload, staleTimestamp),
      secret: SECRET,
      toleranceInSeconds: Number.NaN,
      nowInSeconds: NOW,
    })

    expect(result).toEqual({ valid: false, reason: 'timestamp-out-of-tolerance' })
  })

  it('should default a non-finite current time to Date.now', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW * 1000)

    try {
      const staleTimestamp = NOW - 301
      const result = await verifyWebhookSignature({
        payload,
        header: headerFor(payload, staleTimestamp),
        secret: SECRET,
        nowInSeconds: Number.POSITIVE_INFINITY,
      })

      expect(result).toEqual({ valid: false, reason: 'timestamp-out-of-tolerance' })
    } finally {
      vi.useRealTimers()
    }
  })

  it('should honor a custom tolerance', async () => {
    const staleTimestamp = NOW - 600
    const result = await verifyWebhookSignature({
      payload,
      header: headerFor(payload, staleTimestamp),
      secret: SECRET,
      toleranceInSeconds: 900,
      nowInSeconds: NOW,
    })
    expect(result).toEqual({ valid: true, timestamp: staleTimestamp })
  })

  it('should default nowInSeconds to the current time', async () => {
    const timestamp = Math.floor(Date.now() / 1000)
    const result = await verifyWebhookSignature({
      payload,
      header: headerFor(payload, timestamp),
      secret: SECRET,
    })
    expect(result.valid).toBe(true)
  })
})
