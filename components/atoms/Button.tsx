import React from "react";

interface ButtonProps {
  variant: "solid" | "ghost";
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const Button: React.FC<ButtonProps> = (props) => {
  const base =
    "inline-block px-8 py-3 rounded-full text-sm font-sans font-medium tracking-widest uppercase transition-all duration-300";
  const variants = {
    solid:
      "bg-accent text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30",
    ghost:
      "border border-white/60 text-white hover:bg-white/10 hover:border-white",
  };

  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      role="button"
      aria-label={props.ariaLabel}
      className={`${base} ${variants[props.variant]} ${props.className ?? ""}`}
    >
      {props.children}
    </a>
  );
};

Button.displayName = "Button";
export default Button;
