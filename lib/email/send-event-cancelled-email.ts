import { getEnv } from "@/lib/env";

import { getResend } from "./client";
import { escapeHtml } from "./escape";

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

  const html = `<!DOCTYPE html>
<html lang="zh-Hant" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>活動取消通知 — ${safeTitle}</title>
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
    ${safeName}，很抱歉通知您，原定活動「${safeTitle}」已取消。
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <!-- Email container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width: 560px; width: 100%;">

          <!-- Header: Brand bar -->
          <tr>
            <td style="background-color: #2d3a40; border-radius: 12px 12px 0 0; padding: 24px 32px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #c8d0d5; font-size: 20px; font-weight: 700; letter-spacing: 1px; text-align: center; line-height: 1.4;">
                    SEE YOU WILD
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 32px 32px;">

              <!-- Greeting -->
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

      </td>
    </tr>
  </table>

</body>
</html>`;

  await getResend().emails.send({
    from: getEnv().RESEND_FROM,
    to: params.to,
    subject: `活動取消通知 — ${safeTitle}`,
    html,
  });
}
