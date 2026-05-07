"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, Edit, Users, Megaphone, Tag, BarChart3, Clock, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { formatDate } from "@/lib/utils/format-date";
import { Button } from "@/components/ui/button";

const PERMISSION_LINKS: Record<string, { label: string; href: (eventId: string) => string; icon: React.ReactNode }> = {
  EDIT_EVENT:    { label: "Edit Event",  href: (id) => `/staff/events/${id}/edit`,      icon: <Edit className="h-4 w-4" /> },
  VIEW_ATTENDEE: { label: "Peserta",     href: (id) => `/staff/events/${id}/attendees`, icon: <Users className="h-4 w-4" /> },
  SEND_BLAST:    { label: "Blast",       href: (id) => `/staff/events/${id}/blast`,     icon: <Megaphone className="h-4 w-4" /> },
  MANAGE_PROMO:  { label: "Promo",       href: (id) => `/staff/events/${id}/promos`,    icon: <Tag className="h-4 w-4" /> },
  VIEW_REVENUE:  { label: "Keuangan",    href: (id) => `/staff/events/${id}/revenue`,   icon: <BarChart3 className="h-4 w-4" /> },
};

export default function StaffPage() {
  const { staffEvents, user } = useAuth();

  const activeEvents = staffEvents.filter((s) => s.role === "co_organizer" && s.accepted_at);
  const pendingEvents = staffEvents.filter((s) => s.role === "co_organizer" && !s.accepted_at);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Halo, {user?.full_name?.split(" ")[0]}!
        </h1>
        <p className="text-sm text-gray-500">
          Kelola event yang kamu bantu sebagai Co-Organizer.
        </p>
      </div>

      {/* Pending invitations */}
      {pendingEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Undangan Menunggu ({pendingEvents.length})
          </h2>
          {pendingEvents.map((staffEvent) => (
            <div
              key={staffEvent.event_id}
              className="flex items-center justify-between gap-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0 text-yellow-600" />
                  <p className="truncate font-semibold text-gray-900">
                    {staffEvent.event.title}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 pl-6">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(staffEvent.event.starts_at)}
                </div>
                <div className="mt-1 flex items-center gap-1 pl-6 text-xs text-yellow-700">
                  <Clock className="h-3 w-3" />
                  Undangan belum diterima
                </div>
              </div>
              {staffEvent.invitation_token ? (
                <Link href={`/invite/${staffEvent.invitation_token}`}>
                  <Button size="sm" className="flex-shrink-0">
                    Terima
                  </Button>
                </Link>
              ) : (
                <span className="text-xs text-gray-400">Cek email kamu</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Active events */}
      <div className="space-y-3">
        {activeEvents.length > 0 && (
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Event Aktif ({activeEvents.length})
          </h2>
        )}

        {activeEvents.length === 0 && pendingEvents.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 py-12 text-center">
            <CalendarDays className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-500">Belum ada event yang kamu kelola</p>
            <p className="text-xs text-gray-400">Tunggu undangan dari organizer</p>
          </div>
        )}

        {activeEvents.map((staffEvent) => (
          <div
            key={staffEvent.event_id}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {staffEvent.event.title}
                </p>
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(staffEvent.event.starts_at)}
                </div>
              </div>
              <Link
                href={`/staff/events/${staffEvent.event_id}`}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"
              >
                Overview
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {staffEvent.permissions.map((perm) => {
                const link = PERMISSION_LINKS[perm.toUpperCase()];
                if (!link) return null;
                return (
                  <Link
                    key={perm}
                    href={link.href(staffEvent.event_id)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
