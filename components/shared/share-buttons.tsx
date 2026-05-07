"use client";

import { Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

  const copyLink = async () => {
    await navigator.clipboard.writeText(fullUrl);
    toast.success("Link berhasil disalin!");
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${fullUrl}`)}`,
      "_blank",
    );
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
      "_blank",
    );
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copyLink}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
        title="Salin link"
      >
        <Link2 className="h-4 w-4" />
      </button>
      <button
        onClick={shareWhatsApp}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
        title="Bagikan ke WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </button>
      <button
        onClick={shareTwitter}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
        title="Bagikan ke X (Twitter)"
      >
        <span className="text-xs font-bold">𝕏</span>
      </button>
    </div>
  );
}
