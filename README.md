# Luma API Event Calendar Webhooks

A TypeScript client for the Luma public API with first-class support for events, calendars, memberships, images, entities, and webhooks. Responses are validated with Zod, and webhook payloads can be parsed and narrowed safely with discriminated unions.

## Features

- Typed Luma API client with resource-based methods
- Zod-validated responses and exportable schemas
- Auto-pagination via `for await` iterators on every list endpoint
- Opt-in retries with exponential backoff, jitter, and `Retry-After` support
- Per-request cancellation with `AbortSignal`
- Injectable `fetch` for proxies, instrumentation, and tests
- Webhook configuration, signature verification, and a typed webhook handler
- Built-in error classes with rate limit handling
- Debug hook for request/response logging
- ESM + CJS builds with TypeScript types
- No Node-only dependencies — runs on any fetch-capable runtime (Node.js, Deno, Bun, Cloudflare Workers, Vercel Edge, browsers)

## Requirements

- Luma Plus subscription (required by Luma API)
- A Luma API key from your Luma dashboard
- Any runtime with `fetch`, `AbortSignal.any`, and WebCrypto (Node.js >= 22, Deno, Bun, modern browsers, edge runtimes)
- `zod` installed in your project (peer dependency)

See Luma docs: https://docs.luma.com/reference/getting-started-with-your-api

## Install

```bash
pnpm add luma-api-event-calendar-webhooks zod
```

```bash
npm install luma-api-event-calendar-webhooks zod
```

```bash
yarn add luma-api-event-calendar-webhooks zod
```

## Quick Start

```ts
import { LumaClient } from 'luma-api-event-calendar-webhooks'

const apiKey = process.env.LUMA_API_KEY
if (!apiKey) {
  throw new Error('LUMA_API_KEY environment variable is required')
}

const client = new LumaClient({ apiKey })

const me = await client.user.getSelf()
const event = await client.event.get({ event_api_id: 'evt_123' })

console.log(me.user.email)
console.log(event.event.name)
```

## Configuration

```ts
import { LumaClient, BASE_URL } from 'luma-api-event-calendar-webhooks'

const apiKey = process.env.LUMA_API_KEY
if (!apiKey) {
  throw new Error('LUMA_API_KEY environment variable is required')
}

const client = new LumaClient({
  apiKey,
  baseUrl: BASE_URL, // default: https://public-api.luma.com
  timeout: 30_000, // default: 30000 ms
  retry: {}, // opt-in retries, omit to disable (see "Automatic Retries")
  fetch: myFetch, // optional custom fetch implementation
})
```

### Custom fetch

Pass a `fetch` implementation to route requests through a proxy, add
instrumentation, or stub responses in tests without patching the global:

```ts
const client = new LumaClient({
  apiKey,
  fetch: async (url, init) => {
    console.time(String(url))
    try {
      return await fetch(url, init)
    } finally {
      console.timeEnd(String(url))
    }
  },
})
```

## Automatic Retries

Retries are off by default. Pass `retry` (empty object for the defaults) to
retry rate limits (429), server errors (5xx), and network failures with
exponential backoff and jitter. 429 responses honor the `Retry-After` header.

```ts
const client = new LumaClient({
  apiKey,
  retry: {
    maxRetries: 2, // retries after the initial attempt (default 2)
    initialDelayMs: 500, // base backoff delay (default 500)
    maxDelayMs: 30_000, // cap for any single delay (default 30000)
    backoffMultiplier: 2, // growth factor per attempt (default 2)
  },
})
```

Client errors (4xx other than 429), validation errors, and caller-initiated
aborts are never retried. Note that with retries enabled, a POST that fails at
the network layer may be retried after it reached the server — enable retries
for mutating endpoints only if duplicates are acceptable or handled.

## Cancellation

Every resource method accepts an optional `{ signal }` as its last argument.
The signal is combined with the client timeout via `AbortSignal.any()`, and
aborting rejects the request with a `LumaAbortError`:

```ts
import { LumaAbortError } from 'luma-api-event-calendar-webhooks'

const controller = new AbortController()
const promise = client.calendar.listEvents({ limit: 50 }, { signal: controller.signal })

controller.abort()

try {
  await promise
} catch (error) {
  if (error instanceof LumaAbortError) {
    console.log('request cancelled')
  }
}
```

Authentication uses the `x-luma-api-key` header. Luma docs include a simple curl example:
https://docs.luma.com/reference/getting-started-with-your-api

## Debug Hook

Add a `debug` callback to log all requests and responses for debugging:

