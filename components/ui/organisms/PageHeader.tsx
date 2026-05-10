"use client";

import { Menu as IconMenu } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/atoms/Button";
import Logo from "@/components/ui/atoms/Logo";
import MobileNav from "@/components/ui/organisms/MobileNav";
import { NAV_LINKS } from "@/lib/constants";
import { useTranslations } from "@/lib/i18n/client";
import { Link } from "@/lib/i18n/navigation";

const NAV_LINK_CLASS =
  "text-sm hover:[text-shadow:0_0.5px_16px_color-mix(in_srgb,var(--color-brand-800)_80%,transparent)] hover:text-white focus-visible:opacity-100 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-current rounded-sm";

const PageHeader: React.FC = () => {
  const t = useTranslations("common");
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: t("nav.about"), href: NAV_LINKS.about },
    { label: t("nav.contact"), href: NAV_LINKS.contact },
  ];

  return (
    <>
      <header
        id="page-header"
        className="fixed top-0 left-0 right-0 z-99 px-10 md:px-16 bg-linear-180 from-surface-deep/25 from-0% to-surface-brand/20 to-200% backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between text-white text-shadow-md">
          <Link
            href="/"
            className="flex items-center gap-3 -translate-x-2"
            aria-label={t("siteName")}
          >
            <Logo size="sm" />
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
              className="ml-2 rounded-full px-5 py-1.5 text-sm tracking-widest border-accent bg-brand-500 hover:bg-brand-400 text-white hover:shadow-none"
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

PageHeader.displayName = "PageHeader";
export default PageHeader;
