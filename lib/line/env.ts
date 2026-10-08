// 不走 lib/env.ts 的 getEnv()：那邊把 Supabase / Resend 設為必填，
// LINE 模組共用會讓「缺 LINE secret」變成 500 而不是 403，單元測試也得 stub 一整組無關變數。
export interface LineEnv {
  channelSecret: string | undefined;
  channelAccessToken: string | undefined;
  audience: string | undefined;
  adminUserIds: string | undefined;
}

export function readLineEnv(
  environment: Readonly<Record<string, string | undefined>> = process.env
): LineEnv {
  return {
    channelSecret: environment.LINE_CHANNEL_SECRET,
    channelAccessToken: environment.LINE_CHANNEL_ACCESS_TOKEN,
    audience: environment.LINE_AUDIENCE,
    adminUserIds: environment.LINE_ADMIN_USER_IDS,
  };
}
