import { getResend } from "./client";
import { getEnv } from "@/lib/env";
import { generateToken } from "@/lib/token";

interface SendRegistrationEmailParams {
  registrationId: string;
  to: string;
  customerName: string;
  eventTitle: string;
  amountDue: number;
  expiresAt: string;
  baseUrl: string;
}

export async function sendRegistrationEmail(
  params: SendRegistrationEmailParams
) {
  const {
    registrationId,
    to,
    customerName,
    eventTitle,
    amountDue,
    expiresAt,
    baseUrl,
  } = params;

  const token = generateToken(registrationId);
  const paymentRefUrl = `${baseUrl}/payment-ref?id=${registrationId}&token=${token}`;
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
  <title>你的報名已收到！— ${eventTitle}</title>
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
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    /* Dark mode overrides */
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #1a1a1a !important; }
      .card-bg { background-color: #2a2a2a !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans TC', sans-serif;">

  <!-- Preheader (hidden preview text) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${customerName}，你的 ${eventTitle} 報名已收到，請於 ${formattedExpiry} 前完成繳費以確認名額。
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
                    Hi ${customerName}
                  </td>
                </tr>
                <tr>
                  <td style="color: #2d3a40; font-size: 15px; line-height: 1.7; padding-bottom: 28px;">
                    你的報名已收到！請在期限內完成繳費，即可確認名額。
                  </td>
                </tr>
              </table>

              <!-- Info card (well container) -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <!-- Event title -->
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">
                          活動
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 16px; font-weight: 600; line-height: 1.5; padding-bottom: 20px;">
                          ${eventTitle}
                        </td>
                      </tr>
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
                        <td style="color: #d4a373; font-size: 16px; font-weight: 700; line-height: 1.5;">
                          ${formattedExpiry}
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

              <!-- Bank info section -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #2d3a40; font-size: 15px; font-weight: 700; line-height: 1.5; padding-bottom: 12px;">
                    匯款資訊
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-left: 3px solid #d4a373; margin-bottom: 0;">
                <tr>
                  <td style="padding: 12px 0 12px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="color: #9eb3c2; font-size: 13px; line-height: 1.6; padding-bottom: 2px;">銀行</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; font-weight: 600; line-height: 1.5; padding-bottom: 12px;">{{bankName}}</td>
                      </tr>
                      <tr>
                        <td style="color: #9eb3c2; font-size: 13px; line-height: 1.6; padding-bottom: 2px;">帳號</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 17px; font-weight: 600; line-height: 1.5; letter-spacing: 1px; padding-bottom: 12px; font-family: 'Courier New', Courier, monospace;">{{bankAccount}}</td>
                      </tr>
                      <tr>
                        <td style="color: #9eb3c2; font-size: 13px; line-height: 1.6; padding-bottom: 2px;">戶名</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; font-weight: 600; line-height: 1.5;">{{accountHolder}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Spacer -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="padding-top: 28px;"></td></tr>
              </table>

              <!-- CTA: Payment confirmation -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${paymentRefUrl}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="17%" stroke="f" fillcolor="#d4a373">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">匯款完成，回報繳費</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${paymentRefUrl}" target="_blank" style="display: inline-block; background-color: #d4a373; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 40px; border-radius: 8px; line-height: 1.2; mso-hide: all;">
                      匯款完成，回報繳費
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Helper text -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #9eb3c2; font-size: 13px; line-height: 1.6; text-align: center; padding-top: 16px;">
                    匯款後點擊上方按鈕回報，我們確認後會再通知你。
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
    to,
    subject: `你的報名已收到！— ${eventTitle}`,
    html,
  });
}
