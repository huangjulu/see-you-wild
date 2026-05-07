"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

interface TextAreaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> {
  ref?: React.Ref<HTMLTextAreaElement>;
  error?: string;
  label?: string;
}

const TextArea: React.FC<TextAreaProps> = (props) => {
  const generatedId = useId();
  const textareaId = props.id ?? generatedId;

  const {
    error: _error,
    label: _label,
    className: _className,
    ref: _ref,
    ...nativeProps
  } = props;

  return (
    <div className="flex flex-col gap-1">
      {props.label != null && (
        <label htmlFor={textareaId} className="typo-ui text-sm text-primary">
          {props.label}
        </label>
      )}
      <textarea
        ref={props.ref}
        {...nativeProps}
        id={textareaId}
        className={cn(
          "min-w-0 w-full rounded-md border transition-colors typo-body",
          "min-h-[120px] resize-y px-4 py-3",
          "border-stroke-default bg-white text-primary ring-stroke-focus",
          "placeholder:text-neutral-200",
          "hover:border-brand-400 hover:disabled:border-stroke-default",
          "focus:border-accent focus:ring-2 focus:ring-brand-200/70 focus-visible:outline-none",
          "read-only:bg-neutral-100 read-only:text-secondary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          props.error != null &&
            "border-critical ring-critical/20 focus:border-critical",
          props.className
        )}
      />
      {props.error != null && (
        <p className="typo-ui text-xs text-critical">{props.error}</p>
      )}
    </div>
  );
};

TextArea.displayName = "TextArea";

export default TextArea;
