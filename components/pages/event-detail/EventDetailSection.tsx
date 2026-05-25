"use client";

import { Minus as IconMinus, Plus as IconPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import ModalCard from "@/components/ui/molecules/ModalCard";
import { cn } from "@/lib/utils";

interface EventDetailSectionProps {
  title: string;
  content: string;
  expandLabel: string;
  collapseLabel: string;
  defaultExpanded?: boolean;
}

const EventDetailSection = (props: EventDetailSectionProps) => {
  const [expanded, setExpanded] = useState(props.defaultExpanded ?? false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsClamp, setNeedsClamp] = useState(true);

  useEffect(function detectContentOverflow() {
    const el = contentRef.current;
    if (el == null) return;
    if (el.scrollHeight <= el.clientHeight) {
      setNeedsClamp(false);
      setExpanded(true);
    }
  }, []);

  return (
    <ModalCard>
      <ModalCard.Header title={props.title} />
      <ModalCard.Main>
        <div className="relative">
          <div
            ref={contentRef}
            className={cn(
              "typo-body text-sm leading-relaxed text-secondary whitespace-pre-line overflow-hidden",
              !expanded && needsClamp && "max-h-[8.125em]"
            )}
          >
            {props.content}
          </div>
          {needsClamp && (
            <>
              <button
                type="button"
                onClick={function toggleExpand() {
                  setExpanded((prev) => !prev);
                }}
                className="relative z-10 mt-2 typo-ui text-sm hover:underline text-brand-500"
              >
                {expanded ? (
                  <>
                    <IconMinus className="inline size-3.5" />{" "}
                    {props.collapseLabel}
                  </>
                ) : (
                  <>
                    <IconPlus className="inline size-3.5" /> {props.expandLabel}
                  </>
                )}
              </button>
              {!expanded && (
                <div className="pointer-events-none absolute -inset-x-5 -bottom-5 h-20 bg-linear-to-b from-transparent from-10% via-white to-brand-700/10" />
              )}
            </>
          )}
        </div>
      </ModalCard.Main>
    </ModalCard>
  );
};

EventDetailSection.displayName = "EventDetailSection";
export default EventDetailSection;
