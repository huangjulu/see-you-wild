import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/api-fetch";
import type { RegistrationRow } from "@/lib/types/database";
import type { CreateRegistrationInput } from "@/lib/validations/registrations";

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
