import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "lg";
  className?: string;
}

const Logo: React.FC<LogoProps> = (props) => {
  const size = props.size ?? "lg";
  const dimensions =
    size === "lg" ? { width: 200, height: 200 } : { width: 48, height: 48 };

  return (
    <Image
      src="/images/logo.png"
      alt="See You Wild 西揪團 — 石虎貓咪戴護目鏡品牌 Logo"
      {...dimensions}
      className={props.className ?? ""}
      priority={size === "lg"}
    />
  );
};

Logo.displayName = "Logo";
export default Logo;
