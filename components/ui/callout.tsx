"use client";

import { cn } from "@/lib/utils";
import { Info, TriangleAlert, CircleX, CircleCheck, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

const typeConfig = {
  info: {
    icon: Info,
    color: "text-[#2a97ff]",
    border: "border-[#2a97ff]/15",
    bg: "bg-[#2a97ff]/[0.04]",
  },
  warn: {
    icon: TriangleAlert,
    color: "text-[#b45309]",
    border: "border-[#b45309]/15",
    bg: "bg-[#b45309]/[0.04]",
  },
  error: {
    icon: CircleX,
    color: "text-[#ef4444]",
    border: "border-[#ef4444]/15",
    bg: "bg-[#ef4444]/[0.04]",
  },
  success: {
    icon: CircleCheck,
    color: "text-[#059669]",
    border: "border-[#059669]/15",
    bg: "bg-[#059669]/[0.04]",
  },
  idea: {
    icon: Lightbulb,
    color: "text-[#7c3aed]",
    border: "border-[#7c3aed]/15",
    bg: "bg-[#7c3aed]/[0.04]",
  },
};

type CalloutType = keyof typeof typeConfig;

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Callout({
  type = "info",
  title,
  children,
  className,
}: CalloutProps) {
  const config = typeConfig[type] ?? typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "my-4 flex items-center gap-3 rounded-[var(--radius-lg)] border p-3.5 font-[var(--font-sans)] text-[0.8125rem] leading-relaxed",
        config.border,
        config.bg,
        className
      )}
    >
      <Icon
        className={cn("size-4 shrink-0", config.color)}
        strokeWidth={2}
      />
      <div className="min-w-0 flex-1 font-[var(--font-sans)]">
        {title && (
          <p className="mb-1 font-medium text-[var(--color-fd-foreground)]">
            {title}
          </p>
        )}
        <div className="text-[var(--color-fd-muted-foreground)] [&_code]:rounded [&_code]:bg-black/[0.04] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.75rem] [&_code]:font-[var(--font-mono)] [&_p]:my-0">
          {children}
        </div>
      </div>
    </div>
  );
}
