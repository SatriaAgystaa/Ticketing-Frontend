"use client";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { id } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

registerLocale("id", id);
import { cn } from "@/lib/utils/cn";

interface DateTimePickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  id?: string;
  minDate?: Date;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  error,
  placeholder = "Pilih tanggal & waktu",
  id,
  minDate,
}: DateTimePickerProps) {
  const selected = value ? new Date(value) : null;

  const handleChange = (date: Date | null) => {
    if (!date) {
      onChange("");
      return;
    }
    // Format ke ISO local string yang kompatibel dengan backend
    const pad = (n: number) => String(n).padStart(2, "0");
    const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    onChange(formatted);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <DatePicker
          wrapperClassName="w-full"
          id={id}
          selected={selected}
          onChange={handleChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="dd/MM/yyyy, HH:mm"
          placeholderText={placeholder}
          locale="id"
          minDate={minDate}
          autoComplete="off"
          className={cn(
            "w-full rounded-md border bg-white px-3 py-2 pl-9 text-sm text-zinc-900 shadow-sm outline-none transition-colors",
            "focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400",
            "dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:focus:border-zinc-500",
            error ? "border-red-500" : "border-zinc-300 dark:border-zinc-700",
          )}
          popperClassName="z-50"
          popperPlacement="bottom-start"
        />
        <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
