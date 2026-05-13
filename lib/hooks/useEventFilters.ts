"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import type { EventListingItem } from "@/lib/types/database";

function getUniqueValues<T>(items: T[], selector: (item: T) => string) {
  return Array.from(new Set(items.map(selector))).sort();
}

function useEventFilters(events: EventListingItem[]) {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") ?? "";
  const initialLocation = searchParams.get("location") ?? "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  const typeOptions = useMemo(
    () => getUniqueValues(events, (e) => e.type),
    [events]
  );

  const locationOptions = useMemo(
    () => getUniqueValues(events, (e) => e.location),
    [events]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);
      const matchesType = selectedType === "" || event.type === selectedType;
      const matchesLocation =
        selectedLocation === "" || event.location === selectedLocation;
      return matchesSearch && matchesType && matchesLocation;
    });
  }, [events, searchQuery, selectedType, selectedLocation]);

  return {
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedLocation,
    setSelectedLocation,
    typeOptions,
    locationOptions,
    filteredEvents,
  };
}

export default useEventFilters;
