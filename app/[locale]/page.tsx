import { notFound } from "next/navigation";

import HomeTemplate from "@/components/pages/home/HomeTemplate";
import type { Locale, PageProps } from "@/lib/i18n";
import { isValidLocale } from "@/lib/i18n";
import { getEventSchemas, getLocalBusinessSchema } from "@/lib/seo/schemas";

const HomePage = async (props: PageProps) => {
  const { locale } = await props.params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <>
      <SEOStrategy locale={locale} />
      <HomeTemplate />
    </>
  );
};

HomePage.displayName = "HomePage";
export default HomePage;

interface SEOStrategyProps {
  locale: Locale;
}

const SEOStrategy = async (props: SEOStrategyProps) => {
  const localBusinessSchema = await getLocalBusinessSchema(props.locale);
  const eventSchemas = await getEventSchemas(props.locale);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      {eventSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  );
};
