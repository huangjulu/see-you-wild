import { LINE_OA_URL, SITE_URL } from "@/lib/constants";
import { getEnv } from "@/lib/env";
import { paymentAccount } from "@/lib/payment";

import { getResend } from "./client";
import { escapeHtml } from "./escape";
import { renderEmailLayout } from "./layout";

interface SendRegistrationFailedEmailParams {
  to: string;
  customerName: string;
  eventTitle: string;
  paymentRefUrl: string;
}

export async function sendRegistrationFailedEmail(
  params: SendRegistrationFailedEmailParams
) {
  const safeName = escapeHtml(params.customerName);
  const safeTitle = escapeHtml(params.eventTitle);

  const html = renderEmailLayout({
    title: `付款待確認 — ${safeTitle}`,
    preheaderHtml: `${safeName}，你的付款資訊需要重新確認，請重新填寫末五碼。`,
    headerBg: "#d4a373",
    headerTextColor: "#ffffff",
    footerBg: "#f4f6f5",
    footerHtml: `有任何問題請透過 <a href="${LINE_OA_URL}" target="_blank" style="color: #9eb3c2;">LINE OA</a> 聯繫我們。<br>
                    &copy; See You Wild`,
    containerWidth: 560,
    bodyHtml: `<!-- Greeting -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #2d3a40; font-size: 22px; font-weight: 700; line-height: 1.4; padding-bottom: 8px;">
                    Hi ${safeName}
                  </td>
                </tr>
                <tr>
                  <td style="color: #2d3a40; font-size: 15px; line-height: 1.7; padding-bottom: 28px;">
                    我們核對了你填寫的匯款末五碼，但未能比對到對應的款項。請確認匯款是否完成，並重新填寫正確的末五碼。
                  </td>
                </tr>
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
                        <td style="color: #2d3a40; font-size: 15px; font-weight: 600; line-height: 1.5; padding-bottom: 12px;">${paymentAccount.bankName}</td>
                      </tr>
                      <tr>
                        <td style="color: #9eb3c2; font-size: 13px; line-height: 1.6; padding-bottom: 2px;">帳號</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 17px; font-weight: 600; line-height: 1.5; letter-spacing: 1px; padding-bottom: 12px; font-family: 'Courier New', Courier, monospace;">${paymentAccount.bankAccount}</td>
                      </tr>
                      <tr>
                        <td style="color: #9eb3c2; font-size: 13px; line-height: 1.6; padding-bottom: 2px;">戶名</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; font-weight: 600; line-height: 1.5;">${paymentAccount.accountHolder}</td>
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
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${params.paymentRefUrl}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="17%" stroke="f" fillcolor="#d4a373">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">重新填寫末五碼</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${params.paymentRefUrl}" target="_blank" style="display: inline-block; background-color: #d4a373; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 40px; border-radius: 8px; line-height: 1.2; mso-hide: all;">
                      重新填寫末五碼
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Helper text -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #9eb3c2; font-size: 13px; line-height: 1.6; text-align: center; padding-top: 16px;">
                    如有疑問，請透過 <a href="${LINE_OA_URL}" target="_blank" style="color: #9eb3c2;">LINE OA</a> 聯繫我們。<br>
                    更多活動資訊請至 <a href="${SITE_URL}" target="_blank" style="color: #9eb3c2;">${SITE_URL}</a>
                  </td>
                </tr>
              </table>`,
  });

  await getResend().emails.send({
    from: getEnv().RESEND_FROM,
    to: params.to,
    subject: `付款待確認 — ${safeTitle}`,
    html,
  });
}
