import EventCard from "@/components/molecules/EventCard";
import Divider from "@/components/atoms/Divider";
import { EVENTS_CONFIG } from "@/lib/constants";
import type { HomeDictionary } from "@/lib/i18n";

interface EventsSectionProps {
  dict: HomeDictionary["events"];
}

export default function EventsSection({ dict }: EventsSectionProps) {
  return (
    <section
      id="events"
      className="py-20 md:py-28 px-4"
      aria-labelledby="events-heading"
    >
      <h2 id="events-heading" className="sr-only">
        {dict.sectionLabel}
      </h2>
      <div className="max-w-5xl mx-auto space-y-0">
        {EVENTS_CONFIG.map((config, i) => {
          const text = dict.items[config.id as keyof typeof dict.items];
          return (
            <div key={config.id}>
              {i > 0 && <Divider />}
              <EventCard
                tag={text.tag}
                title={text.title}
                subtitle={text.subtitle}
                date={text.date}
                description={text.description}
                cta={text.cta}
                ctaUrl={config.ctaUrl}
                image={config.image}
                imageAlt={text.imageAlt}
                variant={config.variant}
                reverse={i % 2 !== 0}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
