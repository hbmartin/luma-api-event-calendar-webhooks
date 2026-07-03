import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { Webhook, LumaWebhookConfigurationError, LumaWebhookSignatureError } from "../src/index.js";

const { createWebhookHandler } = Webhook;

const SECRET = "whsec_handler_secret";

const sign = (payload: string, timestamp: number): string =>
  createHmac("sha256", SECRET).update(`${timestamp}.${payload}`).digest("hex");

const eventCreatedPayload = {
  type: "event.created",
  created_at: "2024-01-01T10:00:00Z",
  data: { event: { api_id: "evt_123", name: "New Event" } },
};

const guestRegisteredPayload = {
  type: "guest.registered",
  created_at: "2024-01-01T10:00:00Z",
  data: {
    guest: { api_id: "gst_123", name: "New Guest" },
    event: { api_id: "evt_123", name: "Test Event" },
  },
};

const hasHandleRequest = (
  handler: Webhook.WebhookHandler
): handler is Webhook.VerifyingWebhookHandler => {
  if (!("handleRequest" in handler)) {
    return false;
  }

  return typeof handler.handleRequest === "function";
};

describe("createWebhookHandler", () => {
  it("should dispatch to the matching callback with a narrowed payload", async () => {
    const onEventCreated = vi.fn();
    const onGuestRegistered = vi.fn();
    const handler = createWebhookHandler({ onEventCreated, onGuestRegistered });

    const parsed = await handler.handle(eventCreatedPayload);

    expect(onEventCreated).toHaveBeenCalledTimes(1);
    expect(onEventCreated.mock.calls[0][0].data.event.api_id).toBe("evt_123");
    expect(onGuestRegistered).not.toHaveBeenCalled();
    expect(parsed.type).toBe("event.created");
  });

  it("should dispatch every webhook event type to its callback", async () => {
    const event = { api_id: "evt_1", name: "E" };
    const guest = { api_id: "gst_1", name: "G" };
    const person = { api_id: "per_1", name: "P" };
    const created_at = "2024-01-01T10:00:00Z";

    const payloads = [
      { type: "event.created", created_at, data: { event } },
      { type: "event.updated", created_at, data: { event } },
      { type: "guest.registered", created_at, data: { guest, event } },
      { type: "guest.updated", created_at, data: { guest, event } },
      { type: "ticket.registered", created_at, data: { guest, event } },
      { type: "calendar.event.added", created_at, data: { event } },
      { type: "calendar.person.subscribed", created_at, data: { person } },
    ];

    const callbacks = {
      onEventCreated: vi.fn(),
      onEventUpdated: vi.fn(),
      onGuestRegistered: vi.fn(),
      onGuestUpdated: vi.fn(),
      onTicketRegistered: vi.fn(),
      onCalendarEventAdded: vi.fn(),
      onCalendarPersonSubscribed: vi.fn(),
    };
    const handler = createWebhookHandler(callbacks);

    for (const payload of payloads) {
      await handler.handle(payload);
    }

    for (const callback of Object.values(callbacks)) {
      expect(callback).toHaveBeenCalledTimes(1);
    }
  });

  it("should dispatch guest.registered payloads", async () => {
    const onGuestRegistered = vi.fn();
    const handler = createWebhookHandler({ onGuestRegistered });

    await handler.handle(guestRegisteredPayload);

    expect(onGuestRegistered).toHaveBeenCalledTimes(1);
    expect(onGuestRegistered.mock.calls[0][0].data.guest.api_id).toBe("gst_123");
  });

  it("should await async callbacks", async () => {
    let resolved = false;
    const handler = createWebhookHandler({
      onEventCreated: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        resolved = true;
      },
    });

    await handler.handle(eventCreatedPayload);
    expect(resolved).toBe(true);
  });

  it("should call onUnhandled when no callback matches", async () => {
    const onUnhandled = vi.fn();
    const handler = createWebhookHandler({ onUnhandled });

    await handler.handle(eventCreatedPayload);

    expect(onUnhandled).toHaveBeenCalledTimes(1);
    expect(onUnhandled.mock.calls[0][0].type).toBe("event.created");
  });

  it("should not call onUnhandled when a callback matches", async () => {
    const onUnhandled = vi.fn();
    const handler = createWebhookHandler({ onEventCreated: vi.fn(), onUnhandled });

    await handler.handle(eventCreatedPayload);

    expect(onUnhandled).not.toHaveBeenCalled();
  });

  it("should be a no-op for unmatched payloads without onUnhandled", async () => {
    const handler = createWebhookHandler({});
    const parsed = await handler.handle(eventCreatedPayload);
    expect(parsed.type).toBe("event.created");
  });

  it("should throw for payloads that fail validation", async () => {
    const handler = createWebhookHandler({});
    await expect(handler.handle({ type: "unknown.event" })).rejects.toThrow();
  });

  it("should propagate callback errors", async () => {
    const handler = createWebhookHandler({
      onEventCreated: () => {
        throw new Error("callback failed");
      },
    });

    await expect(handler.handle(eventCreatedPayload)).rejects.toThrow("callback failed");
  });

  describe("handleRequest", () => {
    const body = JSON.stringify(eventCreatedPayload);

    const validHeader = () => {
      const timestamp = Math.floor(Date.now() / 1000);
      return `t=${timestamp},v1=${sign(body, timestamp)}`;
    };

    it("should verify the signature and dispatch", async () => {
      const onEventCreated = vi.fn();
      const handler = createWebhookHandler({ secret: SECRET, onEventCreated });

      const parsed = await handler.handleRequest({ body, signatureHeader: validHeader() });

      expect(parsed.type).toBe("event.created");
      expect(onEventCreated).toHaveBeenCalledTimes(1);
    });

    it("should reject an invalid signature without dispatching", async () => {
      const onEventCreated = vi.fn();
      const handler = createWebhookHandler({ secret: SECRET, onEventCreated });
      const timestamp = Math.floor(Date.now() / 1000);

      const attempt = handler.handleRequest({
        body,
        signatureHeader: `t=${timestamp},v1=${"ab".repeat(32)}`,
      });

      await expect(attempt).rejects.toBeInstanceOf(LumaWebhookSignatureError);
      await expect(attempt).rejects.toMatchObject({ reason: "signature-mismatch" });
      expect(onEventCreated).not.toHaveBeenCalled();
    });

    it("should reject a missing signature header", async () => {
      const handler = createWebhookHandler({ secret: SECRET });

      await expect(handler.handleRequest({ body, signatureHeader: null })).rejects.toMatchObject({
        reason: "missing-header",
      });
    });

    it("should reject stale timestamps", async () => {
      const handler = createWebhookHandler({ secret: SECRET, toleranceInSeconds: 60 });
      const staleTimestamp = Math.floor(Date.now() / 1000) - 120;

      const attempt = handler.handleRequest({
        body,
        signatureHeader: `t=${staleTimestamp},v1=${sign(body, staleTimestamp)}`,
      });

      await expect(attempt).rejects.toMatchObject({ reason: "timestamp-out-of-tolerance" });
    });

    it("should throw a configuration error when constructed without a secret", async () => {
      const handler = createWebhookHandler({});
      if (!hasHandleRequest(handler)) {
        throw new Error("Expected handler to expose handleRequest at runtime");
      }
      const attempt = handler.handleRequest({ body, signatureHeader: validHeader() });

      await expect(attempt).rejects.toBeInstanceOf(LumaWebhookConfigurationError);
      await expect(attempt).rejects.toMatchObject({ reason: "missing-secret" });
    });
  });
});
