import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/api-fetch";
import type { EventTypeRow } from "@/lib/types/database";

export const eventTypesApi = {
  useAll: () =>
    useQuery<EventTypeRow[]>({
      queryKey: ["event-types"],
      queryFn: () => apiFetch<EventTypeRow[]>("/api/event-types"),
    }),

  useCreate: () => {
    const queryClient = useQueryClient();
    return useMutation<
      EventTypeRow,
      Error,
      { slug: string; name_zh: string; name_en: string }
    >({
      mutationFn: (data) =>
        apiFetch<EventTypeRow>("/api/event-types", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["event-types"] });
      },
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    return useMutation<
      EventTypeRow,
      Error,
      { id: string; slug: string; name_zh: string; name_en: string }
    >({
      mutationFn: ({ id, ...data }) =>
        apiFetch<EventTypeRow>(`/api/event-types/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["event-types"] });
      },
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation<{ deleted: boolean }, Error, string>({
      mutationFn: (id) =>
        apiFetch<{ deleted: boolean }>(`/api/event-types/${id}`, {
          method: "DELETE",
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["event-types"] });
      },
    });
  },
};
