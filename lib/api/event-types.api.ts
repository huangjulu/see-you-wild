import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { EventTypeRow } from "@/lib/types/database";

interface ApiError {
  error: string;
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (response.ok) {
    return response.json();
  }

  const body: ApiError | null = await response.json().catch(() => null);
  throw new Error(body?.error ?? `Request failed: ${response.status}`);
}

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
