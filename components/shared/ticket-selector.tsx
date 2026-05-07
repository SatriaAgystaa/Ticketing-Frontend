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
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-gray-300">
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-gray-900">{ticketType.name}</h4>
          {ticketType.is_early_bird && <Badge variant="warning">Early Bird</Badge>}
          {isSoldOut && <Badge variant="danger">Habis</Badge>}
        </div>
        {ticketType.description && (
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">{ticketType.description}</p>
        )}
        <p className="mt-1.5 text-base font-bold text-gray-900">
          {ticketType.price === 0 ? "Gratis" : formatCurrency(ticketType.price)}
        </p>
        {!isSoldOut && remaining <= 20 && (
          <p className="mt-0.5 text-xs font-medium text-amber-600">Sisa {remaining} tiket</p>
        )}
      </div>

      {!isSoldOut && (
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
            disabled={quantity <= 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 shadow-xs transition-colors hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center text-sm font-semibold text-gray-900">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange(Math.min(maxAllowed, quantity + 1))}
            disabled={quantity >= maxAllowed}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 shadow-xs transition-colors hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
