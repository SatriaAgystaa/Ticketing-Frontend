"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BadgeCheck,
  Banknote,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Moderasi Event", icon: CalendarDays },
  { href: "/admin/organizers", label: "Verifikasi Organizer", icon: BadgeCheck },
  { href: "/admin/payouts", label: "Payout", icon: Banknote },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/config", label: "Konfigurasi", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Admin Panel</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Platform Management</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
