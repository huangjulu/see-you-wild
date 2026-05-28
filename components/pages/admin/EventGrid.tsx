import EventGridCard from "@/components/pages/admin/EventGridCard";
import type { EventListDto } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface EventGridProps {
  events: EventListDto[];
  selectedEventId: string | null;
  compressed: boolean;
  onSelectEvent: (eventId: string | null) => void;
}

const EventGrid: React.FC<EventGridProps> = (props) => {
  if (props.events.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-muted">尚無活動</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto p-4 grid gap-3 auto-rows-min content-start",
        props.compressed
          ? "grid-cols-1 xl:grid-cols-2"
          : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      )}
    >
      {props.events.map((event) => (
        <EventGridCard
          key={event.id}
          event={event}
          isSelected={props.selectedEventId === event.id}
          onClick={() =>
            props.onSelectEvent(
              props.selectedEventId === event.id ? null : event.id
            )
          }
        />
      ))}
    </div>
  );
};

EventGrid.displayName = "EventGrid";
export default EventGrid;
