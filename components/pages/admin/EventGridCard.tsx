import type { EventListDto } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface EventGridCardProps {
  event: EventListDto;
  isSelected: boolean;
  onClick: () => void;
}

const EventGridCard: React.FC<EventGridCardProps> = (props) => {
  const firstImage = props.event.images[0];
  const registrationCount = props.event.registrations.length;

  return (
    <div
      className={cn(
        "flex cursor-pointer gap-3 rounded-xl border p-3 transition-all",
        props.isSelected
          ? "border-2 border-brand-400 bg-surface-warm"
          : "border-stroke-default bg-white shadow-2xs hover:shadow-md"
      )}
      onClick={props.onClick}
    >
      <div className="size-14 shrink-0 overflow-hidden rounded-lg">
        {firstImage ? (
          <img
            src={firstImage.src}
            alt={firstImage.alt}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-surface">
            <span className="typo-body text-xs text-secondary">IMG</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="typo-ui truncate text-sm text-primary">
          {props.event.title}
        </p>
        <p className="typo-body truncate text-xs text-secondary">
          {props.event.location} · {props.event.start_date}
        </p>
        <p className="typo-body text-xs text-secondary">
          {registrationCount} 人報名
        </p>
      </div>
    </div>
  );
};

EventGridCard.displayName = "EventGridCard";
export default EventGridCard;
