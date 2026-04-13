"use client";

import { useState, useEffect } from "react";
import { Menu as IconMenu, X as IconX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/i18n/client";
import Button from "@/components/atoms/Button";
import Logo from "@/components/atoms/Logo";
import { NAV_ANCHORS } from "@/lib/constants";

const NAV_LINK_CLASS =
  "text-sm hover:[text-shadow:0_0.5px_16px_color-mix(in_srgb,var(--color-primary-800)_80%,transparent)] hover:text-white focus-visible:opacity-100 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-current rounded-sm";

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
    { label: t("nav.events"), href: NAV_ANCHORS.events },
    { label: t("nav.contact"), href: NAV_ANCHORS.contact },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 md:px-12 transition-all duration-500",
        scrolled
          ? "bg-linear-180 from-surface-deep/25 from-0% to-surface-brand/20 to-200% backdrop-blur-sm"
          : "bg-transparent border-transparent"
      )}
    >
      <div
        className={cn(
          "max-w-6xl mx-auto h-16 flex items-center justify-between transition-colors",
          scrolled ? "text-white text-shadow-md" : "text-surface-deep-fg"
        )}
      >
        <a
          href={locale === "zh-TW" ? "/" : `/${locale}`}
          className="flex items-center gap-3"
          aria-label={t("siteName")}
        >
          <Logo size="sm" />
          <span className="font-serif text-lg font-semibold hidden sm:inline [text-shadow:0_0_12px_color-mix(in_srgb,var(--color-accent-fg)_50%,transparent)]">
            {t("siteName")}
          </span>
        </a>

        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Button
              key={link.href}
              theme="link"
              href={link.href}
              underline={false}
              className={NAV_LINK_CLASS}
            >
              {link.label}
            </Button>
          ))}
          <Button
            underline={false}
            theme="link"
            href="/journeys"
            className={cn(
              "ml-2 rounded-full px-5 py-1.5 text-sm tracking-widest",
              scrolled
                ? " border-accent bg-primary-500 hover:bg-primary-400 text-white hover:shadow-none"
                : "text-surface-deep-fg ring-1 ring-surface-deep-fg"
            )}
          >
            {t("nav.exploreCta")}
          </Button>
        </nav>

        <button
          className="md:hidden p-2.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <IconX size={24} /> : <IconMenu size={24} />}
        </button>
      </div>

      <nav
        className={cn(
          "md:hidden  backdrop-blur-md border-t border-border/30 px-4 flex flex-col gap-4 text-foreground overflow-hidden transition-all duration-300",
          menuOpen ? "max-h-60 py-4 opacity-100" : "max-h-0 py-0 opacity-0"
        )}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        {navLinks.map((link) => (
          <Button
            key={link.href}
            theme="link"
            href={link.href}
            underline={false}
            className={NAV_LINK_CLASS}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Button>
        ))}
        <a
          href="/journeys"
          className="typo-ui rounded-full bg-accent px-5 py-2 text-center text-xs tracking-widest text-white transition-all duration-300 hover:bg-accent-hover"
          onClick={() => setMenuOpen(false)}
        >
          {t("nav.exploreCta")}
        </a>
      </nav>
    </header>
  );
};

Header.displayName = "Header";
export default Header;
