"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/atoms/Button";

type ReviewStatus = "loading" | "ready" | "submitting" | "done" | "error";

interface ReviewInfo {
  customerName: string;
  eventTitle: string;
  paymentRef: string | null;
  status: string;
}

const AdminReviewContent: React.FC = () => {
  const searchParams = useSearchParams();
  const t = useTranslations("adminReview");

  const id = searchParams.get("id") ?? "";
  const token = searchParams.get("token") ?? "";

  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>("loading");
  const [info, setInfo] = useState<ReviewInfo | null>(null);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(function fetchReviewInfo() {
    if (!id || !token) {
      const url = new URL(window.location.href);
      if (url.searchParams.get("done") === "1") {
        setReviewStatus("done");
      } else {
        setReviewStatus("error");
      }
      return;
    }

    fetch(`/api/admin/registrations/${id}/review-info?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: ReviewInfo) => {
        setInfo(data);
        setReviewStatus("ready");
      })
      .catch(() => {
        setReviewStatus("error");
      });
  }, [id, token]);

  function handleReview(status: "paid" | "failed") {
    setReviewStatus("submitting");

    fetch(`/api/admin/registrations/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, status }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to submit");
        return res.json();
      })
      .then(() => {
        setResultMessage(
          status === "paid" ? t("resultPaid") : t("resultFailed")
        );
        setReviewStatus("done");

        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}?id=${id}&done=1`
        );
      })
      .catch(() => {
        setReviewStatus("error");
      });
  }

  const alreadyReviewed = info != null && (info.status === "paid" || info.status === "failed");

  if (reviewStatus === "loading") {
    return (
      <main className={cn("flex min-h-screen items-center justify-center bg-background")}>
        <p className="text-secondary">{t("loading")}</p>
      </main>
    );
  }

  if (reviewStatus === "error") {
    return (
      <main className={cn("flex min-h-screen items-center justify-center bg-background")}>
        <p className="text-critical">{t("error")}</p>
      </main>
    );
  }

  if (reviewStatus === "done") {
    return (
      <main className={cn("flex min-h-screen items-center justify-center bg-background")}>
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-md">
          <p className="text-lg font-semibold text-primary">{resultMessage}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={cn("flex min-h-screen items-center justify-center bg-background p-4")}>
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-xl font-bold text-primary">{t("title")}</h1>

        {info != null && (
          <dl className="mb-8 space-y-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">{t("customerName")}</dt>
              <dd className="mt-1 text-primary">{info.customerName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">{t("eventTitle")}</dt>
              <dd className="mt-1 text-primary">{info.eventTitle}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">{t("paymentRef")}</dt>
              <dd className="mt-1 font-mono text-lg font-bold text-primary">{info.paymentRef ?? "—"}</dd>
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
              disabled={reviewStatus === "submitting"}
              onClick={() => handleReview("paid")}
              className="flex-1 bg-fill-success text-on-fill-neutral hover:opacity-90"
            >
              {t("confirmPaid")}
            </Button>
            <Button
              theme="danger"
              disabled={reviewStatus === "submitting"}
              onClick={() => handleReview("failed")}
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
