"use client";

import { Clock } from "lucide-react";
import { useCountdown } from "@/lib/hooks/use-countdown";
import { cn } from "@/lib/utils/cn";

interface CountdownTimerProps {
  targetDate: string | Date;
  label?: string;
  onExpired?: () => void;
  variant?: "default" | "danger";
  className?: string;
}

export function CountdownTimer({
  targetDate,
  label = "Sisa waktu",
  variant = "default",
  className,
}: CountdownTimerProps) {
  const { formatted, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return (
      <div className={cn("flex items-center gap-1.5 text-sm text-red-600", className)}>
        <Clock className="h-4 w-4" />
        Waktu habis
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium",
        variant === "danger" ? "text-red-600" : "text-gray-700",
        className,
      )}
    >
      <Clock className="h-4 w-4" />
      {label}: <span className="font-mono">{formatted}</span>
    </div>
  );
}
