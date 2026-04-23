import { notFound } from "next/navigation";
import HomeTemplate from "@/components/pages/home/HomeTemplate";
import { isValidLocale } from "@/lib/i18n";
import type { Locale, PageProps } from "@/lib/i18n";
import { getLocalBusinessSchema, getEventSchemas } from "@/lib/seo/schemas";

const HomePage: React.FC<PageProps> = async (props) => {
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

const SEOStrategy: React.FC<SEOStrategyProps> = async (props) => {
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
