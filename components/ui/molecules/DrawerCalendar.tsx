"use client";

import DatePickerDrawer from "@/components/ui/molecules/DatePickerDrawer";
import DatePickerInput from "@/components/ui/molecules/DatePickerInput";
import { maxWidth } from "@/lib/breakpoints";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface DrawerCalendarProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  startYear?: number;
  endYear?: number;
  minDate?: Date;
}

const DrawerCalendar = (props: DrawerCalendarProps) => {
  const isSmallScreen = useMediaQuery(maxWidth("sm"));

  if (isSmallScreen) {
    return <DatePickerDrawer {...props} />;
  }
  return <DatePickerInput {...props} />;
};

DrawerCalendar.displayName = "DrawerCalendar";
export default DrawerCalendar;
