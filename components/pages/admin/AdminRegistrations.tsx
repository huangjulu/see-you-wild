"use client";

import { Search as IconSearch } from "lucide-react";
import { useMemo, useState } from "react";

import Button from "@/components/ui/atoms/Button";
import Selector from "@/components/ui/molecules/Selector";
import AdminSidebar from "@/components/ui/organisms/AdminSidebar";
import { adminApi } from "@/lib/api/admin.api";
import type { EventListDto, RegistrationAdminDto } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface FlatRegistration extends RegistrationAdminDto {
  eventTitle: string;
}

const TABLE_GRID =
  "grid grid-cols-[1.1fr_0.8fr_0.9fr_1.3fr_0.7fr_0.6fr_0.5fr_0.6fr_0.5fr_1fr] items-center gap-2 px-3";

type RegistrationStatusFilter =
  | "all"
  | "pending_payment"
  | "pending_review"
  | "paid";

const STATUS_OPTIONS: { value: RegistrationStatusFilter; label: string }[] = [
  { value: "all", label: "全部狀態" },
  { value: "pending_payment", label: "待付款" },
  { value: "pending_review", label: "待審核" },
  { value: "paid", label: "已付款" },
];

const STATUS_FILTER_VALUES: RegistrationStatusFilter[] = [
  "all",
  "pending_payment",
  "pending_review",
  "paid",
];

function isRegistrationStatusFilter(v: string): v is RegistrationStatusFilter {
  // Widening to string[] is necessary: Array<T>.includes() does not accept supertypes of T
  return (STATUS_FILTER_VALUES as string[]).includes(v);
}

