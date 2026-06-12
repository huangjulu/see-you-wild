import { getEnv } from "@/lib/env";

import { getResend } from "./client";
import { escapeHtml } from "./escape";
import { renderEmailLayout } from "./layout";

interface SendStorageAlertEmailParams {
  level: "warning" | "critical";
  filename: string;
  r2Error: string;
  supabaseError?: string;
}

export async function sendStorageAlertEmail(
  params: SendStorageAlertEmailParams
): Promise<void> {
  const { level, filename, r2Error, supabaseError } = params;

  const isWarning = level === "warning";

  const safeFilename = escapeHtml(filename);
  const safeR2Error = escapeHtml(r2Error);
  const safeSupabaseError = supabaseError ? escapeHtml(supabaseError) : null;

  const subject = isWarning
    ? "⚠️ 儲存空間告警 — R2 上傳失敗，已 fallback 至 Supabase"
    : "🚨 儲存空間緊急 — R2 與 Supabase 皆上傳失敗";

  const headerBg = isWarning ? "#d4a373" : "#c0392b";
  const headerTextColor = isWarning ? "#2d3a40" : "#ffffff";

  const actionMessage = isWarning
    ? "R2 上傳失敗，系統已自動 fallback 至 Supabase Storage。請儘快檢查 R2 服務狀態。"
    : "R2 與 Supabase Storage 皆上傳失敗，使用者的圖片可能未能儲存。請立即排查儲存服務狀態。";

  const supabaseErrorRow = safeSupabaseError
    ? `<!-- Supabase error -->
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px; padding-top: 20px;">
                          Supabase 錯誤
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #c0392b; font-size: 14px; font-weight: 400; line-height: 1.6; font-family: 'Courier New', Courier, monospace; word-break: break-all;">
                          ${safeSupabaseError}
                        </td>
                      </tr>`
    : "";

  const html = renderEmailLayout({
    title: subject,
    preheaderHtml: `檔案：${safeFilename} — ${actionMessage}`,
    headerBg,
    headerTextColor,
    footerBg: "#2d3a40",
    footerHtml: `此為系統自動通知，無需回覆。<br>&copy; See You Wild`,
    containerWidth: 560,
    bodyHtml: `<!-- Alert heading -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #2d3a40; font-size: 22px; font-weight: 700; line-height: 1.4; padding-bottom: 8px;">
                    ${isWarning ? "⚠️ 儲存空間告警" : "🚨 儲存空間緊急"}
                  </td>
                </tr>
                <tr>
                  <td style="color: #2d3a40; font-size: 15px; line-height: 1.7; padding-bottom: 28px;">
                    ${actionMessage}
                  </td>
                </tr>
              </table>

              <!-- Error detail card -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <!-- Filename -->
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">
                          檔案名稱
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #2d3a40; font-size: 16px; font-weight: 600; line-height: 1.5; padding-bottom: 20px; word-break: break-all;">
                          ${safeFilename}
                        </td>
                      </tr>
                      <!-- R2 error -->
                      <tr>
                        <td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">
                          R2 錯誤
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #c0392b; font-size: 14px; font-weight: 400; line-height: 1.6; font-family: 'Courier New', Courier, monospace; word-break: break-all;">
                          ${safeR2Error}
                        </td>
                      </tr>
                      ${supabaseErrorRow}
                    </table>
                  </td>
                </tr>
              </table>`,
  });

  await getResend().emails.send({
    from: getEnv().RESEND_FROM,
    to: process.env.ADMIN_EMAIL ?? "admin@seeyouwild.com",
    subject,
    html,
  });
}
