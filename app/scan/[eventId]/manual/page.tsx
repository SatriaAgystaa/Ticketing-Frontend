"use client";

import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Camera, Search } from "lucide-react";
import { ticketsApi } from "@/lib/api/tickets";
import type { TicketValidationResult } from "@/lib/types/ticket";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScanResult } from "@/components/shared/scan-result";

export default function ManualScanPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
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

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
          Input Manual
        </h1>
        <Link href={`/scan/${eventId}`}>
          <Button variant="ghost" size="sm">
            <Camera className="mr-1 h-4 w-4" />
            Kamera
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        <Input
          id="ticket-code"
          label="Kode Tiket"
          placeholder="Masukkan kode tiket..."
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

      <ScanResult result={result} isError={isError} />

      {result && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            setResult(null);
            setCode("");
            setIsError(false);
          }}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
