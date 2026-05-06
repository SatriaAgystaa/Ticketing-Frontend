"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  className?: string;
}

export function Dropdown({ trigger, items, className }: DropdownProps) {
  return (
    <Menu as="div" className={cn("relative inline-block text-left", className)}>
      <MenuButton as="div" className="cursor-pointer">
        {trigger}
      </MenuButton>
      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg border border-zinc-200 bg-white py-1 shadow-lg transition data-[closed]:scale-95 data-[closed]:opacity-0 dark:border-zinc-800 dark:bg-zinc-900"
      >
        {items.map((item) => (
          <MenuItem key={item.label}>
            <button
              onClick={item.onClick}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm data-[focus]:bg-zinc-100 dark:data-[focus]:bg-zinc-800",
                item.danger ? "text-red-600" : "text-zinc-700 dark:text-zinc-300",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}

export function DropdownSimple({
  label,
  items,
}: {
  label: string;
  items: DropdownItem[];
}) {
  return (
    <Dropdown
      trigger={
        <button className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">
          {label}
          <ChevronDown className="h-4 w-4" />
        </button>
      }
      items={items}
    />
  );
}
