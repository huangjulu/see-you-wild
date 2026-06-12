import { getEnv } from "@/lib/env";

import { getResend } from "./client";
import { escapeHtml } from "./escape";
import { renderEmailLayout } from "./layout";

interface SendEventReminderParams {
  to: string;
  customerName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventUrl: string;
  transport: "self" | "carpool";
  finalRole?: "driver" | "passenger";
  pickupLocation?: string;
  carGroup?: number;
  passengerCount?: number;
  refundAmount?: number;
  hasDriver?: boolean;
}

function buildDetailRow(label: string, value: string): string {
  return `
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">
                          ${label}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; line-height: 1.5; padding-bottom: 20px;">
                          ${value}
                        </td>
                      </tr>`;
}

function buildDetailSection(params: SendEventReminderParams): string {
  const safeTitle = escapeHtml(params.eventTitle);
  const safeDate = escapeHtml(
    new Date(params.eventDate).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );
  const safeLocation = escapeHtml(params.eventLocation);

  const baseRows =
    buildDetailRow("活動", safeTitle) + buildDetailRow("日期", safeDate);

  if (params.transport === "self") {
    return baseRows + buildDetailRow("地點", safeLocation);
  }

  const safePickup =
    params.pickupLocation != null ? escapeHtml(params.pickupLocation) : "待定";
  const carGroupDisplay =
    params.carGroup != null ? `第 ${params.carGroup} 車` : "待定";

  const carpoolBase =
    baseRows +
    buildDetailRow("車組編號", carGroupDisplay) +
    buildDetailRow("集合地點", safePickup);

  if (params.finalRole === "driver") {
    const passengerCountDisplay =
      params.passengerCount != null ? String(params.passengerCount) : "0";
    const formattedRefund =
      params.refundAmount != null
        ? `NT$ ${params.refundAmount.toLocaleString("zh-TW")}`
        : "NT$ 0";
    return (
      carpoolBase +
      buildDetailRow("乘客數", passengerCountDisplay) +
      buildDetailRow("退還金額", formattedRefund)
    );
  }

  const noDriverNotice =
    params.hasDriver === false
      ? `
                      <tr>
                        <td style="color: #2d3a40; font-size: 14px; line-height: 1.7; padding-bottom: 20px; border-left: 3px solid #d4a373; padding-left: 12px;">
                          主辦方將另行安排交通，詳情將於活動前通知。
                        </td>
                      </tr>`
      : "";

  return carpoolBase + noDriverNotice;
}

export async function sendEventReminderEmail(
  params: SendEventReminderParams
): Promise<void> {
  const safeName = escapeHtml(params.customerName);
  const safeTitle = escapeHtml(params.eventTitle);
  const safeEventUrl = escapeHtml(params.eventUrl);
  const detailSection = buildDetailSection(params);

  const html = renderEmailLayout({
    title: `活動提醒 — ${safeTitle}`,
    preheaderHtml: `${safeName}，你報名的 ${safeTitle} 即將到來，快來看看活動詳情！`,
    headerBg: "#d4a373",
    headerTextColor: "#ffffff",
    footerBg: "#f4f6f5",
    footerHtml: `有任何問題歡迎直接回覆此信。<br>
                    &copy; See You Wild`,
    containerWidth: 560,
    extraStyles: `@media (prefers-color-scheme: dark) {
      .email-bg { background-color: #1a1a1a !important; }
      .card-bg { background-color: #2a2a2a !important; }
    }`,
    outerTableClass: "email-bg",
    mainCardClass: "card-bg",
    bodyHtml: `<!-- Greeting -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #2d3a40; font-size: 22px; font-weight: 700; line-height: 1.4; padding-bottom: 8px;">
                    Hi ${safeName}
                  </td>
                </tr>
                <tr>
                  <td style="color: #2d3a40; font-size: 15px; line-height: 1.7; padding-bottom: 28px;">
                    你報名的活動快到囉！以下是你的活動資訊，請確認相關細節。
                  </td>
                </tr>
              </table>

              <!-- Info card (well container) -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${detailSection}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Spacer -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="padding-top: 28px;"></td></tr>
              </table>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeEventUrl}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="17%" stroke="f" fillcolor="#d4a373">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">查看活動詳情</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${safeEventUrl}" target="_blank" style="display: inline-block; background-color: #d4a373; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 40px; border-radius: 8px; line-height: 1.2; mso-hide: all;">
                      查看活動詳情
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Closing text -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #2d3a40; font-size: 15px; line-height: 1.7; text-align: center; padding-top: 24px;">
                    期待見到你！
                  </td>
                </tr>
              </table>`,
  });

  await getResend().emails.send({
    from: getEnv().RESEND_FROM,
    to: params.to,
    subject: `活動提醒 — ${safeTitle}`,
    html,
  });
}
