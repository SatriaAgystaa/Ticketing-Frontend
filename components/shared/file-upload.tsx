"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { uploadApi } from "@/lib/api/upload";

interface FileUploadProps {
  label?: string;
  folder: string;
  accept?: Record<string, string[]>;
  maxSizeMB?: number;
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function FileUpload({
  label,
  folder,
  accept = { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
  maxSizeMB = 5,
  value,
  onChange,
  className,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File terlalu besar. Maksimal ${maxSizeMB}MB`);
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const url = await uploadApi.uploadFile(file, folder);
        onChange(url);
      } catch {
        setError("Gagal mengupload file. Coba lagi.");
      } finally {
        setIsUploading(false);
      }
    },
    [folder, maxSizeMB, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className={className}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </span>
      )}

      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-gray-200">
          <img src={value} alt="Uploaded" className="h-40 w-full object-cover" />
          <button
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-8 text-center transition-colors hover:border-gray-400",
            isDragActive && "border-blue-500 bg-blue-50",
            isUploading && "pointer-events-none opacity-50",
          )}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">
                {isDragActive ? "Drop file di sini..." : "Klik atau drag file ke sini"}
              </p>
              <p className="text-xs text-gray-400">Maks {maxSizeMB}MB</p>
            </>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
