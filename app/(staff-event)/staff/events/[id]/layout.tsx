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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => router.push("/staff")}
              className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900 shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Staff Dashboard</span>
            </button>
            {staffEvent && (
              <>
                <span className="text-gray-300 shrink-0">/</span>
                <span className="text-sm font-semibold text-gray-900 truncate max-w-[180px] sm:max-w-xs">
                  {staffEvent.event.title}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.full_name?.split(" ")[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto border-t border-gray-100 px-4 sm:px-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
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
