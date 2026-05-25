"use client";

import { usePathname } from "next/navigation";

import Header from "@/components/ui/organisms/Header";

const HOME_PATH_PATTERN = /^\/(zh-TW|en)?\/?$/;
const ADMIN_PATH_PATTERN = /\/admin(\/|$)/;

const HeaderSlot = () => {
  const pathname = usePathname();

  if (ADMIN_PATH_PATTERN.test(pathname)) return null;

  const isHome = HOME_PATH_PATTERN.test(pathname);
  return <Header variant={isHome ? "home" : "page"} />;
};

HeaderSlot.displayName = "HeaderSlot";
export default HeaderSlot;
