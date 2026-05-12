"use client";

import { usePathname } from "next/navigation";

import HomeHeader from "@/components/ui/organisms/HomeHeader";
import PageHeader from "@/components/ui/organisms/PageHeader";

const HOME_PATH_PATTERN = /^\/(zh-TW|en)?\/?$/;
const ADMIN_PATH_PATTERN = /\/admin(\/|$)/;

const HeaderSlot: React.FC = () => {
  const pathname = usePathname();

  if (ADMIN_PATH_PATTERN.test(pathname)) return null;

  const isHome = HOME_PATH_PATTERN.test(pathname);
  return isHome ? <HomeHeader /> : <PageHeader />;
};

HeaderSlot.displayName = "HeaderSlot";
export default HeaderSlot;
