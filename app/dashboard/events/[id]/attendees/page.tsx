"use client";

import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Search } from "lucide-react";
import Papa from "papaparse";
import { eventsApi } from "@/lib/api/events";
import type { Attendee } from "@/lib/types/event";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils/format-date";

export default function AttendeesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = use(params);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [filtered, setFiltered] = useState<Attendee[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadAttendees = useCallback(async () => {
    try {
      const res = await eventsApi.getAttendees(eventId);
      setAttendees(res.data);
      setFiltered(res.data);
    } catch {
      toast.error("Gagal memuat daftar peserta");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadAttendees();
  }, [loadAttendees]);

  useEffect(() => {
    if (!search) {
      setFiltered(attendees);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      attendees.filter(
        (a) =>
          a.holder_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.ticket_code.toLowerCase().includes(q),
      ),
    );
  }, [search, attendees]);

  const exportCsv = () => {
    const csv = Papa.unparse(
      attendees.map((a) => ({
        "Nama": a.holder_name,
        "Email": a.email,
        "Kode Tiket": a.ticket_code,
        "Tipe Tiket": a.ticket_type,
        "Status": a.status,
        "Check-in": a.checked_in_at
          ? formatDateTime(a.checked_in_at)
          : "-",
        "Dibeli": formatDateTime(a.purchased_at),
      })),
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendees-${eventId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV berhasil diunduh");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Daftar Peserta
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {attendees.length} peserta terdaftar
          </p>
        </div>
        <Button variant="secondary" onClick={exportCsv}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari nama, email, atau kode tiket..."
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={[
          {
            key: "holder_name",
            header: "Nama",
            render: (a: Attendee) => a.holder_name,
          },
          {
            key: "email",
            header: "Email",
            render: (a: Attendee) => a.email,
          },
          {
            key: "ticket_code",
            header: "Kode Tiket",
            render: (a: Attendee) => (
              <code className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-mono dark:bg-zinc-800">
                {a.ticket_code}
              </code>
            ),
          },
          {
            key: "ticket_type",
            header: "Tipe",
            render: (a: Attendee) => a.ticket_type,
          },
          {
            key: "status",
            header: "Status",
            render: (a: Attendee) => (
              <Badge
                variant={
                  a.status === "active"
                    ? "success"
                    : a.status === "used"
                      ? "info"
                      : "danger"
                }
              >
                {a.status === "active"
                  ? "Aktif"
                  : a.status === "used"
                    ? "Digunakan"
                    : "Dibatalkan"}
              </Badge>
            ),
          },
          {
            key: "checked_in_at",
            header: "Check-in",
            render: (a: Attendee) =>
              a.checked_in_at ? formatDateTime(a.checked_in_at) : "-",
          },
        ]}
        data={filtered}
        keyExtractor={(a) => a.ticket_code}
        emptyMessage="Tidak ada peserta ditemukan"
      />
    </div>
  );
}
