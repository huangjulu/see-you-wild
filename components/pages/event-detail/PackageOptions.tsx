"use client";

import React, { useEffect, useMemo, useState } from "react";

import Heading from "@/components/ui/atoms/Heading";
import RadioOption from "@/components/ui/atoms/RadioOption";
import EventCalendar from "@/components/ui/molecules/EventCalendar";
import ModalCard from "@/components/ui/molecules/ModalCard";
import Selector from "@/components/ui/molecules/Selector";
import { PICKUP_LOCATIONS } from "@/lib/constants";
import { useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

import type { PackageSelection } from "./packageOptions.types";

interface PackageOptionsProps {
  availableDates: string[];
  carpoolSurcharge: number;
  onSelectionChange: (selection: PackageSelection) => void;
}

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

type TransportMode = "self" | "carpool";
type CarpoolRole = "passenger" | "driver";

const PackageOptions = (props: PackageOptionsProps) => {
  const t = useTranslations("eventDetail");
  const availableDateObjects = useMemo(
    () => props.availableDates.map((d) => new Date(d + "T00:00:00")),
    [props.availableDates]
  );

  const nearestDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nearest = availableDateObjects
      .filter((d) => d >= today)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    return nearest ?? null;
  }, [availableDateObjects]);

  const defaultMonth = nearestDate ?? new Date();
  const defaultDateStr = nearestDate ? toDateStr(nearestDate) : null;

  const [selectedDate, setSelectedDate] = useState<string | null>(
    defaultDateStr
  );
  const [transportMode, setTransportMode] = useState<TransportMode>("self");
  const [carpoolRole, setCarpoolRole] = useState<CarpoolRole>("passenger");
  const [selectedPickup, setSelectedPickup] = useState<string | null>(null);
  const [seatCount, setSeatCount] = useState<number>(3);

  const seatCountOptions = SEAT_COUNT_VALUES.map((value) => ({
    value: String(value),
    label: t("seatCountOption", { count: value }),
  }));

  // Notify parent of default values on mount
  useEffect(function notifyDefaults() {
    props.onSelectionChange({
      selectedDate: defaultDateStr,
      transport: "self",
      carpoolRole: null,
      selectedPickup: null,
      seatCount: null,
    });
  }, []);

  function notifySelectionChange(
    date: string | null,
    mode: TransportMode,
    role: CarpoolRole,
    pickup: string | null,
    seats: number
  ) {
    props.onSelectionChange({
      selectedDate: date,
      transport: mode,
      carpoolRole: mode === "carpool" ? role : null,
      selectedPickup: mode === "carpool" ? pickup : null,
      seatCount: mode === "carpool" && role === "driver" ? seats : null,
    });
  }

  function handleDateSelect(date: Date | { from: Date; to: Date } | undefined) {
    if (!(date instanceof Date)) return;
    const dateStr = toDateStr(date);
    setSelectedDate(dateStr);
    notifySelectionChange(
      dateStr,
      transportMode,
      carpoolRole,
      selectedPickup,
      seatCount
    );
  }

  function handleTransportModeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw !== "self" && raw !== "carpool") return;
    const mode: TransportMode = raw;
    const pickup = mode === "carpool" ? (PICKUP_LOCATIONS[0] ?? null) : null;

    setTransportMode(mode);
    setSelectedPickup(pickup);
    notifySelectionChange(selectedDate, mode, carpoolRole, pickup, seatCount);
  }

  function handleCarpoolRoleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw !== "passenger" && raw !== "driver") return;
    const role: CarpoolRole = raw;
    setCarpoolRole(role);
    notifySelectionChange(
      selectedDate,
      transportMode,
      role,
      selectedPickup,
      seatCount
    );
  }

  function handlePickupChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSelectedPickup(value);
    notifySelectionChange(
      selectedDate,
      transportMode,
      carpoolRole,
      value,
      seatCount
    );
  }

  function handleSeatCountChange(value: string) {
    const num = Number(value);
    setSeatCount(num);
    notifySelectionChange(
      selectedDate,
      transportMode,
      carpoolRole,
      selectedPickup,
      num
    );
  }

  const selectedDateObj =
    selectedDate != null ? new Date(selectedDate + "T00:00:00") : undefined;

  return (
    <ModalCard>
      <ModalCard.Header title={t("packageOptions")} />
      <ModalCard.Main className="space-y-6">
        {/* Event Date */}
        <div className="space-y-2">
          <Heading.H3 variant="ui">{t("eventDate")}</Heading.H3>
          <EventCalendar
            size="lg"
            className="w-full"
            value={selectedDateObj}
            onChange={handleDateSelect}
            availableDates={availableDateObjects}
            minAdvanceDays={3}
            defaultMonth={defaultMonth}
          />
        </div>

        {/* Transport */}
        <div className="space-y-2">
          <Heading.H4 variant="ui">{t("transport")}</Heading.H4>
          <div className="flex flex-wrap gap-2.5">
            <RadioOption
              variant="outlined"
              name="transportMode"
              value="self"
              label={t("selfArrival")}
              checked={transportMode === "self"}
              onChange={handleTransportModeChange}
            />
            <RadioOption
              variant="outlined"
              name="transportMode"
              value="carpool"
              label={t("carpool")}
              checked={transportMode === "carpool"}
              onChange={handleTransportModeChange}
            />
          </div>
        </div>

        {/* Carpool sub-group */}
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300",
            transportMode === "carpool" ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden space-y-4">
            <p className="typo-ui text-sm text-accent">
              {t("carpoolLockWarning")}
            </p>
            {/* Carpool role */}
            <div className="space-y-2">
              <Heading.H4 variant="ui">{t("carpoolRole")}</Heading.H4>
              <div className="flex flex-wrap gap-2.5">
                <RadioOption
                  variant="outlined"
                  name="carpoolRole"
                  value="passenger"
                  label={t("needRide")}
                  checked={carpoolRole === "passenger"}
                  onChange={handleCarpoolRoleChange}
                />
                <RadioOption
                  variant="outlined"
                  name="carpoolRole"
                  value="driver"
                  label={t("canDrive")}
                  subtitle={t("carpoolSubtitle")}
                  checked={carpoolRole === "driver"}
                  onChange={handleCarpoolRoleChange}
                />
              </div>
              {carpoolRole === "driver" && (
                <p className="typo-body text-xs text-secondary">
                  {t("driverNote")}
                  <br />
                  {t("driverOverflowNote")}
                </p>
              )}
            </div>

            {/* Seat count (driver only) */}
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300",
                carpoolRole === "driver" ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <Selector
                  label={t("seatCount")}
                  placeholder={t("selectSeatCount")}
                  options={seatCountOptions}
                  value={String(seatCount)}
                  onChange={handleSeatCountChange}
                />
              </div>
            </div>

            {/* Pickup place */}
            <div className="space-y-2">
              <Heading.H3 variant="ui">{t("pickupPlace")}</Heading.H3>
              <div className="flex flex-wrap gap-2.5">
                {PICKUP_LOCATIONS.map((loc) => (
                  <RadioOption
                    variant="outlined"
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
          </div>
        </div>
      </ModalCard.Main>
    </ModalCard>
  );
};

PackageOptions.displayName = "PackageOptions";
export default PackageOptions;

const SEAT_COUNT_VALUES = [3, 4, 5] as const;
