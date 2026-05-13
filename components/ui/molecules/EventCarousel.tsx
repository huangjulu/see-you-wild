"use client";

import {
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
} from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/atoms/Button";
import type { EventListDto } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface EventCarouselProps {
  events: EventListDto[];
  selectedEventId: string | null;
  onSelectEvent: (eventId: string | null) => void;
  onCreateEvent: () => void;
  onEditEvent: (event: EventListDto) => void;
  onDeleteEvent: (event: EventListDto) => void;
}

const CARDS_PER_PAGE = 3;

const EventCarousel: React.FC<EventCarouselProps> = (props) => {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(
    1,
    Math.ceil(props.events.length / CARDS_PER_PAGE)
  );
  const isFirstPage = page === 0;
  const isLastPage = page >= totalPages - 1;

  const startIndex = page * CARDS_PER_PAGE;
  const visibleEvents = props.events.slice(
    startIndex,
    startIndex + CARDS_PER_PAGE
  );
  const peekEvent = props.events[startIndex + CARDS_PER_PAGE];

  function onCardClick(eventId: string) {
    props.onSelectEvent(props.selectedEventId === eventId ? null : eventId);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden border-b border-stroke-default">
      <div className="flex shrink-0 items-center justify-between border-b border-stroke-default bg-white px-6 py-3.5">
        <h2 className="typo-heading text-xl text-primary">活動管理</h2>
        <Button theme="solid" onClick={props.onCreateEvent}>
          + 新增活動
        </Button>
      </div>

      <div className="flex flex-1 items-center gap-2.5 overflow-hidden px-4">
        <button
          type="button"
          onClick={() => setPage((p) => p - 1)}
          disabled={isFirstPage}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full border border-stroke-default bg-white shadow-sm transition-colors",
            isFirstPage
              ? "invisible"
              : "text-secondary hover:border-stroke-strong"
          )}
        >
          <IconChevronLeft className="size-4" />
        </button>

        <div className="flex flex-1 gap-3.5 overflow-hidden">
          {visibleEvents.map((event) => {
            const isActive = props.selectedEventId === event.id;
            return (
              <div
                key={event.id}
                onClick={() => onCardClick(event.id)}
                className={cn(
                  "relative flex min-w-0 basis-[calc((100%-42px)/3.5)] shrink-0 cursor-pointer gap-3 rounded-xl border p-3 transition-all",
                  isActive
                    ? "border-2 border-brand-400 bg-surface-warm"
                    : "border-stroke-default bg-white shadow-2xs hover:shadow-md"
                )}
              >
                <div
                  className={cn(
                    "size-14 shrink-0 overflow-hidden rounded-lg",
                    !event.images[0] &&
                      (isActive
                        ? "flex items-center justify-center bg-brand-200 text-[10px] text-brand-600"
                        : "flex items-center justify-center bg-neutral-200 text-[10px] text-secondary")
                  )}
                >
                  {event.images[0] ? (
                    <img
                      src={event.images[0].src}
                      alt={event.images[0].alt}
                      className="size-full object-cover"
                    />
                  ) : (
                    "IMG"
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p className="typo-ui truncate text-sm text-primary">
                    {event.title}
                  </p>
                  <p className="typo-body truncate text-xs text-secondary">
                    {event.location} · {event.start_date}
                  </p>
                  <p
                    className={cn(
                      "typo-body text-xs",
                      isActive ? "typo-ui text-brand-500" : "text-secondary"
                    )}
                  >
                    {event.registrations.length} 人報名
                  </p>
                </div>
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button
                    theme="outline"
                    className="px-1.5 py-0.5 text-[11px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      props.onEditEvent(event);
                    }}
                  >
                    編輯
                  </Button>
                  <Button
                    theme="danger"
                    className="px-1.5 py-0.5 text-[11px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      props.onDeleteEvent(event);
                    }}
                  >
                    刪除
                  </Button>
                </div>
              </div>
            );
          })}

          {peekEvent && (
            <div className="pointer-events-none min-w-0 basis-[calc((100%-42px)/3.5)] shrink-0 flex-col rounded-xl border border-stroke-default bg-white p-3 opacity-55 [mask-image:linear-gradient(to_right,black_30%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_30%,transparent_100%)]">
              <div className="flex flex-1 items-center gap-3">
                <div className="size-14 shrink-0 overflow-hidden rounded-lg">
                  {peekEvent.images[0] ? (
                    <img
                      src={peekEvent.images[0].src}
                      alt={peekEvent.images[0].alt}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-neutral-200 text-[10px] text-secondary">
                      IMG
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p className="typo-ui truncate text-sm text-primary">
                    {peekEvent.title}
                  </p>
                  <p className="typo-body truncate text-xs text-secondary">
                    {peekEvent.location} · {peekEvent.start_date}
                  </p>
                  <p className="typo-body text-xs text-secondary">
                    {peekEvent.registrations.length} 人報名
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={isLastPage}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full border border-stroke-default bg-white shadow-sm transition-colors",
            isLastPage
              ? "invisible"
              : "text-secondary hover:border-stroke-strong"
          )}
        >
          <IconChevronRight className="size-4" />
        </button>
      </div>

      <div className="flex shrink-0 justify-center gap-1.5 py-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <div
            key={i}
            className={cn(
              "size-[7px] rounded-full",
              i === page ? "bg-brand-400" : "bg-neutral-200"
            )}
          />
        ))}
      </div>
    </div>
  );
};

EventCarousel.displayName = "EventCarousel";
export default EventCarousel;
