"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

export function QrScanner({ onScan, onError, enabled = true }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
        },
        () => {},
      )
      .then(() => setIsStarted(true))
      .catch((err) => {
        onError?.(String(err));
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [enabled, onScan, onError]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      <div id="qr-reader" ref={containerRef} className="w-full" />
      {!isStarted && enabled && (
        <div className="flex aspect-square items-center justify-center">
          <p className="text-sm text-zinc-400">Mengaktifkan kamera...</p>
        </div>
      )}
    </div>
  );
}
