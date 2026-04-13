import EventCard from "@/components/molecules/EventCard";
import Divider from "@/components/atoms/Divider";
import { EVENTS_CONFIG } from "@/lib/constants";
import { getTranslations } from "@/lib/i18n/server";

const EventsSection: React.FC = async () => {
  const t = await getTranslations("home.events");

  return (
    <section
      id="events"
      className="py-20 md:py-28 px-6 md:px-12 bg-surface-brand"
      style={
        {
          "--color-foreground": "var(--color-surface-brand-fg)",
          "--color-muted": "var(--color-surface-deep-fg)",
        } as React.CSSProperties
      }
      aria-labelledby="events-heading"
    >
      <h2 id="events-heading" className="sr-only">
        {t("sectionLabel")}
      </h2>
      <div className="max-w-5xl mx-auto space-y-0">
        {EVENTS_CONFIG.map((config, i) => (
          <div key={config.id}>
            {i > 0 && <Divider />}
            <EventCard
              tag={t(`items.${config.id}.tag`)}
              title={t(`items.${config.id}.title`)}
              subtitle={t(`items.${config.id}.subtitle`)}
              date={t(`items.${config.id}.date`)}
              description={t(`items.${config.id}.description`)}
              cta={t(`items.${config.id}.cta`)}
              ctaUrl={config.ctaUrl}
              image={config.image}
              imageAlt={t(`items.${config.id}.imageAlt`)}
              theme={config.theme}
              reverse={i % 2 !== 0}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

EventsSection.displayName = "EventsSection";
export default EventsSection;
