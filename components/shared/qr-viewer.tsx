"use client";

import { QRCodeSVG } from "qrcode.react";

interface QrViewerProps {
  data: string;
  size?: number;
  className?: string;
}

export function QrViewer({ data, size = 200, className }: QrViewerProps) {
  return (
    <div className={className}>
      <QRCodeSVG
        value={data}
        size={size}
        level="H"
        includeMargin
        className="rounded-lg"
      />
    </div>
  );
}
