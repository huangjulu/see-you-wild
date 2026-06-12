import { LINE_OA_URL, SITE_URL } from "@/lib/constants";
import { getEnv } from "@/lib/env";
import { paymentAccount } from "@/lib/payment";

import { getResend } from "./client";
import { escapeHtml } from "./escape";
import { renderEmailLayout } from "./layout";

interface SendRegistrationEmailParams {
  to: string;
  customerName: string;
  eventTitle: string;
  amountDue: number;
  expiresAt: string;
  transport?: "self" | "carpool";
}

export async function sendRegistrationEmail(
  params: SendRegistrationEmailParams
) {
  const safeName = escapeHtml(params.customerName);
  const safeTitle = escapeHtml(params.eventTitle);

  const formattedAmount = params.amountDue.toLocaleString("zh-TW");
  const formattedExpiry = new Date(params.expiresAt).toLocaleDateString(
    "zh-TW",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const carpoolNotice =
    params.transport === "carpool"
      ? `<tr><td style="padding: 20px 24px; font-size: 14px; color: #6b7280; line-height: 1.6;">
      你已選擇共乘方案，共乘角色將由主辦方於活動前統一安排，届時會另行通知。
    </td></tr>`
      : "";

  const html = renderEmailLayout({
    title: `你的報名已收到！— ${safeTitle}`,
    preheaderHtml: `${safeName}，你的 ${safeTitle} 報名已收到，請於 ${formattedExpiry} 前完成繳費以確認名額。`,
    headerBg: "#d4a373",
    headerTextColor: "#ffffff",
    footerBg: "#f4f6f5",
    footerHtml: `有任何問題請透過 <a href="${LINE_OA_URL}" target="_blank" style="color: #9eb3c2;">LINE OA</a> 聯繫我們。<br>
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
                          ${safeTitle}
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

              <!-- Carpool notice (conditional) -->
              ${carpoolNotice}

              <!-- CTA: LINE OA payment report -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${LINE_OA_URL}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="17%" stroke="f" fillcolor="#06c755">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">加 LINE OA 回報繳費</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${LINE_OA_URL}" target="_blank" style="display: inline-block; background-color: #06c755; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 40px; border-radius: 8px; line-height: 1.2; mso-hide: all;">
                      加 LINE OA 回報繳費
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Helper text -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #9eb3c2; font-size: 13px; line-height: 1.6; text-align: center; padding-top: 16px;">
                    匯款後請加入 LINE OA 並傳送末五碼，我們確認後會再通知你。<br>
                    更多活動資訊請至 <a href="${SITE_URL}" target="_blank" style="color: #9eb3c2;">${SITE_URL}</a>
                  </td>
                </tr>
              </table>`,
  });

  await getResend().emails.send({
    from: getEnv().RESEND_FROM,
    to: params.to,
    subject: `你的報名已收到！— ${safeTitle}`,
    html,
  });
}
