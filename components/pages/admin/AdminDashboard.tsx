"use client";

import { Search as IconSearch } from "lucide-react";
import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom";

import AdminDashboardSkeleton from "@/components/pages/admin/AdminDashboardSkeleton";
import DeleteEventDialog from "@/components/pages/admin/DeleteEventDialog";
import DeleteRegistrationDialog from "@/components/pages/admin/DeleteRegistrationDialog";
import EventFormModal from "@/components/pages/admin/EventFormModal";
import PaymentReviewDialog from "@/components/pages/admin/PaymentReviewDialog";
import RegistrationFormModal from "@/components/pages/admin/RegistrationFormModal";
import Button from "@/components/ui/atoms/Button";
import FilterTag from "@/components/ui/atoms/FilterTag";
import EventCarousel from "@/components/ui/molecules/EventCarousel";
import SummaryBar from "@/components/ui/molecules/SummaryBar";
import AdminSidebar from "@/components/ui/organisms/AdminSidebar";
import { adminApi } from "@/lib/api/admin.api";
import { useToast } from "@/lib/hooks/useToast";
import type { EventListDto, RegistrationAdminDto } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface FlatRegistration extends RegistrationAdminDto {
  eventId: string;
  eventTitle: string;
}

const TABLE_GRID =
  "grid grid-cols-[1.2fr_1fr_1.4fr_0.8fr_0.7fr_0.5fr_0.7fr_0.6fr_1fr] items-center gap-2 px-3";

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const { data: events, isLoading } = adminApi.events.useList();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventListDto | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventListDto | null>(null);
  const [showCreateRegistration, setShowCreateRegistration] = useState(false);
  const [editingRegistration, setEditingRegistration] =
    useState<RegistrationAdminDto | null>(null);
  const [deletingRegistration, setDeletingRegistration] =
    useState<FlatRegistration | null>(null);
  const [reviewingRegistration, setReviewingRegistration] =
    useState<FlatRegistration | null>(null);

  const allRegistrations = useMemo<FlatRegistration[]>(() => {
    if (!events) return [];
    return events.flatMap((event) =>
      event.registrations.map((reg) => ({
        ...reg,
        eventId: event.id,
        eventTitle: event.title,
      }))
    );
  }, [events]);

  const filteredRegistrations = useMemo(() => {
    let list =
      selectedEventId != null
        ? allRegistrations.filter((r) => r.eventId === selectedEventId)
        : allRegistrations;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.payment_ref?.toLowerCase().includes(q)
      );
    }

    return list.sort(sortPendingReviewFirst);
  }, [allRegistrations, selectedEventId, searchQuery]);

  const pendingReviewCount = allRegistrations.filter(isPendingReview).length;

  const selectedEventTitle =
    events?.find((e) => e.id === selectedEventId)?.title ?? null;

  if (isLoading) {
    return (
      <>
        <AdminSidebar />
        <AdminDashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <AdminSidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <SummaryBar count={pendingReviewCount} />

        <EventCarousel
          events={events ?? []}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
          onCreateEvent={() => setShowCreateModal(true)}
          onEditEvent={setEditingEvent}
          onDeleteEvent={setDeletingEvent}
        />

        <div className="flex flex-2 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-stroke-default bg-white px-6 py-3.5">
            <div className="flex items-center gap-2.5">
              <h2 className="typo-heading text-xl text-primary">報名管理</h2>
              {selectedEventTitle != null && (
                <FilterTag
                  label={selectedEventTitle}
                  onClear={() => setSelectedEventId(null)}
                />
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-300" />
                <input
                  type="text"
                  placeholder="搜尋姓名 / 末五碼..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-[200px] rounded-lg border border-stroke-default bg-background py-1.5 pl-8 pr-3 text-xs text-primary",
                    "placeholder:text-neutral-300",
                    "focus:border-brand-200 focus:ring-2 focus:ring-brand-200/30 focus:outline-none"
                  )}
                />
              </div>
              <Button
                theme="solid"
                onClick={() => setShowCreateRegistration(true)}
              >
                + 新增報名
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-4">
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

            {filteredRegistrations.map((reg) => {
              const pendingReview = isPendingReview(reg);

              return (
                <div
                  key={reg.id}
                  onClick={
                    pendingReview
                      ? () => setReviewingRegistration(reg)
                      : undefined
                  }
                  className={cn(
                    TABLE_GRID,
                    "typo-body py-2.5 text-[13px] transition-colors",
                    pendingReview
                      ? "cursor-pointer rounded border-l-[3px] border-brand-400 bg-surface-warm hover:bg-brand-100"
                      : "border-b border-neutral-100 hover:bg-neutral-50"
                  )}
                >
                  <span className="typo-body truncate text-xs text-secondary">
                    {reg.eventTitle}
                  </span>
                  <span className="typo-ui">{reg.name}</span>
                  <span className="typo-body truncate text-xs text-secondary">
                    {reg.email}
                  </span>
                  <span className="typo-body text-xs">{reg.phone}</span>
                  <span
                    className={cn(
                      "typo-ui text-xs",
                      pendingReview && "text-brand-500",
                      reg.status === "paid" && "text-success",
                      reg.status === "pending" &&
                        reg.payment_ref == null &&
                        "text-neutral-300"
                    )}
                  >
                    {pendingReview
                      ? "⏳ 待審核"
                      : reg.status === "paid"
                        ? "✓ 已付款"
                        : "等待匯款"}
                  </span>
                  <span className="typo-body text-xs">{reg.transport}</span>
                  <span
                    className={cn(
                      "typo-body font-bold",
                      reg.payment_ref == null && "text-neutral-200"
                    )}
                  >
                    {reg.payment_ref ?? "—"}
                  </span>
                  <span className="typo-body text-xs">
                    <span className="opacity-50">$</span>
                    {reg.amount_due.toLocaleString("zh-TW")}
                  </span>
                  <span className="flex gap-1">
                    {reg.status === "pending" && reg.payment_ref == null && (
                      <Button
                        theme="outline"
                        className="px-1.5 py-0.5 text-[11px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info("驗證信已重新寄送");
                        }}
                      >
                        重發驗證信
                      </Button>
                    )}
                    {pendingReview && (
                      <Button
                        theme="solid"
                        className="px-1.5 py-0.5 text-[11px] bg-fill-success text-on-fill-neutral hover:opacity-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReviewingRegistration(reg);
                        }}
                      >
                        確認收款
                      </Button>
                    )}
                    <Button
                      theme="outline"
                      className="px-1.5 py-0.5 text-[11px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRegistration(reg);
                      }}
                    >
                      編輯
                    </Button>
                    <Button
                      theme="danger"
                      className="px-1.5 py-0.5 text-[11px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingRegistration(reg);
                      }}
                    >
                      刪除
                    </Button>
                  </span>
                </div>
              );
            })}
            {filteredRegistrations.length === 0 && (
              <div className="flex items-center justify-center py-16 text-sm text-secondary">
                目前沒有報名資料
              </div>
            )}
          </div>
        </div>
      </main>

      {typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <>
            <EventFormModal
              open={showCreateModal || editingEvent != null}
              onClose={() => {
                setShowCreateModal(false);
                setEditingEvent(null);
              }}
              event={editingEvent}
            />

            <DeleteEventDialog
              open={deletingEvent != null}
              onClose={() => setDeletingEvent(null)}
              event={deletingEvent}
            />

            <RegistrationFormModal
              open={showCreateRegistration || editingRegistration != null}
              onClose={() => {
                setShowCreateRegistration(false);
                setEditingRegistration(null);
              }}
              registration={editingRegistration}
              events={events ?? []}
              preselectedEventId={selectedEventId}
            />

            <DeleteRegistrationDialog
              open={deletingRegistration != null}
              onClose={() => setDeletingRegistration(null)}
              registration={deletingRegistration}
            />

            <PaymentReviewDialog
              open={reviewingRegistration != null}
              onClose={() => setReviewingRegistration(null)}
              registration={
                reviewingRegistration
                  ? {
                      id: reviewingRegistration.id,
                      name: reviewingRegistration.name,
                      payment_ref: reviewingRegistration.payment_ref,
                      amount_due: reviewingRegistration.amount_due,
                      eventTitle: reviewingRegistration.eventTitle,
                    }
                  : null
              }
            />
          </>,
          document.body
        )}
    </>
  );
};

AdminDashboard.displayName = "AdminDashboard";
export default AdminDashboard;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPendingReview(reg: FlatRegistration): boolean {
  return reg.status === "pending" && reg.payment_ref != null;
}

function sortPendingReviewFirst(
  a: FlatRegistration,
  b: FlatRegistration
): number {
  const aPending = isPendingReview(a);
  const bPending = isPendingReview(b);
  if (aPending && !bPending) return -1;
  if (!aPending && bPending) return 1;
  return 0;
}
