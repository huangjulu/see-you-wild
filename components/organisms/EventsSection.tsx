import EventCard from "@/components/molecules/EventCard";
import Divider from "@/components/atoms/Divider";
import { EVENTS } from "@/lib/constants";

export default function EventsSection() {
  return (
    <section id="events" className="py-20 md:py-28 px-4" aria-labelledby="events-heading">
      <h2 id="events-heading" className="sr-only">
        活動行程
      </h2>
      <div className="max-w-5xl mx-auto space-y-0">
        {EVENTS.map((event, i) => (
          <div key={event.id}>
            {i > 0 && <Divider />}
            <EventCard {...event} reverse={i % 2 !== 0} />
          </div>
        ))}
      </div>
    </section>
  );
}
