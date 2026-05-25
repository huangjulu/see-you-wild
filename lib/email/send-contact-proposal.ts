import { getEnv } from "@/lib/env";

import { getResend } from "./client";
import { escapeHtml } from "./escape";

interface SendContactProposalParams {
  template: string;
  name: string;
  email: string;
  phone: string;
  activityType: string;
  groupSize: string;
  preferredDate: string;
  duration: string;
  message: string;
}

const TEMPLATE_LABELS: Record<string, string> = {
  group4: "四人成行",
  private: "團體包團",
  custom: "自由提案",
};

export async function sendContactProposal(
  params: SendContactProposalParams
): Promise<void> {
  const safeName = escapeHtml(params.name);
  const safeEmail = escapeHtml(params.email);
  const safePhone = escapeHtml(params.phone);
  const safeActivityType = escapeHtml(params.activityType);
  const safeGroupSize = escapeHtml(params.groupSize);
  const safePreferredDate = escapeHtml(params.preferredDate);
  const safeDuration = escapeHtml(params.duration);
  const safeMessage = escapeHtml(params.message);
  const templateLabel = escapeHtml(
    TEMPLATE_LABELS[params.template] ?? params.template
  );

  const env = getEnv();
  const toEmail = process.env.ADMIN_EMAIL ?? env.RESEND_FROM;

  const html = `<!DOCTYPE html>
<html lang="zh-Hant" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>新行程提案 — ${safeName} / ${safeActivityType}</title>
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
    ${safeName} 提交了新的行程提案：${safeActivityType}（${templateLabel}）
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
                    新行程提案通知
                  </td>
                </tr>
                <tr>
                  <td style="color: #2d3a40; font-size: 15px; line-height: 1.7; padding-bottom: 28px;">
                    <strong>${safeName}</strong> 透過「${templateLabel}」方案提交了一份行程提案。
                  </td>
                </tr>
              </table>

              <!-- Section: 聯絡資訊 -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5; border-radius: 8px; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 20px 24px 4px;">
                    <p style="margin: 0 0 16px; color: #2d3a40; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">聯絡資訊</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 24px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; padding-bottom: 2px;">姓名</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; font-weight: 600; padding-bottom: 14px;">${safeName}</td>
                      </tr>
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; padding-bottom: 2px;">Email</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; font-weight: 600; padding-bottom: 14px;">${safeEmail}</td>
                      </tr>
                      ${safePhone
                        ? `<tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; padding-bottom: 2px;">電話</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; font-weight: 600;">${safePhone}</td>
                      </tr>`
                        : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Section: 行程資訊 -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5; border-radius: 8px; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 20px 24px 4px;">
                    <p style="margin: 0 0 16px; color: #2d3a40; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">行程資訊</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 24px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; padding-bottom: 2px;">活動類型</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; font-weight: 600; padding-bottom: 14px;">${safeActivityType}</td>
                      </tr>
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; padding-bottom: 2px;">人數</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; font-weight: 600; padding-bottom: 14px;">${safeGroupSize}</td>
                      </tr>
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; padding-bottom: 2px;">行程天數</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; font-weight: 600; padding-bottom: ${safePreferredDate ? "14px" : "0"};">${safeDuration}</td>
                      </tr>
                      ${safePreferredDate
                        ? `<tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; padding-bottom: 2px;">希望日期</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; font-weight: 600;">${safePreferredDate}</td>
                      </tr>`
                        : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Section: 補充說明 -->
              ${safeMessage
                ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px 24px 4px;">
                    <p style="margin: 0 0 16px; color: #2d3a40; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">補充說明</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 24px 20px;">
                    <p style="margin: 0; color: #2d3a40; font-size: 15px; line-height: 1.7;">${safeMessage}</p>
                  </td>
                </tr>
              </table>`
                : ""}

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
    from: env.RESEND_FROM,
    to: toEmail,
    subject: `[See You Wild] 新行程提案 — ${safeName} / ${safeActivityType}`,
    html,
  });
}
