"use client";

import { useMemo, useState } from "react";

import Selector from "@/components/ui/molecules/Selector";
import AdminSidebar from "@/components/ui/organisms/AdminSidebar";
import { adminApi } from "@/lib/api/admin.api";
import type { EventListDto } from "@/lib/types/database";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TimeRange = "all" | "3m" | "6m" | "12m";

interface HistoryRow {
  id: string;
  title: string;
  dateRange: string;
  location: string;
  totalCount: number;
  paidCount: number;
  revenue: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIME_RANGE_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "3m", label: "近 3 個月" },
  { value: "6m", label: "近半年" },
  { value: "12m", label: "近一年" },
] satisfies { value: TimeRange; label: string }[];

const TABLE_GRID =
  "grid grid-cols-[2fr_1.6fr_1.4fr_0.8fr_0.8fr_1fr] items-center gap-3 px-5";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPastEvent(event: EventListDto): boolean {
  return event.status === "closed" || new Date(event.end_date) < new Date();
}

function isWithinRange(endDate: string, range: TimeRange): boolean {
  if (range === "all") return true;
  const monthMap: Record<Exclude<TimeRange, "all">, number> = {
    "3m": 3,
    "6m": 6,
    "12m": 12,
  };
  const months = monthMap[range as Exclude<TimeRange, "all">];
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return new Date(endDate) >= cutoff;
}

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  return `${fmt(startDate)} ~ ${fmt(endDate)}`;
}

function buildHistoryRow(event: EventListDto): HistoryRow {
  const paidRegs = event.registrations.filter((r) => r.status === "paid");
  return {
    id: event.id,
    title: event.title,
    dateRange: formatDateRange(event.start_date, event.end_date),
    location: event.location,
    totalCount: event.registrations.length,
    paidCount: paidRegs.length,
    revenue: paidRegs.reduce((sum, r) => sum + r.amount_due, 0),
  };
}

function formatRevenue(amount: number): string {
  return `NT$ ${amount.toLocaleString("zh-TW")}`;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface AdminHistoryProps {}

const AdminHistory = (props: AdminHistoryProps) => {
  void props;

  const { data: events } = adminApi.events.useList();
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);

  const pastEvents = useMemo<EventListDto[]>(() => {
    if (!events) return [];
    return events.filter(isPastEvent);
  }, [events]);

  const eventFilterOptions = useMemo(() => {
    const all = { value: "all", label: "全部活動" };
    const rest = pastEvents.map((e) => ({ value: e.id, label: e.title }));
    return [all, ...rest];
  }, [pastEvents]);

  const filteredRows = useMemo<HistoryRow[]>(() => {
    return pastEvents
      .filter((e) => isWithinRange(e.end_date, timeRange))
      .filter((e) => selectedEventId === "all" || e.id === selectedEventId)
      .sort(
        (a, b) =>
          new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
      )
      .map(buildHistoryRow);
  }, [pastEvents, timeRange, selectedEventId]);

  function onRowClick(id: string) {
    setHighlightedRowId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      <AdminSidebar />
      <main className="flex flex-1 flex-col overflow-clip bg-background">
        <div className="border-b border-stroke-default bg-white px-6 py-4">
          <h1 className="text-xl font-semibold text-primary">歷史資料</h1>
        </div>

        <div className="flex items-center gap-3 border-b border-stroke-default bg-white px-6 py-3">
          <Selector
            className="w-36"
            options={TIME_RANGE_OPTIONS}
            value={timeRange}
            onChange={(v) => setTimeRange(v as TimeRange)}
          />
          <Selector
            className="w-52"
            options={eventFilterOptions}
            value={selectedEventId}
            onChange={setSelectedEventId}
          />
        </div>

        {/* Table container */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* Sticky table header */}
          <div
            className={cn(
              TABLE_GRID,
              "sticky top-0 z-[1] border-b border-stroke-default bg-white py-2.5 typo-overline text-[11px] text-secondary"
            )}
          >
            <span>活動名稱</span>
            <span>日期</span>
            <span>地點</span>
            <span>報名人數</span>
            <span>已付款</span>
            <span>營收</span>
          </div>

          {/* Table rows */}
          {filteredRows.length === 0 && (
            <p className="mt-12 text-center text-sm text-secondary">
              沒有符合條件的歷史活動
            </p>
          )}

          {filteredRows.map((row) => {
            const isHighlighted = highlightedRowId === row.id;
            return (
              <div
                key={row.id}
                role="row"
                tabIndex={0}
                onClick={() => onRowClick(row.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onRowClick(row.id);
                }}
                className={cn(
                  TABLE_GRID,
                  "cursor-pointer py-3 text-sm transition-colors border-b border-stroke-default",
                  isHighlighted ? "bg-surface-warm" : "hover:bg-surface"
                )}
              >
                <span className="typo-ui truncate text-primary">
                  {row.title}
                </span>
                <span className="typo-body text-xs text-secondary">
                  {row.dateRange}
                </span>
                <span className="typo-body truncate text-xs text-secondary">
                  {row.location}
                </span>
                <span className="typo-body text-xs">{row.totalCount}</span>
                <span className="typo-body text-xs">{row.paidCount}</span>
                <span className="typo-ui text-xs text-accent">
                  {formatRevenue(row.revenue)}
                </span>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
};

AdminHistory.displayName = "AdminHistory";
export default AdminHistory;
