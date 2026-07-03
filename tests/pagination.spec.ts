import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LumaClient, BASE_URL, paginateItems, paginatePages, type PaginatedPage } from "../src/index.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const jsonResponse = (body: unknown) => ({
  ok: true,
  headers: new Headers({ "content-type": "application/json" }),
  text: async () => JSON.stringify(body),
});

describe("paginatePages", () => {
  it("should yield a single page when has_more is false", async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      entries: [1, 2, 3],
      has_more: false,
      next_cursor: null,
    });

    const pages: PaginatedPage<number>[] = [];
    for await (const page of paginatePages(fetchPage)) {
      pages.push(page);
    }

    expect(pages).toHaveLength(1);
    expect(pages[0].entries).toEqual([1, 2, 3]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith(undefined);
  });

  it("should follow next_cursor across pages", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ entries: ["a"], has_more: true, next_cursor: "cursor-2" })
      .mockResolvedValueOnce({ entries: ["b"], has_more: true, next_cursor: "cursor-3" })
      .mockResolvedValueOnce({ entries: ["c"], has_more: false, next_cursor: null });

    const pages: PaginatedPage<string>[] = [];
    for await (const page of paginatePages(fetchPage)) {
      pages.push(page);
    }

    expect(pages).toHaveLength(3);
    expect(fetchPage).toHaveBeenNthCalledWith(1, undefined);
    expect(fetchPage).toHaveBeenNthCalledWith(2, "cursor-2");
    expect(fetchPage).toHaveBeenNthCalledWith(3, "cursor-3");
  });

  it("should start from the provided initial cursor", async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      entries: [],
      has_more: false,
      next_cursor: null,
    });

    for await (const _page of paginatePages(fetchPage, "start-here")) {
      // consume
    }

    expect(fetchPage).toHaveBeenCalledWith("start-here");
  });

  it("should stop when has_more is true but next_cursor is null", async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      entries: ["only"],
      has_more: true,
      next_cursor: null,
    });

    const pages: PaginatedPage<string>[] = [];
    for await (const page of paginatePages(fetchPage)) {
      pages.push(page);
    }

    expect(pages).toHaveLength(1);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("should stop early when the consumer breaks", async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      entries: ["x"],
      has_more: true,
      next_cursor: "next",
    });

    for await (const _page of paginatePages(fetchPage)) {
      break;
    }

    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("should propagate fetch errors", async () => {
    const fetchPage = vi.fn().mockRejectedValue(new Error("boom"));

    const iterate = async () => {
      for await (const _page of paginatePages(fetchPage)) {
        // consume
      }
    };

    await expect(iterate()).rejects.toThrow("boom");
  });
});

describe("paginateItems", () => {
  it("should yield items across pages lazily", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ entries: [1, 2], has_more: true, next_cursor: "c2" })
      .mockResolvedValueOnce({ entries: [3], has_more: false, next_cursor: null });

    const items: number[] = [];
    for await (const item of paginateItems(fetchPage)) {
      items.push(item);
    }

    expect(items).toEqual([1, 2, 3]);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("should not fetch the next page until the current one is consumed", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ entries: [1, 2], has_more: true, next_cursor: "c2" })
      .mockResolvedValueOnce({ entries: [3], has_more: false, next_cursor: null });

    const iterator = paginateItems(fetchPage);
    await iterator.next();
    expect(fetchPage).toHaveBeenCalledTimes(1);
    await iterator.next();
    expect(fetchPage).toHaveBeenCalledTimes(1);
    await iterator.next();
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });
});

