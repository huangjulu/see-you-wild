"use client";

import { X as IconX } from "lucide-react";
import { useEffect, useState } from "react";

import { useTranslations } from "@/lib/i18n/client";

const CookiePopup: React.FC = () => {
  const t = useTranslations("common");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(function checkCookieConsent() {
    const dismissed = localStorage.getItem("cookie-consent");
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  function onAcceptClick() {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 w-full bg-surface-deep/95 backdrop-blur-sm z-40 flex items-center justify-center gap-8 py-4 px-6">
      <p className="typo-overline text-on-surface-brand/80 text-center">
        {t("cookie.message")}
      </p>
      <div className="flex items-center gap-6">
        <button
          onClick={onAcceptClick}
          className="typo-overline text-on-surface-brand/80 border-b border-surface-deep-fg/30 pb-0.5 hover:border-surface-deep-fg transition-colors"
        >
          {t("cookie.accept")}
        </button>
        <button onClick={onAcceptClick} aria-label="Close cookie notice">
          <IconX className="w-4 h-4 text-on-surface-brand/50 hover:text-on-surface-brand/80 transition-opacity" />
        </button>
      </div>
    </div>
  );
};

CookiePopup.displayName = "CookiePopup";
export default CookiePopup;
