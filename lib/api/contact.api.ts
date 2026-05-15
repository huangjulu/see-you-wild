import { useMutation } from "@tanstack/react-query";

import type { ContactFormInput } from "@/lib/validations/contact";

interface ApiError {
  error: string;
}

async function postContact(data: ContactFormInput): Promise<void> {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body: ApiError | null = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed: ${response.status}`);
  }
}

export const contactApi = {
  useSubmit: () =>
    useMutation<void, Error, ContactFormInput>({
      mutationFn: postContact,
    }),
};
