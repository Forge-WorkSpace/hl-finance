import type { ProductType } from "@/types";
import { ChevronRight } from "lucide-react";

interface DiscountChipsProps {
  steps: number[];
  tipe: ProductType;
}

export function DiscountChips({ steps, tipe }: DiscountChipsProps) {
  if (!steps.length) {
    return <span className="text-[13px] text-[var(--text-tertiary)]">—</span>;
  }

  const chipClass =
    tipe === "LM"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : "bg-violet-50 text-violet-700 border-violet-100";

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {steps.map((step, index) => (
        <span key={`${tipe}-${index}`} className="inline-flex items-center gap-1.5">
          <span
            className={`mono rounded border px-1.5 py-0.5 text-xs font-medium ${chipClass}`}
          >
            {step}%
          </span>
          {index < steps.length - 1 ? (
            <ChevronRight size={12} className="text-[var(--text-tertiary)]" />
          ) : null}
        </span>
      ))}
    </span>
  );
}
