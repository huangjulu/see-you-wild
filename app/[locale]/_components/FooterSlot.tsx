"use client";

import { usePathname } from "next/navigation";

interface FooterSlotProps {
  children: React.ReactNode;
}

const ADMIN_PATH_PATTERN = /\/admin(\/|$)/;

const FooterSlot: React.FC<FooterSlotProps> = (props) => {
  const pathname = usePathname();

  if (ADMIN_PATH_PATTERN.test(pathname)) return null;

  return <>{props.children}</>;
};

FooterSlot.displayName = "FooterSlot";
export default FooterSlot;
