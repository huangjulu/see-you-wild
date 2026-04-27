"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTranslations } from "@/lib/i18n/client";
import ModalCard from "@/components/ui/molecules/ModalCard";
import EventCalendar from "@/components/ui/molecules/EventCalendar";
import RadioOption from "@/components/ui/atoms/RadioOption";
import type { PackageSelection } from "./packageOptions.types";

interface PackageOptionsProps {
  availableDates: string[];
  pickupLocations: string[];
  carpoolSurcharge: number;
  onSelectionChange: (selection: PackageSelection) => void;
}

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const PackageOptions: React.FC<PackageOptionsProps> = (props) => {
  const t = useTranslations("eventDetail");
  const availableDateObjects = useMemo(
    () => props.availableDates.map((d) => new Date(d + "T00:00:00")),
    [props.availableDates]
  );

  const nearestDate = useMemo(() => {
    const today = new Date();
    const nearest = availableDateObjects
      .filter((d) => d >= today)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    return nearest ?? null;
  }, [availableDateObjects]);

  const defaultMonth = nearestDate ?? new Date();
  const defaultDateStr = nearestDate != null ? toDateStr(nearestDate) : null;

  const [selectedDate, setSelectedDate] = useState<string | null>(
    defaultDateStr
  );
  const [transport, setTransport] = useState<"carpool" | "self">("self");
  const [selectedPickup, setSelectedPickup] = useState<string | null>(null);

  // Notify parent of default values on mount
  useEffect(function notifyDefaults() {
    props.onSelectionChange({
      selectedDate: defaultDateStr,
      selectedPickup: null,
      isSelfArrival: true,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function notify(date: string | null, pickup: string | null, isSelf: boolean) {
    props.onSelectionChange({
      selectedDate: date,
      selectedPickup: pickup,
      isSelfArrival: isSelf,
    });
  }

  function handleDateSelect(date: Date | { from: Date; to: Date } | undefined) {
    if (!(date instanceof Date)) return;
    const dateStr = toDateStr(date);
    setSelectedDate(dateStr);
    notify(dateStr, selectedPickup, transport === "self");
  }

  function handleTransportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw !== "carpool" && raw !== "self") return;
    const isSelf = raw === "self";
    const pickup = isSelf ? null : (props.pickupLocations[0] ?? null);

    setTransport(raw);
    setSelectedPickup(pickup);
    notify(selectedDate, pickup, isSelf);
  }

  function handlePickupChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSelectedPickup(value);
    notify(selectedDate, value, false);
  }

  const selectedDateObj =
    selectedDate != null ? new Date(selectedDate + "T00:00:00") : undefined;

  const surchargeLabel = `+NT$ ${props.carpoolSurcharge.toLocaleString("zh-TW")}`;

  return (
    <ModalCard>
      <ModalCard.Header title={t("packageOptions")} />
      <ModalCard.Main className="space-y-6">
        {/* Event Date */}
        <div className="space-y-2">
          <h3 className="typo-ui text-sm text-foreground">{t("eventDate")}</h3>
          <EventCalendar
            size="lg"
            className="w-full"
            value={selectedDateObj}
            onChange={handleDateSelect}
            availableDates={availableDateObjects}
            minAdvanceDays={3}
            visibleWeeks={2}
            expandLabel="展開完整月份"
            defaultMonth={defaultMonth}
          />
        </div>

        {/* Transport */}
        <div className="space-y-2">
          <h3 className="typo-ui text-sm text-foreground">{t("transport")}</h3>
          <div className="flex flex-wrap gap-2">
            <RadioOption
              name="transport"
              value="self"
              label={t("selfArrival")}
              checked={transport === "self"}
              onChange={handleTransportChange}
            />
            <RadioOption
              name="transport"
              value="carpool"
              label={`${t("carpoolPickup")}  ${surchargeLabel}`}
              checked={transport === "carpool"}
              onChange={handleTransportChange}
            />
          </div>
        </div>

        {/* Pickup Place (only when carpool selected) */}
        {transport === "carpool" && (
          <div className="space-y-2">
            <h3 className="typo-ui text-sm text-foreground">
              {t("pickupPlace")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {props.pickupLocations.map((loc) => (
                <RadioOption
                  key={loc}
                  name="pickup"
                  value={loc}
                  label={loc}
                  checked={selectedPickup === loc}
                  onChange={handlePickupChange}
                />
              ))}
            </div>
          </div>
        )}
      </ModalCard.Main>
    </ModalCard>
  );
};

PackageOptions.displayName = "PackageOptions";
export default PackageOptions;
