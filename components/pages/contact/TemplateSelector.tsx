"use client";

import React from "react";

import { useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TEMPLATE_OPTIONS = ["group4", "private", "custom"] as const;

const TemplateSelector: React.FC<TemplateSelectorProps> = (props) => {
  const t = useTranslations("contact");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {TEMPLATE_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => props.onChange(option)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 typo-ui text-sm font-medium transition-colors",
              props.value === option
                ? "bg-brand-500 text-white"
                : "bg-white border border-stroke-default text-primary hover:border-brand-400"
            )}
          >
            {t(`templates.${option}.label`)}
          </button>
        ))}
      </div>
      <p className="typo-body-2 text-sm text-secondary">
        {t(`templates.${props.value as (typeof TEMPLATE_OPTIONS)[number]}.description`)}
      </p>
    </div>
  );
};

TemplateSelector.displayName = "TemplateSelector";
export default TemplateSelector;
