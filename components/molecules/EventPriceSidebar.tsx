"use client";

import React from "react";
import { useTranslations } from "@/lib/i18n/client";
import Button from "@/components/atoms/Button";

interface EventPriceSidebarProps {
  basePrice: number;
  carpoolSurcharge: number;
  isSelfArrival: boolean;
  allOptionsSelected: boolean;
  isSidebarAtOrigin: boolean;
  isInView: boolean;
  onScrollToOptions: () => void;
  onBook: () => void;
}

const EventPriceSidebar: React.FC<EventPriceSidebarProps> = (props) => {
  const t = useTranslations("eventDetail");
  const totalPrice =
    props.basePrice + (props.isSelfArrival ? 0 : props.carpoolSurcharge);
  const formattedPrice = totalPrice.toLocaleString("zh-TW");

  // Wireframe CTA logic:
  // - Sidebar at origin (not sticking yet) → "查看可選日期" → scroll to calendar
  // - Sidebar floating (sticking) → "立即預約" → disabled until all options filled
  const desktopIsOrigin = props.isSidebarAtOrigin;
  const desktopCtaLabel = desktopIsOrigin ? t("checkDates") : t("bookNow");
  const desktopDisabled = !desktopIsOrigin && !props.allOptionsSelected;
  const desktopAction = desktopIsOrigin
    ? props.onScrollToOptions
    : props.onBook;

  // Mobile: same logic but based on isInView (PackageOptions visibility)
  const mobileCtaLabel = props.isInView ? t("checkDates") : t("bookNow");
  const mobileDisabled = !props.isInView && !props.allOptionsSelected;
  const mobileAction = props.isInView ? props.onScrollToOptions : props.onBook;

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside className="hidden md:block self-start sticky top-24">
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div>
            <p className="typo-ui text-sm text-muted">{t("price")}</p>
            <p className="typo-heading text-3xl text-foreground">
              NT$ {formattedPrice}
              <span className="typo-body text-sm text-muted ml-1">
                {t("perPerson")}
              </span>
            </p>
          </div>
          {!props.isSelfArrival && props.carpoolSurcharge > 0 && (
            <p className="typo-body text-xs text-muted">
              {t("carpoolIncluded")}{" "}
              {props.carpoolSurcharge.toLocaleString("zh-TW")}
            </p>
          )}
          <Button
            theme="solid"
            className="w-full"
            disabled={desktopDisabled}
            onClick={desktopAction}
          >
            {desktopCtaLabel}
          </Button>
          {desktopDisabled && !desktopIsOrigin && (
            <p className="typo-body text-xs text-center text-muted">
              {t("selectOptionsHint")}
            </p>
          )}
        </div>
      </aside>

      {/* Mobile: fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-background px-4 py-3 flex items-center justify-between">
        <div>
          <p className="typo-heading text-lg text-foreground">
            NT$ {formattedPrice}
          </p>
          <p className="typo-body text-xs text-muted">{t("perPerson")}</p>
        </div>
        <Button theme="solid" disabled={mobileDisabled} onClick={mobileAction}>
          {mobileCtaLabel}
        </Button>
      </div>
    </>
  );
};

EventPriceSidebar.displayName = "EventPriceSidebar";
export default EventPriceSidebar;
