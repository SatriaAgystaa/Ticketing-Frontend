/**
 * Format number to Indonesian Rupiah currency.
 * formatCurrency(150000) → "Rp 150.000"
 * formatCurrency(1500000) → "Rp 1.500.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
