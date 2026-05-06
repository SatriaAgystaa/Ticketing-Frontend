"use client";

import { use, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronLeft, LogOut, User,
  Edit, Users, Megaphone, Tag, BarChart3, LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";

const PERMISSION_NAV: Record<string, { label: string; segment: string; icon: React.ReactNode }> = {
  edit_event:    { label: "Edit Event", segment: "edit",      icon: <Edit className="h-4 w-4" /> },
  view_attendee: { label: "Peserta",    segment: "attendees", icon: <Users className="h-4 w-4" /> },
  send_blast:    { label: "Blast",      segment: "blast",     icon: <Megaphone className="h-4 w-4" /> },
  manage_promo:  { label: "Promo",      segment: "promos",    icon: <Tag className="h-4 w-4" /> },
  view_revenue:  { label: "Keuangan",   segment: "revenue",   icon: <BarChart3 className="h-4 w-4" /> },
};

export default function StaffEventLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = use(params);
  const { isLoggedIn, isStaff, isLoading, staffEvents, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const staffEvent = staffEvents.find((s) => s.event_id === eventId && s.role === "co_organizer");
  const permissions = (staffEvent?.permissions ?? []).map((p) => p.toLowerCase());

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) { router.replace("/login"); return; }
    if (!isStaff) { router.replace("/"); return; }
    if (!isLoading && staffEvents.length > 0 && !staffEvent) router.replace("/staff");
  }, [isLoading, isLoggedIn, isStaff, staffEvent, staffEvents.length, router]);

  if (isLoading || !isLoggedIn || !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const tabs = [
    { label: "Overview", segment: "", icon: <LayoutDashboard className="h-4 w-4" />, href: `/staff/events/${eventId}` },
    ...permissions
      .map((perm) => PERMISSION_NAV[perm])
      .filter(Boolean)
      .map((nav) => ({ ...nav, href: `/staff/events/${eventId}/${nav.segment}` })),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => router.push("/staff")}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Staff Dashboard</span>
            </button>
            {staffEvent && (
              <>
                <span className="text-zinc-700 shrink-0">/</span>
                <span className="text-sm font-semibold text-white truncate max-w-[180px] sm:max-w-xs">
                  {staffEvent.event.title}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-sm text-zinc-400">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.full_name?.split(" ")[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-red-400 hover:bg-red-950 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto border-t border-zinc-800 px-4 sm:px-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-white text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </Link>
            );
          })}
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