```ts
import { LumaClient, type DebugContext } from 'luma-api-event-calendar-webhooks'

const client = new LumaClient({
  apiKey: process.env.LUMA_API_KEY!,
  debug: (ctx: DebugContext) => {
    console.log(`${ctx.request.method} ${ctx.request.url} [${ctx.durationMs}ms]`)

    if (ctx.outcome.type === 'success') {
      console.log(`Status: ${ctx.outcome.response.status}`)
    } else {
      console.log(`Error: ${ctx.outcome.error.message}`)
    }
  },
})
```

The debug hook is called after each request completes with:

- `request`: Method, URL, headers, and body (for POST/PUT/PATCH)
- `outcome`: Either `{ type: 'success', response }` with status/headers/body, or `{ type: 'error', error }` for network failures
- `durationMs`: Request duration in milliseconds

## Resources

All methods are thin wrappers around the Luma REST endpoints. Request/response types are exported and validated.

- `client.user`
  - `getSelf()`
- `client.event`
  - `get`, `create`, `update`
  - `getGuest`, `getGuests`, `updateGuestStatus`
  - `sendInvites`, `addGuests`, `addHost`
  - `getCoupons`, `createCoupon`, `updateCoupon`
  - `listTicketTypes`, `getTicketType`, `createTicketType`, `updateTicketType`, `deleteTicketType`
  - `getGuestsIterator`, `getCouponsIterator`
- `client.calendar`
  - `listEvents`, `lookupEvent`, `listPeople`, `listPersonTags`
  - `listCoupons`, `createCoupon`, `updateCoupon`
  - `importPeople`, `createPersonTag`, `updatePersonTag`, `deletePersonTag`
  - `addEvent`, `applyPersonTag`, `removePersonTag`
  - `listEventsIterator`, `listPeopleIterator`, `listPersonTagsIterator`, `listCouponsIterator`
- `client.membership`
  - `listTiers`, `addMemberToTier`, `updateMemberStatus`
  - `listTiersIterator`
- `client.webhook`
  - `list`, `get`, `create`, `update`, `delete`
  - `listIterator`
- `client.entity`
  - `lookup`
- `client.images`
  - `createUploadUrl`

For full request/response shapes, use the exported schemas and types.

## Using Types and Schemas

Types are exported via resource namespaces for clean imports:

```ts
import { Event, Calendar, Webhook } from 'luma-api-event-calendar-webhooks'

// Use types from namespaces
type MyEvent = Event.Event
type MyGuest = Event.Guest
type CalendarEntry = Calendar.CalendarEventEntry

// Webhook namespace includes the parseWebhookPayload utility
const payload = Webhook.parseWebhookPayload(requestBody)
```

For Zod schemas, use the `Schemas` namespace:

```ts
import { Schemas } from 'luma-api-event-calendar-webhooks'

const parsed = Schemas.GetEventResponseSchema.parse(apiResponse)
```

## Webhook Payload Parsing

Incoming webhook payloads can be validated and narrowed by `type`.

```ts
import { Webhook } from 'luma-api-event-calendar-webhooks'

const payload = Webhook.parseWebhookPayload(requestBody)

switch (payload.type) {
  case 'event.created':
    console.log(payload.data.event.api_id)
    break
  case 'guest.registered':
    console.log(payload.data.guest.email)
    break
  default:
    // Exhaustive check is enforced by TypeScript
    break
}
```

Supported webhook types include:

* `event.created`
* `event.updated`
* `guest.registered`
* `guest.updated`
* `ticket.registered`
* `calendar.event.added`
* `calendar.person.subscribed`

## Webhook Signature Verification

