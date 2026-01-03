# Luma API Event Calendar Webhooks

A TypeScript client for the Luma public API with first-class support for events, calendars, memberships, images, entities, and webhooks. Responses are validated with Zod, and webhook payloads can be parsed and narrowed safely with discriminated unions.

## Features

- Typed Luma API client with resource-based methods
- Zod-validated responses and exportable schemas
- Webhook configuration + payload parsing for incoming events
- Built-in error classes with rate limit handling
- ESM + CJS builds with TypeScript types

## Requirements

- Luma Plus subscription (required by Luma API)
- A Luma API key from your Luma dashboard
- Node.js >= 22
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
})
```

Authentication uses the `x-luma-api-key` header. Luma docs include a simple curl example:
https://docs.luma.com/reference/getting-started-with-your-api

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
- `client.calendar`
  - `listEvents`, `lookupEvent`, `listPeople`, `listPersonTags`
  - `listCoupons`, `createCoupon`, `updateCoupon`
  - `importPeople`, `createPersonTag`, `updatePersonTag`, `deletePersonTag`
  - `addEvent`, `applyPersonTag`, `removePersonTag`
- `client.membership`
  - `listTiers`, `addMemberToTier`, `updateMemberStatus`
- `client.webhook`
  - `list`, `get`, `create`, `update`, `delete`
- `client.entity`
  - `lookup`
- `client.images`
  - `createUploadUrl`

For full request/response shapes, use the exported schemas and types.

## Using Schemas

The library exports all Zod schemas and TypeScript types under the `Schemas` namespace.

```ts
import { Schemas } from 'luma-api-event-calendar-webhooks'

const parsed = Schemas.GetEventResponseSchema.parse(apiResponse)
```

## Webhook Payload Parsing

Incoming webhook payloads can be validated and narrowed by `type`.

```ts
import { Schemas } from 'luma-api-event-calendar-webhooks'

const payload = Schemas.parseWebhookPayload(requestBody)

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
You can also use `parseRetryAfter` directly if needed.

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
