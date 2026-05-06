"use client";

import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { TicketValidationResult } from "@/lib/types/ticket";
import { cn } from "@/lib/utils/cn";

interface ScanResultProps {
  result: TicketValidationResult | null;
  isError?: boolean;
  className?: string;
}

export function ScanResult({ result, isError, className }: ScanResultProps) {
  if (!result && !isError) return null;

  if (isError) {
    return (
      <div className={cn("flex flex-col items-center gap-3 rounded-xl bg-yellow-500 p-8 text-white", className)}>
        <AlertTriangle className="h-16 w-16" />
        <p className="text-lg font-bold">Error Jaringan</p>
        <p className="text-sm opacity-90">Periksa koneksi internet dan coba lagi</p>
      </div>
    );
  }

  if (!result) return null;

  const isValid = result.status === "valid";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl p-8 text-white",
        isValid ? "bg-green-500" : "bg-red-500",
        className,
      )}
    >
      {isValid ? (
        <CheckCircle className="h-16 w-16" />
      ) : (
        <XCircle className="h-16 w-16" />
      )}

      <p className="text-lg font-bold">
        {isValid ? "VALID" : "TIDAK VALID"}
      </p>

      {result.holder_name && (
        <p className="text-xl font-bold">{result.holder_name}</p>
      )}

      {result.ticket_type && (
        <p className="text-sm opacity-90">{result.ticket_type}</p>
      )}

      <p className="text-sm opacity-80">{result.message}</p>
    </div>
  );
}
