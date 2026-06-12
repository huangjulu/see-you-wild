import { getEnv } from "@/lib/env";

import { getResend } from "./client";
import { escapeHtml } from "./escape";
import { renderEmailLayout } from "./layout";

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

  const html = renderEmailLayout({
    title: `新行程提案 — ${safeName} / ${safeActivityType}`,
    preheaderHtml: `${safeName} 提交了新的行程提案：${safeActivityType}（${templateLabel}）`,
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
                      ${
                        safePhone
                          ? `<tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; padding-bottom: 2px;">電話</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; font-weight: 600;">${safePhone}</td>
                      </tr>`
                          : ""
                      }
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
                      ${
                        safePreferredDate
                          ? `<tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; padding-bottom: 2px;">希望日期</td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 15px; font-weight: 600;">${safePreferredDate}</td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Section: 補充說明 -->
              ${
                safeMessage
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
                  : ""
              }`,
  });

  await getResend().emails.send({
    from: env.RESEND_FROM,
    to: toEmail,
    subject: `[See You Wild] 新行程提案 — ${safeName} / ${safeActivityType}`,
    html,
  });
}
