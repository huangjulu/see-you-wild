"use client";

import React from "react";

import DatePickerDrawer from "@/components/ui/molecules/DatePickerDrawer";
import DatePickerInput from "@/components/ui/molecules/DatePickerInput";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface DrawerCalendarProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  startYear?: number;
  endYear?: number;
}

const DrawerCalendar: React.FC<DrawerCalendarProps> = (props) => {
  const isTouchDevice = useMediaQuery("(pointer: coarse)");

  if (isTouchDevice) {
    return <DatePickerDrawer {...props} />;
  }
  return <DatePickerInput {...props} />;
};

DrawerCalendar.displayName = "DrawerCalendar";
export default DrawerCalendar;
