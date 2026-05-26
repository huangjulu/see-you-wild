import { getEnv } from "@/lib/env";

import { getResend } from "./client";
import { escapeHtml } from "./escape";

interface CarGroupSummary {
  carGroup: number;
  pickupLocation: string;
  driverName: string | null;
  seatCount: number | null;
  passengerCount: number;
  remainingSeats: number | null;
}

interface SendAdminCarpoolSummaryParams {
  to: string;
  eventTitle: string;
  eventDate: string;
  eventUrl: string;
  groups: CarGroupSummary[];
}

function buildGroupRow(group: CarGroupSummary): string {
  const driverCell =
    group.driverName != null
      ? escapeHtml(group.driverName)
      : `<span style="color: #d4a373; font-weight: 700;">待安排</span>`;

  const remainingCell =
    group.remainingSeats != null
      ? group.remainingSeats > 0
        ? `<span style="color: #d4a373; font-weight: 700;">${group.remainingSeats}</span>`
        : `${group.remainingSeats}`
      : "—";

  return `<tr>
                          <td style="padding: 10px 12px; border-bottom: 1px solid #e8edea; color: #2d3a40; font-size: 14px;">第 ${group.carGroup} 車</td>
                          <td style="padding: 10px 12px; border-bottom: 1px solid #e8edea; color: #2d3a40; font-size: 14px;">${driverCell}</td>
                          <td style="padding: 10px 12px; border-bottom: 1px solid #e8edea; color: #2d3a40; font-size: 14px;">${escapeHtml(group.pickupLocation)}</td>
                          <td style="padding: 10px 12px; border-bottom: 1px solid #e8edea; color: #2d3a40; font-size: 14px; text-align: center;">${group.passengerCount} 位</td>
                          <td style="padding: 10px 12px; border-bottom: 1px solid #e8edea; color: #2d3a40; font-size: 14px; text-align: center;">${remainingCell}</td>
                        </tr>`;
}

export async function sendAdminCarpoolSummaryEmail(
  params: SendAdminCarpoolSummaryParams
) {
  const safeTitle = escapeHtml(params.eventTitle);

  const formattedDate = new Date(params.eventDate).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const safeEventUrl = escapeHtml(params.eventUrl);

  const groupRows =
    params.groups.length > 0
      ? params.groups.map(buildGroupRow).join("\n")
      : `<tr>
                          <td colspan="5" style="padding: 20px 12px; color: #9eb3c2; font-size: 14px; text-align: center;">無共乘車組</td>
                        </tr>`;

  const html = `<!DOCTYPE html>
<html lang="zh-Hant" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>配車結果摘要 — ${safeTitle}｜${formattedDate}</title>
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
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans TC', sans-serif;">

  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${safeTitle} 配車結果已產生，共 ${params.groups.length} 個車組，請前往查看詳情。
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <!-- Email container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;">

          <!-- Header: Brand bar -->
          <tr>
            <td style="background-color: #2d3a40; border-radius: 12px 12px 0 0; padding: 24px 32px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #f4f6f5; font-size: 20px; font-weight: 700; letter-spacing: 1px; text-align: center; line-height: 1.4;">
                    SEE YOU WILD
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 32px 32px;">

              <!-- Title -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #2d3a40; font-size: 22px; font-weight: 700; line-height: 1.4; padding-bottom: 4px;">
                    配車結果摘要
                  </td>
                </tr>
                <tr>
                  <td style="color: #9eb3c2; font-size: 15px; line-height: 1.6; padding-bottom: 32px;">
                    ${safeTitle} — ${formattedDate}
                  </td>
                </tr>
              </table>

              <!-- Group table -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e8edea; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #f4f6f5; padding: 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <!-- Table header -->
                      <tr>
                        <th style="padding: 10px 12px; text-align: left; color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1px solid #e8edea;">車組</th>
                        <th style="padding: 10px 12px; text-align: left; color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1px solid #e8edea;">車手</th>
                        <th style="padding: 10px 12px; text-align: left; color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1px solid #e8edea;">集合點</th>
                        <th style="padding: 10px 12px; text-align: center; color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1px solid #e8edea;">乘客</th>
                        <th style="padding: 10px 12px; text-align: center; color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1px solid #e8edea;">剩餘</th>
                      </tr>
                      ${groupRows}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Spacer -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="padding-top: 32px;"></td></tr>
              </table>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeEventUrl}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="17%" stroke="f" fillcolor="#d4a373">
                      <w:anchorlock/>
                      <center style="color:#2d3a40;font-family:sans-serif;font-size:15px;font-weight:bold;">查看活動詳情</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${safeEventUrl}" target="_blank" style="display: inline-block; background-color: #d4a373; color: #2d3a40; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 40px; border-radius: 8px; line-height: 1.2;">
                      查看活動詳情
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #2d3a40; border-radius: 0 0 12px 12px; padding: 24px 32px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #9eb3c2; font-size: 12px; line-height: 1.7;">
                    此為系統自動通知，無需回覆。<br>
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
    subject: `配車摘要 — ${safeTitle}｜${formattedDate}`,
    html,
  });
}
