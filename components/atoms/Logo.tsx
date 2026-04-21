import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "lg";
  className?: string;
}

const Logo: React.FC<LogoProps> = (props) => {
  const { size = "lg" } = props;

  return (
    <Image
      className={cn(
        props.className,
        "filter-[brightness(0)_invert(1)_drop-shadow(0_0_12px_color-mix(in_srgb,var(--color-accent-fg)_60%,transparent))]"
      )}
      width={size == "lg" ? LG_SIZE : SM_SIZE}
      height={size == "lg" ? LG_SIZE : SM_SIZE}
      priority
      {...logoConfig}
    />
  );
};

Logo.displayName = "Logo";
export default Logo;

const LG_SIZE = 200;
const SM_SIZE = 48;

const logoConfig = {
  src: "/icons/logo-bw.png",
  alt: "See You Wild 西揪團 — 石虎貓咪戴護目鏡品牌 Logo",
} as const;
