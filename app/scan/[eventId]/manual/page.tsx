"use client";

import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Camera, Search, CalendarDays, TicketIcon } from "lucide-react";
import { ticketsApi } from "@/lib/api/tickets";
import type { TicketValidationResult } from "@/lib/types/ticket";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScanResult } from "@/components/shared/scan-result";
import { useAuth } from "@/lib/auth/context";
import { formatDate } from "@/lib/utils/format-date";

export default function ManualScanPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { staffEvents } = useAuth();
  const staffEvent = staffEvents.find((s) => s.event_id === eventId);

  const [code, setCode] = useState("");
  const [result, setResult] = useState<TicketValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleValidate = async () => {
    if (!code.trim()) {
      toast.error("Masukkan kode tiket");
      return;
    }

    setIsValidating(true);
    setIsError(false);
    setResult(null);

    try {
      const res = await ticketsApi.validate(code.trim(), eventId);
      setResult(res.data);

      if (res.data.status === "valid") {
        toast.success("Tiket valid!");
      } else {
        toast.error(res.data.message);
      }
    } catch {
      setIsError(true);
      toast.error("Gagal memvalidasi tiket");
    } finally {
      setIsValidating(false);
    }
  };

  const reset = () => {
    setResult(null);
    setCode("");
    setIsError(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      {/* Info Event */}
      {staffEvent && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
          <p className="font-semibold text-indigo-900">{staffEvent.event.title}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-indigo-500">
            <CalendarDays className="h-3 w-3" />
            {formatDate(staffEvent.event.starts_at)}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">
          Input Manual
        </h1>
        <Link href={`/scan/${eventId}`}>
          <Button variant="ghost" size="sm">
            <Camera className="mr-1 h-4 w-4" />
            Kamera
          </Button>
        </Link>
      </div>

      {/* Form */}
      <div className="space-y-3">
        <Input
          id="ticket-code"
          label="Kode Tiket"
          placeholder="Contoh: TKT-01KQXRTTKXE05X2NCFEJQN9SCC"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleValidate()}
        />
        <Button
          onClick={handleValidate}
          isLoading={isValidating}
          className="w-full"
        >
          <Search className="mr-2 h-4 w-4" />
          Validasi Tiket
        </Button>
      </div>

      {/* Idle hint */}
      {!result && !isError && !isValidating && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 py-8 text-center">
          <TicketIcon className="h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-500">Masukkan kode tiket di atas</p>
          <p className="text-xs text-gray-400">Kode tiket dimulai dengan <span className="font-mono">TKT-</span></p>
        </div>
      )}

      {/* Result */}
      <ScanResult result={result} isError={isError} />

      {(result || isError) && (
        <Button variant="secondary" className="w-full" onClick={reset}>
          Reset
        </Button>
      )}
    </div>
  );
}
