import Link from "next/link";
import { Ticket } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <Ticket className="h-5 w-5" />
              Tiket Event
            </Link>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Platform ticketing event terpercaya di Indonesia.
            </p>
          </div>

          {/* Jelajahi */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Jelajahi</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/events" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                  Semua Event
                </Link>
              </li>
              <li>
                <Link href="/categories/musik-hiburan" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                  Musik & Hiburan
                </Link>
              </li>
              <li>
                <Link href="/categories/seminar" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                  Seminar & Workshop
                </Link>
              </li>
            </ul>
          </div>

          {/* Organizer */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Organizer</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                  Buat Event
                </Link>
              </li>
              <li>
                <Link href="/dashboard/finance" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                  Kelola Keuangan
                </Link>
              </li>
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Bantuan</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/help" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                  Pusat Bantuan
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} Tiket Event. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