Luma signs every webhook delivery with an HMAC-SHA256 signature carried in the
`webhook-signature` header (`t=<unix seconds>,v1=<hex digest>`), keyed with the
webhook's `whsec_...` secret (returned when you create the webhook). Always
verify the signature before trusting a delivery. See the
[Luma webhooks docs](https://help.luma.com/p/webhooks).

```ts
import { Webhook } from 'luma-api-event-calendar-webhooks'

// Use the RAW request body string — do not JSON.parse it first.
const result = await Webhook.verifyWebhookSignature({
  payload: rawBody,
  header: request.headers.get(Webhook.WEBHOOK_SIGNATURE_HEADER),
  secret: process.env.LUMA_WEBHOOK_SECRET!,
})

if (!result.valid) {
  // result.reason: 'missing-header' | 'malformed-header' |
  //                'timestamp-out-of-tolerance' | 'signature-mismatch'
  return new Response('invalid signature', { status: 401 })
}
```

Verification uses WebCrypto, so it works in Node.js, Deno, Bun, browsers, and
edge runtimes. Timestamps outside a 5-minute window are rejected to prevent
replay attacks (tune with `toleranceInSeconds`). Multiple `v1` signatures
(e.g. during secret rotation) are supported, capped at 10 checked signatures.

## Typed Webhook Handler

`createWebhookHandler` gives you exhaustive, narrowed callbacks per event type
instead of switching on `payload.type` yourself. With a `secret`, the handler
also exposes `handleRequest()` which verifies the signature before dispatching:

```ts
import { Webhook, LumaWebhookSignatureError } from 'luma-api-event-calendar-webhooks'

const handler = Webhook.createWebhookHandler({
  secret: process.env.LUMA_WEBHOOK_SECRET!,
  onGuestRegistered: async (payload) => {
    // payload is narrowed to GuestRegisteredPayload
    console.log(payload.data.guest.email, payload.data.event.name)
  },
  onEventUpdated: (payload) => {
    console.log('event updated:', payload.data.event.api_id)
  },
  onUnhandled: (payload) => {
    console.log('ignoring', payload.type)
  },
})

// Fetch-API style server (Deno, Bun, Cloudflare Workers, Next.js route handlers):
export async function POST(request: Request): Promise<Response> {
  const body = await request.text()
  try {
    await handler.handleRequest({
      body,
      signatureHeader: request.headers.get(Webhook.WEBHOOK_SIGNATURE_HEADER),
    })
    return new Response('ok')
  } catch (error) {
    if (error instanceof LumaWebhookSignatureError) {
      return new Response('invalid signature', { status: 401 })
    }
    throw error
  }
}
```

With Express, make sure you read the raw body (e.g. `express.raw()` or
`express.text()`) so the signature is computed over the exact bytes Luma sent:

```ts
app.post('/luma-webhook', express.text({ type: 'application/json' }), async (req, res) => {
  try {
    await handler.handleRequest({
      body: req.body,
      signatureHeader: req.header(Webhook.WEBHOOK_SIGNATURE_HEADER),
    })
    res.sendStatus(200)
  } catch {
    res.sendStatus(401)
  }
})
```

If you only need dispatching (verification handled elsewhere), omit the
`secret` and call `handler.handle(parsedPayload)`.

## Pagination

List endpoints accept `cursor` and `limit`. The client automatically maps them to
Luma's `pagination_cursor` and `pagination_limit` query params.

```ts
const page = await client.calendar.listEvents({
  limit: 50,
  cursor: 'next-page-token',
})

if (page.has_more) {
  console.log(page.next_cursor)
}
```

### Auto-pagination

Every paginated endpoint has an `...Iterator` counterpart that fetches pages
lazily as you consume it, so you never loop over cursors by hand:

```ts
for await (const entry of client.calendar.listEventsIterator({ limit: 50 })) {
  console.log(entry.event.name)
}

for await (const guest of client.event.getGuestsIterator({ event_api_id: 'evt_123' })) {
  console.log(guest.api_id)
}
```

For page-level access, or to paginate a custom call, use the generic helpers:

```ts
import { paginateItems, paginatePages } from 'luma-api-event-calendar-webhooks'

for await (const page of paginatePages((cursor) => client.webhook.list({ cursor }))) {
  console.log(page.entries.length, page.next_cursor)
}

for await (const person of paginateItems((cursor) =>
  client.calendar.listPeople({ cursor, limit: 100 })
)) {
  console.log(person.email)
}
```

## Error Handling

Requests throw typed errors that you can handle in a single place.

```ts
import {
  LumaClient,
  LumaRateLimitError,
  LumaAuthenticationError,
  LumaValidationError,
} from 'luma-api-event-calendar-webhooks'

const client = new LumaClient({ apiKey: '...' })

try {
  await client.user.getSelf()
} catch (error) {
  if (error instanceof LumaRateLimitError) {
    console.error('Rate limited, retry after:', error.retryAfter)
  } else if (error instanceof LumaAuthenticationError) {
    console.error('Invalid API key')
  } else if (error instanceof LumaValidationError) {
    console.error('Response schema mismatch:', error.issues)
  } else {
    throw error
  }
}
```

The `LumaRateLimitError` uses the response `Retry-After` header (seconds or HTTP-date).
You can also use `parseRetryAfter` directly if needed, or enable the built-in
retry policy (see "Automatic Retries") to have 429s handled for you.

Additional error classes: `LumaAbortError` (caller cancelled via `AbortSignal`)
`LumaWebhookSignatureError` (webhook verification failed, with a `reason`), and
`LumaWebhookConfigurationError` (webhook handler configuration failed).

## Rate Limits

Per Luma docs:
- GET endpoints: 500 requests per 5 minutes per calendar
- POST endpoints: 100 requests per 5 minutes per calendar (separate from GET limit)
- Block duration: 1 minute when the limit is exceeded (HTTP 429)

See: https://docs.luma.com/reference/rate-limits

## Development

```bash
pnpm install
pnpm format
pnpm build
pnpm test
npx publint --pack npm
```

## License

MIT
