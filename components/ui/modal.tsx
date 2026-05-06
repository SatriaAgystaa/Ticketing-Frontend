"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className={cn(
            "w-full max-w-md rounded-xl bg-white p-6 shadow-xl transition-all data-[closed]:scale-95 data-[closed]:opacity-0 dark:bg-zinc-900",
            className,
          )}
        >
          {title && (
            <div className="mb-4 flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {title}
              </DialogTitle>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
