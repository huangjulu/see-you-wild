import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSend = vi.fn().mockResolvedValue({ id: "mock-id" });

vi.mock("@/lib/email/client", () => ({
  getResend: () => ({ emails: { send: mockSend } }),
}));

vi.mock("@/lib/env", () => ({
  getEnv: () => ({
    RESEND_FROM: "test@seeyouwild.com",
    RESEND_API_KEY: "re_test",
    canonicalUrl: "https://seeyouwild.com",
  }),
}));

vi.mock("@/lib/token", () => ({
  getPaymentToken: () => ({
    generate: vi.fn().mockReturnValue("mock-hmac-token"),
  }),
}));

import { sendAdminCarpoolSummaryEmail } from "@/lib/email/send-admin-carpool-summary-email";
import { sendAdminNotification } from "@/lib/email/send-admin-notification";
import { sendEventReminderEmail } from "@/lib/email/send-event-reminder-email";
import { sendRegistrationEmail } from "@/lib/email/send-registration-email";
import { sendRegistrationFailedEmail } from "@/lib/email/send-registration-failed-email";
import { sendRegistrationSuccessEmail } from "@/lib/email/send-registration-success-email";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("sendRegistrationSuccessEmail", () => {
  const params = {
    to: "user@example.com",
    customerName: "張小明",
    eventTitle: "宜蘭野溪溫泉",
    eventDate: "2026-08-01",
    eventLocation: "宜蘭",
    amountDue: 4800,
    transport: "carpool",
    dietary: "no_beef",
    wantsRental: true,
  };

  it("HTML 包含活動名稱", async () => {
    await sendRegistrationSuccessEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("宜蘭野溪溫泉");
  });

  it("HTML 包含格式化金額", async () => {
    await sendRegistrationSuccessEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("4,800");
  });

  it("HTML 包含報名者姓名", async () => {
    await sendRegistrationSuccessEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("張小明");
  });

  it("HTML 包含活動地點", async () => {
    await sendRegistrationSuccessEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("宜蘭");
  });

  it("transport 顯示中文標籤（carpool → 共乘）", async () => {
    await sendRegistrationSuccessEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("共乘");
  });

  it("dietary 顯示中文標籤（no_beef → 不吃牛）", async () => {
    await sendRegistrationSuccessEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("不吃牛");
  });

  it("wantsRental=true 顯示「是」", async () => {
    await sendRegistrationSuccessEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("裝備租借：是");
  });

  it("wantsRental=false 顯示「否」", async () => {
    await sendRegistrationSuccessEmail({ ...params, wantsRental: false });
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("裝備租借：否");
  });

  it("subject 包含活動名稱", async () => {
    await sendRegistrationSuccessEmail(params);
    const subject = mockSend.mock.calls[0][0].subject as string;
    expect(subject).toContain("宜蘭野溪溫泉");
  });

  it("HTML escape 防 XSS（名稱含 < >）", async () => {
    await sendRegistrationSuccessEmail({
      ...params,
      customerName: "<script>alert(1)</script>",
    });
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("包含 LINE OA 連結", async () => {
    await sendRegistrationSuccessEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("加入 LINE 好友");
  });
});

describe("sendRegistrationFailedEmail", () => {
  const params = {
    to: "user@example.com",
    customerName: "張小明",
    eventTitle: "宜蘭野溪溫泉",
    paymentRefUrl: "https://seeyouwild.com/payment-ref?id=reg-1&token=abc",
  };

  it("HTML 包含活動名稱", async () => {
    await sendRegistrationFailedEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("宜蘭野溪溫泉");
  });

  it("HTML 包含重新填寫 CTA 連結", async () => {
    await sendRegistrationFailedEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain(params.paymentRefUrl);
    expect(html).toContain("重新填寫末五碼");
  });

  it("HTML 包含匯款資訊", async () => {
    await sendRegistrationFailedEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("匯款資訊");
    expect(html).toContain("銀行");
    expect(html).toContain("帳號");
    expect(html).toContain("戶名");
  });

  it("subject 包含活動名稱", async () => {
    await sendRegistrationFailedEmail(params);
    const subject = mockSend.mock.calls[0][0].subject as string;
    expect(subject).toContain("宜蘭野溪溫泉");
  });

  it("包含 LINE OA 聯繫連結", async () => {
    await sendRegistrationFailedEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("line.me/R/ti/p/@427qyovq");
  });

  it("包含官網連結", async () => {
    await sendRegistrationFailedEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("seeyouwild.com");
  });
});

describe("sendRegistrationEmail", () => {
  const params = {
    to: "user@example.com",
    customerName: "張小明",
    eventTitle: "宜蘭野溪溫泉",
    amountDue: 4800,
    expiresAt: "2026-08-15T00:00:00Z",
    transport: "carpool" as const,
  };

  it("HTML 包含活動名稱和金額", async () => {
    await sendRegistrationEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("宜蘭野溪溫泉");
    expect(html).toContain("4,800");
  });

  it("包含 LINE OA 回報繳費 CTA（已取代舊 paymentRef 按鈕）", async () => {
    await sendRegistrationEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("line.me/R/ti/p/@427qyovq");
    expect(html).toContain("加 LINE OA 回報繳費");
  });

  it("transport=carpool 時包含共乘通知", async () => {
    await sendRegistrationEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("共乘方案");
  });

  it("transport=self 時不包含共乘通知", async () => {
    await sendRegistrationEmail({ ...params, transport: "self" });
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).not.toContain("共乘方案");
  });

  it("subject 包含活動名稱", async () => {
    await sendRegistrationEmail(params);
    const subject = mockSend.mock.calls[0][0].subject as string;
    expect(subject).toContain("宜蘭野溪溫泉");
  });

  it("包含匯款資訊區塊", async () => {
    await sendRegistrationEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("匯款資訊");
  });

  it("包含 LINE OA 回報繳費 CTA", async () => {
    await sendRegistrationEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("加 LINE OA 回報繳費");
    expect(html).toContain("line.me/R/ti/p/@427qyovq");
  });

  it("包含官網連結", async () => {
    await sendRegistrationEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("seeyouwild.com");
  });

  it("HTML escape 防 XSS（名稱含 < >）", async () => {
    await sendRegistrationEmail({
      ...params,
      customerName: "<script>alert(1)</script>",
      eventTitle: "<img src=x onerror=alert(1)>",
    });
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img");
  });
});

describe("sendEventReminderEmail", () => {
  const baseParams = {
    to: "user@example.com",
    customerName: "張小明",
    eventTitle: "宜蘭野溪溫泉",
    eventDate: "2026-08-01",
    eventLocation: "宜蘭",
    eventUrl: "https://seeyouwild.com/events/evt-1",
    transport: "self" as const,
  };

  it("自行前往：HTML 包含活動名稱和地點", async () => {
    await sendEventReminderEmail(baseParams);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("宜蘭野溪溫泉");
    expect(html).toContain("宜蘭");
  });

  it("自行前往：不包含車組編號", async () => {
    await sendEventReminderEmail(baseParams);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).not.toContain("車組編號");
  });

  it("共乘乘客：包含車組和集合地點", async () => {
    await sendEventReminderEmail({
      ...baseParams,
      transport: "carpool",
      finalRole: "passenger",
      pickupLocation: "台北車站",
      carGroup: 1,
    });
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("第 1 車");
    expect(html).toContain("台北車站");
  });

  it("共乘司機：包含乘客數和退還金額", async () => {
    await sendEventReminderEmail({
      ...baseParams,
      transport: "carpool",
      finalRole: "driver",
      pickupLocation: "台北車站",
      carGroup: 1,
      passengerCount: 3,
      refundAmount: 600,
    });
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("乘客數");
    expect(html).toContain("3");
    expect(html).toContain("NT$ 600");
  });

  it("無司機組乘客：顯示待安排通知", async () => {
    await sendEventReminderEmail({
      ...baseParams,
      transport: "carpool",
      finalRole: "passenger",
      pickupLocation: "台北車站",
      carGroup: 2,
      hasDriver: false,
    });
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("主辦方將另行安排交通");
  });

  it("subject 包含活動名稱", async () => {
    await sendEventReminderEmail(baseParams);
    const subject = mockSend.mock.calls[0][0].subject as string;
    expect(subject).toContain("宜蘭野溪溫泉");
  });

  it("包含查看活動詳情 CTA", async () => {
    await sendEventReminderEmail(baseParams);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("查看活動詳情");
    expect(html).toContain(baseParams.eventUrl);
  });
});

