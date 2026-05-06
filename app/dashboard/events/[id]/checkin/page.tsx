"use client";

import { use } from "react";
import { CheckCircle, Radio, Users, Wifi, WifiOff } from "lucide-react";
import { useCheckinStream } from "@/lib/hooks/use-checkin-stream";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils/format-date";

export default function CheckinDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = use(params);
  const { checkinData, isConnected, isError } = useCheckinStream(eventId);

  const checkedIn = checkinData?.total_checkins ?? 0;
  const totalTickets = checkinData?.total_tickets ?? 0;
  const percentage = totalTickets > 0 ? Math.round((checkedIn / totalTickets) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Live Check-in
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Pantau check-in secara real-time
          </p>
        </div>
        <Badge variant={isConnected ? "success" : "danger"}>
          {isConnected ? (
            <>
              <Wifi className="mr-1 h-3 w-3" /> Terhubung
            </>
          ) : (
            <>
              <WifiOff className="mr-1 h-3 w-3" /> Terputus
            </>
          )}
        </Badge>
      </div>

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Gagal terhubung ke stream check-in. Cek koneksi internet Anda.
        </div>
      )}

      {/* Big Counter */}
      <Card>
        <CardContent className="flex flex-col items-center py-12">
          <div className="relative mb-4">
            <svg className="h-40 w-40" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-zinc-200 dark:text-zinc-800"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={`${percentage * 2.83} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                className="text-green-500 transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                {percentage}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-green-600">{checkedIn}</p>
              <p className="text-sm text-zinc-500">Check-in</p>
            </div>
            <div className="h-10 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {totalTickets}
              </p>
              <p className="text-sm text-zinc-500">Total Tiket</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Check-in */}
      {checkinData?.last_checkin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-4 w-4 animate-pulse text-green-500" />
              Check-in Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {checkinData.last_checkin.holder_name}
                </p>
                <p className="text-sm text-zinc-500">
                  {checkinData.last_checkin.ticket_type} &middot;{" "}
                  {checkinData.last_checkin.ticket_code}
                </p>
                <p className="text-xs text-zinc-400">
                  {formatDateTime(checkinData.last_checkin.checked_in_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
