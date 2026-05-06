import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "Tidak ada data",
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800", className)}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn("px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400", col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-zinc-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 text-zinc-900 dark:text-zinc-100", col.className)}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
