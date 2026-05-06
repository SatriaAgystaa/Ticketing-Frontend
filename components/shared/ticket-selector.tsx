"use client";

import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TicketType } from "@/lib/types/event";
import { formatCurrency } from "@/lib/utils/format-currency";

interface TicketSelectorProps {
  ticketType: TicketType;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export function TicketSelector({ ticketType, quantity, onQuantityChange }: TicketSelectorProps) {
  const remaining = ticketType.quota - ticketType.sold_count;
  const isSoldOut = remaining <= 0;
  const maxAllowed = Math.min(remaining, ticketType.max_per_user);

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-zinc-900 dark:text-white">{ticketType.name}</h4>
          {ticketType.is_early_bird && <Badge variant="warning">Early Bird</Badge>}
          {isSoldOut && <Badge variant="danger">Habis</Badge>}
        </div>
        {ticketType.description && (
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{ticketType.description}</p>
        )}
        <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
          {ticketType.price === 0 ? "Gratis" : formatCurrency(ticketType.price)}
        </p>
        {!isSoldOut && remaining <= 20 && (
          <p className="mt-0.5 text-xs text-orange-600">Sisa {remaining} tiket</p>
        )}
      </div>

      {!isSoldOut && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
            disabled={quantity <= 0}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-medium text-zinc-900 dark:text-white">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange(Math.min(maxAllowed, quantity + 1))}
            disabled={quantity >= maxAllowed}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
