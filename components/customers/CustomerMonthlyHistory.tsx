"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatIDR } from "@/lib/calculations";
import { formatDateId } from "@/lib/utils";
import { LunasModal } from "@/components/shared/LunasModal";
import { StatusBadge } from "@/components/transactions/StatusBadge";
import { BonusBadge } from "@/components/transactions/BonusBadge";
import { settleMonthlyBons } from "@/app/(dashboard)/transactions/settlement-actions";
import type { CustomerMonthGroup } from "@/lib/customers/types";

interface CustomerMonthlyHistoryProps {
  customerId: string;
  customerName: string;
  monthGroups: CustomerMonthGroup[];
}

type PendingSettlement = {
  month: number;
  year: number;
  totalTagihan: number;
};

export function CustomerMonthlyHistory({
  customerId,
  customerName,
  monthGroups,
}: CustomerMonthlyHistoryProps) {
  const [pending, setPending] = useState<PendingSettlement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openMonthlySettlement(group: CustomerMonthGroup) {
    const totalTagihan = group.transactions
      .filter((tx) => tx.status === "piutang" && !tx.is_bonus)
      .reduce((sum, tx) => sum + tx.total, 0);

    setError(null);
    setPending({
      month: group.month,
      year: group.year,
      totalTagihan,
    });
  }

  function handleConfirm(tanggalLunas: string) {
    if (!pending) return;

    setError(null);
    startTransition(async () => {
      const result = await settleMonthlyBons(
        customerId,
        pending.month,
        pending.year,
        tanggalLunas,
      );

      if (result.error) {
        setError(result.error);
        return;
      }
    });
  }

  if (monthGroups.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white px-5 py-10 text-center text-sm text-[var(--text-tertiary)] shadow-[var(--shadow-card)]">
        Belum ada transaksi.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {monthGroups.map((group) => (
          <section
            key={`${group.year}-${group.month}`}
            className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
              <h3 className="text-[15px] font-semibold capitalize text-[var(--text-primary)]">
                {group.label}
              </h3>
              {group.hasSettleablePiutang ? (
                <button
                  type="button"
                  onClick={() => openMonthlySettlement(group)}
                  className="text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  Lunasin Semua Bulan Ini →
                </button>
              ) : group.allLunas ? (
                <span className="inline-flex rounded-full border border-[var(--lunas-border)] bg-[var(--lunas-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--lunas)]">
                  Semua Lunas ✓
                </span>
              ) : null}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[520px] w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-dim)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Nomor Bon</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {group.transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-t border-[var(--border)] hover:bg-[rgba(243,243,243,0.6)]"
                    >
                      <td className="mono px-5 py-3 text-[13px] text-[var(--text-secondary)]">
                        {formatDateId(tx.tanggal)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/transactions/${tx.id}`}
                            className="mono text-[13px] font-medium text-[var(--primary)] hover:underline"
                          >
                            {tx.nomor_bon}
                          </Link>
                          {tx.is_bonus ? <BonusBadge /> : null}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="mono px-5 py-3 text-right text-sm">
                        <span
                          className={
                            tx.status === "piutang"
                              ? "font-medium text-[var(--piutang)]"
                              : "text-[var(--text-primary)]"
                          }
                        >
                          {formatIDR(tx.total)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-[var(--border)] bg-[var(--surface-dim)] px-5 py-4 text-sm md:grid-cols-2">
              <div>
                <span className="text-[var(--text-secondary)]">Total Piutang: </span>
                <span className="mono font-medium text-[var(--piutang)]">
                  {formatIDR(group.piutangTotal)}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Total Sudah Bayar: </span>
                <span className="mono font-medium text-[var(--text-primary)]">
                  {formatIDR(group.sudahBayarTotal)}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Omzet LM (Lunas): </span>
                <span className="mono">{formatIDR(group.omzetLmLunas)}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Omzet BR (Lunas): </span>
                <span className="mono">{formatIDR(group.omzetBrLunas)}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Total Omzet (Lunas): </span>
                <span className="mono font-semibold">
                  {formatIDR(group.totalOmzetLunas)}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Total Laba (Lunas): </span>
                <span className="mono font-semibold text-[var(--lunas)]">
                  {formatIDR(group.totalLabaLunas)}
                </span>
              </div>
            </div>
          </section>
        ))}
      </div>

      <LunasModal
        open={pending !== null}
        customerName={customerName}
        totalTagihan={pending?.totalTagihan ?? 0}
        isPending={isPending}
        error={error}
        onCancel={() => setPending(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
