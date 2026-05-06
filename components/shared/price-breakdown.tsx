import { formatCurrency } from "@/lib/utils/format-currency";

interface PriceBreakdownProps {
  subtotal: number;
  platformFee: number;
  paymentFee: number;
  discount: number;
  total: number;
}

export function PriceBreakdown({
  subtotal,
  platformFee,
  paymentFee,
  discount,
  total,
}: PriceBreakdownProps) {
  return (
    <div className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h4 className="font-medium text-zinc-900 dark:text-white">Rincian Biaya</h4>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
          <span>Biaya layanan</span>
          <span>{formatCurrency(platformFee)}</span>
        </div>

        {paymentFee > 0 && (
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Biaya pembayaran</span>
            <span>{formatCurrency(paymentFee)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Diskon</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 pt-2 dark:border-zinc-800">
        <div className="flex justify-between font-semibold text-zinc-900 dark:text-white">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
