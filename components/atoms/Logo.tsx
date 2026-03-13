import Image from "next/image";

interface LogoProps {
  size?: "sm" | "lg";
  className?: string;
}

export default function Logo({ size = "lg", className = "" }: LogoProps) {
  const dimensions = size === "lg" ? { width: 200, height: 200 } : { width: 48, height: 48 };

  return (
    <Image
      src="/images/logo.png"
      alt="See You Wild 西揪團 — 石虎貓咪戴護目鏡品牌 Logo"
      {...dimensions}
      className={className}
      priority={size === "lg"}
    />
  );
}
