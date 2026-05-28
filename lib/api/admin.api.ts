// lib/api/admin.api.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type ApiError, apiFetch } from "@/lib/api/api-fetch";
import type {
  EventListDto,
  EventRow,
  RegistrationDetailDto,
  RegistrationRow,
} from "@/lib/types/database";
import type {
  CreateEventInput,
  UpdateEventInput,
} from "@/lib/validations/events";
import type {
  CreateRegistrationInput,
  UpdateRegistrationInput,
} from "@/lib/validations/registrations";

interface ReviewInfo {
  customerName: string;
  eventTitle: string;
  paymentRef: string | null;
  status: string;
}

export const adminApi = {
  events: {
    useList: () =>
      useQuery<EventListDto[]>({
        queryKey: ["admin", "events"],
        queryFn: () => apiFetch<EventListDto[]>("/api/events"),
      }),

    useCreate: () => {
      const queryClient = useQueryClient();
      return useMutation<EventRow, Error, CreateEventInput>({
        mutationFn: (data) =>
          apiFetch<EventRow>("/api/events", {
            method: "POST",
            body: JSON.stringify(data),
          }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
        },
      });
    },

    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation<
        EventRow,
        Error,
        { eventId: string; data: UpdateEventInput }
      >({
        mutationFn: ({ eventId, data }) =>
          apiFetch<EventRow>(`/api/events/${eventId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
        },
      });
    },

    useDelete: () => {
      const queryClient = useQueryClient();
      return useMutation<
        { deleted: boolean },
        Error,
        { eventId: string; cancellationReason: string }
      >({
        mutationFn: ({ eventId, cancellationReason }) =>
          apiFetch<{ deleted: boolean }>(`/api/events/${eventId}`, {
            method: "DELETE",
            body: JSON.stringify({
              cancellation_reason: cancellationReason,
            }),
          }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
        },
      });
    },
  },

  uploadImage: () => {
    return useMutation<{ url: string }, Error, File>({
      mutationFn: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          return response.json();
        }
        const body: ApiError | null = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Upload failed");
      },
    });
  },

  registrations: {
    useCreate: () => {
      const queryClient = useQueryClient();
      return useMutation<RegistrationRow, Error, CreateRegistrationInput>({
        mutationFn: (data) =>
          apiFetch<RegistrationRow>("/api/admin/registrations", {
            method: "POST",
            body: JSON.stringify(data),
          }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
        },
      });
    },

    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation<
        RegistrationRow,
        Error,
        { id: string; data: UpdateRegistrationInput }
      >({
        mutationFn: ({ id, data }) =>
          apiFetch<RegistrationRow>(`/api/admin/registrations/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
        },
      });
    },

    useConfirmPayment: () => {
      const queryClient = useQueryClient();
      return useMutation<RegistrationRow, Error, string>({
        mutationFn: (registrationId) =>
          apiFetch<RegistrationRow>(
            `/api/admin/registrations/${registrationId}`,
            {
              method: "PATCH",
              body: JSON.stringify({ status: "paid" }),
            }
          ),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
        },
      });
    },

    useDelete: () => {
      const queryClient = useQueryClient();
      return useMutation<{ deleted: boolean }, Error, string>({
        mutationFn: (registrationId) =>
          apiFetch<{ deleted: boolean }>(
            `/api/admin/registrations/${registrationId}`,
            { method: "DELETE" }
          ),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
        },
      });
    },

    useResendEmail: () => {
      return useMutation<{ sent: boolean }, Error, string>({
        mutationFn: (registrationId) =>
          apiFetch<{ sent: boolean }>(
            `/api/admin/registrations/${registrationId}/resend-email`,
            { method: "POST" }
          ),
      });
    },

    useDetail: (id: string | null) =>
      useQuery<RegistrationDetailDto>({
        queryKey: ["admin", "registrations", id],
        queryFn: () =>
          apiFetch<RegistrationDetailDto>(`/api/admin/registrations/${id}`),
        enabled: id != null,
      }),
  },

  review: {
    useReviewInfo: (id: string, token: string) =>
      useQuery<ReviewInfo>({
        queryKey: ["admin", "review", id],
        queryFn: () =>
          apiFetch<ReviewInfo>(
            `/api/admin/registrations/${id}/review-info?token=${encodeURIComponent(token)}`
          ),
        enabled: id !== "" && token !== "",
      }),

    useSubmitReview: () => {
      return useMutation<
        unknown,
        Error,
        { id: string; token: string; status: "paid" | "failed" }
      >({
        mutationFn: ({ id, token, status }) =>
          apiFetch(`/api/admin/registrations/${id}/review`, {
            method: "PATCH",
            body: JSON.stringify({ token, status }),
          }),
      });
    },
  },
};
