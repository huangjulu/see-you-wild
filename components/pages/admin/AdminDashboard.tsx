"use client";

import { Search as IconSearch } from "lucide-react";
import React, { useMemo } from "react";

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
import type { FlatRegistration } from "@/lib/hooks/useAdminDashboard";
import useAdminDashboard from "@/lib/hooks/useAdminDashboard";
import { useToast } from "@/lib/hooks/useToast";
import { cn } from "@/lib/utils";

const TABLE_GRID =
  "grid grid-cols-[1.1fr_0.8fr_0.9fr_1.3fr_0.7fr_0.6fr_0.5fr_0.6fr_0.5fr_1fr] items-center gap-2 px-3";

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const resendEmailMutation = adminApi.registrations.useResendEmail();
  const { data: events, isLoading } = adminApi.events.useList();
  const { state, dispatch } = useAdminDashboard();

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
      state.selectedEventId != null
        ? allRegistrations.filter((r) => r.eventId === state.selectedEventId)
        : allRegistrations;

    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.payment_ref?.toLowerCase().includes(q)
      );
    }

    return list.sort(sortPendingReviewFirst);
  }, [allRegistrations, state.selectedEventId, state.searchQuery]);

  const pendingReviewCount = allRegistrations.filter(isPendingReview).length;

  const selectedEventTitle =
    events?.find((e) => e.id === state.selectedEventId)?.title ?? null;

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
          selectedEventId={state.selectedEventId}
          onSelectEvent={(eventId) =>
            dispatch({ type: "SELECT_EVENT", eventId })
          }
          onCreateEvent={() => dispatch({ type: "OPEN_CREATE_EVENT" })}
          onEditEvent={(event) => dispatch({ type: "OPEN_EDIT_EVENT", event })}
          onDeleteEvent={(event) =>
            dispatch({ type: "OPEN_DELETE_EVENT", event })
          }
        />

        <div className="flex flex-2 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-stroke-default bg-white px-6 py-3.5">
            <div className="flex items-center gap-2.5">
              <h2 className="typo-heading text-xl text-primary">報名管理</h2>
              {selectedEventTitle != null && (
                <FilterTag
                  label={selectedEventTitle}
                  onClear={() =>
                    dispatch({ type: "SELECT_EVENT", eventId: null })
                  }
                />
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-300" />
                <input
                  type="text"
                  placeholder="搜尋姓名 / 末五碼..."
                  value={state.searchQuery}
                  onChange={(e) =>
                    dispatch({ type: "SET_SEARCH", query: e.target.value })
                  }
                  className={cn(
                    "w-[200px] rounded-lg border border-stroke-default bg-background py-1.5 pl-8 pr-3 text-xs text-primary",
                    "placeholder:text-neutral-300",
                    "focus:border-brand-200 focus:ring-2 focus:ring-brand-200/30 focus:outline-none"
                  )}
                />
              </div>
              <Button
                theme="solid"
                onClick={() => dispatch({ type: "OPEN_CREATE_REGISTRATION" })}
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
              <span>活動日期</span>
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
                      ? () =>
                          dispatch({
                            type: "OPEN_REVIEW_PAYMENT",
                            registration: reg,
                          })
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
                  <span className="typo-body text-xs text-secondary">
                    {reg.selected_date ?? "—"}
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
                          resendEmailMutation.mutate(reg.id, {
                            onSuccess: () => toast.success("驗證信已重新寄送"),
                            onError: (err) =>
                              toast.error("寄送失敗", {
                                description: err.message,
                              }),
                          });
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
                          dispatch({
                            type: "OPEN_REVIEW_PAYMENT",
                            registration: reg,
                          });
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
                        dispatch({
                          type: "OPEN_EDIT_REGISTRATION",
                          registration: reg,
                        });
                      }}
                    >
                      編輯
                    </Button>
                    <Button
                      theme="danger"
                      className="px-1.5 py-0.5 text-[11px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({
                          type: "OPEN_DELETE_REGISTRATION",
                          registration: reg,
                        });
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

      <EventFormModal
        open={
          state.modal.type === "createEvent" || state.modal.type === "editEvent"
        }
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        event={state.modal.type === "editEvent" ? state.modal.event : null}
      />

      <DeleteEventDialog
        open={state.modal.type === "deleteEvent"}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        event={state.modal.type === "deleteEvent" ? state.modal.event : null}
      />

      <RegistrationFormModal
        open={
          state.modal.type === "createRegistration" ||
          state.modal.type === "editRegistration"
        }
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        registration={
          state.modal.type === "editRegistration"
            ? state.modal.registration
            : null
        }
        events={events ?? []}
        preselectedEventId={state.selectedEventId}
      />

      <DeleteRegistrationDialog
        open={state.modal.type === "deleteRegistration"}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        registration={
          state.modal.type === "deleteRegistration"
            ? state.modal.registration
            : null
        }
      />

      <PaymentReviewDialog
        open={state.modal.type === "reviewPayment"}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        registration={
          state.modal.type === "reviewPayment"
            ? {
                id: state.modal.registration.id,
                name: state.modal.registration.name,
                payment_ref: state.modal.registration.payment_ref,
                amount_due: state.modal.registration.amount_due,
                eventTitle: state.modal.registration.eventTitle,
              }
            : null
        }
      />
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
