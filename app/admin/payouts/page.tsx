"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { Payout } from "@/lib/types/payout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import type { PayoutStatus } from "@/lib/utils/constants";

const statusVariant: Record<PayoutStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  processing: "info",
  completed: "success",
  failed: "danger",
};

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    payoutId: string;
  }>({ open: false, payoutId: "" });
  const [reason, setReason] = useState("");

  const load = async () => {
    try {
      const res = await adminApi.listPayouts();
      setPayouts(res.data);
    } catch {
      toast.error("Gagal memuat payout");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approvePayout(id);
      toast.success("Payout disetujui");
      load();
    } catch {
      toast.error("Gagal menyetujui payout");
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Alasan wajib diisi");
      return;
    }
    try {
      await adminApi.rejectPayout(rejectModal.payoutId, reason);
      toast.success("Payout ditolak");
      setRejectModal({ open: false, payoutId: "" });
      setReason("");
      load();
    } catch {
      toast.error("Gagal menolak payout");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Payout
        </h1>
        <p className="text-sm text-gray-500">
          Kelola permintaan penarikan dana organizer
        </p>
      </div>

      <DataTable
        columns={[
          {
            key: "created_at",
            header: "Tanggal",
            render: (p: Payout) => formatDate(p.created_at),
          },
          {
            key: "amount",
            header: "Jumlah",
            render: (p: Payout) => (
              <span className="font-medium">{formatCurrency(p.amount)}</span>
            ),
          },
          {
            key: "bank",
            header: "Rekening Tujuan",
            render: (p: Payout) => (
              <div>
                <p className="text-sm">{p.bank_name}</p>
                <p className="text-xs text-gray-500">
                  {p.bank_account_number} - {p.bank_account_name}
                </p>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (p: Payout) => (
              <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
            ),
          },
          {
            key: "actions",
            header: "Aksi",
            render: (p: Payout) =>
              p.status === "pending" ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApprove(p.id)}
                    title="Approve"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setRejectModal({ open: true, payoutId: p.id })
                    }
                    title="Reject"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-gray-400">-</span>
              ),
          },
        ]}
        data={payouts}
        keyExtractor={(p) => p.id}
        emptyMessage="Tidak ada permintaan payout"
      />

      <Modal
        open={rejectModal.open}
        onClose={() => setRejectModal({ open: false, payoutId: "" })}
        title="Tolak Payout"
      >
        <div className="space-y-4">
          <Input
            id="reject-reason"
            label="Alasan Penolakan"
            placeholder="Masukkan alasan..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setRejectModal({ open: false, payoutId: "" })}
            >
              Batal
            </Button>
            <Button variant="danger" onClick={handleReject}>
              Tolak
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
