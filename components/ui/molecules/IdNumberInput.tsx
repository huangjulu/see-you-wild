"use client";

import Input from "@/components/ui/atoms/Input";
import { useTranslations } from "@/lib/i18n/client";

interface IdNumberInputProps {
  country: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  name: string;
  ref: React.Ref<HTMLInputElement>;
  error?: string;
  className?: string;
}

const IdNumberInput: React.FC<IdNumberInputProps> = (props) => {
  const t = useTranslations("registration");

  const isTaiwan = props.country === "TW";
  const placeholder = isTaiwan
    ? t("idPlaceholder.tw")
    : t("idPlaceholder.foreign");

  function onIdNumberChange(event: React.ChangeEvent<HTMLInputElement>) {
    props.onChange(event.target.value);
  }

  return (
    <Input
      ref={props.ref}
      name={props.name}
      label={t("idLabel")}
      placeholder={placeholder}
      value={props.value}
      onChange={onIdNumberChange}
      onBlur={props.onBlur}
      error={props.error}
      className={props.className}
    />
  );
};

IdNumberInput.displayName = "IdNumberInput";
export default IdNumberInput;
