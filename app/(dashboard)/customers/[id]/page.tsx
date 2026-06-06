import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Gift, Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCustomerById } from "@/lib/customers/queries";
import { effectivePct, formatIDR } from "@/lib/calculations";
import { CustomerAvatar } from "@/components/shared/CustomerAvatar";
import { DiscountChips } from "@/components/customers/DiscountChips";
import type { ProductType } from "@/types";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

function TierBlock({
  tipe,
  label,
  steps,
}: {
  tipe: ProductType;
  label: string;
  steps: number[];
}) {
  const eff = effectivePct(steps);

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${
              tipe === "LM"
                ? "bg-blue-50 text-blue-700"
                : "bg-violet-50 text-violet-700"
            }`}
          >
            {tipe}
          </span>
          <span className="text-[13px] font-medium text-[var(--text-primary)]">
            {label}
          </span>
        </div>
        <span
          className={`text-[12.5px] font-semibold ${
            tipe === "LM" ? "text-blue-700" : "text-violet-700"
          }`}
        >
          Efektif {eff.toFixed(1).replace(".", ",")}%
        </span>
      </div>
      <DiscountChips steps={steps} tipe={tipe} />
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        active
          ? "border-[var(--lunas-border)] bg-[var(--lunas-bg)] text-[var(--lunas)]"
          : "border-[var(--border)] bg-[var(--surface-dim)] text-[var(--text-secondary)]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-500" : "bg-gray-400"}`}
      />
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const customer = await getCustomerById(supabase, id);

  if (!customer) {
    notFound();
  }

  const createdDate = new Date(customer.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="animate-[fadeUp_280ms_ease]">
      <div className="mb-4 flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)]">
        <Link href="/customers" className="hover:text-[var(--text-primary)]">
          Pelanggan
        </Link>
        <ChevronRight size={14} className="text-[var(--text-tertiary)]" />
        <span className="font-medium text-[var(--text-primary)]">{customer.nama}</span>
      </div>

      <div className="mb-5 rounded-xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 gap-4">
            <CustomerAvatar name={customer.nama} size={60} />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[22px] font-bold tracking-tight text-[var(--text-primary)]">
                  {customer.nama}
                </h1>
                <StatusBadge active />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                <span className="mono text-[12.5px] text-[var(--text-tertiary)]">
                  {customer.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="h-1 w-1 rounded-full bg-[var(--border-strong)]" />
                <span>Pelanggan sejak {createdDate}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/customers/${customer.id}/edit`}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
            >
              <Pencil size={16} />
              Edit
            </Link>
            <Link
              href="/transactions/new"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={16} />
              Transaksi Baru
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-white p-[18px] shadow-[var(--shadow-card)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Total Piutang
          </div>
          <div
            className={`mono mt-2 text-2xl font-bold ${
              customer.piutang > 0 ? "text-[var(--piutang)]" : "text-[var(--text-primary)]"
            }`}
          >
            {formatIDR(customer.piutang)}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-[18px] shadow-[var(--shadow-card)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Total Transaksi
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
            {customer.transactionCount}
          </div>
          <div className="mt-1 text-xs text-[var(--text-tertiary)]">
            {customer.lunasCount} lunas ·{" "}
            {customer.transactionCount - customer.lunasCount} piutang
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-[18px] shadow-[var(--shadow-card)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Bonus Terkumpul
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--bonus)]">
            {customer.bonusCount}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
            <Gift size={12} />
            klaim bonus
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
              Riwayat Transaksi
            </h2>
            <span className="mono text-xs text-[var(--text-tertiary)]">
              {customer.transactionCount} bon
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[520px] w-full border-collapse">
              <thead>
                <tr className="bg-[var(--surface-dim)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Nomor Bon</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {customer.transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-sm text-[var(--text-tertiary)]"
                    >
                      Belum ada transaksi.
                    </td>
                  </tr>
                ) : (
                  customer.transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-t border-[var(--border)] hover:bg-[rgba(243,243,243,0.6)]"
                    >
                      <td className="mono px-5 py-3 text-[13px] text-[var(--text-secondary)]">
                        {new Date(tx.tanggal).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-5 py-3">
                        <span className="mono text-[13px] font-medium text-[var(--primary)]">
                          {tx.nomor_bon}
                        </span>
                        {tx.is_bonus ? (
                          <span className="ml-2 rounded-full bg-[var(--bonus-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--bonus)]">
                            Bonus
                          </span>
                        ) : null}
                      </td>
                      <td className="mono px-5 py-3 text-right text-sm">
                        <span
                          className={
                            tx.status === "piutang"
                              ? "text-[var(--piutang)]"
                              : "text-[var(--text-primary)]"
                          }
                        >
                          {formatIDR(tx.total)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                            tx.status === "lunas"
                              ? "border-[var(--lunas-border)] bg-[var(--lunas-bg)] text-[var(--lunas)]"
                              : "border-[var(--piutang-border)] bg-[var(--piutang-bg)] text-[var(--piutang)]"
                          }`}
                        >
                          {tx.status === "lunas" ? "Lunas" : "Piutang"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
            Diskon Bertingkat
          </h2>
          <p className="mb-4 mt-1 text-[12.5px] text-[var(--text-secondary)]">
            Diterapkan berurutan dari harga base.
          </p>
          <TierBlock tipe="LM" label="Produk LM" steps={customer.discounts.LM} />
          <div className="my-4 h-px bg-[var(--border)]" />
          <TierBlock tipe="BR" label="Produk BR" steps={customer.discounts.BR} />
          <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--surface-dim)] px-3 py-2.5">
            <div className="text-xs text-[var(--text-secondary)]">Threshold Bonus</div>
            <div className="mono mt-1 text-sm font-semibold text-[var(--text-primary)]">
              {formatIDR(customer.bonus_threshold)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
