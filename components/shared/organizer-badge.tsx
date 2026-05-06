import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface OrganizerBadgeProps {
  brandName: string;
  isVerified: boolean;
  className?: string;
}

export function OrganizerBadge({ brandName, isVerified, className }: OrganizerBadgeProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{brandName}</span>
      {isVerified && (
        <BadgeCheck className="h-4 w-4 text-blue-500" />
      )}
    </div>
  );
}
