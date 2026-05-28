"use client";

import Button from "@/components/ui/atoms/Button";
import Selector from "@/components/ui/molecules/Selector";
import { cn } from "@/lib/utils";

interface EventFilterBarProps {
  statusFilter: "all" | "open" | "closed";
  typeFilter: string | null;
  typeOptions: Array<{ value: string; label: string }>;
  onStatusChange: (status: "all" | "open" | "closed") => void;
  onTypeChange: (typeSlug: string | null) => void;
  onCreateEvent: () => void;
}

const STATUS_OPTIONS: Array<{
  value: "all" | "open" | "closed";
  label: string;
}> = [
  { value: "all", label: "全部" },
  { value: "open", label: "開放中" },
  { value: "closed", label: "已結束" },
];

const EventFilterBar: React.FC<EventFilterBarProps> = (props) => {
  const typeOptions = [{ value: "", label: "全部類型" }, ...props.typeOptions];

  function onStatusSelectorChange(value: string) {
    props.onStatusChange(value as "all" | "open" | "closed");
  }

  function onTypeSelectorChange(value: string) {
    props.onTypeChange(value === "" ? null : value);
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between border-b border-stroke-default bg-white px-6 py-3"
      )}
    >
      <div className="flex items-center gap-3">
        <Selector
          options={STATUS_OPTIONS}
          value={props.statusFilter}
          onChange={onStatusSelectorChange}
          placeholder="狀態"
        />
        <Selector
          options={typeOptions}
          value={props.typeFilter ?? ""}
          onChange={onTypeSelectorChange}
          placeholder="全部類型"
        />
      </div>
      <Button theme="solid" onClick={props.onCreateEvent}>
        + 新增活動
      </Button>
    </div>
  );
};

EventFilterBar.displayName = "EventFilterBar";
export default EventFilterBar;
