import { getEnv } from "@/lib/env";

import { getResend } from "./client";
import { escapeHtml } from "./escape";
import { renderEmailLayout } from "./layout";

interface SendRegistrationCancelledEmailParams {
  to: string;
  customerName: string;
  eventTitle: string;
  eventDate: string;
}

export async function sendRegistrationCancelledEmail(
  params: SendRegistrationCancelledEmailParams
) {
  const safeName = escapeHtml(params.customerName);
  const safeTitle = escapeHtml(params.eventTitle);

  const formattedDate = new Date(params.eventDate).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = renderEmailLayout({
    title: `報名取消通知 — ${safeTitle}`,
    preheaderHtml: `${safeName}，您在「${safeTitle}」的報名已被取消。`,
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
                    您在「${safeTitle}」（${formattedDate}）的報名已被取消。
                  </td>
                </tr>
              </table>

              <!-- Refund note -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #5f727d; font-size: 14px; line-height: 1.7;">
                    若您已完成匯款，我們將盡快安排退款事宜。如有任何疑問，請直接回覆此信聯繫我們。
                  </td>
                </tr>
              </table>`,
  });

  await getResend().emails.send({
    from: getEnv().RESEND_FROM,
    to: params.to,
    subject: `報名取消通知 — ${safeTitle}`,
    html,
  });
}
