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
  const dialCode = props.country.dialCode;

  function formatDisplay(raw: string): string {
    if (!raw.startsWith("+") || raw.length <= 1) return raw;
    const digits = raw.slice(1);
    const groups = digits.match(/.{1,3}/g) ?? [];
    return `+${groups.join(" ")}`;
  }

  function onPhoneInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    let filtered = event.target.value.replace(/[^\d+]/g, "");
    if (!filtered.startsWith("+")) {
      filtered = `+${filtered}`;
    }
    if (filtered.length > 16) {
      filtered = filtered.slice(0, 16);
    }
    props.onChange?.(filtered);
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
        value={formatDisplay(props.value ?? "")}
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
