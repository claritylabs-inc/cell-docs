"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Children, isValidElement } from "react";

interface TabsProps {
  items?: string[];
  children: ReactNode;
  className?: string;
  defaultValue?: string;
}

interface TabProps {
  value?: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ items, children, className, defaultValue }: TabsProps) {
  const tabs: { value: string; content: ReactNode }[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      const props = child.props as TabProps;
      const value = props.value ?? `tab-${tabs.length}`;
      tabs.push({ value, content: props.children });
    }
  });

  const labels = items ?? tabs.map((t) => t.value);
  const resolvedDefault = defaultValue ?? tabs[0]?.value;

  return (
    <TabsPrimitive.Root
      defaultValue={resolvedDefault}
      className={cn("my-4 flex flex-col font-[var(--font-sans)]", className)}
    >
      <TabsPrimitive.List className="flex gap-0 border-b border-[rgba(17,24,39,0.08)] dark:border-[rgba(255,255,255,0.08)]">
        {tabs.map((tab, i) => (
          <TabsPrimitive.Tab
            key={tab.value}
            value={tab.value}
            className={cn(
              "relative -mb-px cursor-pointer px-3 py-2 text-[0.8125rem] font-medium whitespace-nowrap",
              "text-[var(--color-fd-muted-foreground)] transition-colors",
              "border-b-2 border-transparent",
              "hover:text-[var(--color-fd-foreground)]",
              "data-[active]:text-[var(--color-fd-primary)] data-[active]:border-[var(--color-fd-primary)]",
              "outline-none"
            )}
          >
            {labels[i] ?? tab.value}
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>
      {tabs.map((tab) => (
        <TabsPrimitive.Panel
          key={tab.value}
          value={tab.value}
          className={cn(
            "rounded-b-[var(--radius-lg)] border border-t-0 border-[rgba(17,24,39,0.06)] dark:border-[rgba(255,255,255,0.06)]",
            "bg-white/50 dark:bg-white/[0.03]",
            "p-4 text-[0.8125rem] outline-none",
            "[&_pre]:my-3 [&_pre:first-child]:mt-0 [&_pre:last-child]:mb-0",
            "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
          )}
        >
          {tab.content}
        </TabsPrimitive.Panel>
      ))}
    </TabsPrimitive.Root>
  );
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}