const AdminRegistrations: React.FC = () => {
  const { data: events, isLoading } = adminApi.events.useList();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [statusFilter, setStatusFilter] =
    useState<RegistrationStatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const eventOptions = useMemo(() => {
    if (!events) return [{ value: "all", label: "全部活動" }];
    return [
      { value: "all", label: "全部活動" },
      ...events.map((e: EventListDto) => ({ value: e.id, label: e.title })),
    ];
  }, [events]);

  const allRegistrations = useMemo<FlatRegistration[]>(() => {
    if (!events) return [];
    return events.flatMap((event: EventListDto) =>
      event.registrations.map((reg: RegistrationAdminDto) => ({
        ...reg,
        eventTitle: event.title,
      }))
    );
  }, [events]);

  const filteredRegistrations = useMemo<FlatRegistration[]>(() => {
    let list: FlatRegistration[] =
      selectedEventId !== "all"
        ? allRegistrations.filter((r) => r.event_id === selectedEventId)
        : allRegistrations;

    if (statusFilter === "pending_payment") {
      list = list.filter(
        (r) => r.status === "pending" && r.payment_ref == null
      );
    } else if (statusFilter === "pending_review") {
      list = list.filter(
        (r) => r.status === "pending" && r.payment_ref != null
      );
    } else if (statusFilter === "paid") {
      list = list.filter((r) => r.status === "paid");
    }

    if (dateFrom !== "") {
      list = list.filter((r) => r.created_at >= dateFrom);
    }
    if (dateTo !== "") {
      list = list.filter((r) => r.created_at.slice(0, 10) <= dateTo);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.payment_ref?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [
    allRegistrations,
    selectedEventId,
    statusFilter,
    dateFrom,
    dateTo,
    searchQuery,
  ]);

  return (
    <>
      <AdminSidebar />
      <main className="flex flex-1 flex-col overflow-clip bg-background">
        <div className="border-b border-stroke-default bg-white px-6 py-4">
          <h1 className="text-xl font-semibold text-primary">報名管理一覽</h1>
        </div>

        <div className="flex items-center gap-3 border-b border-stroke-default bg-white px-6 py-3">
          <div className="relative flex-1 max-w-xs">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="搜尋姓名、Email、末五碼..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "h-10 w-full rounded-md border pl-9 pr-3 text-sm typo-body",
                "border-stroke-default bg-white text-primary",
                "placeholder:text-disabled",
                "focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none"
              )}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={cn(
                "h-10 rounded-md border px-2 text-xs typo-body",
                "border-stroke-default bg-white text-primary",
                "focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none"
              )}
            />
            <span className="text-xs text-secondary">~</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={cn(
                "h-10 rounded-md border px-2 text-xs typo-body",
                "border-stroke-default bg-white text-primary",
                "focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none"
              )}
            />
          </div>

          <Selector
            className="w-44"
            options={eventOptions}
            value={selectedEventId}
            onChange={setSelectedEventId}
            placeholder="全部活動"
          />

          <Selector
            className="w-36"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(v) => {
              if (isRegistrationStatusFilter(v)) setStatusFilter(v);
            }}
            placeholder="全部狀態"
          />
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="rounded-lg border border-stroke-default bg-white overflow-hidden">
              <TableHeader />
              {filteredRegistrations.length === 0 ? (
                <div className="py-12 text-center text-sm text-secondary">
                  沒有符合條件的報名記錄
                </div>
              ) : (
                <div className="divide-y divide-stroke-default">
                  {filteredRegistrations.map((reg) => (
                    <RegistrationRow key={reg.id} registration={reg} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

AdminRegistrations.displayName = "AdminRegistrations";
export default AdminRegistrations;

const TableHeader: React.FC = () => (
  <div
    className={cn(
      TABLE_GRID,
      "border-b border-stroke-default bg-surface py-2 text-xs font-medium text-secondary"
    )}
  >
    <span>活動</span>
    <span>梯次日期</span>
    <span>姓名</span>
    <span>Email</span>
    <span>電話</span>
    <span>狀態</span>
    <span>交通</span>
    <span>末五碼</span>
    <span>金額</span>
    <span>操作</span>
  </div>
);

TableHeader.displayName = "TableHeader";

interface RegistrationRowProps {
  registration: FlatRegistration;
}

const RegistrationRow: React.FC<RegistrationRowProps> = (props) => {
  const reg = props.registration;
  const isPendingReview = reg.status === "pending" && reg.payment_ref != null;
  const isPendingPayment = reg.status === "pending" && reg.payment_ref == null;

  return (
    <div
      className={cn(
        TABLE_GRID,
        "py-2.5 text-sm text-primary hover:bg-surface transition-colors",
        isPendingReview && "bg-surface-warm"
      )}
    >
      <span className="truncate text-xs text-secondary" title={reg.eventTitle}>
        {reg.eventTitle}
      </span>
      <span className="text-xs text-secondary">
        {reg.selected_date != null ? reg.selected_date : "—"}
      </span>
      <span className="truncate font-medium">{reg.name}</span>
      <span className="truncate text-xs" title={reg.email}>
        {reg.email}
      </span>
      <span className="text-xs">{reg.phone}</span>
      <StatusBadge
        status={reg.status}
        isPendingReview={isPendingReview}
        isPendingPayment={isPendingPayment}
      />
      <span className="text-xs">
        {reg.transport === "carpool" ? "共乘" : "自行"}
      </span>
      <span className="font-mono text-xs">
        {reg.payment_ref != null ? reg.payment_ref.slice(-5) : "—"}
      </span>
      <span className="text-xs">
        {reg.amount_due > 0 ? `$${reg.amount_due}` : "—"}
      </span>
      <ActionButtons registration={reg} />
    </div>
  );
};

RegistrationRow.displayName = "RegistrationRow";

interface StatusBadgeProps {
  status: FlatRegistration["status"];
  isPendingReview: boolean;
  isPendingPayment: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = (props) => {
  if (props.isPendingReview) {
    return (
      <span className="inline-flex rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-500">
        待審核
      </span>
    );
  }
  if (props.isPendingPayment) {
    return (
      <span className="inline-flex rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-secondary">
        待付款
      </span>
    );
  }
  if (props.status === "paid") {
    return (
      <span className="inline-flex rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-success">
        已付款
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-surface px-2 py-0.5 text-xs text-disabled">
      {props.status}
    </span>
  );
};

StatusBadge.displayName = "StatusBadge";

interface ActionButtonsProps {
  registration: FlatRegistration;
}

const ActionButtons: React.FC<ActionButtonsProps> = (props) => {
  const reg = props.registration;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <Button
        theme="text"
        className="h-7 px-2 text-xs"
        onClick={() => {
          console.log("resend email", reg.id);
        }}
      >
        補發信
      </Button>
      {reg.status === "pending" && reg.payment_ref != null && (
        <Button
          theme="text"
          className="h-7 px-2 text-xs text-brand-500"
          onClick={() => {
            console.log("confirm payment", reg.id);
          }}
        >
          確認收款
        </Button>
      )}
      <Button
        theme="text"
        className="h-7 px-2 text-xs"
        onClick={() => {
          console.log("edit", reg.id);
        }}
      >
        編輯
      </Button>
      <Button
        theme="text"
        className="h-7 px-2 text-xs text-critical"
        onClick={() => {
          console.log("delete", reg.id);
        }}
      >
        刪除
      </Button>
    </div>
  );
};

ActionButtons.displayName = "ActionButtons";

const LoadingSkeleton: React.FC = () => (
  <div className="rounded-lg border border-stroke-default bg-white overflow-hidden animate-pulse">
    <div className="h-9 bg-surface border-b border-stroke-default" />
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="h-12 border-b border-stroke-default bg-white last:border-0"
      />
    ))}
  </div>
);

LoadingSkeleton.displayName = "LoadingSkeleton";
