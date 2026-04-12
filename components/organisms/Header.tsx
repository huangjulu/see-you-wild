"use client";

import React, { useState } from "react";
import { Menu as IconMenu, X as IconX } from "lucide-react";
import { useTranslations, useLocale } from "@/lib/i18n/client";
import Logo from "@/components/atoms/Logo";
import NavLink from "@/components/molecules/NavLink";
import { NAV_ANCHORS } from "@/lib/constants";

const Header: React.FC = () => {
  const t = useTranslations("common");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: t("nav.events"), href: NAV_ANCHORS.events },
    { label: t("nav.privateGroup"), href: NAV_ANCHORS.privateGroup },
    { label: t("nav.contact"), href: NAV_ANCHORS.contact },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a
          href={locale === "zh-TW" ? "/" : `/${locale}`}
          className="flex items-center gap-3"
          aria-label={t("siteName")}
        >
          <Logo size="sm" />
          <span className="font-serif text-lg font-semibold hidden sm:inline">
            {t("siteName")}
          </span>
        </a>

        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <IconX size={24} /> : <IconMenu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          className="md:hidden bg-background/95 backdrop-blur-md border-t border-white/10 px-4 py-4 flex flex-col gap-4"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              onClick={() => setMenuOpen(false)}
            />
          ))}
        </nav>
      )}
    </header>
  );
};

Header.displayName = "Header";
export default Header;
