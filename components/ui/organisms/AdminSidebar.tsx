"use client";

import {
  Archive as IconArchive,
  LayoutDashboard as IconLayoutDashboard,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", icon: IconLayoutDashboard, label: "首頁" },
  { href: "/admin/history", icon: IconArchive, label: "歷史" },
] as const;

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="flex w-[72px] shrink-0 flex-col items-center justify-between border-r border-neutral-800 bg-surface-deep py-5">
      <div className="flex size-10 items-center justify-center rounded-[10px] bg-fill-brand">
        <span className="typo-heading text-sm text-neutral-950">SYW</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname.endsWith("/admin") || pathname.endsWith("/admin/")
              : pathname.includes(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex size-12 flex-col items-center justify-center gap-0.5 rounded-xl transition-colors",
                isActive
                  ? "bg-fill-brand text-neutral-950"
                  : "text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
              )}
            >
              <item.icon className="size-[22px]" />
              <span className="text-[9px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

AdminSidebar.displayName = "AdminSidebar";
export default AdminSidebar;
