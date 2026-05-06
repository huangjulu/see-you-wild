"use client";

import { Search as IconSearch } from "lucide-react";
import React from "react";

import Input from "@/components/ui/atoms/Input";
import RadioOption from "@/components/ui/atoms/RadioOption";
import Selector from "@/components/ui/molecules/Selector";
import { useTranslations } from "@/lib/i18n/client";

interface EventSearchBarProps {
  typeOptions: string[];
  locationOptions: { value: string; label: string }[];
  selectedType: string;
  selectedLocation: string;
  searchQuery: string;
  onTypeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

const EventSearchBar: React.FC<EventSearchBarProps> = (props) => {
  const t = useTranslations("events");
  const typeSelectOptions = [
    { value: "", label: t("allTypes") },
    ...props.typeOptions.map((slug) => ({
      value: slug,
      label: t(`type.${slug}`),
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {typeSelectOptions.map((opt) => (
          <RadioOption
            key={`type-${opt.value}`}
            className="rounded-full! px-4! py-3! text-base hover:shadow-sm"
            name="event-type-filter"
            value={opt.value}
            label={opt.label}
            checked={props.selectedType === opt.value}
            onChange={() => props.onTypeChange(opt.value)}
          />
        ))}
      </div>
      <div className="flex gap-3">
        <div className="hidden md:block">
          <Selector
            options={props.locationOptions}
            value={props.selectedLocation}
            onChange={props.onLocationChange}
            placeholder={t("allLocations")}
          />
        </div>
        <div className="flex-1">
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={props.searchQuery}
            onChange={(e) => props.onSearchChange(e.target.value)}
            className="hover:shadow-sm"
            icon={<IconSearch size={18} />}
          />
        </div>
      </div>
    </div>
  );
};

EventSearchBar.displayName = "EventSearchBar";
export default EventSearchBar;
