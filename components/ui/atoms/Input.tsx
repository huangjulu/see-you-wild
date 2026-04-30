"use client";

import { Eye as IconEye, EyeOff as IconEyeOff } from "lucide-react";
import { useId, useRef, useState } from "react";

import { updateRef } from "@/lib/react-ref";
import { cn } from "@/lib/utils";

interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  ref?: React.Ref<HTMLInputElement>;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** 顯示於 input 下方的錯誤訊息，同時觸發 error 樣式 */
  error?: string;
  /** 左側裝飾 icon */
  icon?: React.ReactNode;
  /** 右側裝飾 icon（與 Input.Password 的 toggle 互斥） */
  endIcon?: React.ReactNode;
  /** 上方 label 文字 */
  label?: string;
}

const Input: React.FC<InputProps> = (props) => {
  return <BaseInput {...props} />;
};

Input.displayName = "Input";

const PasswordInput: React.FC<Omit<InputProps, "type" | "endIcon">> = (
  props
) => {
  const [showPassword, setShowPassword] = useState(false);
  const resolvedSize = props.size ?? "md";

  const toggle = (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => setShowPassword((prev) => !prev)}
      className={cn(
        "absolute right-3 top-1/2 -translate-y-1/2 text-secondary transition-colors hover:text-primary",
        "disabled:pointer-events-none"
      )}
      disabled={props.disabled}
      aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
    >
      {showPassword ? (
        <IconEyeOff className={ICON_SIZE_CLASSES[resolvedSize]} />
      ) : (
        <IconEye className={ICON_SIZE_CLASSES[resolvedSize]} />
      )}
    </button>
  );

  return (
    <BaseInput
      {...props}
      type={showPassword ? "text" : "password"}
      endIcon={toggle}
      endIconIsInteractive
    />
  );
};

PasswordInput.displayName = "PasswordInput";

interface BaseInputProps extends InputProps {
  endIconIsInteractive?: boolean;
}

const BaseInput: React.FC<BaseInputProps> = (props) => {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const resolvedSize = props.size ?? "md";
  const hasLeftIcon = props.icon != null;
  const hasRightIcon = props.endIcon != null;

  const onRef = useRef((instance: HTMLInputElement | null) => {
    updateRef(props.ref, instance);
    if (instance == null) {
      return;
    }
    instance.addEventListener("change", touch, { once: true, passive: true });
    instance.addEventListener("invalid", touch, {
      once: true,
      passive: true,
    });
    function touch(event: Event) {
      const input = event.currentTarget;
      if (input instanceof HTMLElement) {
        input.dataset.touched = "";
        input.removeEventListener("change", touch);
        input.removeEventListener("invalid", touch);
      }
    }
  }).current;

  const leftPadding = hasLeftIcon
    ? LEFT_PADDING_CLASSES[resolvedSize]
    : undefined;

  const rightPadding = hasRightIcon
    ? RIGHT_PADDING_CLASSES[resolvedSize]
    : undefined;

  const {
    size: _size,
    error: _error,
    icon: _icon,
    endIcon: _endIcon,
    label: _label,
    className: _className,
    ref: _ref,
    endIconIsInteractive: _endIconIsInteractive,
    ...nativeProps
  } = props;

  return (
    <div className="flex flex-col gap-1">
      {props.label != null && (
        <label htmlFor={inputId} className="typo-ui text-sm text-primary">
          {props.label}
        </label>
      )}
      <div className="relative">
        {hasLeftIcon && (
          <span
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary",
              ICON_SIZE_CLASSES[resolvedSize]
            )}
          >
            {props.icon}
          </span>
        )}
        <input
          ref={onRef}
          {...nativeProps}
          id={inputId}
          className={cn(
            "min-w-0 w-full rounded-md border transition-colors typo-body",
            SIZE_CLASSES[resolvedSize],
            "border-stroke-default bg-white text-primary ring-stroke-focus",
            "placeholder:text-neutral-200",
            "hover:border-stroke-strong hover:disabled:border-stroke-default",
            "focus:border-accent focus:ring-2 focus:ring-brand-200/70 focus-visible:outline-none",
            "data-touched:invalid:border-error data-touched:invalid:ring-error/20 data-touched:invalid:focus:border-error",
            "read-only:bg-neutral-100 read-only:text-secondary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            props.error != null &&
              "border-error ring-error/20 focus:border-error",
            leftPadding,
            rightPadding,
            props.className
          )}
        />
        {props.endIconIsInteractive && props.endIcon}
        {!props.endIconIsInteractive && hasRightIcon && (
          <span
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary",
              ICON_SIZE_CLASSES[resolvedSize]
            )}
          >
            {props.endIcon}
          </span>
        )}
      </div>
      {props.error != null && (
        <p className="typo-ui text-xs text-critical">{props.error}</p>
      )}
    </div>
  );
};

BaseInput.displayName = "BaseInput";

const SIZE_CLASSES = {
  sm: "h-8 text-sm px-3",
  md: "h-10 text-base px-4",
  lg: "h-12 text-lg px-5",
} as const;

const ICON_SIZE_CLASSES = {
  sm: "size-4",
  md: "size-5",
  lg: "size-5",
} as const;

const LEFT_PADDING_CLASSES = {
  sm: "pl-8",
  md: "pl-10",
  lg: "pl-12",
} as const;

const RIGHT_PADDING_CLASSES = {
  sm: "pr-8",
  md: "pr-10",
  lg: "pr-12",
} as const;

const _Input = Object.assign(Input, {
  Password: PasswordInput,
});

export default _Input;
