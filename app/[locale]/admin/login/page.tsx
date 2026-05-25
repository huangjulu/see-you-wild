"use client";

import { useState } from "react";

import Button from "@/components/ui/atoms/Button";
import Heading from "@/components/ui/atoms/Heading";
import Input from "@/components/ui/atoms/Input";
import { authApi } from "@/lib/api/auth.api";
import { useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const AdminLoginPage = () => {
  const t = useTranslations("adminLogin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = authApi.useLogin();

  function handleLoginSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    loginMutation.mutate({ email, password });
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

        {loginMutation.error != null && (
          <p className="typo-ui text-sm text-critical">{t("error")}</p>
        )}

        <Button
          theme="solid"
          disabled={loginMutation.isPending}
          className="w-full"
        >
          {loginMutation.isPending ? "..." : t("submit")}
        </Button>
      </form>
    </main>
  );
};

AdminLoginPage.displayName = "AdminLoginPage";
export default AdminLoginPage;
