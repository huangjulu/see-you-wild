import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import * as fonts from "@/lib/font.config";
import { getTranslations } from "@/lib/i18n/server";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import GsapProvider from "@/components/providers/GsapProvider";
import { isValidLocale } from "@/lib/i18n";
import type { PageProps } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";

/* ─── Layout ─── */

type LocaleLayoutProps = PageProps & {
  children: React.ReactNode;
};

const LocaleLayout: React.FC<LocaleLayoutProps> = async (props) => {
  const locale = (await props.params).locale;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const fontVariable = Object.values(fonts).map((f) => f.variable);

  return (
    <html lang={locale} className={cn(fontVariable)}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <GsapProvider>
            <Header />
            {props.children}
            <Footer />
          </GsapProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

LocaleLayout.displayName = "LocaleLayout";
export default LocaleLayout;

/* ─── Locale-specific Metadata ─── */

const LOCALE_META = {
  "zh-TW": {
    title: (siteName: string) => `${siteName} — 山海之間・野放靈魂`,
    description:
      "See You Wild 西揪團 — 台灣戶外探險品牌，提供野營私廚、野溪溫泉、SUP 立槳、攀樹體驗等活動。山海之間・野放靈魂。",
    keywords: [
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
    ],
    ogLocale: "zh_TW",
  },
  en: {
    title: (siteName: string) => `${siteName} — Between Mountains & Sea`,
    description:
      "See You Wild — Taiwan outdoor adventure brand offering wild camping chef, hot springs, SUP paddleboarding, and tree climbing experiences.",
    keywords: [
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
    ogLocale: "en_US",
  },
};

/* ─── Static Params ─── */

export async function generateStaticParams() {
  return [{ locale: "zh-TW" }, { locale: "en" }];
}

/* ─── Metadata ─── */

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const locale = (await props.params).locale;
  if (!isValidLocale(locale)) return {};

  const t = await getTranslations("common");
  const siteName = t("siteName");
  const meta = LOCALE_META[locale];
  const title = meta.title(siteName);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      type: "website",
      locale: meta.ogLocale,
      url: SITE_URL,
      siteName,
      title,
      description: meta.description,
      images: [
        {
          url: "/images/og-image.jpg",
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: meta.description,
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
      icon: "/icons/icon-192.png",
    },
  };
}
