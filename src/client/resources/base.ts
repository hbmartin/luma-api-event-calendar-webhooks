import type { Fetcher } from '../fetcher.js'

export class Resource {
  constructor(protected readonly fetcher: Fetcher) {}
}
