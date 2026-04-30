"use client";

import Button from "@/components/ui/atoms/Button";
import { useTranslations } from "@/lib/i18n/client";

interface EventPriceSidebarProps {
  basePrice: number;
  carpoolSurcharge: number;
  isSelfArrival: boolean;
  allOptionsSelected: boolean;
  selectedDate: string | null;
  onBook: () => void;
}

const EventPriceSidebar: React.FC<EventPriceSidebarProps> = (props) => {
  const t = useTranslations("eventDetail");
  const totalPrice =
    props.basePrice + (props.isSelfArrival ? 0 : props.carpoolSurcharge);
  const formattedPrice = totalPrice.toLocaleString("zh-TW");
  const dateLabel = formatSelectedDate(props.selectedDate);
  const disabled = !props.allOptionsSelected;

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside className="hidden md:block self-start sticky top-24">
        <div className="rounded-2xl border border-stroke-default bg-white p-6 space-y-4 shadow-sm">
          <div>
            <p className="typo-ui text-sm text-secondary">{t("price")}</p>
            <p className="typo-heading text-3xl text-primary">
              NT$ {formattedPrice}
              <span className="typo-body text-sm text-secondary ml-1">
                {t("perPerson")}
              </span>
            </p>
          </div>
          {!props.isSelfArrival && props.carpoolSurcharge > 0 && (
            <p className="typo-body text-xs text-secondary">
              {t("carpoolIncluded")}{" "}
              {props.carpoolSurcharge.toLocaleString("zh-TW")}
            </p>
          )}
          <Button
            theme="solid"
            className="w-full"
            disabled={disabled}
            onClick={props.onBook}
          >
            <span>{t("bookNow")}</span>
            {dateLabel != null && (
              <span className="pl-2 typo-body opacity-80">{dateLabel}</span>
            )}
          </Button>
          {disabled && (
            <p className="typo-body text-xs text-center text-secondary">
              {t("selectOptionsHint")}
            </p>
          )}
        </div>
      </aside>

      {/* Mobile: fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-stroke-default bg-background px-4 py-3 flex items-center justify-between">
        <div>
          <p className="typo-heading text-lg text-primary">
            NT$ {formattedPrice}
          </p>
          <p className="typo-body text-xs text-secondary">{t("perPerson")}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {dateLabel != null && (
            <p className="typo-body text-sm text-secondary">{dateLabel}</p>
          )}
          <Button theme="solid" disabled={disabled} onClick={props.onBook}>
            {t("bookNow")}
          </Button>
        </div>
      </div>
    </>
  );
};

EventPriceSidebar.displayName = "EventPriceSidebar";
export default EventPriceSidebar;

const WEEKDAYS_ZH = ["日", "一", "二", "三", "四", "五", "六"];

function formatSelectedDate(iso: string | null): string | null {
  if (iso == null) return null;
  const d = new Date(iso + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAYS_ZH[d.getDay()]})`;
}
