"use client";

import { use, useCallback, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Keyboard, RotateCcw } from "lucide-react";
import { ticketsApi } from "@/lib/api/tickets";
import type { TicketValidationResult } from "@/lib/types/ticket";
import { QrScanner } from "@/components/shared/qr-scanner";
import { ScanResult } from "@/components/shared/scan-result";
import { Button } from "@/components/ui/button";

export default function ScannerPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
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
    [isValidating],
  );

  const resetScanner = () => {
    setResult(null);
    setIsError(false);
    setScannerEnabled(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
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

      {/* Validation Loading */}
      {isValidating && (
        <div className="flex items-center justify-center rounded-xl bg-zinc-100 p-8 dark:bg-zinc-800">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
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
