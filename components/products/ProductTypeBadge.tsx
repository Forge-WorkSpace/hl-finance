import type { ProductType } from "@/types";

interface ProductTypeBadgeProps {
  tipe: ProductType;
}

export function ProductTypeBadge({ tipe }: ProductTypeBadgeProps) {
  const isLm = tipe === "LM";

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
        isLm
          ? "border-blue-100 bg-blue-50 text-blue-700"
          : "border-violet-100 bg-violet-50 text-violet-700"
      }`}
    >
      {tipe}
    </span>
  );
}
