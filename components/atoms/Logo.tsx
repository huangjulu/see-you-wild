import Image from "next/image";

interface LogoProps {
  size?: "sm" | "lg";
  className?: string;
}

const Logo: React.FC<LogoProps> = (props) => {
  const { size = "lg" } = props;

  return (
    <Image
      className={props.className}
      width={size == "lg" ? LG_SIZE : SM_SIZE}
      height={size == "lg" ? LG_SIZE : SM_SIZE}
      priority={size == "lg"}
      {...logoConfig}
    />
  );
};

Logo.displayName = "Logo";
export default Logo;

const LG_SIZE = 200;
const SM_SIZE = 48;

const logoConfig = {
  src: "/images/logo.png",
  alt: "See You Wild 西揪團 — 石虎貓咪戴護目鏡品牌 Logo",
} as const;
