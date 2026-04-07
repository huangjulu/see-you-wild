import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Noto_Serif_TC,
  Noto_Sans_TC,
  Playfair_Display,
} from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getTranslations } from "@/lib/i18n/server";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import GsapProvider from "@/components/providers/GsapProvider";
import { isValidLocale } from "@/lib/i18n";
import type { PageProps } from "@/lib/i18n";
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

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair-display",
  display: "swap",
});

export async function generateStaticParams() {
  return [{ locale: "zh-TW" }, { locale: "en" }];
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const locale = (await props.params).locale;
  if (!isValidLocale(locale)) return {};

  const t = await getTranslations("common");

  const title =
    locale === "zh-TW"
      ? `${t("siteName")} — 山海之間・野放靈魂`
      : `${t("siteName")} — Between Mountains & Sea`;

  const description =
    locale === "zh-TW"
      ? "See You Wild 西揪團 — 台灣戶外探險品牌，提供野營私廚、野溪溫泉、SUP 立槳、攀樹體驗等活動。山海之間・野放靈魂。"
      : "See You Wild — Taiwan outdoor adventure brand offering wild camping chef, hot springs, SUP paddleboarding, and tree climbing experiences.";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${t("siteName")}`,
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
      siteName: t("siteName"),
      title,
      description,
      images: [
        {
          url: "/images/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${t("siteName")}`,
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

type LocaleLayoutProps = PageProps & {
  children: React.ReactNode;
};

const LocaleLayout: React.FC<LocaleLayoutProps> = async (props) => {
  const locale = (await props.params).locale;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${notoSerifTC.variable} ${notoSansTC.variable} ${playfairDisplay.variable}`}
    >
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
