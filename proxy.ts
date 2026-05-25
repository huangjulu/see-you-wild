import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import createNextIntlMiddleware from "next-intl/middleware";

import routing from "@/i18n/routing";

const intlMiddleware = createNextIntlMiddleware(routing);

const LOGIN_SUFFIX = "/admin/login";

function extractLocale(pathname: string): string {
  const match = pathname.match(/^\/(zh-TW|en)\//);
  return match ? match[1] : "zh-TW";
}

async function handleAdminGuard(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return intlMiddleware(request);
  }

  const locale = extractLocale(request.nextUrl.pathname);
  const loginUrl = new URL(`/${locale}/admin/login`, request.url);
  return NextResponse.redirect(loginUrl);
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute =
    pathname.includes("/admin") && !pathname.endsWith(LOGIN_SUFFIX);

  if (isAdminRoute) {
    return handleAdminGuard(request);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|images|icons|.*\\..*).*)"],
};
