"use client";

import { Menu as IconMenu, X as IconX } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/atoms/Button";
import Logo from "@/components/ui/atoms/Logo";
import { NAV_ANCHORS } from "@/lib/constants";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const NAV_LINK_CLASS =
  "text-sm hover:[text-shadow:0_0.5px_16px_color-mix(in_srgb,var(--color-brand-800)_80%,transparent)] hover:text-white focus-visible:opacity-100 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-current rounded-sm";

const PageHeader: React.FC = () => {
  const t = useTranslations("common");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: t("nav.events"), href: NAV_ANCHORS.events },
    { label: t("nav.contact"), href: NAV_ANCHORS.contact },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 bg-linear-180 from-surface-deep/25 from-0% to-surface-brand/20 to-200% backdrop-blur-sm">
      <div className="max-w-6xl mx-auto h-16 flex items-center justify-between text-white text-shadow-md">
        <a
          href={locale === "zh-TW" ? "/" : `/${locale}`}
          className="flex items-center gap-3"
          aria-label={t("siteName")}
        >
          <Logo size="sm" />
          <span className="font-serif text-lg font-semibold hidden sm:inline [text-shadow:0_0_12px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]">
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
            href="/events"
            className="ml-2 rounded-full px-5 py-1.5 text-sm tracking-widest border-accent bg-brand-500 hover:bg-brand-400 text-white hover:shadow-none"
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
          "md:hidden backdrop-blur-md border-t border-stroke-default/30 px-4 flex flex-col gap-4 text-primary overflow-hidden transition-all duration-300",
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
          href="/events"
          className="typo-ui rounded-full bg-fill-brand px-5 py-2 text-center text-xs tracking-widest text-on-fill-brand transition-all duration-300 hover:bg-brand-500"
          onClick={() => setMenuOpen(false)}
        >
          {t("nav.exploreCta")}
        </a>
      </nav>
    </header>
  );
};

PageHeader.displayName = "PageHeader";
export default PageHeader;
