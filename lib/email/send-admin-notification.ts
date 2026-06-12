import { getEnv } from "@/lib/env";

import { getResend } from "./client";
import { escapeHtml } from "./escape";
import { renderEmailLayout } from "./layout";

interface SendAdminNotificationParams {
  customerName: string;
  eventTitle: string;
  amountDue: number;
  expiresAt: string;
  adminUrl: string;
  adminEmail: string;
  paymentRef?: string;
  reviewUrl?: string;
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
    paymentRef,
    reviewUrl,
  } = params;

  const safeName = escapeHtml(customerName);
  const safeTitle = escapeHtml(eventTitle);
  const safeRef = escapeHtml(paymentRef ?? "");

  const formattedAmount = amountDue.toLocaleString("zh-TW");
  const formattedExpiry = new Date(expiresAt).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = renderEmailLayout({
    title: paymentRef
      ? `付款審核 — ${safeName}｜末五碼 ${safeRef}`
      : `新報名 — ${safeName}｜${safeTitle}`,
    preheaderHtml: paymentRef
      ? `${safeTitle} — ${safeName} — 末五碼 ${safeRef}，請前往審核。`
      : `${safeName} 報名了 ${safeTitle}，待繳 NT$ ${formattedAmount}，期限 ${formattedExpiry}。`,
    headerBg: "#2d3a40",
    headerTextColor: "#f4f6f5",
    footerBg: "#2d3a40",
    footerHtml: `此為系統自動通知，無需回覆。<br>
                    &copy; See You Wild`,
    containerWidth: 560,
    bodyHtml: `<!-- Greeting -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #2d3a40; font-size: 22px; font-weight: 700; line-height: 1.4; padding-bottom: 8px;">
                    ${paymentRef ? "付款審核通知" : "新成員報名通知"}
                  </td>
                </tr>
                <tr>
                  <td style="color: #2d3a40; font-size: 15px; line-height: 1.7; padding-bottom: 28px;">
                    ${
                      paymentRef
                        ? `<strong>${safeName}</strong> 已回報 <strong>${safeTitle}</strong> 的匯款末五碼：<strong>${safeRef}</strong>，請前往審核。`
                        : `<strong>${safeName}</strong> 已報名 <strong>${safeTitle}</strong>。`
                    }
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
                          ${
                            reviewUrl
                              ? "請點選下方按鈕前往審核這筆付款。"
                              : "請點選下方按鈕前往後台查看這筆報名紀錄，以便我們團隊作業。"
                          }
                        </td>
                      </tr>
                    </table>
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${reviewUrl ?? adminUrl}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="17%" stroke="f" fillcolor="#d4a373">
                      <w:anchorlock/>
                      <center style="color:#2d3a40;font-family:sans-serif;font-size:15px;font-weight:bold;">${reviewUrl ? "前往審核" : "前往後台查看"}</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${reviewUrl ?? adminUrl}" target="_blank" style="display: inline-block; background-color: #d4a373; color: #2d3a40; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 40px; border-radius: 8px; line-height: 1.2;">
                      ${reviewUrl ? "前往審核" : "前往後台查看"}
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>`,
  });

  await getResend().emails.send({
    from: getEnv().RESEND_FROM,
    to: adminEmail,
    subject: paymentRef
      ? `付款審核 — ${safeTitle}｜${safeName}｜末五碼 ${safeRef}`
      : `新報名 — ${safeName}｜${safeTitle}`,
    html,
  });
}
