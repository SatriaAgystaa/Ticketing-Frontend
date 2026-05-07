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
        className="absolute right-0 z-10 mt-2 w-52 origin-top-right rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5 transition data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        {items.map((item) => (
          <MenuItem key={item.label}>
            <button
              onClick={item.onClick}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                "data-[focus]:bg-gray-50",
                item.danger
                  ? "text-red-600 data-[focus]:text-red-700"
                  : "text-gray-700 data-[focus]:text-gray-900",
              )}
            >
              {item.icon && (
                <span className={cn("shrink-0", item.danger ? "text-red-500" : "text-gray-400")}>
                  {item.icon}
                </span>
              )}
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
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-xs transition-colors hover:bg-gray-50 hover:border-gray-300">
          {label}
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </button>
      }
      items={items}
    />
  );
}
