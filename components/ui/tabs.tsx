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
      <TabList className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {items.map((item) => (
          <Tab
            key={item.label}
            className={cn(
              "-mb-px border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700 focus:outline-none data-[selected]:border-zinc-900 data-[selected]:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300 dark:data-[selected]:border-white dark:data-[selected]:text-white",
            )}
          >
            {item.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels className="mt-4">
        {items.map((item) => (
          <TabPanel key={item.label}>{item.content}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
