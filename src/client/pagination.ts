/** A single page returned by a cursor-paginated Luma endpoint. */
export interface PaginatedPage<Item> {
  entries: Item[]
  has_more: boolean
  next_cursor: string | null
}

/** Fetches one page for the given cursor (undefined requests the first page). */
export type PageFetcher<Item> = (cursor: string | undefined) => Promise<PaginatedPage<Item>>

/**
 * Iterates over every page of a cursor-paginated endpoint.
 *
 * ```ts
 * for await (const page of paginatePages((cursor) => client.webhook.list({ cursor }))) {
 *   console.log(page.entries.length)
 * }
 * ```
 */
export async function* paginatePages<Item>(
  fetchPage: PageFetcher<Item>,
  initialCursor?: string
): AsyncGenerator<PaginatedPage<Item>, void, undefined> {
  let cursor = initialCursor
  let hasMore = true

  while (hasMore) {
    const page = await fetchPage(cursor)
    yield page

    // A null cursor with has_more=true would loop forever, so treat it as the end.
    hasMore = page.has_more && page.next_cursor !== null
    cursor = page.next_cursor ?? undefined
  }
}

/**
 * Iterates over every item of a cursor-paginated endpoint, fetching pages lazily.
 *
 * ```ts
 * for await (const event of paginateItems((cursor) => client.calendar.listEvents({ cursor }))) {
 *   console.log(event.event.name)
 * }
 * ```
 */
export async function* paginateItems<Item>(
  fetchPage: PageFetcher<Item>,
  initialCursor?: string
): AsyncGenerator<Item, void, undefined> {
  for await (const page of paginatePages(fetchPage, initialCursor)) {
    yield* page.entries
  }
}
