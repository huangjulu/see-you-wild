import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "lg";
  className?: string;
}

const Logo: React.FC<LogoProps> = (props) => {
  const { size = "lg" } = props;

  return (
    <img
      className={cn(
        size === "lg" ? "size-50" : "size-12",
        "filter-[brightness(0)_invert(1)_drop-shadow(0_0_12px_color-mix(in_srgb,var(--color-foreground)_60%,transparent))]",
        props.className
      )}
      fetchPriority="high"
      src="/icons/logo-bw.png"
      alt="See You Wild 西揪團 — 石虎貓咪戴護目鏡品牌 Logo"
    />
  );
};

Logo.displayName = "Logo";
export default Logo;
