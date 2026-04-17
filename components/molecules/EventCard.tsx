import { cn } from "@/lib/utils";
import Tag from "@/components/atoms/Tag";

interface EventCardProps {
  id: string;
  type: string;
  location: string;
  title: string;
  startDate: string;
  endDate: string;
  basePrice: number;
  status: "open" | "closed";
  image: string;
  imageAlt: string;
}

const EventCard: React.FC<EventCardProps> = (props) => {
  const formattedPrice = props.basePrice.toLocaleString("zh-TW");

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl bg-surface transition-shadow duration-300 hover:shadow-lg"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={props.image}
          alt={props.imageAlt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2 p-4">
        <Tag>{props.type}</Tag>
        <h3 className="typo-heading text-lg">{props.title}</h3>
        <p className="typo-body text-sm text-muted">
          {props.location} · {props.startDate}
        </p>
        <p className="typo-ui text-base font-semibold">NT$ {formattedPrice}</p>
      </div>
    </article>
  );
};

EventCard.displayName = "EventCard";
export default EventCard;
