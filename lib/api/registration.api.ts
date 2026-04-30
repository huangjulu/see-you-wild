import type { RegistrationRow } from "@/lib/types/database";
import type { CreateRegistrationInput } from "@/lib/validations/registrations";

interface ApiError {
  error: string;
}

export const registrationApi = {
  create: async (data: CreateRegistrationInput): Promise<RegistrationRow> => {
    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return response.json();
    }

    const body: ApiError | null = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Registration failed");
  },
};
