import { cn } from "@/lib/utils/cn";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-3",
  lg: "h-12 w-12 border-4",
};

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100",
        sizes[size],
        className,
      )}
    />
  );
}
