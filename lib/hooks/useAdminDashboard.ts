import { useReducer } from "react";

import type { EventListDto, RegistrationAdminDto } from "@/lib/types/database";

export interface FlatRegistration extends RegistrationAdminDto {
  eventId: string;
  eventTitle: string;
}

type ModalState =
  | { type: "none" }
  | { type: "createEvent" }
  | { type: "editEvent"; event: EventListDto }
  | { type: "deleteEvent"; event: EventListDto }
  | { type: "createRegistration" }
  | { type: "editRegistration"; registration: RegistrationAdminDto }
  | { type: "deleteRegistration"; registration: FlatRegistration }
  | { type: "reviewPayment"; registration: FlatRegistration };

export interface AdminDashboardState {
  selectedEventId: string | null;
  searchQuery: string;
  modal: ModalState;
}

export type AdminDashboardAction =
  | { type: "SELECT_EVENT"; eventId: string | null }
  | { type: "SET_SEARCH"; query: string }
  | { type: "OPEN_CREATE_EVENT" }
  | { type: "OPEN_EDIT_EVENT"; event: EventListDto }
  | { type: "OPEN_DELETE_EVENT"; event: EventListDto }
  | { type: "OPEN_CREATE_REGISTRATION" }
  | { type: "OPEN_EDIT_REGISTRATION"; registration: RegistrationAdminDto }
  | { type: "OPEN_DELETE_REGISTRATION"; registration: FlatRegistration }
  | { type: "OPEN_REVIEW_PAYMENT"; registration: FlatRegistration }
  | { type: "CLOSE_MODAL" };

const initialState: AdminDashboardState = {
  selectedEventId: null,
  searchQuery: "",
  modal: { type: "none" },
};

function reducer(
  state: AdminDashboardState,
  action: AdminDashboardAction
): AdminDashboardState {
  switch (action.type) {
    case "SELECT_EVENT":
      return { ...state, selectedEventId: action.eventId };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.query };
    case "OPEN_CREATE_EVENT":
      return { ...state, modal: { type: "createEvent" } };
    case "OPEN_EDIT_EVENT":
      return { ...state, modal: { type: "editEvent", event: action.event } };
    case "OPEN_DELETE_EVENT":
      return { ...state, modal: { type: "deleteEvent", event: action.event } };
    case "OPEN_CREATE_REGISTRATION":
      return { ...state, modal: { type: "createRegistration" } };
    case "OPEN_EDIT_REGISTRATION":
      return {
        ...state,
        modal: {
          type: "editRegistration",
          registration: action.registration,
        },
      };
    case "OPEN_DELETE_REGISTRATION":
      return {
        ...state,
        modal: {
          type: "deleteRegistration",
          registration: action.registration,
        },
      };
    case "OPEN_REVIEW_PAYMENT":
      return {
        ...state,
        modal: { type: "reviewPayment", registration: action.registration },
      };
    case "CLOSE_MODAL":
      return { ...state, modal: { type: "none" } };
  }
}

export interface UseAdminDashboardReturn {
  state: AdminDashboardState;
  dispatch: React.Dispatch<AdminDashboardAction>;
  isModalOpen: (type: ModalState["type"]) => boolean;
}

function useAdminDashboard(): UseAdminDashboardReturn {
  const [state, dispatch] = useReducer(reducer, initialState);

  function isModalOpen(type: ModalState["type"]): boolean {
    return state.modal.type === type;
  }

  return { state, dispatch, isModalOpen };
}

export default useAdminDashboard;