describe("resource iterators", () => {
  let client: LumaClient;

  beforeEach(() => {
    client = new LumaClient({ apiKey: "test-api-key" });
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should iterate webhooks across pages", async () => {
    const webhook = (id: string) => ({
      api_id: id,
      url: "https://example.com/webhook",
      event_types: ["event.created"],
    });

    mockFetch
      .mockResolvedValueOnce(
        jsonResponse({ entries: [webhook("wh_1"), webhook("wh_2")], has_more: true, next_cursor: "page-2" })
      )
      .mockResolvedValueOnce(
        jsonResponse({ entries: [webhook("wh_3")], has_more: false, next_cursor: null })
      );

    const ids: string[] = [];
    for await (const item of client.webhook.listIterator({ limit: 2 })) {
      ids.push(item.api_id);
    }

    expect(ids).toEqual(["wh_1", "wh_2", "wh_3"]);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      `${BASE_URL}/v1/webhooks/list?pagination_limit=2`,
      expect.any(Object)
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      `${BASE_URL}/v1/webhooks/list?pagination_limit=2&pagination_cursor=page-2`,
      expect.any(Object)
    );
  });

  it("should preserve non-pagination params across guest pages", async () => {
    const guest = (id: string) => ({ api_id: id, name: "Guest" });

    mockFetch
      .mockResolvedValueOnce(
        jsonResponse({ entries: [guest("gst_1")], has_more: true, next_cursor: "cur" })
      )
      .mockResolvedValueOnce(
        jsonResponse({ entries: [guest("gst_2")], has_more: false, next_cursor: null })
      );

    const ids: string[] = [];
    for await (const item of client.event.getGuestsIterator({ event_api_id: "evt_9" })) {
      ids.push(item.api_id);
    }

    expect(ids).toEqual(["gst_1", "gst_2"]);
    const secondUrl = String(mockFetch.mock.calls[1][0]);
    expect(secondUrl).toContain("event_api_id=evt_9");
    expect(secondUrl).toContain("pagination_cursor=cur");
  });

  it("should iterate calendar events", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        entries: [{ api_id: "cal_evt_1", event: { api_id: "evt_1", name: "Event" } }],
        has_more: false,
        next_cursor: null,
      })
    );

    const ids: string[] = [];
    for await (const item of client.calendar.listEventsIterator({ limit: 1 })) {
      ids.push(item.api_id);
    }

    expect(ids).toEqual(["cal_evt_1"]);
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/calendar/list-events?pagination_limit=1`,
      expect.any(Object)
    );
  });

  it("should iterate calendar person tags", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        entries: [{ api_id: "tag_1", name: "VIP" }],
        has_more: false,
        next_cursor: null,
      })
    );

    const ids: string[] = [];
    for await (const item of client.calendar.listPersonTagsIterator({ limit: 1 })) {
      ids.push(item.api_id);
    }

    expect(ids).toEqual(["tag_1"]);
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/calendar/list-person-tags?pagination_limit=1`,
      expect.any(Object)
    );
  });

  it("should iterate calendar people", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        entries: [{ api_id: "person_1", email: "person@example.com" }],
        has_more: false,
        next_cursor: null,
      })
    );

    const ids: string[] = [];
    for await (const item of client.calendar.listPeopleIterator({ limit: 1 })) {
      ids.push(item.api_id);
    }

    expect(ids).toEqual(["person_1"]);
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/calendar/list-people?pagination_limit=1`,
      expect.any(Object)
    );
  });

  it("should iterate calendar coupons", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        entries: [
          {
            api_id: "coupon_1",
            code: "SAVE",
            discount_type: "percentage",
            discount_percentage: 10,
          },
        ],
        has_more: false,
        next_cursor: null,
      })
    );

    const ids: string[] = [];
    for await (const item of client.calendar.listCouponsIterator({ limit: 1 })) {
      ids.push(item.api_id);
    }

    expect(ids).toEqual(["coupon_1"]);
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/calendar/coupons?pagination_limit=1`,
      expect.any(Object)
    );
  });

  it("should iterate event coupons", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        entries: [
          {
            api_id: "coupon_2",
            code: "EVENTSAVE",
            discount_type: "fixed_amount",
            discount_amount: 500,
          },
        ],
        has_more: false,
        next_cursor: null,
      })
    );

    const ids: string[] = [];
    for await (const item of client.event.getCouponsIterator({
      event_api_id: "evt_1",
      limit: 1,
    })) {
      ids.push(item.api_id);
    }

    expect(ids).toEqual(["coupon_2"]);
    const requestUrl = String(mockFetch.mock.calls[0][0]);
    expect(requestUrl).toContain("/v1/event/coupons");
    expect(requestUrl).toContain("event_api_id=evt_1");
    expect(requestUrl).toContain("pagination_limit=1");
  });

  it("should iterate membership tiers", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        entries: [{ api_id: "tier_1", name: "Gold" }],
        has_more: false,
        next_cursor: null,
      })
    );

    const ids: string[] = [];
    for await (const item of client.membership.listTiersIterator({ limit: 1 })) {
      ids.push(item.api_id);
    }

    expect(ids).toEqual(["tier_1"]);
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/memberships/tiers/list?pagination_limit=1`,
      expect.any(Object)
    );
  });

  it("should expose iterators on calendar and membership resources", () => {
    expect(typeof client.calendar.listEventsIterator).toBe("function");
    expect(typeof client.calendar.listPeopleIterator).toBe("function");
    expect(typeof client.calendar.listPersonTagsIterator).toBe("function");
    expect(typeof client.calendar.listCouponsIterator).toBe("function");
    expect(typeof client.event.getCouponsIterator).toBe("function");
    expect(typeof client.membership.listTiersIterator).toBe("function");
  });
});
