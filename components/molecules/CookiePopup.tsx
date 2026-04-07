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
    <div
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-40 rounded-2xl p-6 shadow-2xl transition-all duration-500"
      style={{ backgroundColor: "#1A211B", color: "#FDFBF7" }}
    >
      <p className="text-sm leading-relaxed mb-4 font-sans">
        我們使用 Cookie 來提升您的瀏覽體驗。繼續使用本站即表示您同意我們的
        Cookie 政策。
      </p>
      <button
        onClick={handleAccept}
        className="w-full py-2.5 rounded-full text-sm font-medium tracking-wider transition-colors duration-200"
        style={{
          backgroundColor: "#A69B8D",
          color: "#FDFBF7",
        }}
      >
        我了解了
      </button>
    </div>
  );
};

CookiePopup.displayName = "CookiePopup";
export default CookiePopup;
