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
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className={cn(
            "w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200",
            "transition-all data-[closed]:scale-95 data-[closed]:opacity-0",
            className,
          )}
        >
          {title && (
            <div className="mb-5 flex items-center justify-between">
              <DialogTitle className="text-base font-semibold text-gray-900">
                {title}
              </DialogTitle>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
