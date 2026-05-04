"use client";

import React, { useEffect, useMemo, useState } from "react";

import RadioOption from "@/components/ui/atoms/RadioOption";
import EventCalendar from "@/components/ui/molecules/EventCalendar";
import ModalCard from "@/components/ui/molecules/ModalCard";
import Selector from "@/components/ui/molecules/Selector";
import { useTranslations } from "@/lib/i18n/client";

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

type TransportChoice = "self" | "passenger" | "driver";

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
  const [transportChoice, setTransportChoice] =
    useState<TransportChoice>("self");
  const [selectedPickup, setSelectedPickup] = useState<string | null>(null);
  const [seatCount, setSeatCount] = useState<number>(3);

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
    choice: TransportChoice,
    pickup: string | null,
    seats: number
  ) {
    const isCarpool = choice === "passenger" || choice === "driver";
    props.onSelectionChange({
      selectedDate: date,
      transport: isCarpool ? "carpool" : "self",
      carpoolRole:
        choice === "driver"
          ? "driver"
          : choice === "passenger"
            ? "passenger"
            : null,
      selectedPickup: isCarpool ? pickup : null,
      seatCount: choice === "driver" ? seats : null,
    });
  }

  function handleDateSelect(date: Date | { from: Date; to: Date } | undefined) {
    if (!(date instanceof Date)) return;
    const dateStr = toDateStr(date);
    setSelectedDate(dateStr);
    notifySelectionChange(dateStr, transportChoice, selectedPickup, seatCount);
  }

  function handleTransportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw !== "self" && raw !== "passenger" && raw !== "driver") return;
    const choice: TransportChoice = raw;
    const isCarpool = choice === "passenger" || choice === "driver";
    const pickup = isCarpool ? (props.pickupLocations[0] ?? null) : null;

    setTransportChoice(choice);
    setSelectedPickup(pickup);
    notifySelectionChange(selectedDate, choice, pickup, seatCount);
  }

  function handlePickupChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSelectedPickup(value);
    notifySelectionChange(selectedDate, transportChoice, value, seatCount);
  }

  function handleSeatCountChange(value: string) {
    const num = Number(value);
    setSeatCount(num);
    notifySelectionChange(selectedDate, transportChoice, selectedPickup, num);
  }

  const selectedDateObj =
    selectedDate != null ? new Date(selectedDate + "T00:00:00") : undefined;

  const surchargeLabel = `+NT$ ${props.carpoolSurcharge.toLocaleString("zh-TW")}`;
  const isCarpool =
    transportChoice === "passenger" || transportChoice === "driver";

  return (
    <ModalCard>
      <ModalCard.Header title={t("packageOptions")} />
      <ModalCard.Main className="space-y-6">
        {/* Event Date */}
        <div className="space-y-2">
          <h3 className="typo-ui text-sm text-primary">{t("eventDate")}</h3>
          <EventCalendar
            size="lg"
            className="w-full"
            value={selectedDateObj}
            onChange={handleDateSelect}
            availableDates={availableDateObjects}
            minAdvanceDays={3}
            gridType="biweek"
            expandLabel="展開完整月份"
            defaultMonth={defaultMonth}
          />
        </div>

        {/* Transport */}
        <div className="space-y-2">
          <h3 className="typo-ui text-sm text-primary">{t("transport")}</h3>
          <div className="flex flex-wrap gap-2">
            <RadioOption
              name="transport"
              value="self"
              label={t("selfArrival")}
              checked={transportChoice === "self"}
              onChange={handleTransportChange}
            />
            <RadioOption
              name="transport"
              value="passenger"
              label={`${t("needRide")}  ${surchargeLabel}`}
              checked={transportChoice === "passenger"}
              onChange={handleTransportChange}
            />
            <RadioOption
              name="transport"
              value="driver"
              label={`${t("canDrive")}  ${surchargeLabel}`}
              checked={transportChoice === "driver"}
              onChange={handleTransportChange}
            />
          </div>
        </div>

        {/* Pickup Place (only when carpool selected) */}
        {isCarpool && (
          <div className="space-y-2">
            <h3 className="typo-ui text-sm text-primary">{t("pickupPlace")}</h3>
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

        {/* Seat count (only when driver selected) */}
        {transportChoice === "driver" && (
          <div className="space-y-2">
            <Selector
              label={t("seatCount")}
              placeholder="選擇人數"
              options={SEAT_COUNT_OPTIONS}
              value={String(seatCount)}
              onChange={handleSeatCountChange}
            />
            <p className="typo-body text-xs text-secondary">
              {t("canDriveNote")}
            </p>
          </div>
        )}
      </ModalCard.Main>
    </ModalCard>
  );
};

PackageOptions.displayName = "PackageOptions";
export default PackageOptions;

const SEAT_COUNT_OPTIONS = [
  { value: "3", label: "3 人" },
  { value: "4", label: "4 人" },
  { value: "5", label: "5 人" },
];
