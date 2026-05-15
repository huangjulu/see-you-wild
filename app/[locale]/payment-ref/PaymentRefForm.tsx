"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/atoms/Button";
import Heading from "@/components/ui/atoms/Heading";
import Input from "@/components/ui/atoms/Input";
import { paymentRefApi } from "@/lib/api/payment-ref.api";
import { useTranslations } from "@/lib/i18n/client";
import { paymentAccount } from "@/lib/payment";
import { cn } from "@/lib/utils";

const PaymentRefForm = () => {
  const searchParams = useSearchParams();
  const t = useTranslations("paymentRef");
  const [inputValue, setInputValue] = useState("");

  const id = searchParams.get("id");
  const token = searchParams.get("token");

  const infoQuery = paymentRefApi.useInfo(id, token);
  const submitMutation = paymentRefApi.useSubmit();

  const missingParams = id == null || token == null;

  function handlePaymentRefSubmit() {
    if (id == null || token == null || inputValue.length !== 5) return;
    submitMutation.mutate({ id, token, payment_ref: inputValue });
  }

  return (
    <main
      className={cn(
        "mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-4 py-12"
      )}
    >
      {missingParams && (
        <div className="w-full rounded-lg border border-stroke-critical bg-red-50 p-6 text-center">
          <p className="typo-body text-critical">{t("invalidLink")}</p>
        </div>
      )}

      {!missingParams && infoQuery.isLoading && (
        <p className="typo-body text-secondary">{t("loading")}</p>
      )}

      {!missingParams && infoQuery.isError && (
        <div className="w-full rounded-lg border border-stroke-critical bg-red-50 p-6 text-center">
          <p className="typo-body text-critical">{infoQuery.error.message}</p>
        </div>
      )}

      {!missingParams && submitMutation.isError && (
        <div className="w-full rounded-lg border border-stroke-critical bg-red-50 p-6 text-center">
          <p className="typo-body text-critical">
            {submitMutation.error.message}
          </p>
        </div>
      )}

      {!missingParams &&
        infoQuery.data?.payment_ref != null &&
        !submitMutation.isSuccess && (
          <div className="w-full rounded-lg border border-stroke-default bg-surface p-6 text-center">
            <p className="typo-heading-3 mb-2 text-primary">
              {infoQuery.data.event_title}
            </p>
            <p className="typo-body text-secondary">{infoQuery.data.name}</p>
            <p className="typo-body mt-4 text-primary">
              {t("alreadySubmitted")}
            </p>
          </div>
        )}

      {!missingParams &&
        infoQuery.data != null &&
        infoQuery.data.payment_ref == null &&
        !submitMutation.isSuccess && (
          <div className="w-full space-y-6">
            <div className="text-center">
              <Heading.H1
                variant="sub-heading"
                description={infoQuery.data.event_title}
              >
                {t("title")}
              </Heading.H1>
            </div>

            <div className="rounded-lg border border-stroke-default bg-white p-4 space-y-2">
              <div className="flex justify-between">
                <span className="typo-body text-secondary">{t("name")}</span>
                <span className="typo-body text-primary">
                  {infoQuery.data.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="typo-body text-secondary">
                  {t("amountDue")}
                </span>
                <span className="typo-body font-semibold text-primary">
                  NT$ {infoQuery.data.amount_due.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="typo-body text-secondary">
                  {t("expiresAt")}
                </span>
                <span className="typo-body text-primary">
                  {new Date(infoQuery.data.expires_at).toLocaleDateString(
                    "zh-TW",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
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
              disabled={inputValue.length !== 5 || submitMutation.isPending}
            >
              {submitMutation.isPending ? t("submitting") : t("submit")}
            </Button>
          </div>
        )}

      {submitMutation.isSuccess && (
        <div className="w-full rounded-lg border border-stroke-success bg-green-50 p-6 text-center">
          <p className="typo-body text-primary">{t("successMessage")}</p>
        </div>
      )}
    </main>
  );
};

PaymentRefForm.displayName = "PaymentRefForm";
export default PaymentRefForm;
