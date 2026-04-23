"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/ui/organisms/Header";
import PageHeader from "@/components/ui/organisms/PageHeader";

const HOME_PATH_PATTERN = /^\/(zh-TW|en)?\/?$/;

const HeaderSlot: React.FC = () => {
  const pathname = usePathname();
  const isHome = HOME_PATH_PATTERN.test(pathname);
  return isHome ? <Header /> : <PageHeader />;
};

HeaderSlot.displayName = "HeaderSlot";
export default HeaderSlot;
