"use client";

import Input from "@/components/ui/atoms/Input";
import type { CountryRule } from "@/lib/form-rules";
import { formatLocalPhone } from "@/lib/form-rules";
import { cn } from "@/lib/utils";

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

const PhoneInput: React.FC<PhoneInputProps> = (props) => {
  function onPhoneInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const filtered = event.target.value.replace(/\D/g, "");
    props.onChange(filtered);
  }

  function onPhoneInputFocus() {
    const raw = props.value.replace(/\s/g, "");
    if (raw !== props.value) {
      props.onChange(raw);
    }
  }

  function onPhoneInputBlur() {
    const formatted = formatLocalPhone(props.value);
    if (formatted !== props.value) {
      props.onChange(formatted);
    }
    props.onBlur();
  }

  return (
    <div className="flex flex-col gap-1">
      {props.label != null && (
        <span className="typo-ui text-sm text-primary">{props.label}</span>
      )}
      <div
        className={cn(
          "flex items-center rounded-md border transition-colors bg-white",
          "border-stroke-default ring-stroke-focus",
          "hover:border-brand-400",
          "focus-within:border-accent focus-within:ring-2 focus-within:ring-brand-200/70",
          props.error != null &&
            "border-critical ring-critical/20 focus-within:border-critical",
          props.className
        )}
      >
        <span className="typo-body text-sm text-secondary pl-3 shrink-0 select-none">
          {props.country.dialCode}
        </span>
        <Input
          ref={props.ref}
          name={props.name}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={props.placeholder ?? "9 1234 5678"}
          value={props.value}
          onChange={onPhoneInputChange}
          onFocus={onPhoneInputFocus}
          onBlur={onPhoneInputBlur}
          className="border-none shadow-none focus:ring-0 focus:border-transparent pl-2"
        />
      </div>
      {props.error != null && (
        <p className="typo-ui text-xs text-critical">{props.error}</p>
      )}
      {props.hint != null && props.error == null && (
        <p className="typo-ui text-xs text-secondary">{props.hint}</p>
      )}
    </div>
  );
};

PhoneInput.displayName = "PhoneInput";
export default PhoneInput;
