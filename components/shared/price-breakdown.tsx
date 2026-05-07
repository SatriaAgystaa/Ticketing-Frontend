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
    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h4 className="text-sm font-semibold text-gray-900">Rincian Biaya</h4>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Biaya layanan</span>
          <span className="font-medium text-gray-900">{formatCurrency(platformFee)}</span>
        </div>

        {paymentFee > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Biaya pembayaran</span>
            <span className="font-medium text-gray-900">{formatCurrency(paymentFee)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Diskon</span>
            <span className="font-medium">-{formatCurrency(discount)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span className="text-indigo-600">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
