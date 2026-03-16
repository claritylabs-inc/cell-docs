"use client";

import { useEffect, useState } from "react";
import { CURRENT_VERSION, versions } from "@/lib/versions";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function VersionSelect() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex w-full items-center justify-between rounded-lg border bg-fd-secondary/50 px-2.5 py-1.5 text-sm font-medium text-fd-muted-foreground">
        v{CURRENT_VERSION}
        <ChevronDownIcon className="size-3.5 text-fd-muted-foreground" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-lg border bg-fd-secondary/50 px-2.5 py-1.5 text-sm font-medium text-fd-muted-foreground outline-none select-none transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground">
        v{CURRENT_VERSION}
        <ChevronDownIcon className="size-3.5 text-fd-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={4} className="min-w-[var(--anchor-width)]">
        {versions.map((v) => (
          <DropdownMenuItem
            key={v.version}
            className="flex items-center justify-between gap-2 text-[0.8125rem]"
            onClick={() => {
              if (v.version !== CURRENT_VERSION) {
                window.location.href = v.url;
              }
            }}
          >
            {v.label}
            {v.version === CURRENT_VERSION && (
              <CheckIcon className="size-3.5 text-fd-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
