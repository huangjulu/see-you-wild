"use client";

import React, { useMemo, useState } from "react";

import EventCard from "@/components/ui/molecules/EventCard";
import EventSearchBar from "@/components/ui/molecules/EventSearchBar";
import { cn } from "@/lib/utils";
import type { MockEvent } from "@/server/mockdata/mock-events";

interface EventsGridProps {
  events: MockEvent[];
  initialType?: string;
  initialLocation?: string;
  className?: string;
}

const EventsGrid: React.FC<EventsGridProps> = (props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(props.initialType ?? "");
  const [selectedLocation, setSelectedLocation] = useState(
    props.initialLocation ?? ""
  );

  const typeOptions = useMemo(() => {
    const types = new Set(props.events.map((e) => e.type));
    return Array.from(types).sort();
  }, [props.events]);

  const locationOptions = useMemo(() => {
    const locations = new Set(props.events.map((e) => e.location));
    return Array.from(locations).sort();
  }, [props.events]);

  const filteredEvents = useMemo(() => {
    return props.events.filter((event) => {
      const matchesSearch =
        searchQuery === "" ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "" || event.type === selectedType;
      const matchesLocation =
        selectedLocation === "" || event.location === selectedLocation;
      return matchesSearch && matchesType && matchesLocation;
    });
  }, [props.events, searchQuery, selectedType, selectedLocation]);

  return (
    <div className={cn("space-y-8", props.className)}>
      <EventSearchBar
        typeOptions={typeOptions}
        locationOptions={locationOptions}
        selectedType={selectedType}
        selectedLocation={selectedLocation}
        searchQuery={searchQuery}
        onTypeChange={setSelectedType}
        onLocationChange={setSelectedLocation}
        onSearchChange={setSearchQuery}
      />
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              type={event.type}
              location={event.location}
              title={event.title}
              startDate={event.start_date}
              endDate={event.end_date}
              basePrice={event.base_price}
              status={event.status}
              image={event.image}
              imageAlt={event.imageAlt}
            />
          ))}
        </div>
      ) : (
        // TODO(SYW-XXX): unified empty state component
        <p className="typo-body py-12 text-center text-secondary">
          沒有找到符合條件的活動
        </p>
      )}
    </div>
  );
};

EventsGrid.displayName = "EventsGrid";
export default EventsGrid;
