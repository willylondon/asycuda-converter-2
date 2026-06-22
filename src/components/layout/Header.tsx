"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/converter", label: "Converter" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Support" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 bg-surface border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          className="flex items-center justify-between h-16"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-primary hover:text-accent transition-colors"
          >
            <span className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm font-extrabold">
              AC
            </span>
            <span className="hidden sm:inline">ASYCUDA Excel Converter</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text hover:bg-surface-hover rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/converter"
              className="ml-2 inline-flex items-center justify-center rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary-light transition-colors min-h-[44px]"
            >
              Start Converting
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:text-text hover:bg-surface-hover min-h-[44px] min-w-[44px]"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1 pb-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 text-base font-medium text-text-secondary hover:text-text hover:bg-surface-hover rounded-md transition-colors min-h-[44px] flex items-center"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/converter"
              onClick={() => setMenuOpen(false)}
              className="block mx-3 mt-2 text-center rounded-lg bg-primary text-white px-4 py-3 text-sm font-semibold hover:bg-primary-light transition-colors"
            >
              Start Converting
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
