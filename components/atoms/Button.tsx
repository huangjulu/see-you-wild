import { cn } from "@/lib/utils";

type ButtonTheme =
  | "base"
  | "solid"
  | "ghost"
  | "link"
  | "text"
  | "outline"
  | "danger";

interface ButtonProps {
  children?: React.ReactNode;
  theme?: ButtonTheme;
  href?: string;
  className?: string;
  ariaLabel?: string;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  external?: boolean;
}

// 所有 box-shaped theme 的共用 layout。
// link 不套用（link 是 inline text，沒有 box）；base 是首頁 Hero 的大 CTA，自成一格。
const BOX_LAYOUT =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md";

const Button: React.FC<ButtonProps> = (props) => {
  let themeClass: string;
  switch (props.theme) {
    case "solid":
      themeClass = cn(
        BOX_LAYOUT,
        "bg-accent text-white border-transparent hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30"
      );
      break;
    case "danger":
      themeClass = cn(
        BOX_LAYOUT,
        "bg-red-500 text-white border-transparent hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30"
      );
      break;
    case "ghost":
      themeClass = cn(
        BOX_LAYOUT,
        "border-white/60 text-white hover:bg-white/10 hover:border-white"
      );
      break;
    case "outline":
      themeClass = cn(
        BOX_LAYOUT,
        "border-border-strong text-foreground hover:border-foreground"
      );
      break;
    case "text":
      themeClass = cn(
        BOX_LAYOUT,
        "border-transparent text-foreground hover:opacity-80"
      );
      break;
    case "link":
      themeClass = "underline underline-offset-4 hover:opacity-80";
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
    const isExternal = props.external ?? true;
    return (
      <a
        href={props.href}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className={className}
        aria-label={props.ariaLabel}
      >
        {props.icon}
        {props.children}
      </a>
    );
  }

  return (
    <button
      className={className}
      aria-label={props.ariaLabel}
      onClick={props.onClick}
    >
      {props.icon}
      {props.children}
    </button>
  );
}
