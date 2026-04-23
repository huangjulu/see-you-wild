"use client";

import { Search as IconSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventSearchBarProps {
  typeOptions: string[];
  locationOptions: string[];
  selectedType: string;
  selectedLocation: string;
  searchQuery: string;
  onTypeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

const EventSearchBar: React.FC<EventSearchBarProps> = (props) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <IconSearch
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          placeholder="搜尋活動..."
          value={props.searchQuery}
          onChange={(e) => props.onSearchChange(e.target.value)}
          className={cn(
            "typo-body w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4",
            "placeholder:text-muted focus:border-accent focus:outline-none"
          )}
        />
      </div>
      <div className="flex gap-3">
        <div>
          <label htmlFor="type-filter" className="sr-only">
            活動類型
          </label>
          <select
            id="type-filter"
            aria-label="活動類型"
            value={props.selectedType}
            onChange={(e) => props.onTypeChange(e.target.value)}
            className="typo-body rounded-lg border border-border bg-surface px-3 py-2.5 focus:border-accent focus:outline-none"
          >
            <option value="">所有類型</option>
            {props.typeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="location-filter" className="sr-only">
            地點
          </label>
          <select
            id="location-filter"
            aria-label="地點"
            value={props.selectedLocation}
            onChange={(e) => props.onLocationChange(e.target.value)}
            className="typo-body rounded-lg border border-border bg-surface px-3 py-2.5 focus:border-accent focus:outline-none"
          >
            <option value="">所有地點</option>
            {props.locationOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

EventSearchBar.displayName = "EventSearchBar";
export default EventSearchBar;
