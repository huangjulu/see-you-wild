import { getEnv } from "@/lib/env";

import { getResend } from "./client";
import { escapeHtml } from "./escape";
import { renderEmailLayout } from "./layout";

interface SendEventCancelledEmailParams {
  to: string;
  customerName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  cancellationReason: string;
}

export async function sendEventCancelledEmail(
  params: SendEventCancelledEmailParams
) {
  const safeName = escapeHtml(params.customerName);
  const safeTitle = escapeHtml(params.eventTitle);
  const safeLocation = escapeHtml(params.eventLocation);
  const safeReason = escapeHtml(params.cancellationReason);

  const formattedDate = new Date(params.eventDate).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = renderEmailLayout({
    title: `活動取消通知 — ${safeTitle}`,
    preheaderHtml: `${safeName}，很抱歉通知您，原定活動「${safeTitle}」已取消。`,
    headerBg: "#2d3a40",
    headerTextColor: "#c8d0d5",
    footerBg: "#f4f6f5",
    footerHtml: `有任何問題歡迎直接回覆此信。<br>
                    &copy; See You Wild`,
    containerWidth: 560,
    bodyHtml: `<!-- Greeting -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #2d3a40; font-size: 22px; font-weight: 700; line-height: 1.4; padding-bottom: 8px;">
                    ${safeName} 您好
                  </td>
                </tr>
                <tr>
                  <td style="color: #2d3a40; font-size: 15px; line-height: 1.7; padding-bottom: 28px;">
                    很抱歉通知您，原定於 ${formattedDate} 在 ${safeLocation} 舉辦的「${safeTitle}」活動已取消。
                  </td>
                </tr>
              </table>

              <!-- Cancellation reason section -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #2d3a40; font-size: 15px; font-weight: 700; line-height: 1.5; padding-bottom: 12px;">
                    取消原因
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5; border-left: 3px solid #de954e; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="color: #5f727d; font-size: 13px; line-height: 1.6; padding-bottom: 6px;">
                          取消原因
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; line-height: 1.7;">
                          ${safeReason}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Refund note -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #5f727d; font-size: 14px; line-height: 1.7; padding-bottom: 0;">
                    若您已完成匯款，我們將盡快安排退款事宜。如有任何疑問，請直接回覆此信聯繫我們。
                  </td>
                </tr>
              </table>`,
  });

  await getResend().emails.send({
    from: getEnv().RESEND_FROM,
    to: params.to,
    subject: `活動取消通知 — ${safeTitle}`,
    html,
  });
}
