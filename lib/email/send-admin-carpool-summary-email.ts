import { getEnv } from "@/lib/env";

import { getResend } from "./client";
import { escapeHtml } from "./escape";
import { renderEmailLayout } from "./layout";

interface CarGroupSummary {
  carGroup: number;
  pickupLocation: string;
  driverName: string | null;
  seatCount: number | null;
  passengerCount: number;
  remainingSeats: number | null;
}

interface SendAdminCarpoolSummaryParams {
  to: string;
  eventTitle: string;
  eventDate: string;
  eventUrl: string;
  groups: CarGroupSummary[];
}

function buildGroupRow(group: CarGroupSummary): string {
  const driverCell =
    group.driverName != null
      ? escapeHtml(group.driverName)
      : `<span style="color: #d4a373; font-weight: 700;">待安排</span>`;

  const remainingCell =
    group.remainingSeats != null
      ? group.remainingSeats > 0
        ? `<span style="color: #d4a373; font-weight: 700;">${group.remainingSeats}</span>`
        : `${group.remainingSeats}`
      : "—";

  return `<tr>
                          <td style="padding: 10px 12px; border-bottom: 1px solid #e8edea; color: #2d3a40; font-size: 14px;">第 ${group.carGroup} 車</td>
                          <td style="padding: 10px 12px; border-bottom: 1px solid #e8edea; color: #2d3a40; font-size: 14px;">${driverCell}</td>
                          <td style="padding: 10px 12px; border-bottom: 1px solid #e8edea; color: #2d3a40; font-size: 14px;">${escapeHtml(group.pickupLocation)}</td>
                          <td style="padding: 10px 12px; border-bottom: 1px solid #e8edea; color: #2d3a40; font-size: 14px; text-align: center;">${group.passengerCount} 位</td>
                          <td style="padding: 10px 12px; border-bottom: 1px solid #e8edea; color: #2d3a40; font-size: 14px; text-align: center;">${remainingCell}</td>
                        </tr>`;
}

export async function sendAdminCarpoolSummaryEmail(
  params: SendAdminCarpoolSummaryParams
) {
  const safeTitle = escapeHtml(params.eventTitle);

  const formattedDate = new Date(params.eventDate).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const safeEventUrl = escapeHtml(params.eventUrl);

  const groupRows =
    params.groups.length > 0
      ? params.groups.map(buildGroupRow).join("\n")
      : `<tr>
                          <td colspan="5" style="padding: 20px 12px; color: #9eb3c2; font-size: 14px; text-align: center;">無共乘車組</td>
                        </tr>`;

  const html = renderEmailLayout({
    title: `配車結果摘要 — ${safeTitle}｜${formattedDate}`,
    preheaderHtml: `${safeTitle} 配車結果已產生，共 ${params.groups.length} 個車組，請前往查看詳情。`,
    headerBg: "#2d3a40",
    headerTextColor: "#f4f6f5",
    footerBg: "#2d3a40",
    footerHtml: `此為系統自動通知，無需回覆。<br>
                    &copy; See You Wild`,
    containerWidth: 600,
    bodyHtml: `<!-- Title -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #2d3a40; font-size: 22px; font-weight: 700; line-height: 1.4; padding-bottom: 4px;">
                    配車結果摘要
                  </td>
                </tr>
                <tr>
                  <td style="color: #9eb3c2; font-size: 15px; line-height: 1.6; padding-bottom: 32px;">
                    ${safeTitle} — ${formattedDate}
                  </td>
                </tr>
              </table>

              <!-- Group table -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e8edea; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #f4f6f5; padding: 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <!-- Table header -->
                      <tr>
                        <th style="padding: 10px 12px; text-align: left; color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1px solid #e8edea;">車組</th>
                        <th style="padding: 10px 12px; text-align: left; color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1px solid #e8edea;">車手</th>
                        <th style="padding: 10px 12px; text-align: left; color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1px solid #e8edea;">集合點</th>
                        <th style="padding: 10px 12px; text-align: center; color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1px solid #e8edea;">乘客</th>
                        <th style="padding: 10px 12px; text-align: center; color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1px solid #e8edea;">剩餘</th>
                      </tr>
                      ${groupRows}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Spacer -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="padding-top: 32px;"></td></tr>
              </table>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeEventUrl}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="17%" stroke="f" fillcolor="#d4a373">
                      <w:anchorlock/>
                      <center style="color:#2d3a40;font-family:sans-serif;font-size:15px;font-weight:bold;">查看活動詳情</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${safeEventUrl}" target="_blank" style="display: inline-block; background-color: #d4a373; color: #2d3a40; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 40px; border-radius: 8px; line-height: 1.2;">
                      查看活動詳情
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>`,
  });

  await getResend().emails.send({
    from: getEnv().RESEND_FROM,
    to: params.to,
    subject: `配車摘要 — ${safeTitle}｜${formattedDate}`,
    html,
  });
}
