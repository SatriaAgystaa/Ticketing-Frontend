import Link from "next/link";
import { Ticket } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-gray-900"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
                <Ticket className="h-3.5 w-3.5 text-white" />
              </div>
              Tiket Event
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Platform ticketing event terpercaya di Indonesia.
            </p>
          </div>

          {/* Jelajahi */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Jelajahi
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { href: "/events", label: "Semua Event" },
                { href: "/categories/musik-hiburan", label: "Musik & Hiburan" },
                { href: "/categories/seminar", label: "Seminar & Workshop" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organizer */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Organizer
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { href: "/dashboard", label: "Buat Event" },
                { href: "/dashboard/finance", label: "Kelola Keuangan" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Bantuan
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { href: "/help", label: "Pusat Bantuan" },
                { href: "/terms", label: "Syarat & Ketentuan" },
                { href: "/privacy", label: "Kebijakan Privasi" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-8">
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Tiket Event. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
