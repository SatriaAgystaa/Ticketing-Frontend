"use client";

import { use, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { eventsApi } from "@/lib/api/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LIMITS } from "@/lib/utils/constants";

export default function BlastMessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = use(params);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject dan pesan wajib diisi");
      return;
    }

    if (!confirm("Kirim pesan ke semua peserta event ini?")) return;

    setIsSubmitting(true);
    try {
      await eventsApi.sendBlast(eventId, { subject, message });
      toast.success("Pesan berhasil dikirim ke semua peserta!");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Gagal mengirim pesan. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Blast Message
        </h1>
        <p className="text-sm text-gray-500">
          Kirim pesan email ke semua peserta event ini
        </p>
      </div>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
        Blast message dibatasi 1x setiap {LIMITS.BLAST_COOLDOWN_MINUTES} menit.
        Pastikan isi pesan sudah benar sebelum mengirim.
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tulis Pesan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="subject"
            label="Subject Email"
            placeholder="Contoh: Informasi Penting Event"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            id="message"
            label="Isi Pesan"
            placeholder="Tulis pesan yang ingin disampaikan ke peserta..."
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={handleSend} isLoading={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              Kirim ke Semua Peserta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
