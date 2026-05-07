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
      <div className={cn("flex flex-col items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center", className)}>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="h-7 w-7 text-amber-600" />
        </div>
        <div>
          <p className="text-base font-semibold text-amber-900">Error Jaringan</p>
          <p className="mt-1 text-sm text-amber-700">Periksa koneksi internet dan coba lagi</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isValid = result.status === "valid";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border p-8 text-center",
        isValid
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full",
          isValid ? "bg-emerald-100" : "bg-red-100",
        )}
      >
        {isValid ? (
          <CheckCircle className={cn("h-8 w-8", "text-emerald-600")} />
        ) : (
          <XCircle className={cn("h-8 w-8", "text-red-600")} />
        )}
      </div>

      <div>
        <p className={cn("text-lg font-bold", isValid ? "text-emerald-900" : "text-red-900")}>
          {isValid ? "VALID" : "TIDAK VALID"}
        </p>

        {result.holder_name && (
          <p className={cn("mt-1 text-base font-semibold", isValid ? "text-emerald-800" : "text-red-800")}>
            {result.holder_name}
          </p>
        )}

        {result.ticket_type && (
          <p className={cn("mt-0.5 text-sm", isValid ? "text-emerald-700" : "text-red-700")}>
            {result.ticket_type}
          </p>
        )}

        <p className={cn("mt-2 text-sm", isValid ? "text-emerald-600" : "text-red-600")}>
          {result.message}
        </p>
      </div>
    </div>
  );
}
