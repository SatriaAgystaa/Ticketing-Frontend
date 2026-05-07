"use client";

import Link from "next/link";
import useSWR from "swr";
import { ticketsApi } from "@/lib/api/tickets";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { Ticket } from "@/lib/types/ticket";
import { formatDate } from "@/lib/utils/format-date";
import { TICKET_STATUS } from "@/lib/utils/constants";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  [TICKET_STATUS.ACTIVE]: "success",
  [TICKET_STATUS.USED]: "default",
  [TICKET_STATUS.CANCELLED]: "danger",
};

export default function MyTicketsPage() {
  const { data: tickets, isLoading } = useSWR<Ticket[]>("/tickets", async () => {
    const res = await ticketsApi.list();
    return res.data;
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Tiket Saya</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Tiket Saya</h1>

      {!tickets || tickets.length === 0 ? (
        <EmptyState
          title="Belum ada tiket"
          description="Tiket Anda akan muncul di sini setelah pembayaran berhasil."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.ticket_code}`}
              className="rounded-xl border border-gray-200 p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <p className="font-semibold text-gray-900">
                  {ticket.event.title}
                </p>
                <Badge variant={STATUS_VARIANT[ticket.status] ?? "default"}>
                  {ticket.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {ticket.ticket_type_name}
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                {ticket.holder_name}
              </p>
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">
                  {formatDate(ticket.event.starts_at)}
                </p>
                {ticket.event.venue_name && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {ticket.event.venue_name}
                  </p>
                )}
              </div>
              <p className="mt-2 font-mono text-xs text-gray-400">{ticket.ticket_code}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
