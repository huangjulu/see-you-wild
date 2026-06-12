interface RenderEmailLayoutParams {
  title: string;
  preheaderHtml: string;
  bodyHtml: string;
  footerHtml: string;
  headerBg: string;
  headerTextColor: string;
  footerBg: string;
  containerWidth: 560 | 600;
  extraStyles?: string;
  outerTableClass?: string;
  mainCardClass?: string;
}

export function renderEmailLayout(params: RenderEmailLayoutParams): string {
  const {
    title,
    preheaderHtml,
    bodyHtml,
    footerHtml,
    headerBg,
    headerTextColor,
    footerBg,
    containerWidth,
    extraStyles,
    outerTableClass,
    mainCardClass,
  } = params;

  const outerTableClassAttr = outerTableClass
    ? ` class="${outerTableClass}"`
    : "";
  const mainCardClassAttr = mainCardClass ? ` class="${mainCardClass}"` : "";

  return `<!DOCTYPE html>
<html lang="zh-Hant" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
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
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }${extraStyles ? `\n    ${extraStyles}` : ""}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans TC', sans-serif;">

  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheaderHtml}
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5;"${outerTableClassAttr}>
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <!-- Email container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${containerWidth}" style="max-width: ${containerWidth}px; width: 100%;">

          <!-- Header: Brand bar -->
          <tr>
            <td style="background-color: ${headerBg}; border-radius: 12px 12px 0 0; padding: 24px 32px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: ${headerTextColor}; font-size: 20px; font-weight: 700; letter-spacing: 1px; text-align: center; line-height: 1.4;">
                    SEE YOU WILD
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 32px 32px;"${mainCardClassAttr}>

              ${bodyHtml}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${footerBg}; border-radius: 0 0 12px 12px; padding: 24px 32px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #9eb3c2; font-size: 12px; line-height: 1.7;">
                    ${footerHtml}
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
}
