import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const variants = {
  default: "bg-gray-100 text-gray-700 border border-gray-200",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  purple: "bg-violet-50 text-violet-700 border border-violet-200",
  brand: "bg-indigo-50 text-indigo-700 border border-indigo-200",
} as const;

interface BadgeProps {
  variant?: keyof typeof variants;
  className?: string;
  children: ReactNode;
}

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
