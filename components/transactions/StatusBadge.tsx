import type { TransactionStatus } from "@/types";

interface StatusBadgeProps {
  status: TransactionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isLunas = status === "lunas";

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
        isLunas
          ? "border-[var(--lunas-border)] bg-[var(--lunas-bg)] text-[var(--lunas)]"
          : "border-[var(--piutang-border)] bg-[var(--piutang-bg)] text-[var(--piutang)]"
      }`}
    >
      {isLunas ? "Lunas" : "Piutang"}
    </span>
  );
}
