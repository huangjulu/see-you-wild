"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

import Button from "@/components/ui/atoms/Button";
import Heading from "@/components/ui/atoms/Heading";
import { adminApi } from "@/lib/api/admin.api";
import { useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const AdminReviewContent: React.FC = () => {
  const searchParams = useSearchParams();
  const t = useTranslations("adminReview");

  const id = searchParams.get("id") ?? "";
  const token = searchParams.get("token") ?? "";
  const isDone = searchParams.get("done") === "1";

  const reviewInfoQuery = adminApi.review.useReviewInfo(id, token);
  const submitReviewMutation = adminApi.review.useSubmitReview();

  function handlePaymentReview(status: "paid" | "failed") {
    submitReviewMutation.mutate(
      { id, token, status },
      {
        onSuccess: () => {
          window.history.replaceState(
            {},
            "",
            `${window.location.pathname}?id=${id}&done=1`
          );
        },
      }
    );
  }

  if (isDone || submitReviewMutation.isSuccess) {
    const submittedStatus = submitReviewMutation.variables?.status;
    const resultMessage =
      submittedStatus === "paid"
        ? t("resultPaid")
        : submittedStatus === "failed"
          ? t("resultFailed")
          : t("done");

    return (
      <main
        className={cn(
          "flex min-h-screen items-center justify-center bg-background"
        )}
      >
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-md">
          <p className="text-lg font-semibold text-primary">{resultMessage}</p>
        </div>
      </main>
    );
  }

  if (reviewInfoQuery.isPending) {
    return (
      <main
        className={cn(
          "flex min-h-screen items-center justify-center bg-background"
        )}
      >
        <p className="text-secondary">{t("loading")}</p>
      </main>
    );
  }

  if (reviewInfoQuery.isError) {
    return (
      <main
        className={cn(
          "flex min-h-screen items-center justify-center bg-background"
        )}
      >
        <p className="text-critical">{t("error")}</p>
      </main>
    );
  }

  const info = reviewInfoQuery.data;
  const alreadyReviewed =
    info && (info.status === "paid" || info.status === "failed");

  return (
    <main
      className={cn(
        "flex min-h-screen items-center justify-center bg-background p-4"
      )}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <Heading.H1 className="mb-6 text-xl">{t("title")}</Heading.H1>

        {info && (
          <dl className="mb-8 space-y-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">
                {t("customerName")}
              </dt>
              <dd className="mt-1 text-primary">{info.customerName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">
                {t("eventTitle")}
              </dt>
              <dd className="mt-1 text-primary">{info.eventTitle}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">
                {t("paymentRef")}
              </dt>
              <dd className="mt-1 font-mono text-lg font-bold text-primary">
                {info.paymentRef ?? "—"}
              </dd>
            </div>
          </dl>
        )}

        {alreadyReviewed ? (
          <p className="rounded-lg border border-stroke-default bg-surface p-4 text-center text-secondary">
            {info.status === "paid" ? t("resultPaid") : t("resultFailed")}
          </p>
        ) : (
          <div className="flex gap-3">
            <Button
              theme="solid"
              disabled={submitReviewMutation.isPending}
              onClick={() => handlePaymentReview("paid")}
              className="flex-1 bg-fill-success text-on-fill-neutral hover:opacity-90"
            >
              {t("confirmPaid")}
            </Button>
            <Button
              theme="danger"
              disabled={submitReviewMutation.isPending}
              onClick={() => handlePaymentReview("failed")}
              className="flex-1"
            >
              {t("markFailed")}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

const AdminReviewPage: React.FC = () => {
  return (
    <Suspense>
      <AdminReviewContent />
    </Suspense>
  );
};

AdminReviewContent.displayName = "AdminReviewContent";
AdminReviewPage.displayName = "AdminReviewPage";
export default AdminReviewPage;
