"use client";

import { Menu as IconMenu } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/atoms/Button";
import Logo from "@/components/ui/atoms/Logo";
import MobileNav from "@/components/ui/organisms/MobileNav";
import { NAV_LINKS } from "@/lib/constants";
import { useScrolled } from "@/lib/hooks/useScrolled";
import { useTranslations } from "@/lib/i18n/client";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV_LINK_CLASS =
  "text-sm hover:[text-shadow:0_0.5px_16px_color-mix(in_srgb,var(--color-brand-800)_80%,transparent)] hover:text-white focus-visible:opacity-100 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-current rounded-sm";

const HomeHeader = () => {
  const t = useTranslations("common");
  const scrolled = useScrolled(50);

  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.contact"), href: NAV_LINKS.contact },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-10 md:px-16 transition-all duration-500",
          scrolled
            ? "bg-linear-180 from-surface-deep/25 from-0% to-surface-brand/20 to-200% backdrop-blur-sm"
            : "bg-transparent border-transparent"
        )}
      >
        <div
          className={cn(
            "max-w-6xl mx-auto h-16 flex items-center justify-between transition-colors",
            scrolled ? "text-white text-shadow-md" : "text-on-surface-brand"
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-3 -translate-x-2"
            aria-label={t("siteName")}
          >
            <span className="font-serif text-lg font-semibold hidden sm:inline [text-shadow:0_0_12px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]">
              {t("siteName")}
            </span>
          </Link>
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
              className={cn(
                "ml-2 rounded-full px-5 py-1.5 text-sm tracking-widest",
                scrolled
                  ? " border-accent bg-brand-500 hover:bg-brand-400 text-white hover:shadow-none"
                  : "text-on-surface-brand ring-1 ring-on-surface-deep"
              )}
            >
              {t("nav.exploreCta")}
            </Button>
          </nav>

          <button
            className="md:hidden p-2.5"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <IconMenu size={24} />
          </button>
        </div>
      </header>

      <MobileNav
        open={menuOpen}
        onOpenChange={setMenuOpen}
        navLinks={navLinks}
        ctaLabel={t("nav.exploreCta")}
        ctaHref="/events"
      />
    </>
  );
};

HomeHeader.displayName = "HomeHeader";
export default HomeHeader;
