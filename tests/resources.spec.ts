import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LumaClient,
  BASE_URL,
  LumaApiError,
  LumaNetworkError,
  LumaValidationError,
} from '../src/index.js'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('CalendarResource', () => {
  let client: LumaClient

  beforeEach(() => {
    client = new LumaClient({ apiKey: 'test-api-key' })
    mockFetch.mockReset()
  })

  describe('listPersonTags', () => {
    it('should list person tags', async () => {
      const mockResponse = {
        entries: [
          { api_id: 'tag-1', name: 'VIP' },
          { api_id: 'tag-2', name: 'Speaker' },
        ],
        has_more: false,
        next_cursor: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.listPersonTags()

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/calendar/list-person-tags`,
        expect.any(Object)
      )
      expect(result.entries).toHaveLength(2)
    })

    it('should list person tags with calendar_api_id param', async () => {
      const mockResponse = {
        entries: [],
        has_more: false,
        next_cursor: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      await client.calendar.listPersonTags({ calendar_api_id: 'cal-123' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('calendar_api_id=cal-123'),
        expect.any(Object)
      )
    })

    it('should throw LumaNetworkError when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'))

      await expect(client.calendar.listPersonTags()).rejects.toThrow(LumaNetworkError)
    })

    it('should throw LumaApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Internal server error' }),
      })

      await expect(client.calendar.listPersonTags()).rejects.toThrow(LumaApiError)
    })

    it('should throw LumaValidationError when response has invalid schema', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ invalid: 'response' }),
      })

      await expect(client.calendar.listPersonTags()).rejects.toThrow(LumaValidationError)
    })
  })

  describe('lookupEvent', () => {
    it('should lookup event by event_api_id', async () => {
      const mockResponse = {
        event: { api_id: 'evt-123', name: 'Test Event' },
        is_managed: true,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.lookupEvent({
        event_api_id: 'evt-123',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('event_api_id=evt-123'),
        expect.any(Object)
      )
      expect(result.event?.api_id).toBe('evt-123')
    })

    it('should lookup event by URL', async () => {
      const mockResponse = {
        event: { api_id: 'evt-456', name: 'URL Event' },
        is_managed: false,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.lookupEvent({
        url: 'https://lu.ma/my-event',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('url='),
        expect.any(Object)
      )
      expect(result.event?.name).toBe('URL Event')
    })

    it('should throw LumaNetworkError when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      await expect(
        client.calendar.lookupEvent({ event_api_id: 'evt-123' })
      ).rejects.toThrow(LumaNetworkError)
    })

    it('should throw LumaApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Forbidden' }),
      })

      await expect(
        client.calendar.lookupEvent({ event_api_id: 'evt-123' })
      ).rejects.toThrow(LumaApiError)
    })
  })

  describe('listPeople', () => {
    it('should list people on calendar', async () => {
      const mockResponse = {
        entries: [{ api_id: 'person-1', email: 'test@example.com' }],
        has_more: false,
        next_cursor: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.listPeople()

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/calendar/list-people`,
        expect.any(Object)
      )
      expect(result.entries).toHaveLength(1)
    })

    it('should throw LumaNetworkError when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network timeout'))

      await expect(client.calendar.listPeople()).rejects.toThrow(LumaNetworkError)
    })

    it('should throw LumaApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Server error' }),
      })

      await expect(client.calendar.listPeople()).rejects.toThrow(LumaApiError)
    })
  })

  describe('listCoupons', () => {
    it('should list calendar coupons', async () => {
      const mockResponse = {
        entries: [
          {
            api_id: 'coupon-1',
            code: 'SAVE10',
            discount_type: 'percentage',
            discount_percentage: 10,
          },
        ],
        has_more: false,
        next_cursor: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.listCoupons()

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/calendar/coupons`,
        expect.any(Object)
      )
      expect(result.entries).toHaveLength(1)
    })

    it('should throw LumaNetworkError when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new Error('DNS lookup failed'))

      await expect(client.calendar.listCoupons()).rejects.toThrow(LumaNetworkError)
    })

    it('should throw LumaApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Unauthorized' }),
      })

      await expect(client.calendar.listCoupons()).rejects.toThrow(LumaApiError)
    })
  })

  describe('createCoupon', () => {
    it('should create calendar coupon with percentage discount', async () => {
      const mockResponse = {
        coupon: {
          api_id: 'coupon-new',
          code: 'DISCOUNT20',
          discount_type: 'percentage',
          discount_percentage: 20,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.createCoupon({
        code: 'DISCOUNT20',
        discount_type: 'percentage',
        discount_percentage: 20,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/calendar/coupons/create`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.coupon.code).toBe('DISCOUNT20')
    })

    it('should create calendar coupon with fixed amount discount', async () => {
      const mockResponse = {
        coupon: {
          api_id: 'coupon-fixed',
          code: 'FLAT10',
          discount_type: 'fixed_amount',
          discount_amount: 1000,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.createCoupon({
        code: 'FLAT10',
        discount_type: 'fixed_amount',
        discount_amount: 1000,
      })

      expect(result.coupon.code).toBe('FLAT10')
    })

    it('should throw LumaNetworkError when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection reset'))

      await expect(
        client.calendar.createCoupon({
          code: 'TEST',
          discount_type: 'percentage',
          discount_percentage: 10,
        })
      ).rejects.toThrow(LumaNetworkError)
    })

    it('should throw LumaApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Invalid coupon code' }),
      })

      await expect(
        client.calendar.createCoupon({
          code: 'TEST',
          discount_type: 'percentage',
          discount_percentage: 10,
        })
      ).rejects.toThrow(LumaApiError)
    })
  })

  describe('updateCoupon', () => {
    it('should update calendar coupon', async () => {
      const mockResponse = {
        coupon: {
          api_id: 'coupon-1',
          code: 'UPDATED',
          discount_type: 'percentage',
          discount_percentage: 15,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.updateCoupon({
        coupon_api_id: 'coupon-1',
        max_uses: 100,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/calendar/coupons/update`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.coupon.api_id).toBe('coupon-1')
    })

    it('should throw LumaNetworkError when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Socket hang up'))

      await expect(
        client.calendar.updateCoupon({ coupon_api_id: 'coupon-1', max_uses: 50 })
      ).rejects.toThrow(LumaNetworkError)
    })

    it('should throw LumaApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Coupon not found' }),
      })

      await expect(
        client.calendar.updateCoupon({ coupon_api_id: 'coupon-1', max_uses: 50 })
      ).rejects.toThrow(LumaApiError)
    })
  })

  describe('importPeople', () => {
    it('should import people to calendar', async () => {
      const mockResponse = {
        imported_count: 1,
        people: [{ api_id: 'person-new', email: 'new@example.com' }],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.importPeople({
        people: [{ email: 'new@example.com' }],
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/calendar/import-people`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.imported_count).toBe(1)
    })

    it('should throw LumaNetworkError when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request aborted'))

      await expect(
        client.calendar.importPeople({ people: [{ email: 'test@example.com' }] })
      ).rejects.toThrow(LumaNetworkError)
    })

    it('should throw LumaApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Invalid email format' }),
      })

      await expect(
        client.calendar.importPeople({ people: [{ email: 'invalid' }] })
      ).rejects.toThrow(LumaApiError)
    })
  })

  describe('createPersonTag', () => {
    it('should create person tag', async () => {
      const mockResponse = {
        tag: { api_id: 'tag-new', name: 'NewTag' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.createPersonTag({
        name: 'NewTag',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/calendar/create-person-tag`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.tag.name).toBe('NewTag')
    })

    it('should throw LumaNetworkError when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))

      await expect(
        client.calendar.createPersonTag({ name: 'Test' })
      ).rejects.toThrow(LumaNetworkError)
    })

    it('should throw LumaApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Tag name already exists' }),
      })

      await expect(
        client.calendar.createPersonTag({ name: 'Duplicate' })
      ).rejects.toThrow(LumaApiError)
    })
  })

  describe('updatePersonTag', () => {
    it('should update person tag', async () => {
      const mockResponse = {
        tag: { api_id: 'tag-1', name: 'UpdatedTag' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.updatePersonTag({
        tag_api_id: 'tag-1',
        name: 'UpdatedTag',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/calendar/update-person-tag`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.tag.name).toBe('UpdatedTag')
    })

    it('should throw LumaNetworkError when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network unreachable'))

      await expect(
        client.calendar.updatePersonTag({ tag_api_id: 'tag-1', name: 'Updated' })
      ).rejects.toThrow(LumaNetworkError)
    })

    it('should throw LumaApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Tag not found' }),
      })

      await expect(
        client.calendar.updatePersonTag({ tag_api_id: 'nonexistent', name: 'Updated' })
      ).rejects.toThrow(LumaApiError)
    })
  })

  describe('deletePersonTag', () => {
    it('should delete person tag', async () => {
      const mockResponse = { success: true }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.deletePersonTag({
        tag_api_id: 'tag-1',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/calendar/delete-person-tag`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.success).toBe(true)
    })

    it('should throw LumaNetworkError when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request failed'))

      await expect(
        client.calendar.deletePersonTag({ tag_api_id: 'tag-1' })
      ).rejects.toThrow(LumaNetworkError)
    })

    it('should throw LumaApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Permission denied' }),
      })

      await expect(
        client.calendar.deletePersonTag({ tag_api_id: 'tag-1' })
      ).rejects.toThrow(LumaApiError)
    })
  })

  describe('addEvent', () => {
    it('should add event to calendar by api_id', async () => {
      const mockResponse = {
        success: true,
        event: { api_id: 'evt-456', name: 'Added Event' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.addEvent({
        event_api_id: 'evt-456',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/calendar/add-event`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.success).toBe(true)
    })

    it('should add event to calendar by URL', async () => {
      const mockResponse = {
        success: true,
        event: { api_id: 'evt-789', name: 'URL Added Event' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.addEvent({
        url: 'https://lu.ma/other-event',
      })

      expect(result.success).toBe(true)
    })

    it('should throw LumaNetworkError when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'))

      await expect(
        client.calendar.addEvent({ event_api_id: 'evt-123' })
      ).rejects.toThrow(LumaNetworkError)
    })

    it('should throw LumaApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Event not found' }),
      })

      await expect(
        client.calendar.addEvent({ event_api_id: 'nonexistent' })
      ).rejects.toThrow(LumaApiError)
    })
  })

  describe('applyPersonTag', () => {
    it('should apply tag to people by user_api_ids', async () => {
      const mockResponse = { success: true, applied_count: 2 }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.applyPersonTag({
        tag_api_id: 'tag-1',
        user_api_ids: ['user-1', 'user-2'],
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/calendar/person-tags/apply`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.success).toBe(true)
    })

    it('should apply tag to people by emails', async () => {
      const mockResponse = { success: true, applied_count: 1 }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.applyPersonTag({
        tag_api_id: 'tag-1',
        emails: ['test@example.com'],
      })

      expect(result.success).toBe(true)
    })
  })

  describe('removePersonTag', () => {
    it('should remove tag from people', async () => {
      const mockResponse = { success: true, removed_count: 1 }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.calendar.removePersonTag({
        tag_api_id: 'tag-1',
        user_api_ids: ['user-1'],
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/calendar/person-tags/unapply`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.success).toBe(true)
    })
  })
})

