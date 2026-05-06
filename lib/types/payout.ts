import type { PayoutStatus } from "@/lib/utils/constants";

export interface Payout {
  id: string;
  organizer_id: string;
  amount: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  status: PayoutStatus;
  transfer_proof_url: string | null;
  failure_reason: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayoutBalance {
  gross_sales: number;
  platform_fee_deducted: number;
  available_balance: number;
  on_hold_balance: number;
  total_withdrawn: number;
  pending_withdrawal: number;
}
