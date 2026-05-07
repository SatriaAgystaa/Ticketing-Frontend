"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface TabItem {
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  className?: string;
}

export function Tabs({ items, className }: TabsProps) {
  return (
    <TabGroup className={className}>
      <TabList className="flex gap-0.5 border-b border-gray-200">
        {items.map((item) => (
          <Tab
            key={item.label}
            className={cn(
              "-mb-px border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-500",
              "transition-colors duration-150",
              "hover:text-gray-700",
              "focus:outline-none",
              "data-[selected]:border-indigo-600 data-[selected]:text-indigo-600",
            )}
          >
            {item.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels className="mt-5">
        {items.map((item) => (
          <TabPanel key={item.label}>{item.content}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
