import HomeTemplate from "@/components/templates/HomeTemplate";
import { getLocalBusinessSchema, getEventSchemas } from "@/lib/schemas";

export default function HomePage() {
  const localBusinessSchema = getLocalBusinessSchema();
  const eventSchemas = getEventSchemas();

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
      <HomeTemplate />
    </>
  );
}
