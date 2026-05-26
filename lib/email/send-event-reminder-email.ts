import { getEnv } from "@/lib/env";

import { getResend } from "./client";
import { escapeHtml } from "./escape";

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

  const html = `<!DOCTYPE html>
<html lang="zh-Hant" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>活動提醒 — ${safeTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #1a1a1a !important; }
      .card-bg { background-color: #2a2a2a !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans TC', sans-serif;">

  <!-- Preheader (hidden preview text) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${safeName}，你報名的 ${safeTitle} 即將到來，快來看看活動詳情！
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5;" class="email-bg">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <!-- Email container (max 560px) -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width: 560px; width: 100%;">

          <!-- Header: Brand bar -->
          <tr>
            <td style="background-color: #d4a373; border-radius: 12px 12px 0 0; padding: 24px 32px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 1px; text-align: center; line-height: 1.4;">
                    SEE YOU WILD
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 32px 32px;" class="card-bg">

              <!-- Greeting -->
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
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f6f5; border-radius: 0 0 12px 12px; padding: 24px 32px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #9eb3c2; font-size: 12px; line-height: 1.7;">
                    有任何問題歡迎直接回覆此信。<br>
                    &copy; See You Wild
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Email container -->

      </td>
    </tr>
  </table>

</body>
</html>`;

  await getResend().emails.send({
    from: getEnv().RESEND_FROM,
    to: params.to,
    subject: `活動提醒 — ${safeTitle}`,
    html,
  });
}
