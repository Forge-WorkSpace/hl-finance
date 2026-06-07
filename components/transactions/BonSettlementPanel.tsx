"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { formatIDR } from "@/lib/calculations";
import { formatDateId } from "@/lib/utils";
import { LunasModal } from "@/components/shared/LunasModal";
import { settleSingleBon } from "@/app/(dashboard)/transactions/settlement-actions";
import type { TransactionStatus } from "@/types";

interface BonSettlementPanelProps {
  transactionId: string;
  customerName: string;
  totalTagihan: number;
  status: TransactionStatus;
  tanggalLunas: string | null;
}

export function BonSettlementPanel({
  transactionId,
  customerName,
  totalTagihan,
  status,
  tanggalLunas,
}: BonSettlementPanelProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm(tanggal: string) {
    setError(null);
    startTransition(async () => {
      const result = await settleSingleBon(transactionId, tanggal);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mt-4 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="mb-3 text-[15px] font-semibold text-[var(--text-primary)]">
          Status Pembayaran
        </h2>

        {status === "piutang" ? (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setOpen(true);
            }}
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-green-600 text-sm font-medium text-white hover:bg-green-700"
          >
            Tandai Lunas
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--lunas)]">
            <CheckCircle2 size={18} />
            Lunas pada {formatDateId(tanggalLunas)}
          </div>
        )}
      </div>

      <LunasModal
        open={open}
        customerName={customerName}
        totalTagihan={totalTagihan}
        isPending={isPending}
        error={error}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
