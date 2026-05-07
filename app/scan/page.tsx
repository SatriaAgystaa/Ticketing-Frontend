"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, ScanLine, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils/format-date";

export default function ScanHomePage() {
  const { user, staffEvents, isLoading } = useAuth();

  const now = new Date();
  const upcoming = staffEvents.filter(
    (s) => new Date(s.event.ends_at) >= now,
  );
  const past = staffEvents.filter(
    (s) => new Date(s.event.ends_at) < now,
  );

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {/* Greeting */}
      <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
          <ShieldCheck className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <p className="font-semibold text-indigo-900">
            Selamat datang, {user?.full_name?.split(" ")[0]}!
          </p>
          <p className="text-sm text-indigo-500">
            Kamu bertugas di {staffEvents.length} event
          </p>
        </div>
      </div>

      {/* Event list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : staffEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ScanLine className="h-10 w-10 text-gray-500" />
            <p className="text-sm text-gray-400">
              Kamu belum ditugaskan di event manapun
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Event Aktif / Mendatang
              </p>
              {upcoming.map((s) => (
                <EventCard key={s.event_id} s={s} />
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Event Selesai
              </p>
              {past.map((s) => (
                <EventCard key={s.event_id} s={s} dimmed />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({
  s,
  dimmed = false,
}: {
  s: { event_id: string; role: string; event: { title: string; starts_at: string } };
  dimmed?: boolean;
}) {
  const roleLabel = s.role === "gate_scanner" ? "Gate Scanner" : "Co-Organizer";

  return (
    <Link href={`/scan/${s.event_id}`}>
      <Card
        className={`transition-shadow hover:shadow-md ${dimmed ? "opacity-50" : ""}`}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <CalendarDays className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {s.event.title}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">
                  {formatDate(s.event.starts_at)}
                </p>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </CardContent>
      </Card>
    </Link>
  );
}
