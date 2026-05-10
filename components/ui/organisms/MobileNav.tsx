"use client";

import { X as IconX } from "lucide-react";
import { useEffect } from "react";

import Logo from "@/components/ui/atoms/Logo";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/constants";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navLinks: Array<{ label: string; href: string }>;
  ctaLabel: string;
  ctaHref: string;
}

const MobileNav: React.FC<MobileNavProps> = (props) => {
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
          <Logo size="sm" />
          <button
            onClick={() => props.onOpenChange(false)}
            className="p-2.5 text-on-surface-deep"
            aria-label="Close menu"
          >
            <IconX size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 gap-2">
          {props.navLinks.map((link) =>
            link.href.startsWith("#") ? (
              <a
                key={link.href}
                href={link.href}
                onClick={() => props.onOpenChange(false)}
                className="font-serif text-2xl font-medium tracking-wide text-on-surface-deep py-4 block"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => props.onOpenChange(false)}
                className="font-serif text-2xl font-medium tracking-wide text-on-surface-deep py-4 block"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <div className="px-8 pb-8 space-y-6">
          <Link
            href={props.ctaHref}
            onClick={() => props.onOpenChange(false)}
            className="block text-center rounded-full bg-fill-brand px-8 py-3 text-sm tracking-widest text-on-fill-brand typo-ui"
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
};

MobileNav.displayName = "MobileNav";
export default MobileNav;
