import { notFound } from "next/navigation";
import HomeTemplate from "@/components/templates/HomeTemplate";
import { getDictionary, isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getLocalBusinessSchema, getEventSchemas } from "@/lib/seo/schemas";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <>
      <SEOStrategy locale={locale} />
      <HomeTemplate common={dict.common} home={dict.home} />
    </>
  );
}

async function SEOStrategy({ locale }: { locale: Locale }) {
  const localBusinessSchema = await getLocalBusinessSchema(locale);
  const eventSchemas = await getEventSchemas(locale);

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
}
