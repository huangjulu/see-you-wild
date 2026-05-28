"use client";

import { useMemo } from "react";

import AdminDashboardSkeleton from "@/components/pages/admin/AdminDashboardSkeleton";
import DeleteEventDialog from "@/components/pages/admin/DeleteEventDialog";
import DeleteRegistrationDialog from "@/components/pages/admin/DeleteRegistrationDialog";
import EventFilterBar from "@/components/pages/admin/EventFilterBar";
import EventFormModal from "@/components/pages/admin/EventFormModal";
import EventGrid from "@/components/pages/admin/EventGrid";
import PaymentReviewDialog from "@/components/pages/admin/PaymentReviewDialog";
import RegistrationDrawer from "@/components/pages/admin/RegistrationDrawer";
import RegistrationFormModal from "@/components/pages/admin/RegistrationFormModal";
import SummaryBar from "@/components/ui/molecules/SummaryBar";
import AdminSidebar from "@/components/ui/organisms/AdminSidebar";
import { adminApi } from "@/lib/api/admin.api";
import { eventTypesApi } from "@/lib/api/event-types.api";
import type { FlatRegistration } from "@/lib/hooks/useAdminDashboard";
import useAdminDashboard from "@/lib/hooks/useAdminDashboard";
import { useToast } from "@/lib/hooks/useToast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const resendEmailMutation = adminApi.registrations.useResendEmail();
  const { data: events, isLoading } = adminApi.events.useList();
  const { data: eventTypes = [] } = eventTypesApi.useAll();
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

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    let list = events;
    if (state.statusFilter !== "all") {
      list = list.filter((e) => e.status === state.statusFilter);
    }
    if (state.typeFilter != null) {
      list = list.filter((e) => e.type === state.typeFilter);
    }
    return list;
  }, [events, state.statusFilter, state.typeFilter]);

  const pendingReviewCount = allRegistrations.filter(isPendingReview).length;

  const drawerPendingReviewCount =
    filteredRegistrations.filter(isPendingReview).length;

  const selectedEvent =
    events?.find((e) => e.id === state.selectedEventId) ?? null;
  const drawerOpen = selectedEvent != null;

  const typeOptions = eventTypes.map((t) => ({
    value: t.slug,
    label: t.name_zh,
  }));

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
      <main className="flex flex-1 flex-col overflow-clip">
        <SummaryBar count={pendingReviewCount} />

        <EventFilterBar
          statusFilter={state.statusFilter}
          typeFilter={state.typeFilter}
          typeOptions={typeOptions}
          onStatusChange={(status) =>
            dispatch({ type: "SET_STATUS_FILTER", status })
          }
          onTypeChange={(typeSlug) =>
            dispatch({ type: "SET_TYPE_FILTER", typeSlug })
          }
          onCreateEvent={() => dispatch({ type: "OPEN_CREATE_EVENT" })}
        />

        <div className="flex flex-1 overflow-clip">
          <EventGrid
            events={filteredEvents}
            selectedEventId={state.selectedEventId}
            compressed={drawerOpen}
            onSelectEvent={(eventId) =>
              dispatch({ type: "SELECT_EVENT", eventId })
            }
          />

          <RegistrationDrawer
            open={drawerOpen}
            event={selectedEvent}
            registrations={filteredRegistrations}
            pendingReviewCount={drawerPendingReviewCount}
            searchQuery={state.searchQuery}
            dispatch={dispatch}
            onResendEmail={(id) =>
              resendEmailMutation.mutate(id, {
                onSuccess: () => toast.success("驗證信已重新寄送"),
                onError: (err) =>
                  toast.error("寄送失敗", { description: err.message }),
              })
            }
          />
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
