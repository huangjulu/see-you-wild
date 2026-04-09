"use client";

import { useState, useEffect } from "react";

const CookiePopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("cookie-consent");
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 md:left-auto md:right-6 md:max-w-sm z-40 rounded-2xl p-6 shadow-2xl transition-all duration-500 bg-neutral-950 text-neutral-50">
      <p className="typo-body text-sm leading-relaxed mb-4">
        我們使用 Cookie 來提升您的瀏覽體驗。繼續使用本站即表示您同意我們的
        Cookie 政策。
      </p>
      <button
        onClick={handleAccept}
        className="typo-ui w-full py-2.5 rounded-full text-sm tracking-wider transition-colors duration-200 bg-neutral-400 text-neutral-50"
      >
        我了解了
      </button>
    </div>
  );
};

CookiePopup.displayName = "CookiePopup";
export default CookiePopup;
