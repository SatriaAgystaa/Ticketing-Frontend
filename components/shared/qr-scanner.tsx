"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

interface QrScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

export function QrScanner({ onScan, onError, enabled = true }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let stopped = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsReady(true);
        }
      } catch (err) {
        onError?.(String(err));
      }
    };

    startCamera();

    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setIsReady(false);
    };
  }, [enabled, onError]);

  // Scan loop — read frames via canvas + jsQR
  useEffect(() => {
    if (!isReady) return;

    const scan = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(scan);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code?.data) {
        onScan(code.data);
        return; // stop scanning after first hit — parent decides when to re-enable
      }

      rafRef.current = requestAnimationFrame(scan);
    };

    rafRef.current = requestAnimationFrame(scan);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isReady, onScan]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        className="w-full"
        autoPlay
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* scan frame overlay */}
      {isReady && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-56 w-56">
            <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-md border-l-4 border-t-4 border-white" />
            <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-md border-r-4 border-t-4 border-white" />
            <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-md border-b-4 border-l-4 border-white" />
            <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-md border-b-4 border-r-4 border-white" />
          </div>
        </div>
      )}

      {!isReady && enabled && (
        <div className="absolute inset-0 flex aspect-square items-center justify-center">
          <p className="text-sm text-gray-400">Mengaktifkan kamera...</p>
        </div>
      )}
    </div>
  );
}
