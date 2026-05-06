import { getEnv } from "@/lib/env";

import { getResend } from "./client";
import { escapeHtml } from "./escape";

interface SendRegistrationSuccessEmailParams {
  to: string;
  customerName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  amountDue: number;
  transport: string;
  dietary: string;
  wantsRental: boolean;
}

const transportLabel: Record<string, string> = {
  self: "自行前往",
  carpool: "共乘",
};

const dietaryLabel: Record<string, string> = {
  meat: "葷食",
  no_beef: "不吃牛",
  vegetarian: "素食",
  vegan: "全素",
};

export async function sendRegistrationSuccessEmail(
  params: SendRegistrationSuccessEmailParams
) {
  const safeName = escapeHtml(params.customerName);
  const safeTitle = escapeHtml(params.eventTitle);
  const safeLocation = escapeHtml(params.eventLocation);
  const formattedDate = new Date(params.eventDate).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const safeDate = escapeHtml(formattedDate);
  const formattedAmount = params.amountDue.toLocaleString("zh-TW");
  const safeTransport = escapeHtml(
    transportLabel[params.transport] ?? params.transport
  );
  const safeDietary = escapeHtml(
    dietaryLabel[params.dietary] ?? params.dietary
  );
  const rentalLabel = params.wantsRental ? "是" : "否";

  const html = `<!DOCTYPE html>
<html lang="zh-Hant" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>報名成功！— ${safeTitle}</title>
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
    ${safeName}，你的 ${safeTitle} 報名已確認成功！
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <!-- Email container -->
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
            <td style="background-color: #ffffff; padding: 40px 32px 32px;">

              <!-- Info card -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

                      <!-- Greeting -->
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; line-height: 1.7; padding-bottom: 20px;">
                          Hi ${safeName}, 你的付款已確認，報名正式完成！我們很期待在活動中見到你。
                        </td>
                      </tr>

                      <!-- Event title -->
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">
                          活動
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 16px; font-weight: 600; line-height: 1.5; padding-bottom: 20px;">
                          ${safeTitle}
                        </td>
                      </tr>

                      <!-- Event date -->
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">
                          活動日期
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; line-height: 1.5; padding-bottom: 20px;">
                          ${safeDate}
                        </td>
                      </tr>

                      <!-- Event location -->
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">
                          活動地點
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; line-height: 1.5; padding-bottom: 20px;">
                          ${safeLocation}
                        </td>
                      </tr>

                      <!-- Customer name -->
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">
                          報名者
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; line-height: 1.5; padding-bottom: 20px;">
                          ${safeName}
                        </td>
                      </tr>

                      <!-- Amount paid -->
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">
                          已付金額
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #4a7c59; font-size: 16px; font-weight: 700; line-height: 1.5; padding-bottom: 20px;">
                          NT$ ${formattedAmount}
                        </td>
                      </tr>

                      <!-- Registration summary -->
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 8px;">
                          報名資料摘要
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 20px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="color: #2d3a40; font-size: 14px; line-height: 1.8;">
                                交通方式：${safeTransport}<br>
                                飲食偏好：${safeDietary}<br>
                                裝備租借：${rentalLabel}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Notice -->
                      <tr>
                        <td style="color: #2d3a40; font-size: 14px; line-height: 1.7; padding-bottom: 24px;">
                          活動詳細集合資訊與行前須知將於活動前另行通知，届時請留意信箱。
                        </td>
                      </tr>

                      <!-- LINE CTA -->
                      <tr>
                        <td align="center">
                          <a href="https://line.me/ti/p/PLACEHOLDER" target="_blank" style="display: inline-block; background-color: #06c755; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px; letter-spacing: 0.5px;">
                            加入 LINE 好友
                          </a>
                        </td>
                      </tr>

                    </table>
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
    subject: `報名成功！— ${safeTitle}`,
    html,
  });
}
