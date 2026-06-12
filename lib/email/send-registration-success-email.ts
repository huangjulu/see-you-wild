import { LINE_OA_URL } from "@/lib/constants";
import { getEnv } from "@/lib/env";

import { getResend } from "./client";
import { escapeHtml } from "./escape";
import { renderEmailLayout } from "./layout";

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

  const html = renderEmailLayout({
    title: `報名成功！— ${safeTitle}`,
    preheaderHtml: `${safeName}，你的 ${safeTitle} 報名已確認成功！`,
    headerBg: "#d4a373",
    headerTextColor: "#ffffff",
    footerBg: "#f4f6f5",
    footerHtml: `有任何問題歡迎直接回覆此信。<br>
                    &copy; See You Wild`,
    containerWidth: 560,
    bodyHtml: `<!-- Info card -->
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
                          <a href="${LINE_OA_URL}" target="_blank" style="display: inline-block; background-color: #06c755; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px; letter-spacing: 0.5px;">
                            加入 LINE 好友
                          </a>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>`,
  });

  await getResend().emails.send({
    from: getEnv().RESEND_FROM,
    to: params.to,
    subject: `報名成功！— ${safeTitle}`,
    html,
  });
}
