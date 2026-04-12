"use client";

import React, { useState, useEffect } from "react";
import { Menu as IconMenu, X as IconX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/i18n/client";
import Logo from "@/components/atoms/Logo";
import NavLink from "@/components/molecules/NavLink";
import { NAV_ANCHORS } from "@/lib/constants";

const Header: React.FC = () => {
  const t = useTranslations("common");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(function trackScroll() {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: t("nav.privateGroup"), href: NAV_ANCHORS.privateGroup },
    { label: t("nav.contact"), href: NAV_ANCHORS.contact },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-surface-deep/80 backdrop-blur-md border-b border-surface-deep-fg/10"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div
        className={cn(
          "max-w-6xl mx-auto px-4 h-16 flex items-center justify-between transition-colors duration-500",
          scrolled ? "text-surface-deep-fg" : "text-white"
        )}
      >
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
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <IconX size={24} /> : <IconMenu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          className="md:hidden bg-background/95 backdrop-blur-md border-t border-border/30 px-4 py-4 flex flex-col gap-4 text-foreground"
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
