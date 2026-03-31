"use client";

import { useState } from "react";
import Logo from "@/components/atoms/Logo";
import NavLink from "@/components/molecules/NavLink";
import { NAV_ANCHORS } from "@/lib/constants";
import type { CommonDictionary } from "@/lib/i18n";

interface HeaderProps {
  dict: CommonDictionary;
  locale: string;
}

export default function Header({ dict, locale }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: dict.nav.events, href: NAV_ANCHORS.events },
    { label: dict.nav.privateGroup, href: NAV_ANCHORS.privateGroup },
    { label: dict.nav.contact, href: NAV_ANCHORS.contact },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a
          href={locale === "zh-TW" ? "/" : `/${locale}`}
          className="flex items-center gap-3"
          aria-label={dict.siteName}
        >
          {/* <Logo size="sm" /> */}
          <span className="font-serif text-lg font-semibold hidden sm:inline">
            {dict.siteName}
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
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
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
}
