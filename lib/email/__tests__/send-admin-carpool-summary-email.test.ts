import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/email/client", () => ({
  getResend: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getEnv: vi.fn(),
}));

import { getResend } from "@/lib/email/client";
import { sendAdminCarpoolSummaryEmail } from "@/lib/email/send-admin-carpool-summary-email";
import { getEnv } from "@/lib/env";

const mockSend = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // Resend is opaque 3rd-party type; we only need .emails.send() for these tests.
  vi.mocked(getResend).mockReturnValue({
    emails: { send: mockSend },
  } as never);
  vi.mocked(getEnv).mockReturnValue({
    RESEND_FROM: "noreply@seeyouwild.com",
    RESEND_API_KEY: "re_test",
    NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    canonicalUrl: "https://seeyouwild.com",
  } as never);
  mockSend.mockResolvedValue({ id: "email-id" });
});

const baseParams = {
  to: "admin@seeyouwild.com",
  eventTitle: "宜蘭單車之旅",
  eventDate: "2026-07-01",
  eventUrl: "https://seeyouwild.com/events/evt-1",
  groups: [
    {
      carGroup: 1,
      pickupLocation: "台北車站",
      driverName: "王大明",
      seatCount: 4,
      passengerCount: 3,
      remainingSeats: 1,
    },
  ],
};

describe("sendAdminCarpoolSummaryEmail", () => {
  it("寄出含車組摘要的信", async () => {
    await sendAdminCarpoolSummaryEmail(baseParams);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const call = mockSend.mock.calls[0][0];
    expect(call.to).toBe("admin@seeyouwild.com");
    expect(call.from).toBe("noreply@seeyouwild.com");
    expect(call.subject).toContain("配車摘要");
    expect(call.subject).toContain("宜蘭單車之旅");
    expect(call.html).toContain("第 1 車");
    expect(call.html).toContain("王大明");
    expect(call.html).toContain("台北車站");
    expect(call.html).toContain("3 位");
  });

  it("無 driver 的車組標示待安排", async () => {
    const params = {
      ...baseParams,
      groups: [
        {
          carGroup: 2,
          pickupLocation: "板橋",
          driverName: null,
          seatCount: null,
          passengerCount: 2,
          remainingSeats: null,
        },
      ],
    };

    await sendAdminCarpoolSummaryEmail(params);

    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("待安排");
    expect(html).toContain("#d4a373");
  });

  it("未滿車的車組顯示剩餘座位", async () => {
    const params = {
      ...baseParams,
      groups: [
        {
          carGroup: 1,
          pickupLocation: "台北車站",
          driverName: "林小花",
          seatCount: 4,
          passengerCount: 1,
          remainingSeats: 3,
        },
      ],
    };

    await sendAdminCarpoolSummaryEmail(params);

    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain(">3<");
    expect(html).toContain("#d4a373");
  });

  it("空車組陣列仍能正常寄出並顯示無共乘車組", async () => {
    const params = { ...baseParams, groups: [] };

    await sendAdminCarpoolSummaryEmail(params);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("無共乘車組");
  });
});
