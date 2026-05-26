"use client";

import { Search as IconSearch } from "lucide-react";

import Skeleton from "@/components/ui/atoms/Skeleton";
import { cn } from "@/lib/utils";

const TABLE_GRID =
  "grid grid-cols-[1.2fr_1fr_1.4fr_0.8fr_0.7fr_0.5fr_0.7fr_0.6fr_1fr] items-center gap-2 px-3";

const AdminDashboardSkeleton = () => {
  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* SummaryBar placeholder */}
      <div className="flex h-10 shrink-0 items-center border-b border-stroke-default bg-white px-6">
        <Skeleton className="h-4 w-48" />
      </div>

      {/* EventCarousel skeleton */}
      <div className="flex flex-1 flex-col overflow-hidden border-b border-stroke-default">
        <div className="flex shrink-0 items-center justify-between border-b border-stroke-default bg-white px-6 py-3.5">
          <h2 className="typo-heading text-xl text-primary">活動管理</h2>
          <button
            disabled
            className="typo-ui rounded-md border border-transparent bg-fill-brand px-4 py-2 text-on-surface-brand opacity-50 cursor-not-allowed"
          >
            + 新增活動
          </button>
        </div>

        <div className="flex flex-1 items-center gap-2.5 overflow-hidden px-4">
          {/* Invisible nav button spacer */}
          <div className="size-8 shrink-0" />

          <div className="flex flex-1 gap-3.5 overflow-hidden [&>div]:flex [&>div]:min-w-0 [&>div]:flex-1 [&>div]:gap-3 [&>div]:rounded-xl [&>div]:border [&>div]:border-stroke-default [&>div]:bg-white [&>div]:p-3 [&>div]:shadow-2xs">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i}>
                <Skeleton className="size-14 shrink-0 rounded-lg" />
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>

          {/* Invisible nav button spacer */}
          <div className="size-8 shrink-0" />
        </div>

        <div className="flex shrink-0 justify-center gap-1.5 py-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "size-[7px] rounded-full",
                i === 0 ? "bg-brand-400" : "bg-neutral-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Registration section skeleton */}
      <div className="flex flex-2 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-stroke-default bg-white px-6 py-3.5">
          <h2 className="typo-heading text-xl text-primary">報名管理</h2>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-300" />
              <input
                disabled
                placeholder="搜尋姓名 / 末五碼..."
                className="w-[200px] rounded-lg border border-stroke-default bg-background py-1.5 pl-8 pr-3 text-xs text-primary placeholder:text-neutral-300 opacity-50 cursor-not-allowed"
              />
            </div>
            <button
              disabled
              className="typo-ui rounded-md border border-transparent bg-fill-brand px-4 py-2 text-on-surface-brand opacity-50 cursor-not-allowed"
            >
              + 新增報名
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* Table header — real column names */}
          <div
            className={cn(
              TABLE_GRID,
              "sticky top-0 z-[1] border-b border-stroke-default bg-white py-2 typo-overline text-[11px] text-secondary"
            )}
          >
            <span>活動</span>
            <span>姓名</span>
            <span>Email</span>
            <span>電話</span>
            <span>狀態</span>
            <span>交通</span>
            <span>末五碼</span>
            <span>金額</span>
            <span>操作</span>
          </div>

          {/* 5 skeleton rows */}
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={cn(TABLE_GRID, "border-b border-neutral-100 py-2.5")}
            >
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-10 rounded" />
                <Skeleton className="h-5 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

AdminDashboardSkeleton.displayName = "AdminDashboardSkeleton";
export default AdminDashboardSkeleton;
