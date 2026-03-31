import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, isValidLocale } from "@/lib/i18n";

function getLocaleFromHeaders(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language") || "";
  if (/zh/i.test(acceptLanguage)) return "zh-TW";
  if (/en/i.test(acceptLanguage)) return "en";
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathnameSegments = pathname.split("/");
  const firstSegment = pathnameSegments[1];

  if (isValidLocale(firstSegment)) {
    if (firstSegment === defaultLocale) {
      const newPath = pathname.replace(`/${defaultLocale}`, "") || "/";
      return NextResponse.redirect(new URL(newPath, request.url));
    }
    return NextResponse.next();
  }

  const detectedLocale = getLocaleFromHeaders(request);

  if (detectedLocale === defaultLocale) {
    const newUrl = new URL(`/${defaultLocale}${pathname}`, request.url);
    return NextResponse.rewrite(newUrl);
  }

  const newUrl = new URL(`/${detectedLocale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ["/((?!_next|api|images|icons|.*\\..*).*)"],
};
