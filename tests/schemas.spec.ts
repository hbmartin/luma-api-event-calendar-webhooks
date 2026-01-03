import { describe, it, expect } from "vitest";
import {
  // Common schemas
  ApprovalStatusSchema,
  GuestStatusSchema,
  WebhookEventTypeSchema,
  WebhookStatusSchema,
  PaginationParamsSchema,
  EntityTypeSchema,
  TagColorSchema,
  LocationTypeSchema,
  GeoAddressJsonSchema,
  // User schemas
  UserSchema,
  GetSelfResponseSchema,
  // Entity schemas
  EntitySchema,
  LookupEntityResponseSchema,
  // Event schemas
  EventSchema,
  GuestSchema,
  HostSchema,
  CouponSchema,
  TicketTypeSchema,
  GetEventResponseSchema,
  GetGuestsResponseSchema,
  GetGuestParamsSchema,
  CreateEventRequestSchema,
  CreateEventCouponRequestSchema,
  // Calendar schemas
  PersonTagSchema,
  PersonSchema,
  ListCalendarEventsResponseSchema,
  LookupCalendarEventParamsSchema,
  AddEventToCalendarRequestSchema,
  ApplyPersonTagRequestSchema,
  RemovePersonTagRequestSchema,
  CreateCalendarCouponRequestSchema,
  // Membership schemas
  MembershipTierSchema,
  MemberSchema,
  UpdateMemberStatusRequestSchema,
  // Webhook schemas
  WebhookSchema,
  CreateWebhookRequestSchema,
  WebhookPayloadSchema,
  parseWebhookPayload,
} from "../src/index.js";