describe("sendAdminCarpoolSummaryEmail", () => {
  const params = {
    to: "admin@seeyouwild.com",
    eventTitle: "宜蘭野溪溫泉",
    eventDate: "2026-08-01",
    eventUrl: "https://seeyouwild.com/admin/events/evt-1",
    groups: [
      {
        carGroup: 1,
        pickupLocation: "台北車站",
        driverName: "李大華",
        seatCount: 4,
        passengerCount: 3,
        remainingSeats: 1,
      },
      {
        carGroup: 2,
        pickupLocation: "板橋站",
        driverName: null,
        seatCount: null,
        passengerCount: 2,
        remainingSeats: null,
      },
    ],
  };

  it("HTML 包含活動名稱和配車結果摘要", async () => {
    await sendAdminCarpoolSummaryEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("宜蘭野溪溫泉");
    expect(html).toContain("配車結果摘要");
  });

  it("有司機的車組顯示司機名", async () => {
    await sendAdminCarpoolSummaryEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("李大華");
  });

  it("無司機的車組顯示「待安排」", async () => {
    await sendAdminCarpoolSummaryEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("待安排");
  });

  it("剩餘座位 > 0 時有特殊樣式標示", async () => {
    await sendAdminCarpoolSummaryEmail(params);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain(">1</span>");
  });

  it("空 groups 顯示「無共乘車組」", async () => {
    await sendAdminCarpoolSummaryEmail({ ...params, groups: [] });
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("無共乘車組");
  });

  it("subject 包含活動名稱", async () => {
    await sendAdminCarpoolSummaryEmail(params);
    const subject = mockSend.mock.calls[0][0].subject as string;
    expect(subject).toContain("宜蘭野溪溫泉");
  });
});

