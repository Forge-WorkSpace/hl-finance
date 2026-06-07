import Link from "next/link";
import { ChevronRight, Gift, Pencil, Plus } from "lucide-react";
import { effectivePct, formatIDR } from "@/lib/calculations";
import { CustomerAvatar } from "@/components/shared/CustomerAvatar";
import { DiscountChips } from "@/components/customers/DiscountChips";
import { DiscountPanelCollapsible } from "@/components/customers/DiscountPanelCollapsible";
import { CustomerMonthlyHistory } from "@/components/customers/CustomerMonthlyHistory";
import { CustomerDownloadButton } from "@/components/customers/CustomerDownloadButton";
import { buildCustomerPdfData } from "@/lib/reports/customer-pdf";
import type { CustomerDetail } from "@/lib/customers/types";
import type { ProductType } from "@/types";

interface CustomerDetailViewProps {
  customer: CustomerDetail;
}

function ActiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--lunas-border)] bg-[var(--lunas-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--lunas)]">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      Aktif
    </span>
  );
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

export function CustomerDetailView({ customer }: CustomerDetailViewProps) {
  const pdfData = buildCustomerPdfData(customer);
  const createdDate = new Date(customer.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="page-content animate-[fadeUp_280ms_ease]">
      <div className="mb-4 flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)]">
        <Link href="/customers" className="hover:text-[var(--text-primary)]">
          Pelanggan
        </Link>
        <ChevronRight size={14} className="text-[var(--text-tertiary)]" />
        <span className="font-medium text-[var(--text-primary)]">{customer.nama}</span>
      </div>

      <div className="mb-5 rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)] lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 gap-4">
            <CustomerAvatar name={customer.nama} size={60} />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  {customer.nama}
                </h1>
                <ActiveBadge />
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
          <div className="flex flex-wrap gap-2">
            <CustomerDownloadButton data={pdfData} />
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

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Piutang"
          value={formatIDR(customer.piutang)}
          tone="piutang"
        />
        <SummaryCard
          label="Sudah Bayar"
          value={formatIDR(customer.sudahBayar)}
        />
        <SummaryCard
          label="Total Omzet"
          value={formatIDR(customer.totalOmzetLunas)}
        />
        <SummaryCard
          label="Laba"
          value={formatIDR(customer.totalLabaLunas)}
          tone="lunas"
        />
      </div>

      {customer.bonusesAvailable > 0 ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Gift size={20} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">
                {customer.bonusesAvailable} Bonus Tersedia
              </p>
              <p className="mt-0.5 text-sm text-amber-700">
                Pelanggan telah mencapai target omzet
              </p>
            </div>
          </div>
          <Link
            href={`/transactions/new?customerId=${customer.id}&bonus=true`}
            className="text-sm font-semibold text-amber-700 hover:underline"
          >
            Klaim Sekarang →
          </Link>
        </div>
      ) : null}

      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
              Riwayat Transaksi
            </h2>
            <span className="mono text-xs text-[var(--text-tertiary)]">
              {customer.transactionCount} bon
            </span>
          </div>
          <CustomerMonthlyHistory
            customerId={customer.id}
            customerName={customer.nama}
            monthGroups={customer.monthGroups}
          />
        </div>

        <DiscountPanelCollapsible>
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
        </DiscountPanelCollapsible>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "piutang" | "lunas";
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)] lg:p-[18px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] lg:text-[11px]">
        {label}
      </div>
      <div
        className={`mono mt-1.5 text-lg font-bold lg:mt-2 lg:text-2xl ${
          tone === "piutang"
            ? "text-[var(--piutang)]"
            : tone === "lunas"
              ? "text-[var(--lunas)]"
              : "text-[var(--text-primary)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
