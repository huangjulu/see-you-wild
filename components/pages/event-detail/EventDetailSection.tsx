"use client";

import { Minus as IconMinus, Plus as IconPlus } from "lucide-react";
import React, { useState } from "react";

import ModalCard from "@/components/ui/molecules/ModalCard";
import { cn } from "@/lib/utils";

interface EventDetailSectionProps {
  title: string;
  content: string;
  expandLabel: string;
  collapseLabel: string;
  defaultExpanded?: boolean;
}

const EventDetailSection: React.FC<EventDetailSectionProps> = (props) => {
  const [expanded, setExpanded] = useState(props.defaultExpanded ?? false);

  return (
    <ModalCard>
      <ModalCard.Header title={props.title} />
      <ModalCard.Main>
        <div className="relative">
          <div
            className={cn(
              "typo-body text-sm leading-relaxed text-secondary whitespace-pre-line overflow-hidden",
              !expanded && "max-h-[4.5em]"
            )}
          >
            {props.content}
          </div>
          <button
            type="button"
            onClick={function toggleExpand() {
              setExpanded((prev) => !prev);
            }}
            className="relative z-10 mt-2 typo-ui text-sm hover:underline text-brand-500"
          >
            {expanded ? (
              <>
                <IconMinus className="inline size-3.5" /> {props.collapseLabel}
              </>
            ) : (
              <>
                <IconPlus className="inline size-3.5" /> {props.expandLabel}
              </>
            )}
          </button>
          {!expanded && (
            <div className="pointer-events-none absolute -inset-x-4 -bottom-4 h-20 bg-linear-to-b from-transparent from-10% via-white to-brand-700/10" />
          )}
        </div>
      </ModalCard.Main>
    </ModalCard>
  );
};

EventDetailSection.displayName = "EventDetailSection";
export default EventDetailSection;
