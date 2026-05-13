"use client";

import Input from "@/components/ui/atoms/Input";
import type { CountryRule } from "@/lib/form-rules";
import { formatLocalPhone } from "@/lib/form-rules";

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

  const localExample = props.country.trunkPrefix
    ? `${props.country.trunkPrefix}912 345 678`
    : "912 345 678";

  return (
    <div className="flex flex-col gap-1">
      <Input
        ref={props.ref}
        name={props.name}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        label={props.label}
        placeholder={props.placeholder ?? localExample}
        icon={
          <span className="typo-body text-sm text-secondary">
            {props.country.dialCode}
          </span>
        }
        value={props.value}
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
