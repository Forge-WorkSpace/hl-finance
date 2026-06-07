"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscountPanelCollapsibleProps {
  children: React.ReactNode;
}

export function DiscountPanelCollapsible({ children }: DiscountPanelCollapsibleProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="hidden lg:block">{children}</div>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-white px-4 py-3.5 text-left shadow-[var(--shadow-card)]"
          aria-expanded={open}
        >
          <span className="text-[15px] font-semibold text-[var(--text-primary)]">
            Diskon Bertingkat
          </span>
          <ChevronDown
            size={18}
            className={cn(
              "shrink-0 text-[var(--text-tertiary)] transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
        {open ? <div className="mt-3">{children}</div> : null}
      </div>
    </>
  );
}
