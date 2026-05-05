"use client";

import Selector from "@/components/ui/molecules/Selector";
import { COUNTRY_OPTIONS } from "@/lib/form-rules";
import { useTranslations } from "@/lib/i18n/client";

interface CountrySelectorProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (iso: string) => void;
  onBlur?: () => void;
  error?: string;
  name?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = (props) => {
  const tCountry = useTranslations("country");

  const options = COUNTRY_OPTIONS.map((country) => ({
    value: country.iso,
    label: tCountry(country.iso),
  }));

  return (
    <Selector
      label={props.label}
      placeholder={props.placeholder}
      options={options}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      error={props.error}
      name={props.name}
    />
  );
};

CountrySelector.displayName = "CountrySelector";
export default CountrySelector;