describe("sendAdminNotification", () => {
  const baseParams = {
    customerName: "張小明",
    eventTitle: "宜蘭野溪溫泉",
    amountDue: 4800,
    expiresAt: "2026-08-15T00:00:00Z",
    adminUrl: "https://seeyouwild.com/admin/registrations/reg-1",
    adminEmail: "admin@seeyouwild.com",
  };

  it("新報名：HTML 包含報名者和活動名稱", async () => {
    await sendAdminNotification(baseParams);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("張小明");
    expect(html).toContain("宜蘭野溪溫泉");
    expect(html).toContain("新成員報名通知");
  });

  it("新報名：subject 格式正確", async () => {
    await sendAdminNotification(baseParams);
    const subject = mockSend.mock.calls[0][0].subject as string;
    expect(subject).toContain("新報名");
    expect(subject).toContain("張小明");
  });

  it("新報名：CTA 連到後台查看", async () => {
    await sendAdminNotification(baseParams);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("前往後台查看");
    expect(html).toContain(baseParams.adminUrl);
  });

  it("付款審核：包含末五碼", async () => {
    await sendAdminNotification({
      ...baseParams,
      paymentRef: "12345",
      reviewUrl: "https://seeyouwild.com/admin/review/reg-1",
    });
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("付款審核通知");
    expect(html).toContain("12345");
  });

  it("付款審核：CTA 連到審核頁面", async () => {
    const reviewUrl = "https://seeyouwild.com/admin/review/reg-1";
    await sendAdminNotification({
      ...baseParams,
      paymentRef: "12345",
      reviewUrl,
    });
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("前往審核");
    expect(html).toContain(reviewUrl);
  });

  it("付款審核：subject 包含末五碼", async () => {
    await sendAdminNotification({
      ...baseParams,
      paymentRef: "12345",
    });
    const subject = mockSend.mock.calls[0][0].subject as string;
    expect(subject).toContain("付款審核");
    expect(subject).toContain("12345");
  });

  it("金額格式化", async () => {
    await sendAdminNotification(baseParams);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("4,800");
  });

  it("寄送到指定 adminEmail", async () => {
    await sendAdminNotification(baseParams);
    expect(mockSend.mock.calls[0][0].to).toBe("admin@seeyouwild.com");
  });
});
