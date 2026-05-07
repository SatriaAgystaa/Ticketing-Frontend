"use client";

import { useEffect } from "react";

export default function PublicError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // TODO: log to error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8">
        <h2 className="text-xl font-bold text-red-800">
          Terjadi Kesalahan
        </h2>
        <p className="mt-2 text-sm text-red-600">
          Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-red-500">
            Kode error: {error.digest}
          </p>
        )}
        <button
          onClick={() => unstable_retry()}
          className="mt-6 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
