import Link from "next/link";
import { Gift } from "lucide-react";
import {
  bonusDiscountLabel,
  calculateTransactionSummary,
  formatIDR,
  stepsLabel,
} from "@/lib/calculations";
import { formatDateId } from "@/lib/utils";
import type { TransactionDetail } from "@/lib/transactions/types";
import { ProductTypeBadge } from "@/components/products/ProductTypeBadge";
import { StatusBadge } from "@/components/transactions/StatusBadge";
import { BonusBadge } from "@/components/transactions/BonusBadge";
import { BonSettlementPanel } from "@/components/transactions/BonSettlementPanel";

interface BonDetailViewProps {
  transaction: TransactionDetail;
}

export function BonDetailView({ transaction }: BonDetailViewProps) {
  const summaryLines = transaction.lines.map((line) => ({
    lineOmzet: line.line_omzet,
    productType: line.product_tipe,
  }));
  const summary = calculateTransactionSummary(summaryLines, transaction.ongkir);

  return (
    <div className="animate-[fadeUp_280ms_ease]">
      <div className="mb-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <Link href="/transactions" className="hover:text-[var(--text-primary)]">
          Transaksi
        </Link>
        <span>/</span>
        <span className="mono font-medium text-[var(--text-primary)]">
          {transaction.nomor_bon}
        </span>
      </div>

      <section className="mb-5 rounded-xl border border-[var(--border)] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="mono text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                {transaction.nomor_bon}
              </h1>
              <StatusBadge status={transaction.status} />
              {transaction.is_bonus ? <BonusBadge /> : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-[var(--text-secondary)]">Pelanggan: </span>
                <Link
                  href={`/customers/${transaction.customer_id}`}
                  className="font-medium text-[var(--text-primary)] hover:text-[var(--primary)]"
                >
                  {transaction.customer_nama}
                </Link>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Tanggal: </span>
                <span className="font-medium">{formatDateId(transaction.tanggal)}</span>
              </div>
              {transaction.deskripsi ? (
                <div>
                  <span className="text-[var(--text-secondary)]">Deskripsi: </span>
                  <span>{transaction.deskripsi}</span>
                </div>
              ) : null}
              {transaction.status === "lunas" && transaction.tanggal_lunas ? (
                <div>
                  <span className="text-[var(--text-secondary)]">Tanggal Lunas: </span>
                  <span className="font-medium text-[var(--lunas)]">
                    {formatDateId(transaction.tanggal_lunas)}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                Line Items
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-dim)] text-left text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    <th className="px-5 py-2.5">Produk</th>
                    <th className="px-3 py-2.5">Tipe</th>
                    <th className="px-3 py-2.5 text-center">Qty</th>
                    <th className="px-3 py-2.5 text-right">Harga Base</th>
                    <th className="px-3 py-2.5 text-center">Diskon</th>
                    <th className="px-3 py-2.5 text-right">Harga Final</th>
                    <th className="px-3 py-2.5 text-right">Omzet</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.lines.map((line) => (
                    <tr key={line.id} className="border-t border-[var(--border)]">
                      <td className="px-5 py-3 text-sm font-medium">
                        {line.product_nama}
                      </td>
                      <td className="px-3 py-3">
                        <ProductTypeBadge tipe={line.product_tipe} />
                      </td>
                      <td className="mono px-3 py-3 text-center text-sm">
                        {line.quantity}
                      </td>
                      <td className="mono px-3 py-3 text-right text-sm text-[var(--text-secondary)]">
                        {formatIDR(line.snapshot_harga_base)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="mono rounded bg-[var(--surface-dim)] px-2 py-1 text-xs text-[var(--text-secondary)]">
                          {transaction.is_bonus
                            ? bonusDiscountLabel(true)
                            : stepsLabel(line.snapshot_discounts)}
                        </span>
                      </td>
                      <td className="mono px-3 py-3 text-right text-sm">
                        {formatIDR(line.discounted_unit_price)}
                      </td>
                      <td className="mono px-3 py-3 text-right text-sm font-semibold">
                        {formatIDR(line.line_omzet)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {transaction.is_bonus ? (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-[var(--bonus-border)] bg-[var(--bonus-bg)] p-4">
              <Gift size={18} className="mt-0.5 shrink-0 text-[var(--bonus)]" />
              <p className="text-sm text-[var(--text-primary)]">
                Transaksi ini ditandai sebagai bonus pelanggan — tidak masuk omzet
                dan laba reguler.
              </p>
            </div>
          ) : null}
        </div>

        <aside className="w-full shrink-0 lg:w-80">
          <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-[15px] font-semibold text-[var(--text-primary)]">
              Ringkasan
            </h2>
            <SummaryLine label="Omzet LM" value={summary.omzetLm} />
            <SummaryLine label="Omzet BR" value={summary.omzetBr} />
            <hr className="my-2.5 border-[var(--border)]" />
            <SummaryLine label="Total Omzet" value={summary.totalOmzet} strong />
            <SummaryLine label="Ongkir" value={transaction.ongkir} />
            <hr className="my-2.5 border-[var(--border)]" />
            <div className="flex items-end justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Total Tagihan
              </span>
              <span className="mono text-xl font-bold text-[var(--primary)]">
                {formatIDR(summary.totalTagihan)}
              </span>
            </div>
          </div>

          <BonSettlementPanel
            transactionId={transaction.id}
            customerName={transaction.customer_nama}
            totalTagihan={summary.totalTagihan}
            status={transaction.status}
            tanggalLunas={transaction.tanggal_lunas}
          />
        </aside>
      </div>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span
        className={`text-sm ${strong ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
      >
        {label}
      </span>
      <span className={`mono text-sm ${strong ? "font-semibold" : ""}`}>
        {formatIDR(value)}
      </span>
    </div>
  );
}
