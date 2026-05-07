"use client";

import { use, useCallback, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Keyboard, RotateCcw, ScanLine, CalendarDays } from "lucide-react";
import { ticketsApi } from "@/lib/api/tickets";
import type { TicketValidationResult } from "@/lib/types/ticket";
import { QrScanner } from "@/components/shared/qr-scanner";
import { ScanResult } from "@/components/shared/scan-result";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { formatDate } from "@/lib/utils/format-date";

export default function ScannerPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { staffEvents } = useAuth();
  const staffEvent = staffEvents.find((s) => s.event_id === eventId);

  const [result, setResult] = useState<TicketValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [isError, setIsError] = useState(false);

  const handleScan = useCallback(
    async (code: string) => {
      if (isValidating) return;

      setScannerEnabled(false);
      setIsValidating(true);
      setIsError(false);
      setResult(null);

      try {
        const res = await ticketsApi.validate(code, eventId);
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
    },
    [isValidating, eventId],
  );

  const resetScanner = () => {
    setResult(null);
    setIsError(false);
    setScannerEnabled(true);
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
          Scan Tiket
        </h1>
        <Link href={`/scan/${eventId}/manual`}>
          <Button variant="ghost" size="sm">
            <Keyboard className="mr-1 h-4 w-4" />
            Manual
          </Button>
        </Link>
      </div>

      {/* Camera Scanner */}
      <QrScanner
        onScan={handleScan}
        enabled={scannerEnabled}
        onError={(err) => toast.error(err)}
      />

      {/* Idle hint — tampil kalau belum ada result */}
      {!result && !isError && !isValidating && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 py-8 text-center">
          <ScanLine className="h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-500">Arahkan kamera ke QR Code tiket</p>
          <p className="text-xs text-gray-400">atau gunakan input Manual di atas</p>
        </div>
      )}

      {/* Validation Loading */}
      {isValidating && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-gray-100 p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
          <p className="text-sm text-gray-500">Memvalidasi tiket...</p>
        </div>
      )}

      {/* Scan Result */}
      <ScanResult result={result} isError={isError} />

      {/* Reset Button */}
      {(result || isError) && (
        <Button onClick={resetScanner} variant="secondary" className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" />
          Scan Lagi
        </Button>
      )}
    </div>
  );
}
