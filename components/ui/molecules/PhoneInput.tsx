"use client";

import { useState } from "react";

import Input from "@/components/ui/atoms/Input";
import type { CountryRule } from "@/lib/form-rules";
import { normalizePhone } from "@/lib/form-rules";

interface PhoneInputProps {
  country: CountryRule;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  name: string;
  ref: React.Ref<HTMLInputElement>;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  className?: string;
}

function formatDisplay(raw: string): string {
  if (!raw.startsWith("+") || raw.length <= 1) return raw;
  const digits = raw.slice(1);
  const groups = digits.match(/.{1,3}/g) ?? [];
  return `+${groups.join(" ")}`;
}

const PhoneInput: React.FC<PhoneInputProps> = (props) => {
  const [focused, setFocused] = useState(false);

  function onPhoneInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    let filtered = event.target.value.replace(/[^\d+]/g, "");
    if (!filtered.startsWith("+")) {
      filtered = `+${filtered}`;
    }
    if (filtered.length > 16) {
      filtered = filtered.slice(0, 16);
    }
    props.onChange(filtered);
  }

  function onPhoneInputFocus() {
    setFocused(true);
  }

  function onPhoneInputBlur() {
    setFocused(false);
    const raw = props.value;
    const normalized = normalizePhone(raw, props.country);
    if (normalized != null && normalized !== raw) {
      props.onChange(normalized);
    }
    props.onBlur();
  }

  const displayValue = focused ? props.value : formatDisplay(props.value);

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
        value={displayValue}
        onChange={onPhoneInputChange}
        onFocus={onPhoneInputFocus}
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
