import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";
import { id } from "date-fns/locale";

/** "10 Mei 2026" */
export function formatDate(date: string | Date): string {
  return format(new Date(date), "d MMMM yyyy", { locale: id });
}

/** "10 Mei 2026, 19:00 WIB" */
export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "d MMMM yyyy, HH:mm 'WIB'", { locale: id });
}

/** "Sabtu, 10 Mei 2026" */
export function formatDateFull(date: string | Date): string {
  return format(new Date(date), "EEEE, d MMMM yyyy", { locale: id });
}

/** "19:00" */
export function formatTime(date: string | Date): string {
  return format(new Date(date), "HH:mm", { locale: id });
}

/** "2 jam lagi" / "3 hari lalu" */
export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id });
}

/** Check if a date is in the future */
export function isFuture(date: string | Date): boolean {
  return isAfter(new Date(date), new Date());
}

/** Check if a date is in the past */
export function isPast(date: string | Date): boolean {
  return isBefore(new Date(date), new Date());
}
