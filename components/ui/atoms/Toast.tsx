"use client";

import {
  AlertCircle as IconAlertCircle,
  AlertTriangle as IconAlertTriangle,
  CheckCircle as IconCheckCircle,
  Info as IconInfo,
  X as IconX,
} from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  onDismiss: (id: string) => void;
}

const variantConfig = {
  success: {
    container: "bg-background border-l-green-500",
    icon: IconCheckCircle,
    iconClass: "text-success",
  },
  error: {
    container: "bg-background border-l-red-500",
    icon: IconAlertCircle,
    iconClass: "text-critical",
  },
  warning: {
    container: "bg-background border-l-brand-500",
    icon: IconAlertTriangle,
    iconClass: "text-accent",
  },
  info: {
    container: "bg-surface-deep border-l-tertiary-400 text-on-surface-deep",
    icon: IconInfo,
    iconClass: "text-info",
  },
} satisfies Record<
  ToastVariant,
  {
    container: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    iconClass: string;
  }
>;

const Toast: React.FC<ToastProps> = (props) => {
  const config = variantConfig[props.variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border-l-4 p-4 shadow-md",
        config.container
      )}
      role="alert"
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", config.iconClass)} />
      <div className="flex-1 min-w-0">
        <p className="typo-body font-medium">{props.title}</p>
        {props.description != null && (
          <p className="typo-caption mt-1 opacity-80">{props.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => props.onDismiss(props.id)}
        className="shrink-0 rounded p-1 opacity-60 transition-opacity hover:opacity-100"
        aria-label="關閉通知"
      >
        <IconX className="size-4" />
      </button>
    </div>
  );
};

Toast.displayName = "Toast";
export default Toast;
