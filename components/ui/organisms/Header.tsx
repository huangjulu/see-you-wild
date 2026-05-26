"use client";

import { Menu as IconMenu, X as IconX } from "lucide-react";
import { useEffect, useState } from "react";

import Button from "@/components/ui/atoms/Button";
import { eventTypesApi } from "@/lib/api/event-types.api";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  LINE_OA_URL,
  NAV_LINKS,
} from "@/lib/constants";
import { useScrolled } from "@/lib/hooks/useScrolled";
import { useTranslations } from "@/lib/i18n/client";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  variant: "home" | "page";
}

interface NavLink {
  label: string;
  href: string;
}

const Header = (props: HeaderProps) => {
  const t = useTranslations("common");
  const scrolled = useScrolled(50);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: eventTypes = [] } = eventTypesApi.useOpenTypes();

  const isHome = props.variant === "home";

  const navLinks: NavLink[] = [
    { label: t("nav.about"), href: isHome ? "#about" : NAV_LINKS.about },
    { label: t("nav.contact"), href: LINE_OA_URL },
  ];

  const ctaLabel = t("nav.exploreCta");

  const headerBg = isHome
    ? scrolled
      ? "bg-linear-180 from-surface-deep/25 from-0% to-surface-brand/20 to-200% backdrop-blur-sm"
      : "bg-transparent border-transparent"
    : "bg-linear-180 from-surface-deep/25 from-0% to-surface-brand/20 to-200% backdrop-blur-sm";

  const textColor = isHome
    ? scrolled
      ? "text-white text-shadow-md"
      : "text-on-surface-brand"
    : "text-white text-shadow-md";

  const ctaStyle =
    isHome && !scrolled
      ? "text-on-surface-brand ring-1 ring-on-surface-deep"
      : "border-accent bg-brand-500 hover:bg-brand-400 text-white hover:shadow-none";

  return (
    <>
      <header
        id="page-header"
        className={cn(
          "fixed top-0 left-0 right-0 z-99 px-8 md:px-16 transition-all duration-500",
          headerBg
        )}
      >
        <div
          className={cn(
            "max-w-6xl mx-auto h-16 flex items-center justify-between transition-colors",
            textColor
          )}
        >
          <Link
            href="/"
            className="font-serif text-lg font-semibold [text-shadow:0_0_12px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]"
            aria-label={t("siteName")}
          >
            See You Wild <span className="tracking-wider">西揪團</span>
          </Link>

          <DesktopMenu
            navLinks={navLinks}
            ctaLabel={ctaLabel}
            ctaStyle={ctaStyle}
          />
          <MobileMenuButton
            menuOpen={menuOpen}
            onOpen={() => setMenuOpen(true)}
          />
        </div>
      </header>

      <MobileDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        navLinks={navLinks}
        siteName={t("siteName")}
        ctaLabel={ctaLabel}
        customConsultLabel={t("nav.customConsult")}
        eventTypesLabel={t("nav.eventTypes")}
        eventTypes={eventTypes}
      />
    </>
  );
};

Header.displayName = "Header";
export default Header;

const NAV_LINK_CLASS =
  "text-sm hover:[text-shadow:0_0.5px_16px_color-mix(in_srgb,var(--color-brand-800)_80%,transparent)] hover:text-white focus-visible:opacity-100 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-current rounded-sm";

interface DesktopMenuProps {
  navLinks: NavLink[];
  ctaLabel: string;
  ctaStyle: string;
}

function DesktopMenu(props: DesktopMenuProps) {
  return (
    <nav
      className="hidden md:flex items-center gap-8"
      aria-label="Main navigation"
    >
      {props.navLinks.map((link) => (
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
          props.ctaStyle
        )}
      >
        {props.ctaLabel}
      </Button>
    </nav>
  );
}

interface MobileMenuButtonProps {
  menuOpen: boolean;
  onOpen: () => void;
}

function MobileMenuButton(props: MobileMenuButtonProps) {
  return (
    <button
      className="md:hidden p-2.5"
      onClick={props.onOpen}
      aria-label="Open menu"
      aria-expanded={props.menuOpen}
    >
      <IconMenu size={24} />
    </button>
  );
}

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navLinks: NavLink[];
  siteName: string;
  ctaLabel: string;
  customConsultLabel: string;
  eventTypesLabel: string;
  eventTypes: string[];
}

function MobileDrawer(props: MobileDrawerProps) {
  useEffect(
    function lockBodyScroll() {
      if (!props.open) return;
      const html = document.documentElement;
      const original = html.style.overflow;
      html.style.overflow = "hidden";
      return () => {
        html.style.overflow = original;
      };
    },
    [props.open]
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-100 bg-black/40 transition-opacity duration-300 md:hidden",
          props.open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => props.onOpenChange(false)}
        aria-hidden="true"
      />

      <nav
        className={cn(
          "fixed top-0 left-0 z-100 h-full w-4/5 max-w-sm flex flex-col bg-surface-deep transition-transform duration-300 ease-out md:hidden",
          props.open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal={props.open}
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between h-16 px-6">
          <span className="font-serif text-lg font-semibold text-on-surface-deep">
            See You Wild <span className="tracking-wider">西揪團</span>
          </span>
          <button
            onClick={() => props.onOpenChange(false)}
            className="p-2.5 text-on-surface-deep"
            aria-label="Close menu"
          >
            <IconX size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col px-8 gap-2 overflow-y-auto">
          {props.eventTypes.length > 0 && (
            <div className="py-4 border-b border-on-surface-deep/10">
              <p className="typo-overline text-xs text-on-surface-deep/50 mb-3 tracking-widest">
                {props.eventTypesLabel}
              </p>
              <div className="flex flex-wrap gap-2 [&>a]:rounded-full [&>a]:border [&>a]:border-on-surface-deep/20 [&>a]:px-4 [&>a]:py-1.5 [&>a]:text-sm [&>a]:text-on-surface-deep [&>a]:hover:bg-on-surface-deep/5 [&>a]:transition-colors">
                {props.eventTypes.map((type) => (
                  <Link
                    key={type}
                    href={`/events?type=${encodeURIComponent(type)}`}
                    onClick={() => props.onOpenChange(false)}
                  >
                    {type}
                  </Link>
                ))}
              </div>
              <a
                href={LINE_OA_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => props.onOpenChange(false)}
                className="mt-2 text-sm text-on-surface-deep/70 hover:text-on-surface-deep transition-colors"
              >
                {props.customConsultLabel}
              </a>
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center gap-2 [&>a]:font-serif [&>a]:text-2xl [&>a]:font-medium [&>a]:tracking-wide [&>a]:text-on-surface-deep [&>a]:py-4 [&>a]:block">
            {props.navLinks.map((link) => {
              const isExternal = link.href.startsWith("http");
              const isHash = link.href.startsWith("#");

              if (isExternal || isHash) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    {...(isExternal && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                    onClick={() => props.onOpenChange(false)}
                  >
                    {link.label}
                  </a>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => props.onOpenChange(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="px-8 pb-8 space-y-6">
          <Link
            href="/events"
            onClick={() => props.onOpenChange(false)}
            className="block text-center rounded-full bg-fill-brand px-8 py-3 text-base tracking-widest text-on-fill-brand typo-ui"
          >
            {props.ctaLabel}
          </Link>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-on-surface-deep/60"
          >
            {INSTAGRAM_HANDLE}
          </a>
        </div>
      </nav>
    </>
  );
}
