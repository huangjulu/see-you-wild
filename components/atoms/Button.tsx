import React from "react";
import { cn } from "@/lib/utils";

type ButtonTheme = "base" | "solid" | "ghost" | "link" | "text" | "outline";

interface ButtonProps {
  children?: React.ReactNode;
  theme?: ButtonTheme;
  href?: string;
  className?: string;
  ariaLabel?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = (props) => {
  let themeClass: string;
  switch (props.theme) {
    case "solid":
      themeClass =
        "bg-accent text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30";
      break;
    case "ghost":
      themeClass =
        "border-white/60 text-white hover:bg-white/10 hover:border-white";
      break;
    case "link":
      themeClass = "underline underline-offset-4 hover:opacity-80";
      break;
    case "text":
      themeClass = "hover:opacity-80";
      break;
    case "outline":
      themeClass = "border-neutral-300 hover:border-neutral-500";
      break;
    case "base":
    default:
      themeClass = "flex gap-2 px-8 py-3 rounded-full text-sm tracking-widest";
      break;
  }

  const className = cn(
    themeClass,
    "typo-ui border transition-all duration-300",
    props.className
  );

  return renderElement(props, className);
};

Button.displayName = "Button";
export default Button;
export type { ButtonTheme };

function renderElement(props: ButtonProps, className: string) {
  if (props.href != null) {
    return (
      <a
        href={props.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={props.ariaLabel}
      >
        {props.icon}
        {props.children}
      </a>
    );
  }

  return (
    <button className={className} aria-label={props.ariaLabel}>
      {props.icon}
      {props.children}
    </button>
  );
}
