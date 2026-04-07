import { getResend } from "./client";
import { getEnv } from "@/lib/env";

interface SendAdminNotificationParams {
  customerName: string;
  eventTitle: string;
  amountDue: number;
  expiresAt: string;
  adminUrl: string;
  adminEmail: string;
}

export async function sendAdminNotification(
  params: SendAdminNotificationParams
) {
  const {
    customerName,
    eventTitle,
    amountDue,
    expiresAt,
    adminUrl,
    adminEmail,
  } = params;

  const formattedAmount = amountDue.toLocaleString("zh-TW");
  const formattedExpiry = new Date(expiresAt).toLocaleDateString("zh-TW", {
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
  <title>新報名 — ${customerName}｜${eventTitle}</title>
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
    ${customerName} 報名了 ${eventTitle}，待繳 NT$ ${formattedAmount}，期限 ${formattedExpiry}。
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

              <!-- Greeting -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #2d3a40; font-size: 22px; font-weight: 700; line-height: 1.4; padding-bottom: 8px;">
                    新成員報名通知
                  </td>
                </tr>
                <tr>
                  <td style="color: #2d3a40; font-size: 15px; line-height: 1.7; padding-bottom: 28px;">
                    <strong>${customerName}</strong> 已報名 <strong>${eventTitle}</strong>。
                  </td>
                </tr>
              </table>

              <!-- Info card (well container) -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <!-- Amount -->
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">
                          應繳金額
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 24px; font-weight: 700; line-height: 1.3; padding-bottom: 20px;">
                          NT$ ${formattedAmount}
                        </td>
                      </tr>
                      <!-- Deadline -->
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">
                          繳費期限
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 16px; font-weight: 600; line-height: 1.5; padding-bottom: 20px;">
                          ${formattedExpiry}
                        </td>
                      </tr>
                      <!-- Status -->
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">
                          繳費狀態
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #d4a373; font-size: 16px; font-weight: 700; line-height: 1.5;">
                          待繳費
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Spacer -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="padding-top: 28px;"></td></tr>
              </table>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; line-height: 1.7; text-align: center; padding-bottom: 16px;">
                          請點選下方按鈕前往後台查看這筆報名紀錄，以便我們團隊作業。
                        </td>
                      </tr>
                    </table>
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${adminUrl}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="17%" stroke="f" fillcolor="#d4a373">
                      <w:anchorlock/>
                      <center style="color:#2d3a40;font-family:sans-serif;font-size:15px;font-weight:bold;">前往後台查看</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${adminUrl}" target="_blank" style="display: inline-block; background-color: #d4a373; color: #2d3a40; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 40px; border-radius: 8px; line-height: 1.2;">
                      前往後台查看
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
    to: adminEmail,
    subject: `新報名 — ${customerName}｜${eventTitle}`,
    html,
  });
}
