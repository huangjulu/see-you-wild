import { useQuery } from "@tanstack/react-query";

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
  useOpenTypes: () =>
    useQuery<string[]>({
      queryKey: ["event-types"],
      queryFn: () => apiFetch<string[]>("/api/event-types"),
    }),
};
