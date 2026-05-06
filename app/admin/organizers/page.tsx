"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { OrganizerProfile, User } from "@/lib/types/user";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import type { KycStatus } from "@/lib/utils/constants";

const kycVariant: Record<KycStatus, "default" | "success" | "warning" | "danger"> = {
  unverified: "default",
  pending: "warning",
  verified: "success",
  rejected: "danger",
};

export default function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState<
    (OrganizerProfile & { user: User })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    userId: string;
  }>({ open: false, userId: "" });
  const [reason, setReason] = useState("");

  const load = async () => {
    try {
      const res = await adminApi.listOrganizers();
      setOrganizers(res.data);
    } catch {
      toast.error("Gagal memuat data organizer");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await adminApi.approveOrganizer(userId);
      toast.success("Organizer diverifikasi");
      load();
    } catch {
      toast.error("Gagal memverifikasi");
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Alasan wajib diisi");
      return;
    }
    try {
      await adminApi.rejectOrganizer(rejectModal.userId, reason);
      toast.success("Organizer ditolak");
      setRejectModal({ open: false, userId: "" });
      setReason("");
      load();
    } catch {
      toast.error("Gagal menolak organizer");
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
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Verifikasi Organizer
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Review dan verifikasi KYC organizer
        </p>
      </div>

      <DataTable
        columns={[
          {
            key: "brand_name",
            header: "Organizer",
            render: (o: OrganizerProfile & { user: User }) => (
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {o.brand_name}
                </p>
                <p className="text-xs text-zinc-500">{o.user.email}</p>
              </div>
            ),
          },
          {
            key: "user_name",
            header: "Nama",
            render: (o: OrganizerProfile & { user: User }) => o.user.full_name,
          },
          {
            key: "kyc_status",
            header: "Status KYC",
            render: (o: OrganizerProfile & { user: User }) => (
              <Badge variant={kycVariant[o.kyc_status]}>{o.kyc_status}</Badge>
            ),
          },
          {
            key: "actions",
            header: "Aksi",
            render: (o: OrganizerProfile & { user: User }) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleApprove(o.user_id)}
                  title="Approve"
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setRejectModal({ open: true, userId: o.user_id })
                  }
                  title="Reject"
                >
                  <XCircle className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ),
          },
        ]}
        data={organizers}
        keyExtractor={(o) => o.id}
        emptyMessage="Tidak ada organizer untuk diverifikasi"
      />

      <Modal
        open={rejectModal.open}
        onClose={() => setRejectModal({ open: false, userId: "" })}
        title="Tolak Organizer"
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
              onClick={() => setRejectModal({ open: false, userId: "" })}
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
