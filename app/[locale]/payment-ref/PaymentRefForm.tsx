"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import Button from "@/components/ui/atoms/Button";
import Input from "@/components/ui/atoms/Input";
import { useTranslations } from "@/lib/i18n/client";
import { paymentAccount } from "@/lib/payment";
import { cn } from "@/lib/utils";

interface PaymentRefInfo {
  name: string;
  amount_due: number;
  expires_at: string;
  payment_ref: string | null;
  status: string;
  event_title: string;
}

type FormState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "already_submitted"; name: string; eventTitle: string }
  | { kind: "form"; info: PaymentRefInfo }
  | { kind: "success" };

const PaymentRefForm: React.FC = () => {
  const searchParams = useSearchParams();
  const t = useTranslations("paymentRef");
  const [state, setState] = useState<FormState>({ kind: "loading" });
  const [inputValue, setInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const id = searchParams.get("id");
  const token = searchParams.get("token");

  useEffect(
    function fetchPaymentRefInfo() {
      if (!id || !token) {
        setState({ kind: "error", message: t("invalidLink") });
        return;
      }

      const validId = id;
      const validToken = token;

      async function load() {
        const res = await fetch(
          `/api/registrations/${validId}/payment-ref-info?token=${encodeURIComponent(validToken)}`
        );

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const errorMessage =
            res.status === 403
              ? t("invalidToken")
              : res.status === 404
                ? t("notFound")
                : t("loadError");
          setState({ kind: "error", message: body?.error ?? errorMessage });
          return;
        }

        const info: PaymentRefInfo = await res.json();

        if (info.payment_ref) {
          setState({
            kind: "already_submitted",
            name: info.name,
            eventTitle: info.event_title,
          });
          return;
        }

        setState({ kind: "form", info });
      }

      load();
    },
    [id, token]
  );

  async function handlePaymentRefSubmit() {
    if (!id || !token || inputValue.length !== 5) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/registrations/${id}/payment-ref`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_ref: inputValue, token }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const errorMessage =
          res.status === 403
            ? t("invalidToken")
            : res.status === 409
              ? t("alreadyPaid")
              : res.status === 410
                ? t("expired")
                : t("submitError");
        setState({ kind: "error", message: body?.error ?? errorMessage });
        return;
      }

      setState({ kind: "success" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className={cn(
        "mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-4 py-12"
      )}
    >
      {state.kind === "loading" && (
        <p className="typo-body text-secondary">{t("loading")}</p>
      )}

      {state.kind === "error" && (
        <div className="w-full rounded-lg border border-stroke-critical bg-red-50 p-6 text-center">
          <p className="typo-body text-critical">{state.message}</p>
        </div>
      )}

      {state.kind === "already_submitted" && (
        <div className="w-full rounded-lg border border-stroke-default bg-surface p-6 text-center">
          <p className="typo-heading-3 mb-2 text-primary">{state.eventTitle}</p>
          <p className="typo-body text-secondary">{state.name}</p>
          <p className="typo-body mt-4 text-primary">{t("alreadySubmitted")}</p>
        </div>
      )}

      {state.kind === "form" && (
        <div className="w-full space-y-6">
          <div className="text-center">
            <h1 className="typo-heading-2 text-primary">{t("title")}</h1>
            <p className="typo-body mt-1 text-secondary">
              {state.info.event_title}
            </p>
          </div>

          <div className="rounded-lg border border-stroke-default bg-white p-4 space-y-2">
            <div className="flex justify-between">
              <span className="typo-body text-secondary">{t("name")}</span>
              <span className="typo-body text-primary">{state.info.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="typo-body text-secondary">{t("amountDue")}</span>
              <span className="typo-body font-semibold text-primary">
                NT$ {state.info.amount_due.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="typo-body text-secondary">{t("expiresAt")}</span>
              <span className="typo-body text-primary">
                {new Date(state.info.expires_at).toLocaleDateString("zh-TW", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-stroke-default bg-white p-4 space-y-1">
            <p className="typo-ui text-sm text-disabled">{t("bankInfo")}</p>
            <p className="typo-body text-primary">
              {paymentAccount.bankName} — {paymentAccount.bankAccount}
            </p>
            <p className="typo-body text-primary">
              {paymentAccount.accountHolder}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="payment-ref" className="typo-body text-primary">
              {t("inputLabel")}
            </label>
            <Input
              id="payment-ref"
              inputMode="numeric"
              pattern="\d{5}"
              maxLength={5}
              placeholder={t("inputPlaceholder")}
              value={inputValue}
              onChange={(e) =>
                setInputValue(e.currentTarget.value.replace(/\D/g, ""))
              }
              required
            />
            <p className="typo-ui text-sm text-disabled">{t("inputHint")}</p>
          </div>

          <Button
            theme="solid"
            className="w-full"
            onClick={handlePaymentRefSubmit}
            disabled={inputValue.length !== 5 || submitting}
          >
            {submitting ? t("submitting") : t("submit")}
          </Button>
        </div>
      )}

      {state.kind === "success" && (
        <div className="w-full rounded-lg border border-stroke-success bg-green-50 p-6 text-center">
          <p className="typo-body text-primary">{t("successMessage")}</p>
        </div>
      )}
    </main>
  );
};

PaymentRefForm.displayName = "PaymentRefForm";
export default PaymentRefForm;
