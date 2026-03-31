import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Noto_Serif_TC, Noto_Sans_TC } from "next/font/google";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import { isValidLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/constants";

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif-tc",
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

export async function generateStaticParams() {
  return [{ locale: "zh-TW" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const { common } = await getDictionary(locale);

  const title =
    locale === "zh-TW"
      ? `${common.siteName} — 山海之間・野放靈魂`
      : `${common.siteName} — Between Mountains & Sea`;

  const description =
    locale === "zh-TW"
      ? "See You Wild 西揪團 — 台灣戶外探險品牌，提供野營私廚、野溪溫泉、SUP 立槳、攀樹體驗等活動。山海之間・野放靈魂。"
      : "See You Wild — Taiwan outdoor adventure brand offering wild camping chef, hot springs, SUP paddleboarding, and tree climbing experiences.";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${common.siteName}`,
    },
    description,
    keywords:
      locale === "zh-TW"
        ? [
            "See You Wild",
            "西揪團",
            "台灣戶外活動",
            "野營私廚",
            "野溪溫泉",
            "SUP 立槳",
            "攀樹體驗",
            "戶外探險",
            "露營",
            "包團旅遊",
          ]
        : [
            "See You Wild",
            "Taiwan outdoor",
            "camping chef",
            "hot springs",
            "SUP paddleboarding",
            "tree climbing",
            "outdoor adventure",
            "glamping",
            "group travel",
          ],
    openGraph: {
      type: "website",
      locale: locale === "zh-TW" ? "zh_TW" : "en_US",
      url: SITE_URL,
      siteName: common.siteName,
      title,
      description,
      images: [
        {
          url: "/images/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${common.siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-image.jpg"],
    },
    alternates: {
      canonical: SITE_URL,
      languages: {
        "zh-TW": SITE_URL,
        en: `${SITE_URL}/en`,
      },
    },
    icons: {
      icon: "/icons/favicon.ico",
      apple: "/icons/apple-touch-icon.png",
    },
  };
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const { common } = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${notoSerifTC.variable} ${notoSansTC.variable}`}
    >
      <body className="antialiased">
        <Header dict={common} locale={locale} />
        {children}
        <Footer dict={common} />
      </body>
    </html>
  );
}
