"use client";

import Selector from "@/components/ui/molecules/Selector";
import { COUNTRY_OPTIONS } from "@/lib/form-rules";
import { useTranslations } from "@/lib/i18n/client";

type CountrySelectorProps = Omit<
  React.ComponentProps<typeof Selector>,
  "options"
>;

const CountrySelector: React.FC<CountrySelectorProps> = (props) => {
  const tCountry = useTranslations("country");

  const options = COUNTRY_OPTIONS.map((country) => ({
    value: country.iso,
    label: tCountry(country.iso),
  }));

  return <Selector options={options} {...props} />;
};

CountrySelector.displayName = "CountrySelector";
export default CountrySelector;
