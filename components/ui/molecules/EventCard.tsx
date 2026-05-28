"use client";

import Heading from "@/components/ui/atoms/Heading";
import Tag from "@/components/ui/atoms/Tag";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

interface EventCardProps {
  id: string;
  type: string;
  location: string;
  title: string;
  startDate: string;
  endDate: string;
  basePrice: number;
  status: "open" | "closed";
  image: string | null;
  imageAlt: string;
  typeLabel?: string;
}

const EventCard = (props: EventCardProps) => {
  const formattedPrice = props.basePrice.toLocaleString("zh-TW");

  return (
    <Link href={`/events/${props.id}`} className="block">
      <article
        className={cn(
          "group overflow-hidden rounded-2xl bg-white transition-shadow duration-300 hover:shadow-lg border border-neutral-100 shadow-2xs max-h-96 flex flex-col"
        )}
      >
        <div className="relative aspect-4/3 overflow-hidden shrink-0">
          {props.image != null ? (
            <img
              src={props.image}
              alt={props.imageAlt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-neutral-200" />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent to-50% pointer-events-none"
            aria-hidden="true"
          />
          <Tag className="absolute top-3 left-3 z-10 border-white text-white">
            {props.typeLabel ?? props.type}
          </Tag>
        </div>
        <div className="p-4 min-h-0">
          <Heading.H3 className="text-lg truncate">{props.title}</Heading.H3>
          <p className="typo-body text-sm text-secondary truncate">
            {props.location} · {props.startDate}
          </p>
          <p className="typo-ui text-base font-semibold mt-2 text-brand-500">
            NT$ {formattedPrice}
          </p>
        </div>
      </article>
    </Link>
  );
};

EventCard.displayName = "EventCard";
export default EventCard;
