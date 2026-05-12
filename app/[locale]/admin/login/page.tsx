"use client";

import React, { useState } from "react";

import Button from "@/components/ui/atoms/Button";
import Heading from "@/components/ui/atoms/Heading";
import Input from "@/components/ui/atoms/Input";
import { useTranslations } from "@/lib/i18n/client";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const AdminLoginPage: React.FC = () => {
  const t = useTranslations("adminLogin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowser();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(t("error"));
      setLoading(false);
      return;
    }

    window.location.href = window.location.pathname.replace("/login", "");
  }

  return (
    <main
      className={cn(
        "flex flex-1 h-screen items-center justify-center bg-background p-4"
      )}
    >
      <form
        onSubmit={handleLoginSubmit}
        className="w-full max-w-sm space-y-6 rounded-xl border border-stroke-default bg-white p-8 shadow-md"
      >
        <div className="flex flex-col items-center gap-3">
          <img
            src="/icons/logo.png"
            alt="See You Wild"
            className="size-16 rounded-xl object-contain"
          />
          <Heading.H1 variant="sub-heading">{t("title")}</Heading.H1>
        </div>

        <Input
          label={t("email")}
          type="email"
          name="email"
          autoComplete="username"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input.Password
          label={t("password")}
          name="password"
          autoComplete="current-password"
          placeholder={t("passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error != null && (
          <p className="typo-ui text-sm text-critical">{error}</p>
        )}

        <Button theme="solid" disabled={loading} className="w-full">
          {loading ? "..." : t("submit")}
        </Button>
      </form>
    </main>
  );
};

AdminLoginPage.displayName = "AdminLoginPage";
export default AdminLoginPage;
