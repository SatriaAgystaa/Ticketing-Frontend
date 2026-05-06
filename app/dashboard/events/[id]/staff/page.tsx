"use client";

import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { eventsApi } from "@/lib/api/events";
import type { EventStaff } from "@/lib/types/event";
import { STAFF_ROLES, STAFF_PERMISSIONS } from "@/lib/utils/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function StaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = use(params);
  const [staff, setStaff] = useState<EventStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(STAFF_ROLES.GATE_SCANNER);
  const [permissions, setPermissions] = useState<string[]>([]);

  const loadStaff = useCallback(async () => {
    try {
      const res = await eventsApi.getStaff(eventId);
      setStaff(res.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleInvite = async () => {
    if (!email) {
      toast.error("Email wajib diisi");
      return;
    }
    setIsSubmitting(true);
    try {
      await eventsApi.inviteStaff(eventId, { email, role, permissions });
      toast.success("Undangan berhasil dikirim");
      setIsModalOpen(false);
      setEmail("");
      setPermissions([]);
      loadStaff();
    } catch {
      toast.error("Gagal mengirim undangan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Hapus staff ini?")) return;
    try {
      await eventsApi.removeStaff(eventId, userId);
      toast.success("Staff dihapus");
      loadStaff();
    } catch {
      toast.error("Gagal menghapus staff");
    }
  };

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Staff Event
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Kelola tim yang membantu event Anda
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Undang Staff
        </Button>
      </div>

      {staff.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <UserPlus className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500">Belum ada staff</p>
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
              Undang Staff Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {staff.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {s.user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {s.user.full_name}
                    </p>
                    <p className="text-sm text-zinc-500">{s.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      s.role === STAFF_ROLES.CO_ORGANIZER ? "purple" : "info"
                    }
                  >
                    {s.role === STAFF_ROLES.CO_ORGANIZER
                      ? "Co-Organizer"
                      : "Gate Scanner"}
                  </Badge>
                  {!s.accepted_at && (
                    <Badge variant="warning">Pending</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(s.user_id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Undang Staff"
        className="max-w-md"
      >
        <div className="space-y-4">
          <Input
            id="staff-email"
            label="Email"
            type="email"
            placeholder="staff@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Select
            id="staff-role"
            label="Role"
            options={[
              { value: STAFF_ROLES.GATE_SCANNER, label: "Gate Scanner" },
              { value: STAFF_ROLES.CO_ORGANIZER, label: "Co-Organizer" },
            ]}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          {role === STAFF_ROLES.CO_ORGANIZER && (
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Permissions
              </p>
              <div className="space-y-2">
                {Object.entries(STAFF_PERMISSIONS).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-zinc-300"
                      checked={permissions.includes(value)}
                      onChange={() => togglePermission(value)}
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {key.replace(/_/g, " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button onClick={handleInvite} isLoading={isSubmitting}>
              Kirim Undangan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
