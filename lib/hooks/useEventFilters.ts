"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { MOCK_EVENTS } from "@/server/mockdata/mock-events";

function getUniqueValues<T>(items: T[], selector: (item: T) => string) {
  return Array.from(new Set(items.map(selector))).sort();
}

function useEventFilters() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") ?? "";
  const initialLocation = searchParams.get("location") ?? "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  const typeOptions = useMemo(
    () => getUniqueValues(MOCK_EVENTS, (e) => e.type),
    []
  );

  const locationOptions = useMemo(
    () => getUniqueValues(MOCK_EVENTS, (e) => e.location),
    []
  );

  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter((event) => {
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
  }, [searchQuery, selectedType, selectedLocation]);

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
