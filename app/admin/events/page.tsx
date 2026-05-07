"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Ban } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { EventListItem } from "@/lib/types/event";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/data-table";
import { EventStatusBadge } from "@/components/shared/event-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils/format-date";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    eventId: string;
    action: "reject" | "suspend";
  }>({ open: false, eventId: "", action: "reject" });
  const [reason, setReason] = useState("");

  const loadEvents = async () => {
    try {
      const res = await adminApi.listEvents();
      setEvents(res.data);
    } catch {
      toast.error("Gagal memuat events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveEvent(id);
      toast.success("Event disetujui");
      loadEvents();
    } catch {
      toast.error("Gagal menyetujui event");
    }
  };

  const handleRejectOrSuspend = async () => {
    if (!reason.trim()) {
      toast.error("Alasan wajib diisi");
      return;
    }
    try {
      if (rejectModal.action === "reject") {
        await adminApi.rejectEvent(rejectModal.eventId, reason);
        toast.success("Event ditolak");
      } else {
        await adminApi.suspendEvent(rejectModal.eventId, reason);
        toast.success("Event disuspend");
      }
      setRejectModal({ open: false, eventId: "", action: "reject" });
      setReason("");
      loadEvents();
    } catch {
      toast.error("Gagal memproses");
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
          Moderasi Event
        </h1>
        <p className="text-sm text-gray-500">
          Approve, reject, atau suspend event
        </p>
      </div>

      <DataTable
        columns={[
          {
            key: "title",
            header: "Event",
            render: (e: EventListItem) => (
              <div>
                <p className="font-medium text-gray-900">
                  {e.title}
                </p>
                <p className="text-xs text-gray-500">
                  {e.organizer.brand_name}
                </p>
              </div>
            ),
          },
          {
            key: "date",
            header: "Tanggal",
            render: (e: EventListItem) => formatDate(e.starts_at),
          },
          {
            key: "status",
            header: "Status",
            render: (e: EventListItem) => (
              <EventStatusBadge status={e.status} />
            ),
          },
          {
            key: "actions",
            header: "Aksi",
            render: (e: EventListItem) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleApprove(e.id)}
                  title="Approve"
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setRejectModal({
                      open: true,
                      eventId: e.id,
                      action: "reject",
                    })
                  }
                  title="Reject"
                >
                  <XCircle className="h-4 w-4 text-red-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setRejectModal({
                      open: true,
                      eventId: e.id,
                      action: "suspend",
                    })
                  }
                  title="Suspend"
                >
                  <Ban className="h-4 w-4 text-yellow-500" />
                </Button>
              </div>
            ),
          },
        ]}
        data={events}
        keyExtractor={(e) => e.id}
        emptyMessage="Tidak ada event untuk dimoderasi"
      />

      {/* Reject/Suspend Modal */}
      <Modal
        open={rejectModal.open}
        onClose={() =>
          setRejectModal({ open: false, eventId: "", action: "reject" })
        }
        title={
          rejectModal.action === "reject" ? "Tolak Event" : "Suspend Event"
        }
      >
        <div className="space-y-4">
          <Input
            id="reason"
            label="Alasan"
            placeholder="Masukkan alasan..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                setRejectModal({ open: false, eventId: "", action: "reject" })
              }
            >
              Batal
            </Button>
            <Button variant="danger" onClick={handleRejectOrSuspend}>
              {rejectModal.action === "reject" ? "Tolak" : "Suspend"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
