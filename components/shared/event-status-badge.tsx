import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/lib/utils/constants";

const statusConfig: Record<EventStatus, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" | "purple" }> = {
  draft: { label: "Draft", variant: "default" },
  published: { label: "Published", variant: "info" },
  on_sale: { label: "On Sale", variant: "success" },
  sold_out: { label: "Sold Out", variant: "danger" },
  completed: { label: "Selesai", variant: "purple" },
  cancelled: { label: "Dibatalkan", variant: "danger" },
};

interface EventStatusBadgeProps {
  status: EventStatus;
}

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
