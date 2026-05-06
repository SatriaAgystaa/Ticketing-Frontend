"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { ticketsApi } from "@/lib/api/tickets";
import { QrViewer } from "@/components/shared/qr-viewer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Ticket } from "@/lib/types/ticket";
import { formatDate } from "@/lib/utils/format-date";
import { TICKET_STATUS } from "@/lib/utils/constants";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  [TICKET_STATUS.ACTIVE]: "success",
  [TICKET_STATUS.USED]: "default",
  [TICKET_STATUS.CANCELLED]: "danger",
};

export default function TicketDetailPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();

  const { data: ticket, isLoading } = useSWR<Ticket>(
    `/tickets/${code}`,
    async () => {
      const res = await ticketsApi.getByCode(code);
      return res.data;
    },
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mx-auto h-52 w-52" />
        <Skeleton className="mt-6 h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Tiket tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <button
        onClick={() => router.push("/tickets")}
        className="mb-4 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
      >
        &larr; Kembali ke Tiket
      </button>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex items-start justify-between">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
            {ticket.event.title}
          </h1>
          <Badge variant={STATUS_VARIANT[ticket.status] ?? "default"}>
            {ticket.status}
          </Badge>
        </div>

        {/* QR Code */}
        <div className="flex justify-center py-6">
          <QrViewer data={ticket.qr_data} size={220} />
        </div>

        <p className="text-center font-mono text-sm text-zinc-500">{ticket.ticket_code}</p>

        {/* Ticket Details */}
        <div className="mt-6 space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Tipe Tiket</span>
            <span className="font-medium text-zinc-900 dark:text-white">
              {ticket.ticket_type_name}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Pemegang</span>
            <span className="font-medium text-zinc-900 dark:text-white">
              {ticket.holder_name}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Tanggal</span>
            <span className="font-medium text-zinc-900 dark:text-white">
              {formatDate(ticket.event.starts_at)}
            </span>
          </div>
          {ticket.event.venue_name && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Lokasi</span>
              <span className="text-right font-medium text-zinc-900 dark:text-white">
                {ticket.event.venue_name}
              </span>
            </div>
          )}
          {ticket.event.venue_address && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Alamat</span>
              <span className="text-right text-xs text-zinc-500 dark:text-zinc-400">
                {ticket.event.venue_address}
              </span>
            </div>
          )}
          {ticket.used_at && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Digunakan pada</span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {formatDate(ticket.used_at)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
