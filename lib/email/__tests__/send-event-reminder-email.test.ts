import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/email/client", () => ({
  getResend: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getEnv: vi.fn(),
}));

import { getResend } from "@/lib/email/client";
import { sendEventReminderEmail } from "@/lib/email/send-event-reminder-email";
import { getEnv } from "@/lib/env";

const mockSend = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // Resend client is opaque 3rd-party type; only .emails.send is exercised here.
  vi.mocked(getResend).mockReturnValue({
    emails: { send: mockSend },
  } as never);
  vi.mocked(getEnv).mockReturnValue({
    RESEND_FROM: "noreply@seeyouwild.com",
    RESEND_API_KEY: "test-key",
  } as never);
  mockSend.mockResolvedValue({ id: "email-id" });
});

describe("sendEventReminderEmail", () => {
  describe("self 類型", () => {
    it("寄出含活動地點和詳情連結的信", async () => {
      await sendEventReminderEmail({
        to: "user@example.com",
        customerName: "王小明",
        eventTitle: "陽明山一日遊",
        eventDate: "2026-06-15",
        eventLocation: "陽明山國家公園",
        eventUrl: "https://seeyouwild.com/events/1",
        transport: "self",
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0] as {
        to: string;
        subject: string;
        html: string;
      };

      expect(call.to).toBe("user@example.com");
      expect(call.subject).toBe("活動提醒 — 陽明山一日遊");
      expect(call.html).toContain("陽明山國家公園");
      expect(call.html).toContain("https://seeyouwild.com/events/1");
      expect(call.html).toContain("查看活動詳情");
      expect(call.html).toContain("地點");
      expect(call.html).toContain("期待見到你！");
    });

    it("不包含車組或集合地點資訊", async () => {
      await sendEventReminderEmail({
        to: "user@example.com",
        customerName: "王小明",
        eventTitle: "陽明山一日遊",
        eventDate: "2026-06-15",
        eventLocation: "陽明山國家公園",
        eventUrl: "https://seeyouwild.com/events/1",
        transport: "self",
      });

      const html = (mockSend.mock.calls[0][0] as { html: string }).html;
      expect(html).not.toContain("車組編號");
      expect(html).not.toContain("集合地點");
    });
  });

  describe("carpool passenger 類型", () => {
    it("信含集合地點和車組編號", async () => {
      await sendEventReminderEmail({
        to: "user@example.com",
        customerName: "李美華",
        eventTitle: "太平山健行",
        eventDate: "2026-07-20",
        eventLocation: "太平山國家森林遊樂區",
        eventUrl: "https://seeyouwild.com/events/2",
        transport: "carpool",
        finalRole: "passenger",
        pickupLocation: "台北車站",
        carGroup: 3,
        hasDriver: true,
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      const html = (mockSend.mock.calls[0][0] as { html: string }).html;

      expect(html).toContain("台北車站");
      expect(html).toContain("3");
      expect(html).toContain("集合地點");
      expect(html).toContain("車組編號");
      expect(html).toContain("查看活動詳情");
    });

    it("無 driver 時顯示另行安排提示", async () => {
      await sendEventReminderEmail({
        to: "user@example.com",
        customerName: "李美華",
        eventTitle: "太平山健行",
        eventDate: "2026-07-20",
        eventLocation: "太平山國家森林遊樂區",
        eventUrl: "https://seeyouwild.com/events/2",
        transport: "carpool",
        finalRole: "passenger",
        pickupLocation: "台北車站",
        carGroup: 2,
        hasDriver: false,
      });

      const html = (mockSend.mock.calls[0][0] as { html: string }).html;
      expect(html).toContain("主辦方將另行安排交通");
    });

    it("有 driver 時不顯示另行安排提示", async () => {
      await sendEventReminderEmail({
        to: "user@example.com",
        customerName: "李美華",
        eventTitle: "太平山健行",
        eventDate: "2026-07-20",
        eventLocation: "太平山國家森林遊樂區",
        eventUrl: "https://seeyouwild.com/events/2",
        transport: "carpool",
        finalRole: "passenger",
        pickupLocation: "台北車站",
        carGroup: 2,
        hasDriver: true,
      });

      const html = (mockSend.mock.calls[0][0] as { html: string }).html;
      expect(html).not.toContain("主辦方將另行安排交通");
    });
  });

  describe("carpool driver 類型", () => {
    it("信含乘客數和退還金額", async () => {
      await sendEventReminderEmail({
        to: "driver@example.com",
        customerName: "陳大壯",
        eventTitle: "合歡山攻頂",
        eventDate: "2026-08-10",
        eventLocation: "合歡山主峰",
        eventUrl: "https://seeyouwild.com/events/3",
        transport: "carpool",
        finalRole: "driver",
        pickupLocation: "台中高鐵站",
        carGroup: 1,
        passengerCount: 4,
        refundAmount: 800,
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      const html = (mockSend.mock.calls[0][0] as { html: string }).html;

      expect(html).toContain("4");
      expect(html).toContain("NT$ 800");
      expect(html).toContain("乘客數");
      expect(html).toContain("退還金額");
      expect(html).toContain("台中高鐵站");
    });

    it("不顯示另行安排交通提示", async () => {
      await sendEventReminderEmail({
        to: "driver@example.com",
        customerName: "陳大壯",
        eventTitle: "合歡山攻頂",
        eventDate: "2026-08-10",
        eventLocation: "合歡山主峰",
        eventUrl: "https://seeyouwild.com/events/3",
        transport: "carpool",
        finalRole: "driver",
        pickupLocation: "台中高鐵站",
        carGroup: 1,
        passengerCount: 4,
        refundAmount: 800,
      });

      const html = (mockSend.mock.calls[0][0] as { html: string }).html;
      expect(html).not.toContain("主辦方將另行安排交通");
    });
  });

  describe("HTML escape 防 XSS", () => {
    it("customerName 中的 HTML 特殊字元被轉義", async () => {
      await sendEventReminderEmail({
        to: "user@example.com",
        customerName: '<script>alert("xss")</script>',
        eventTitle: "測試活動",
        eventDate: "2026-06-15",
        eventLocation: "台北",
        eventUrl: "https://seeyouwild.com/events/1",
        transport: "self",
      });

      const html = (mockSend.mock.calls[0][0] as { html: string }).html;
      expect(html).not.toContain("<script>");
      expect(html).toContain("&lt;script&gt;");
    });

    it("eventTitle 中的 HTML 特殊字元被轉義", async () => {
      await sendEventReminderEmail({
        to: "user@example.com",
        customerName: "測試者",
        eventTitle: '活動 <img src="x" onerror="alert(1)">',
        eventDate: "2026-06-15",
        eventLocation: "台北",
        eventUrl: "https://seeyouwild.com/events/1",
        transport: "self",
      });

      const html = (mockSend.mock.calls[0][0] as { html: string }).html;
      expect(html).not.toContain("<img");
      expect(html).toContain("&lt;img");
    });

    it("pickupLocation 中的 HTML 特殊字元被轉義", async () => {
      await sendEventReminderEmail({
        to: "user@example.com",
        customerName: "測試者",
        eventTitle: "測試活動",
        eventDate: "2026-06-15",
        eventLocation: "台北",
        eventUrl: "https://seeyouwild.com/events/1",
        transport: "carpool",
        finalRole: "passenger",
        pickupLocation: "<b onmouseover=\"alert('xss')\">台北車站</b>",
        carGroup: 1,
        hasDriver: true,
      });

      const html = (mockSend.mock.calls[0][0] as { html: string }).html;
      expect(html).not.toContain("<b ");
      expect(html).toContain("&lt;b");
    });
  });
});
