import { useMutation } from "@tanstack/react-query";

import type { RegistrationRow } from "@/lib/types/database";
import type { CreateRegistrationInput } from "@/lib/validations/registrations";

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

export const registrationApi = {
  useCreate: () =>
    useMutation<RegistrationRow, Error, CreateRegistrationInput>({
      mutationFn: (data) =>
        apiFetch<RegistrationRow>("/api/registrations", {
          method: "POST",
          body: JSON.stringify(data),
        }),
    }),
};
