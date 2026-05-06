"use client";

import Input from "@/components/ui/atoms/Input";
import type { CountryRule } from "@/lib/form-rules";
import { normalizePhone } from "@/lib/form-rules";

interface PhoneInputProps {
  country: CountryRule;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
}

const PhoneInput: React.FC<PhoneInputProps> = (props) => {
  function onPhoneInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    props.onChange?.(event.target.value);
  }

  function onPhoneInputBlur() {
    const raw = props.value ?? "";
    const normalized = normalizePhone(raw, props.country);
    if (normalized != null && normalized !== raw) {
      props.onChange?.(normalized);
    }
    props.onBlur?.();
  }

  return (
    <div className="flex flex-col gap-1">
      <Input
        ref={props.ref}
        name={props.name}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        label={props.label}
        placeholder={props.placeholder ?? props.country.phoneExample}
        value={props.value ?? ""}
        onChange={onPhoneInputChange}
        onBlur={onPhoneInputBlur}
        error={props.error}
        className={props.className}
      />
      {props.hint != null && props.error == null && (
        <p className="typo-ui text-xs text-secondary">{props.hint}</p>
      )}
    </div>
  );
};

PhoneInput.displayName = "PhoneInput";
export default PhoneInput;
