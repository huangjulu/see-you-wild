"use client";

import Input from "@/components/ui/atoms/Input";
import { useTranslations } from "@/lib/i18n/client";

interface IdNumberInputProps {
  country: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  name?: string;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
}

const IdNumberInput: React.FC<IdNumberInputProps> = (props) => {
  const t = useTranslations("registration");

  const isTaiwan = props.country === "TW";
  const labelKey = isTaiwan ? "idLabel.tw" : "idLabel.foreign";
  const placeholderKey = isTaiwan
    ? "idPlaceholder.tw"
    : "idPlaceholder.foreign";

  function onIdNumberChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value.trim().toUpperCase();
    props.onChange?.(next);
  }

  return (
    <Input
      ref={props.ref}
      name={props.name}
      label={t(labelKey)}
      placeholder={t(placeholderKey)}
      value={props.value ?? ""}
      onChange={onIdNumberChange}
      onBlur={props.onBlur}
      error={props.error}
      className={props.className}
    />
  );
};

IdNumberInput.displayName = "IdNumberInput";
export default IdNumberInput;
