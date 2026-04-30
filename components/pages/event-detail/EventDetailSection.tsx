"use client";

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
        <div
          className={cn(
            "typo-body text-sm leading-relaxed text-muted whitespace-pre-line",
            !expanded && "line-clamp-3"
          )}
        >
          {props.content}
        </div>
        <button
          type="button"
          onClick={function toggleExpand() {
            setExpanded((prev) => !prev);
          }}
          className="mt-3 typo-ui text-sm text-info hover:underline"
        >
          {expanded ? props.collapseLabel : props.expandLabel}
        </button>
      </ModalCard.Main>
    </ModalCard>
  );
};

EventDetailSection.displayName = "EventDetailSection";
export default EventDetailSection;
