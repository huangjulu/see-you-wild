import { useMutation } from "@tanstack/react-query";

import { createSupabaseBrowser } from "@/lib/supabase/browser";

interface LoginInput {
  email: string;
  password: string;
}

async function signInWithPassword(input: LoginInput): Promise<void> {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) {
    throw new Error(error.message);
  }
}

export const authApi = {
  useLogin: () =>
    useMutation<void, Error, LoginInput>({
      mutationFn: signInWithPassword,
      onSuccess: () => {
        window.location.href = window.location.pathname.replace("/login", "");
      },
    }),
};