describe("Common Schemas", () => {
  describe("ApprovalStatusSchema", () => {
    it("should accept valid approval statuses", () => {
      const validStatuses = ["pending_approval", "approved", "declined", "invited", "waitlisted"];
      validStatuses.forEach((status) => {
        expect(ApprovalStatusSchema.safeParse(status).success).toBe(true);
      });
    });

    it("should reject invalid approval statuses", () => {
      expect(ApprovalStatusSchema.safeParse("invalid").success).toBe(false);
      expect(ApprovalStatusSchema.safeParse(123).success).toBe(false);
    });
  });

  describe("GuestStatusSchema", () => {
    it("should accept valid guest statuses", () => {
      expect(GuestStatusSchema.safeParse("approved").success).toBe(true);
      expect(GuestStatusSchema.safeParse("declined").success).toBe(true);
    });

    it("should reject invalid guest statuses", () => {
      expect(GuestStatusSchema.safeParse("pending").success).toBe(false);
    });
  });

  describe("WebhookEventTypeSchema", () => {
    it("should accept all valid webhook event types", () => {
      const validTypes = [
        "event.created",
        "event.updated",
        "guest.registered",
        "guest.updated",
        "ticket.registered",
        "calendar.event.added",
        "calendar.person.subscribed",
      ];
      validTypes.forEach((type) => {
        expect(WebhookEventTypeSchema.safeParse(type).success).toBe(true);
      });
    });
  });

  describe("WebhookStatusSchema", () => {
    it("should accept valid webhook statuses", () => {
      expect(WebhookStatusSchema.safeParse("active").success).toBe(true);
      expect(WebhookStatusSchema.safeParse("paused").success).toBe(true);
    });
  });

  describe("EntityTypeSchema", () => {
    it("should accept valid entity types", () => {
      expect(EntityTypeSchema.safeParse("event").success).toBe(true);
      expect(EntityTypeSchema.safeParse("calendar").success).toBe(true);
      expect(EntityTypeSchema.safeParse("membership_tier").success).toBe(true);
    });
  });

  describe("TagColorSchema", () => {
    it("should accept valid tag colors", () => {
      const validColors = ["gray", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"];
      validColors.forEach((color) => {
        expect(TagColorSchema.safeParse(color).success).toBe(true);
      });
    });
  });

  describe("LocationTypeSchema", () => {
    it("should accept valid location types", () => {
      expect(LocationTypeSchema.safeParse("offline").success).toBe(true);
      expect(LocationTypeSchema.safeParse("online").success).toBe(true);
      expect(LocationTypeSchema.safeParse("tba").success).toBe(true);
    });
  });

  describe("GeoAddressJsonSchema", () => {
    it("should accept valid geo address", () => {
      const validAddress = {
        type: "google",
        place_id: "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
        description: "New York, NY, USA",
        city: "New York",
        latitude: 40.7128,
        longitude: -74.006,
      };
      expect(GeoAddressJsonSchema.safeParse(validAddress).success).toBe(true);
    });

    it("should accept partial geo address", () => {
      expect(GeoAddressJsonSchema.safeParse({}).success).toBe(true);
      expect(GeoAddressJsonSchema.safeParse({ city: "San Francisco" }).success).toBe(true);
    });
  });

  describe("PaginationParamsSchema", () => {
    it("should accept cursor and limit", () => {
      const params = { cursor: "page-1", limit: 25 };
      expect(PaginationParamsSchema.safeParse(params).success).toBe(true);
    });

    it("should reject invalid limit", () => {
      const params = { cursor: "page-1", limit: 0 };
      expect(PaginationParamsSchema.safeParse(params).success).toBe(false);
    });
  });
});

describe("User Schemas", () => {
  describe("UserSchema", () => {
    it("should accept valid user data", () => {
      const validUser = {
        api_id: "usr_123456",
        email: "test@example.com",
        name: "Test User",
        first_name: "Test",
        last_name: "User",
        avatar_url: "https://example.com/avatar.jpg",
      };
      expect(UserSchema.safeParse(validUser).success).toBe(true);
    });

    it("should accept user with minimal data", () => {
      const minimalUser = { api_id: "usr_123456" };
      expect(UserSchema.safeParse(minimalUser).success).toBe(true);
    });

    it("should accept user with null fields", () => {
      const userWithNulls = {
        api_id: "usr_123456",
        email: null,
        name: null,
      };
      expect(UserSchema.safeParse(userWithNulls).success).toBe(true);
    });

    it("should reject user without api_id", () => {
      const invalidUser = { email: "test@example.com" };
      expect(UserSchema.safeParse(invalidUser).success).toBe(false);
    });
  });

  describe("GetSelfResponseSchema", () => {
    it("should accept valid response", () => {
      const response = {
        user: {
          api_id: "usr_123",
          email: "test@example.com",
          name: "Test User",
        },
      };
      expect(GetSelfResponseSchema.safeParse(response).success).toBe(true);
    });
  });
});

describe("Entity Schemas", () => {
  describe("EntitySchema", () => {
    it("should accept valid entity", () => {
      const validEntity = {
        api_id: "ent_123",
        type: "event",
        name: "Test Event",
        slug: "test-event",
      };
      expect(EntitySchema.safeParse(validEntity).success).toBe(true);
    });
  });

  describe("LookupEntityResponseSchema", () => {
    it("should accept response with entity", () => {
      const response = {
        entity: {
          api_id: "ent_123",
          type: "calendar",
          name: "Test Calendar",
        },
      };
      expect(LookupEntityResponseSchema.safeParse(response).success).toBe(true);
    });

    it("should accept response with null entity", () => {
      const response = { entity: null };
      expect(LookupEntityResponseSchema.safeParse(response).success).toBe(true);
    });
  });
});

describe("Event Schemas", () => {
  describe("EventSchema", () => {
    it("should accept valid event data", () => {
      const validEvent = {
        api_id: "evt_123456",
        name: "Test Event",
        description: "A test event",
        start_at: "2024-01-01T10:00:00Z",
        end_at: "2024-01-01T12:00:00Z",
        timezone: "America/New_York",
        location_type: "offline",
        url: "https://lu.ma/test-event",
      };
      expect(EventSchema.safeParse(validEvent).success).toBe(true);
    });

    it("should accept event with minimal data", () => {
      const minimalEvent = { api_id: "evt_123456" };
      expect(EventSchema.safeParse(minimalEvent).success).toBe(true);
    });

    it("should accept event with hosts array", () => {
      const eventWithHosts = {
        api_id: "evt_123456",
        hosts: [
          { api_id: "host_1", name: "Host 1" },
          { api_id: "host_2", email: "host2@example.com" },
        ],
      };
      expect(EventSchema.safeParse(eventWithHosts).success).toBe(true);
    });

    it("should handle extra fields gracefully (backward compatibility)", () => {
      const eventWithExtra = {
        api_id: "evt_123456",
        name: "Test",
        some_new_field: "value",
      };
      const result = EventSchema.safeParse(eventWithExtra);
      expect(result.success).toBe(true);
    });
  });

  describe("GuestSchema", () => {
    it("should accept valid guest data", () => {
      const validGuest = {
        api_id: "gst_123456",
        event_api_id: "evt_123456",
        name: "Test Guest",
        email: "guest@example.com",
        approval_status: "approved",
        registered_at: "2024-01-01T09:00:00Z",
      };
      expect(GuestSchema.safeParse(validGuest).success).toBe(true);
    });

    it("should accept guest with questions and answers", () => {
      const guestWithQA = {
        api_id: "gst_123456",
        questions_and_answers: [
          { question: "Company?", answer: "Acme Inc" },
          { question: "Dietary restrictions?", answer: null },
        ],
      };
      expect(GuestSchema.safeParse(guestWithQA).success).toBe(true);
    });
  });

  describe("HostSchema", () => {
    it("should accept valid host data", () => {
      const validHost = {
        api_id: "host_123",
        name: "Test Host",
        email: "host@example.com",
        avatar_url: "https://example.com/avatar.jpg",
      };
      expect(HostSchema.safeParse(validHost).success).toBe(true);
    });
  });

  describe("CouponSchema", () => {
    it("should accept valid coupon data", () => {
      const validCoupon = {
        api_id: "cpn_123",
        code: "DISCOUNT20",
        discount_type: "percentage",
        discount_percentage: 20,
        max_uses: 100,
        uses: 5,
        is_active: true,
      };
      expect(CouponSchema.safeParse(validCoupon).success).toBe(true);
    });
  });

  describe("TicketTypeSchema", () => {
    it("should accept valid ticket type data", () => {
      const validTicketType = {
        api_id: "tkt_123",
        event_api_id: "evt_123",
        name: "General Admission",
        price: 50,
        currency: "USD",
        quantity: 100,
        quantity_sold: 25,
        visibility: "visible",
      };
      expect(TicketTypeSchema.safeParse(validTicketType).success).toBe(true);
    });
  });

  describe("GetEventResponseSchema", () => {
    it("should accept valid response", () => {
      const response = {
        event: {
          api_id: "evt_123",
          name: "Test Event",
        },
      };
      expect(GetEventResponseSchema.safeParse(response).success).toBe(true);
    });
  });

  describe("GetGuestsResponseSchema (paginated)", () => {
    it("should accept valid paginated response", () => {
      const response = {
        entries: [
          { api_id: "gst_1", name: "Guest 1" },
          { api_id: "gst_2", name: "Guest 2" },
        ],
        has_more: true,
        next_cursor: "cursor_abc123",
      };
      expect(GetGuestsResponseSchema.safeParse(response).success).toBe(true);
    });

    it("should accept response with null cursor", () => {
      const response = {
        entries: [],
        has_more: false,
        next_cursor: null,
      };
      expect(GetGuestsResponseSchema.safeParse(response).success).toBe(true);
    });
  });

  describe("GetGuestParamsSchema", () => {
    it("should accept lookup by guest_api_id", () => {
      const params = { guest_api_id: "gst_123" };
      expect(GetGuestParamsSchema.safeParse(params).success).toBe(true);
    });

    it("should accept lookup by event_api_id and email", () => {
      const params = { event_api_id: "evt_123", email: "guest@example.com" };
      expect(GetGuestParamsSchema.safeParse(params).success).toBe(true);
    });

    it("should accept lookup by event_api_id and phone_number", () => {
      const params = { event_api_id: "evt_123", phone_number: "1234567890" };
      expect(GetGuestParamsSchema.safeParse(params).success).toBe(true);
    });

    it("should reject missing identifiers", () => {
      expect(GetGuestParamsSchema.safeParse({}).success).toBe(false);
    });

    it("should reject email without event_api_id", () => {
      const params = { email: "guest@example.com" };
      expect(GetGuestParamsSchema.safeParse(params).success).toBe(false);
    });

    it("should reject phone_number without event_api_id", () => {
      const params = { phone_number: "1234567890" };
      expect(GetGuestParamsSchema.safeParse(params).success).toBe(false);
    });

    it("should reject multiple identifiers", () => {
      const params = {
        guest_api_id: "gst_123",
        email: "guest@example.com",
      };
      expect(GetGuestParamsSchema.safeParse(params).success).toBe(false);
    });
  });

  describe("CreateEventRequestSchema", () => {
    it("should accept valid create event request", () => {
      const request = {
        name: "New Event",
        start_at: "2024-06-01T10:00:00Z",
        timezone: "America/Los_Angeles",
      };
      expect(CreateEventRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should accept request with all optional fields", () => {
      const request = {
        name: "New Event",
        start_at: "2024-06-01T10:00:00Z",
        timezone: "America/Los_Angeles",
        end_at: "2024-06-01T12:00:00Z",
        description: "A great event",
        require_rsvp_approval: true,
        meeting_url: "https://zoom.us/j/123",
        visibility: "public",
      };
      expect(CreateEventRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should reject request without required fields", () => {
      const invalidRequest = {
        name: "New Event",
        // missing start_at and timezone
      };
      expect(CreateEventRequestSchema.safeParse(invalidRequest).success).toBe(false);
    });
  });

  describe("CreateEventCouponRequestSchema", () => {
    it("should accept percentage discount coupon", () => {
      const request = {
        event_api_id: "evt_123",
        code: "PCT20",
        discount_type: "percentage",
        discount_percentage: 20,
      };
      expect(CreateEventCouponRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should accept fixed amount discount coupon", () => {
      const request = {
        event_api_id: "evt_123",
        code: "OFF10",
        discount_type: "fixed_amount",
        discount_amount: 10,
      };
      expect(CreateEventCouponRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should reject coupon missing discount fields", () => {
      const request = {
        event_api_id: "evt_123",
        code: "BAD",
        discount_type: "percentage",
      };
      expect(CreateEventCouponRequestSchema.safeParse(request).success).toBe(false);
    });
  });
});

describe("Calendar Schemas", () => {
  describe("PersonTagSchema", () => {
    it("should accept valid person tag", () => {
      const validTag = {
        api_id: "tag_123",
        name: "VIP",
        color: "blue",
      };
      expect(PersonTagSchema.safeParse(validTag).success).toBe(true);
    });
  });

  describe("PersonSchema", () => {
    it("should accept valid person data", () => {
      const validPerson = {
        api_id: "per_123",
        name: "Test Person",
        email: "person@example.com",
        tags: [{ api_id: "tag_1", name: "VIP" }],
      };
      expect(PersonSchema.safeParse(validPerson).success).toBe(true);
    });
  });

  describe("ListCalendarEventsResponseSchema", () => {
    it("should accept valid paginated calendar events response", () => {
      const response = {
        entries: [
          {
            api_id: "entry_1",
            event: { api_id: "evt_1", name: "Event 1" },
          },
        ],
        has_more: false,
        next_cursor: null,
      };
      expect(ListCalendarEventsResponseSchema.safeParse(response).success).toBe(true);
    });
  });

  describe("LookupCalendarEventParamsSchema", () => {
    it("should accept event_api_id lookup", () => {
      const params = { event_api_id: "evt_123" };
      expect(LookupCalendarEventParamsSchema.safeParse(params).success).toBe(true);
    });

    it("should accept url lookup", () => {
      const params = { url: "https://lu.ma/test-event" };
      expect(LookupCalendarEventParamsSchema.safeParse(params).success).toBe(true);
    });

    it("should reject missing lookup params", () => {
      expect(LookupCalendarEventParamsSchema.safeParse({}).success).toBe(false);
    });

    it("should reject multiple lookup params", () => {
      const params = { event_api_id: "evt_123", url: "https://lu.ma/test-event" };
      expect(LookupCalendarEventParamsSchema.safeParse(params).success).toBe(false);
    });
  });

  describe("AddEventToCalendarRequestSchema", () => {
    it("should accept event_api_id", () => {
      const request = { event_api_id: "evt_123" };
      expect(AddEventToCalendarRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should accept url", () => {
      const request = { url: "https://lu.ma/test-event" };
      expect(AddEventToCalendarRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should reject missing event identifiers", () => {
      expect(AddEventToCalendarRequestSchema.safeParse({}).success).toBe(false);
    });

    it("should reject multiple identifiers", () => {
      const request = { event_api_id: "evt_123", url: "https://lu.ma/test-event" };
      expect(AddEventToCalendarRequestSchema.safeParse(request).success).toBe(false);
    });
  });

  describe("ApplyPersonTagRequestSchema", () => {
    it("should accept user_api_ids", () => {
      const request = { tag_api_id: "tag_123", user_api_ids: ["usr_1"] };
      expect(ApplyPersonTagRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should accept emails", () => {
      const request = { tag_api_id: "tag_123", emails: ["user@example.com"] };
      expect(ApplyPersonTagRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should reject empty inputs", () => {
      const request = { tag_api_id: "tag_123" };
      expect(ApplyPersonTagRequestSchema.safeParse(request).success).toBe(false);
    });

    it("should reject empty arrays", () => {
      const request = { tag_api_id: "tag_123", user_api_ids: [] };
      expect(ApplyPersonTagRequestSchema.safeParse(request).success).toBe(false);
    });
  });

  describe("RemovePersonTagRequestSchema", () => {
    it("should accept user_api_ids", () => {
      const request = { tag_api_id: "tag_123", user_api_ids: ["usr_1"] };
      expect(RemovePersonTagRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should accept emails", () => {
      const request = { tag_api_id: "tag_123", emails: ["user@example.com"] };
      expect(RemovePersonTagRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should reject empty inputs", () => {
      const request = { tag_api_id: "tag_123" };
      expect(RemovePersonTagRequestSchema.safeParse(request).success).toBe(false);
    });

    it("should reject empty arrays", () => {
      const request = { tag_api_id: "tag_123", emails: [] };
      expect(RemovePersonTagRequestSchema.safeParse(request).success).toBe(false);
    });
  });

  describe("CreateCalendarCouponRequestSchema", () => {
    it("should accept percentage discount coupon", () => {
      const request = {
        code: "PCT20",
        discount_type: "percentage",
        discount_percentage: 20,
      };
      expect(CreateCalendarCouponRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should accept fixed amount discount coupon", () => {
      const request = {
        code: "OFF10",
        discount_type: "fixed_amount",
        discount_amount: 10,
      };
      expect(CreateCalendarCouponRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should reject coupon missing discount fields", () => {
      const request = {
        code: "BAD",
        discount_type: "percentage",
      };
      expect(CreateCalendarCouponRequestSchema.safeParse(request).success).toBe(false);
    });
  });
});

describe("Membership Schemas", () => {
  describe("MembershipTierSchema", () => {
    it("should accept valid membership tier", () => {
      const validTier = {
        api_id: "tier_123",
        name: "Gold",
        price: 99,
        currency: "USD",
        billing_period: "monthly",
        is_free: false,
      };
      expect(MembershipTierSchema.safeParse(validTier).success).toBe(true);
    });
  });

  describe("MemberSchema", () => {
    it("should accept valid member data", () => {
      const validMember = {
        api_id: "mem_123",
        tier_api_id: "tier_123",
        email: "member@example.com",
        status: "active",
      };
      expect(MemberSchema.safeParse(validMember).success).toBe(true);
    });
  });

  describe("UpdateMemberStatusRequestSchema", () => {
    it("should accept update by user_api_id", () => {
      const request = {
        tier_api_id: "tier_123",
        user_api_id: "usr_123",
        status: "approved",
      };
      expect(UpdateMemberStatusRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should accept update by email", () => {
      const request = {
        tier_api_id: "tier_123",
        email: "member@example.com",
        status: "declined",
      };
      expect(UpdateMemberStatusRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should reject missing identifiers", () => {
      const request = {
        tier_api_id: "tier_123",
        status: "approved",
      };
      expect(UpdateMemberStatusRequestSchema.safeParse(request).success).toBe(false);
    });

    it("should reject multiple identifiers", () => {
      const request = {
        tier_api_id: "tier_123",
        user_api_id: "usr_123",
        email: "member@example.com",
        status: "approved",
      };
      expect(UpdateMemberStatusRequestSchema.safeParse(request).success).toBe(false);
    });
  });
});

describe("Webhook Schemas", () => {
  describe("WebhookSchema", () => {
    it("should accept valid webhook", () => {
      const validWebhook = {
        api_id: "wh_123",
        url: "https://example.com/webhook",
        event_types: ["event.created", "guest.registered"],
        status: "active",
      };
      expect(WebhookSchema.safeParse(validWebhook).success).toBe(true);
    });
  });

  describe("CreateWebhookRequestSchema", () => {
    it("should accept valid request", () => {
      const request = {
        calendar_id: "cal_123",
        url: "https://example.com/webhook",
        event_types: ["event.created"],
      };
      expect(CreateWebhookRequestSchema.safeParse(request).success).toBe(true);
    });

    it("should reject missing calendar_id", () => {
      const request = {
        url: "https://example.com/webhook",
        event_types: ["event.created"],
      };
      expect(CreateWebhookRequestSchema.safeParse(request).success).toBe(false);
    });
  });

  describe("WebhookPayloadSchema", () => {
    it("should parse event.created payload", () => {
      const payload = {
        type: "event.created",
        created_at: "2024-01-01T10:00:00Z",
        data: {
          event: {
            api_id: "evt_123",
            name: "New Event",
          },
        },
      };
      const result = WebhookPayloadSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("event.created");
      }
    });

    it("should parse guest.registered payload", () => {
      const payload = {
        type: "guest.registered",
        created_at: "2024-01-01T10:00:00Z",
        data: {
          guest: {
            api_id: "gst_123",
            name: "New Guest",
          },
          event: {
            api_id: "evt_123",
            name: "Test Event",
          },
        },
      };
      const result = WebhookPayloadSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("guest.registered");
      }
    });

    it("should parse calendar.person.subscribed payload", () => {
      const payload = {
        type: "calendar.person.subscribed",
        created_at: "2024-01-01T10:00:00Z",
        data: {
          person: {
            api_id: "per_123",
            name: "New Subscriber",
          },
        },
      };
      const result = WebhookPayloadSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe("parseWebhookPayload", () => {
    it("should parse valid payload", () => {
      const payload = {
        type: "event.updated",
        created_at: "2024-01-01T10:00:00Z",
        data: {
          event: {
            api_id: "evt_123",
            name: "Updated Event",
          },
        },
      };
      const result = parseWebhookPayload(payload);
      expect(result.type).toBe("event.updated");
    });

    it("should throw on invalid payload", () => {
      const invalidPayload = {
        type: "invalid.type",
        created_at: "2024-01-01T10:00:00Z",
      };
      expect(() => parseWebhookPayload(invalidPayload)).toThrow();
    });
  });
});
