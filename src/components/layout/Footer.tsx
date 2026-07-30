import Link from "next/link";
import { FileCheck2, Mail } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { href: "/invoice-to-xml/new", label: "New declaration" },
    { href: "/invoice-to-xml", label: "How it works" },
  ],
  Company: [
    { href: "/support", label: "Support" },
    { href: "/contact", label: "Contact" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="bg-primary text-white mt-auto"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg text-white hover:text-accent-light transition-colors mb-4"
            >
              <FileCheck2 aria-hidden="true" className="h-6 w-6 text-accent-light" />
              <span>Clearance</span>
            </Link>
            <p className="text-sm text-white/72 leading-relaxed">
              Review commercial invoices, verify Jamaican tariff codes and
              prepare declaration XML for controlled import testing.
            </p>
            <a
              href="mailto:support@asycuda-converter.com"
              className="inline-flex items-center gap-2 mt-4 text-sm text-white/72 hover:text-accent-light transition-colors min-h-[44px]"
            >
              <Mail aria-hidden="true" className="h-4 w-4" />
              <span>support@asycuda-converter.com</span>
            </a>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white/85 mb-4">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/72 hover:text-accent-light transition-colors min-h-[44px] inline-flex items-center"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-light mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/55">
            &copy; {new Date().getFullYear()} Willy London. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