describe('EventResource', () => {
  let client: LumaClient

  beforeEach(() => {
    client = new LumaClient({ apiKey: 'test-api-key' })
    mockFetch.mockReset()
  })

  describe('getGuest', () => {
    it('should get guest by guest_api_id', async () => {
      const mockResponse = {
        guest: { api_id: 'guest-123', email: 'guest@example.com' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.getGuest({
        guest_api_id: 'guest-123',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/event/get-guest'),
        expect.any(Object)
      )
      expect(result.guest.api_id).toBe('guest-123')
    })

    it('should get guest by email', async () => {
      const mockResponse = {
        guest: { api_id: 'guest-456', email: 'test@example.com' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.getGuest({
        event_api_id: 'evt-123',
        email: 'test@example.com',
      })

      expect(result.guest.email).toBe('test@example.com')
    })
  })

  describe('getGuests', () => {
    it('should get guests list', async () => {
      const mockResponse = {
        entries: [{ api_id: 'guest-1', name: 'Guest One' }],
        has_more: false,
        next_cursor: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.getGuests({
        event_api_id: 'evt-123',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/event/get-guests'),
        expect.any(Object)
      )
      expect(result.entries).toHaveLength(1)
    })
  })

  describe('update', () => {
    it('should update event', async () => {
      const mockResponse = {
        event: { api_id: 'evt-123', name: 'Updated Event' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.update({
        event_api_id: 'evt-123',
        name: 'Updated Event',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/event/update`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.event.name).toBe('Updated Event')
    })
  })

  describe('updateGuestStatus', () => {
    it('should update guest status', async () => {
      const mockResponse = {
        guest: { api_id: 'guest-123', approval_status: 'approved' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.updateGuestStatus({
        event_api_id: 'evt-123',
        guest_api_id: 'guest-123',
        status: 'approved',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/event/update-guest-status`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.guest.approval_status).toBe('approved')
    })
  })

  describe('sendInvites', () => {
    it('should send invites', async () => {
      const mockResponse = { success: true }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.sendInvites({
        event_api_id: 'evt-123',
        guest_api_ids: ['guest-1', 'guest-2'],
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/event/send-invites`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.success).toBe(true)
    })
  })

  describe('addGuests', () => {
    it('should add guests to event', async () => {
      const mockResponse = {
        guests: [{ api_id: 'guest-new', email: 'new@example.com' }],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.addGuests({
        event_api_id: 'evt-123',
        guests: [{ email: 'new@example.com' }],
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/event/add-guests`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.guests).toHaveLength(1)
    })
  })

  describe('addHost', () => {
    it('should add host to event', async () => {
      const mockResponse = {
        host: { api_id: 'host-new', name: 'New Host' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.addHost({
        event_api_id: 'evt-123',
        email: 'host@example.com',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/event/add-host`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.host.api_id).toBe('host-new')
    })
  })

  describe('getCoupons', () => {
    it('should get event coupons', async () => {
      const mockResponse = {
        entries: [
          {
            api_id: 'coupon-1',
            code: 'SAVE10',
            discount_type: 'percentage',
            discount_percentage: 10,
          },
        ],
        has_more: false,
        next_cursor: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.getCoupons({
        event_api_id: 'evt-123',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/event/coupons'),
        expect.any(Object)
      )
      expect(result.entries).toHaveLength(1)
    })
  })

  describe('createCoupon', () => {
    it('should create event coupon', async () => {
      const mockResponse = {
        coupon: {
          api_id: 'coupon-new',
          code: 'NEWCODE',
          discount_type: 'percentage',
          discount_percentage: 15,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.createCoupon({
        event_api_id: 'evt-123',
        code: 'NEWCODE',
        discount_type: 'percentage',
        discount_percentage: 15,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/event/create-coupon`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.coupon.code).toBe('NEWCODE')
    })
  })

  describe('updateCoupon', () => {
    it('should update event coupon', async () => {
      const mockResponse = {
        coupon: {
          api_id: 'coupon-1',
          code: 'UPDATED',
          discount_type: 'fixed_amount',
          discount_amount: 500,
          is_active: false,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.updateCoupon({
        coupon_api_id: 'coupon-1',
        max_uses: 50,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/event/update-coupon`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.coupon.api_id).toBe('coupon-1')
    })
  })

  describe('listTicketTypes', () => {
    it('should list ticket types', async () => {
      const mockResponse = {
        ticket_types: [{ api_id: 'tt-1', name: 'General Admission' }],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.listTicketTypes({
        event_api_id: 'evt-123',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/event/ticket-types/list'),
        expect.any(Object)
      )
      expect(result.ticket_types).toHaveLength(1)
    })
  })

  describe('getTicketType', () => {
    it('should get ticket type', async () => {
      const mockResponse = {
        ticket_type: { api_id: 'tt-1', name: 'VIP' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.getTicketType({
        ticket_type_api_id: 'tt-1',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/event/ticket-types/get'),
        expect.any(Object)
      )
      expect(result.ticket_type.api_id).toBe('tt-1')
    })
  })

  describe('createTicketType', () => {
    it('should create ticket type', async () => {
      const mockResponse = {
        ticket_type: { api_id: 'tt-new', name: 'Early Bird' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.createTicketType({
        event_api_id: 'evt-123',
        name: 'Early Bird',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/event/ticket-types/create`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.ticket_type.name).toBe('Early Bird')
    })
  })

  describe('updateTicketType', () => {
    it('should update ticket type', async () => {
      const mockResponse = {
        ticket_type: { api_id: 'tt-1', name: 'Updated Ticket' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.updateTicketType({
        ticket_type_api_id: 'tt-1',
        name: 'Updated Ticket',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/event/ticket-types/update`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.ticket_type.name).toBe('Updated Ticket')
    })
  })

  describe('deleteTicketType', () => {
    it('should delete ticket type', async () => {
      const mockResponse = { success: true }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.event.deleteTicketType({
        ticket_type_api_id: 'tt-1',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/event/ticket-types/delete`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.success).toBe(true)
    })
  })
})

describe('WebhookResource', () => {
  let client: LumaClient

  beforeEach(() => {
    client = new LumaClient({ apiKey: 'test-api-key' })
    mockFetch.mockReset()
  })

  describe('list', () => {
    it('should list webhooks', async () => {
      const mockResponse = {
        entries: [
          {
            api_id: 'wh-1',
            url: 'https://example.com/webhook',
            event_types: ['event.created'],
          },
        ],
        has_more: false,
        next_cursor: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.webhook.list()

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/webhooks/list`,
        expect.any(Object)
      )
      expect(result.entries).toHaveLength(1)
    })

    it('should list webhooks with calendar_api_id param', async () => {
      const mockResponse = {
        entries: [],
        has_more: false,
        next_cursor: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      await client.webhook.list({ calendar_api_id: 'cal-123' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('calendar_api_id=cal-123'),
        expect.any(Object)
      )
    })
  })

  describe('get', () => {
    it('should get webhook by ID', async () => {
      const mockResponse = {
        webhook: {
          api_id: 'wh-123',
          url: 'https://example.com/webhook',
          event_types: ['event.created', 'guest.registered'],
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.webhook.get({ webhook_api_id: 'wh-123' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('webhook_api_id=wh-123'),
        expect.any(Object)
      )
      expect(result.webhook.api_id).toBe('wh-123')
    })
  })

  describe('update', () => {
    it('should update webhook', async () => {
      const mockResponse = {
        webhook: {
          api_id: 'wh-123',
          url: 'https://new-url.com/webhook',
          event_types: ['event.updated'],
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.webhook.update({
        webhook_api_id: 'wh-123',
        url: 'https://new-url.com/webhook',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/webhooks/update`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.webhook.url).toBe('https://new-url.com/webhook')
    })
  })

  describe('delete', () => {
    it('should delete webhook', async () => {
      const mockResponse = { success: true }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.webhook.delete({ webhook_api_id: 'wh-123' })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/webhooks/delete`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.success).toBe(true)
    })
  })
})

describe('EntityResource', () => {
  let client: LumaClient

  beforeEach(() => {
    client = new LumaClient({ apiKey: 'test-api-key' })
    mockFetch.mockReset()
  })

  describe('lookup', () => {
    it('should lookup entity by slug', async () => {
      const mockResponse = {
        entity: { api_id: 'ent-123', type: 'calendar', name: 'My Calendar' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.entity.lookup({ slug: 'my-calendar' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('slug=my-calendar'),
        expect.any(Object)
      )
      expect(result.entity?.api_id).toBe('ent-123')
    })

    it('should handle null entity when not found', async () => {
      const mockResponse = {
        entity: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.entity.lookup({ slug: 'nonexistent' })

      expect(result.entity).toBeNull()
    })
  })
})

describe('ImagesResource', () => {
  let client: LumaClient

  beforeEach(() => {
    client = new LumaClient({ apiKey: 'test-api-key' })
    mockFetch.mockReset()
  })

  describe('createUploadUrl', () => {
    it('should create upload URL', async () => {
      const mockResponse = {
        signed_url: 'https://s3.amazonaws.com/upload?signed=true',
        file_url: 'https://images.luma.com/image-123.jpg',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.images.createUploadUrl({
        purpose: 'event_cover',
        content_type: 'image/jpeg',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/images/create-upload-url`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.signed_url).toContain('s3.amazonaws.com')
    })
  })
})

describe('MembershipResource', () => {
  let client: LumaClient

  beforeEach(() => {
    client = new LumaClient({ apiKey: 'test-api-key' })
    mockFetch.mockReset()
  })

  describe('listTiers', () => {
    it('should list membership tiers', async () => {
      const mockResponse = {
        entries: [{ api_id: 'tier-1', name: 'Gold' }],
        has_more: false,
        next_cursor: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.membership.listTiers()

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/memberships/tiers/list`,
        expect.any(Object)
      )
      expect(result.entries).toHaveLength(1)
    })

    it('should list tiers with calendar_api_id param', async () => {
      const mockResponse = {
        entries: [],
        has_more: false,
        next_cursor: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      await client.membership.listTiers({ calendar_api_id: 'cal-123' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('calendar_api_id=cal-123'),
        expect.any(Object)
      )
    })
  })

  describe('addMemberToTier', () => {
    it('should add member to tier', async () => {
      const mockResponse = {
        member: { api_id: 'member-new', tier_api_id: 'tier-1' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.membership.addMemberToTier({
        tier_api_id: 'tier-1',
        email: 'newmember@example.com',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/memberships/members/add`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.member.tier_api_id).toBe('tier-1')
    })
  })

  describe('updateMemberStatus', () => {
    it('should update member status by email', async () => {
      const mockResponse = {
        member: { api_id: 'member-1', status: 'approved' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.membership.updateMemberStatus({
        tier_api_id: 'tier-1',
        email: 'member@example.com',
        status: 'approved',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/memberships/members/update-status`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.member.status).toBe('approved')
    })

    it('should update member status by user_api_id', async () => {
      const mockResponse = {
        member: { api_id: 'member-2', status: 'declined' },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      })

      const result = await client.membership.updateMemberStatus({
        tier_api_id: 'tier-1',
        user_api_id: 'user-123',
        status: 'declined',
      })

      expect(result.member.status).toBe('declined')
    })
  })
})
