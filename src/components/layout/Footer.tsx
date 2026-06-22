import Link from "next/link";
import { FileSpreadsheet, Mail } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { href: "/converter", label: "Converter" },
    { href: "/pricing", label: "Pricing" },
    { href: "/faq", label: "FAQ" },
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
              <FileSpreadsheet className="h-6 w-6 text-accent" />
              <span>ASYCUDA Converter</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Convert Excel delivery manifests into ASYCUDA-compliant XML files.
              Fast, secure, customs-ready.
            </p>
            <a
              href="mailto:support@asycuda-converter.vercel.app"
              className="inline-flex items-center gap-2 mt-4 text-sm text-gray-400 hover:text-accent-light transition-colors min-h-[44px]"
            >
              <Mail className="h-4 w-4" />
              <span>support@asycuda-converter.com</span>
            </a>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-accent-light transition-colors min-h-[44px] inline-flex items-center"
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
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} IGonics. All rights reserved.
          </p>
          <p className="text-sm text-gray-600">
            Built with Next.js &middot; Deployed on Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}