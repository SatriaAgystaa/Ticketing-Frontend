"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWaitingRoom } from "@/lib/hooks/use-waiting-room";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function WaitingRoomPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const { position, isCalled, checkoutToken, isLoading, join, leave } =
    useWaitingRoom(eventId);

  useEffect(() => {
    if (!position) {
      join().catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isCalled && checkoutToken) {
      router.push(`/checkout/${eventId}?token=${checkoutToken}`);
    }
  }, [isCalled, checkoutToken, eventId, router]);

  const handleLeave = async () => {
    await leave();
    router.push(`/events/${eventId}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Ruang Tunggu
      </h1>
      <p className="mb-8 text-gray-500">
        Event ini sedang ramai. Anda berada di antrian untuk checkout.
      </p>

      <div className="rounded-xl border border-gray-200 bg-white p-8">
        {position?.status === "waiting" && (
          <>
            <div className="mb-4">
              <Spinner />
            </div>
            <p className="text-sm text-gray-500">Posisi antrian Anda</p>
            <p className="mt-1 text-5xl font-bold text-gray-900">
              #{position.position ?? "-"}
            </p>
            {position.estimated_wait_minutes != null && (
              <p className="mt-3 text-sm text-gray-500">
                Estimasi waktu tunggu:{" "}
                <span className="font-medium text-gray-900">
                  ~{position.estimated_wait_minutes} menit
                </span>
              </p>
            )}
            {position.total_in_queue != null && (
              <p className="mt-1 text-sm text-gray-500">
                Total dalam antrian: {position.total_in_queue}
              </p>
            )}
          </>
        )}

        {position?.status === "called" && (
          <>
            <p className="text-lg font-semibold text-green-600">Giliran Anda!</p>
            <p className="mt-2 text-sm text-gray-500">
              Mengalihkan ke halaman checkout...
            </p>
          </>
        )}

        {position?.status === "expired" && (
          <>
            <p className="text-lg font-semibold text-red-600">Sesi Expired</p>
            <p className="mt-2 text-sm text-gray-500">
              Waktu tunggu Anda telah habis. Silakan bergabung kembali.
            </p>
            <Button className="mt-4" onClick={() => join()}>
              Bergabung Lagi
            </Button>
          </>
        )}
      </div>

      {position?.status === "waiting" && (
        <Button variant="ghost" className="mt-6" onClick={handleLeave}>
          Keluar dari Antrian
        </Button>
      )}
    </div>
  );
}
