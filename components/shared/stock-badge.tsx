import { Badge } from "@/components/ui/badge";

interface StockBadgeProps {
  remaining: number;
  total: number;
}

export function StockBadge({ remaining, total }: StockBadgeProps) {
  if (remaining <= 0) {
    return <Badge variant="danger">Habis</Badge>;
  }

  const percentage = (remaining / total) * 100;

  if (percentage <= 10) {
    return <Badge variant="danger">Sisa {remaining} tiket!</Badge>;
  }

  if (percentage <= 30) {
    return <Badge variant="warning">Sisa {remaining} tiket</Badge>;
  }

  return <Badge variant="success">Tersedia</Badge>;
}
