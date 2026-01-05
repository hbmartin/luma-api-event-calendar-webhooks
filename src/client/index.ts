import { createFetcher, type FetcherOptions, type Fetcher } from './fetcher.js'
import { CalendarResource } from './resources/calendar.js'
import { EntityResource } from './resources/entity.js'
import { EventResource } from './resources/event.js'
import { ImagesResource } from './resources/images.js'
import { MembershipResource } from './resources/membership.js'
import { UserResource } from './resources/user.js'
import { WebhookResource } from './resources/webhook.js'

export interface LumaClientOptions extends FetcherOptions {}

export class LumaClient {
  private readonly fetcher: Fetcher

  public readonly user: UserResource
  public readonly entity: EntityResource
  public readonly images: ImagesResource
  public readonly event: EventResource
  public readonly calendar: CalendarResource
  public readonly membership: MembershipResource
  public readonly webhook: WebhookResource

  constructor(options: LumaClientOptions) {
    this.fetcher = createFetcher(options)

    this.user = new UserResource(this.fetcher)
    this.entity = new EntityResource(this.fetcher)
    this.images = new ImagesResource(this.fetcher)
    this.event = new EventResource(this.fetcher)
    this.calendar = new CalendarResource(this.fetcher)
    this.membership = new MembershipResource(this.fetcher)
    this.webhook = new WebhookResource(this.fetcher)
  }
}

// Re-export fetcher utilities
export { createFetcher, BASE_URL, parseRetryAfter } from './fetcher.js'
export type { FetcherOptions, Fetcher, RequestOptions, FetcherConfig } from './fetcher.js'
