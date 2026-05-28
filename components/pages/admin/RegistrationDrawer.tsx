"use client";

import { Search as IconSearch, X as IconX } from "lucide-react";

import Button from "@/components/ui/atoms/Button";
import SummaryBar from "@/components/ui/molecules/SummaryBar";
import type {
  AdminDashboardAction,
  FlatRegistration,
} from "@/lib/hooks/useAdminDashboard";
import type { EventListDto } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface RegistrationDrawerProps {
  open: boolean;
  event: EventListDto | null;
  registrations: FlatRegistration[];
  pendingReviewCount: number;
  searchQuery: string;
  dispatch: React.Dispatch<AdminDashboardAction>;
  onResendEmail: (id: string) => void;
}

const TABLE_GRID =
  "grid grid-cols-[0.8fr_0.9fr_1.3fr_0.7fr_0.6fr_0.5fr_0.6fr_0.5fr_1fr] items-center gap-2 px-3";

const RegistrationDrawer: React.FC<RegistrationDrawerProps> = (props) => {
  const event = props.event;

  return (
    <div
      className={cn(
        "flex flex-col border-l border-stroke-default bg-white transition-[width,opacity] duration-300",
        props.open ? "w-[60%] opacity-100" : "w-0 opacity-0 overflow-clip"
      )}
    >
      {props.open && event != null && (
        <>
          {/* Header: title + close, actions below title */}
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stroke-default px-6 py-3">
            <div className="min-w-0 flex-1">
              <h2 className="typo-heading text-base text-primary truncate">
                {event.title}
              </h2>
              <div className="flex gap-1.5 mt-2">
                <Button
                  theme="outline"
                  className="px-2.5 py-1 text-[11px]"
                  onClick={() =>
                    props.dispatch({ type: "OPEN_EDIT_EVENT", event })
                  }
                >
                  編輯活動
                </Button>
                <Button
                  theme="danger"
                  className="px-2.5 py-1 text-[11px]"
                  onClick={() =>
                    props.dispatch({ type: "OPEN_DELETE_EVENT", event })
                  }
                >
                  刪除活動
                </Button>
              </div>
            </div>
            <button
              aria-label="關閉"
              onClick={() =>
                props.dispatch({ type: "SELECT_EVENT", eventId: null })
              }
              className="shrink-0 rounded p-1.5 text-secondary hover:bg-surface hover:text-primary transition-colors"
            >
              <IconX className="size-4" />
            </button>
          </div>

          {/* Event detail */}
          <div className="shrink-0 border-b border-stroke-default px-6 py-3 space-y-3 text-xs max-h-60 overflow-y-auto">
            {/* 數值欄位：兩欄 */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              <div className="flex gap-2">
                <span className="typo-ui text-secondary shrink-0">地點</span>
                <p className="typo-body text-primary">{event.location}</p>
              </div>
              <div className="flex gap-2">
                <span className="typo-ui text-secondary shrink-0">
                  活動日期
                </span>
                <p className="typo-body text-primary">{event.start_date}</p>
              </div>
              <div className="flex gap-2">
                <span className="typo-ui text-secondary shrink-0">
                  每人費用
                </span>
                <p className="typo-body text-primary">
                  ${event.base_price.toLocaleString("zh-TW")}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="typo-ui text-secondary shrink-0">
                  共乘加價
                </span>
                <p className="typo-body text-primary">
                  ${event.carpool_surcharge.toLocaleString("zh-TW")}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="typo-ui text-secondary shrink-0">
                  付款期限
                </span>
                <p className="typo-body text-primary">
                  {event.payment_days} 天
                </p>
              </div>
              <div className="flex gap-2">
                <span className="typo-ui text-secondary shrink-0">
                  最低人數
                </span>
                <p className="typo-body text-primary">
                  {event.min_participants} 人
                </p>
              </div>
              <div className="flex gap-2">
                <span className="typo-ui text-secondary shrink-0">
                  報名人數
                </span>
                <p className="typo-body text-primary">
                  {props.registrations.length} 人
                </p>
              </div>
              <div className="flex gap-2">
                <span className="typo-ui text-secondary shrink-0">狀態</span>
                <p className="typo-body text-primary">
                  {event.status === "open" ? "開放中" : "已結束"}
                </p>
              </div>
            </div>

            {/* 文字欄位：獨立整行 */}
            {event.description !== "" && (
              <div className="flex gap-2">
                <span className="typo-ui text-secondary shrink-0">
                  活動說明
                </span>
                <p className="typo-body text-primary whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}
            {event.safety_policy !== "" && (
              <div className="flex gap-2">
                <span className="typo-ui text-secondary shrink-0">
                  安全須知
                </span>
                <p className="typo-body text-primary whitespace-pre-line">
                  {event.safety_policy}
                </p>
              </div>
            )}
            {event.preparation_notes !== "" && (
              <div className="flex gap-2">
                <span className="typo-ui text-secondary shrink-0">
                  行前準備
                </span>
                <p className="typo-body text-primary whitespace-pre-line">
                  {event.preparation_notes}
                </p>
              </div>
            )}
            {event.faq !== "" && (
              <div className="flex gap-2">
                <span className="typo-ui text-secondary shrink-0">
                  常見 Q&A
                </span>
                <p className="typo-body text-primary whitespace-pre-line">
                  {event.faq}
                </p>
              </div>
            )}
            {event.refund_policy !== "" && (
              <div className="flex gap-2">
                <span className="typo-ui text-secondary shrink-0">
                  退改政策
                </span>
                <p className="typo-body text-primary whitespace-pre-line">
                  {event.refund_policy}
                </p>
              </div>
            )}
          </div>

          {/* SummaryBar */}
          <SummaryBar count={props.pendingReviewCount} />

          {/* Search + Actions */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-stroke-default bg-white px-6 py-3">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="搜尋姓名 / 末五碼..."
                value={props.searchQuery}
                onChange={(e) =>
                  props.dispatch({ type: "SET_SEARCH", query: e.target.value })
                }
                className={cn(
                  "w-[200px] rounded-lg border border-stroke-default bg-background py-1.5 pl-8 pr-3 text-xs text-primary",
                  "placeholder:text-disabled",
                  "focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none"
                )}
              />
            </div>
            <Button
              theme="solid"
              onClick={() =>
                props.dispatch({ type: "OPEN_CREATE_REGISTRATION" })
              }
            >
              + 新增報名
            </Button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto pb-4">
            <div
              className={cn(
                TABLE_GRID,
                "sticky top-0 z-[1] border-b border-stroke-default bg-white py-2 typo-overline text-[11px] text-secondary"
              )}
            >
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

            {props.registrations.map((reg) => {
              const pendingReview =
                reg.status === "pending" && reg.payment_ref != null;

              return (
                <div
                  key={reg.id}
                  onClick={
                    pendingReview
                      ? () =>
                          props.dispatch({
                            type: "OPEN_REVIEW_PAYMENT",
                            registration: reg,
                          })
                      : undefined
                  }
                  className={cn(
                    TABLE_GRID,
                    "typo-body py-2 text-[12px] transition-colors",
                    pendingReview
                      ? "cursor-pointer rounded border-l-[3px] border-brand-400 bg-surface-warm hover:bg-brand-100"
                      : "border-b border-stroke-default hover:bg-surface"
                  )}
                >
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
                        "text-disabled"
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
                      reg.payment_ref == null && "text-disabled"
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
                        className="px-1 py-0.5 text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          props.onResendEmail(reg.id);
                        }}
                      >
                        重發驗證信
                      </Button>
                    )}
                    {pendingReview && (
                      <Button
                        theme="success"
                        className="px-1 py-0.5 text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          props.dispatch({
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
                      className="px-1 py-0.5 text-[10px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.dispatch({
                          type: "OPEN_EDIT_REGISTRATION",
                          registration: reg,
                        });
                      }}
                    >
                      編輯
                    </Button>
                    <Button
                      theme="danger"
                      className="px-1 py-0.5 text-[10px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.dispatch({
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

            {props.registrations.length === 0 && (
              <div className="flex items-center justify-center py-16 text-sm text-secondary">
                目前沒有報名資料
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

RegistrationDrawer.displayName = "RegistrationDrawer";
export default RegistrationDrawer;
