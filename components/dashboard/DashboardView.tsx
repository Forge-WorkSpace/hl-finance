import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { formatIDR } from "@/lib/calculations";
import { formatDateId } from "@/lib/utils";
import { CustomerAvatar } from "@/components/shared/CustomerAvatar";
import { StatusBadge } from "@/components/transactions/StatusBadge";
import type { DashboardStats, RecentTransactionRow } from "@/lib/reports/types";

interface DashboardViewProps {
  stats: DashboardStats;
  recentTransactions: RecentTransactionRow[];
}

export function DashboardView({ stats, recentTransactions }: DashboardViewProps) {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const cards = [
    {
      label: "Total Piutang",
      value: stats.totalPiutang,
      tone: "piutang" as const,
      icon: ReceiptText,
      trend: stats.piutangSubtext,
      trendTone: "piutang" as const,
    },
    {
      label: "Lunas Bulan Ini",
      value: stats.lunasBulanIni,
      tone: "lunas" as const,
      icon: CheckCircle2,
      trend: stats.lunasTrend,
      trendTone: "lunas" as const,
    },
    {
      label: "Omzet Bulan Ini",
      value: stats.omzetBulanIni,
      tone: "normal" as const,
      icon: TrendingUp,
      trend: stats.omzetTrend,
      trendTone: "lunas" as const,
    },
    {
      label: "Laba Bulan Ini",
      value: stats.labaBulanIni,
      tone: "normal" as const,
      icon: Wallet,
      trend: stats.labaTrend,
      trendTone: "lunas" as const,
    },
  ];

  return (
    <div className="animate-[fadeUp_280ms_ease]">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Ringkasan performa keuangan bisnis Anda
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1 text-sm text-[var(--text-secondary)]">
          <Calendar size={15} />
          <span className="capitalize">{today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Transaksi Terbaru
          </h2>
          <Link
            href="/transactions"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
          >
            Lihat Semua
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full border-collapse">
              <thead>
                <tr className="bg-[var(--surface-dim)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="px-[18px] py-3">Tanggal</th>
                  <th className="px-[18px] py-3">Nomor Bon</th>
                  <th className="px-[18px] py-3">Pelanggan</th>
                  <th className="px-[18px] py-3 text-right">Total</th>
                  <th className="px-[18px] py-3">Status</th>
                  <th className="px-[18px] py-3 text-right" />
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-[18px] py-12 text-center text-sm text-[var(--text-secondary)]"
                    >
                      Belum ada transaksi.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="group border-t border-[var(--border)] transition-colors hover:bg-[rgba(243,243,243,0.6)]"
                    >
                      <td className="mono px-[18px] py-3.5 text-sm text-[var(--text-secondary)]">
                        {formatDateId(tx.tanggal)}
                      </td>
                      <td className="px-[18px] py-3.5">
                        <Link
                          href={`/transactions/${tx.id}`}
                          className="mono text-sm font-medium text-[var(--primary)] hover:underline"
                        >
                          {tx.nomor_bon}
                        </Link>
                      </td>
                      <td className="px-[18px] py-3.5">
                        <div className="flex items-center gap-3">
                          <CustomerAvatar name={tx.customer_nama} size={28} />
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {tx.customer_nama}
                          </span>
                        </div>
                      </td>
                      <td className="mono px-[18px] py-3.5 text-right text-sm font-medium text-[var(--text-primary)]">
                        {formatIDR(tx.total)}
                      </td>
                      <td className="px-[18px] py-3.5">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-[18px] py-3.5 text-right">
                        <Link
                          href={`/transactions/${tx.id}`}
                          className="inline-flex text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                          aria-label="Detail transaksi"
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  icon: Icon,
  trend,
  trendTone,
}: {
  label: string;
  value: number;
  tone: "piutang" | "lunas" | "normal";
  icon: ComponentType<{ size?: number; className?: string }>;
  trend: string;
  trendTone: "piutang" | "lunas";
}) {
  const valueClass =
    tone === "piutang"
      ? "text-[var(--piutang)]"
      : tone === "lunas"
        ? "text-[var(--lunas)]"
        : "text-[var(--text-primary)]";

  const trendClass =
    trendTone === "piutang" ? "text-[var(--piutang)]" : "text-[var(--lunas)]";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-[22px] shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {label}
          </div>
          <div className={`mono mt-3 text-2xl font-bold ${valueClass}`}>
            {formatIDR(value)}
          </div>
          <div className={`mt-1.5 text-xs ${trendClass}`}>{trend}</div>
        </div>
        <div className="flex rounded-lg bg-[var(--surface-dim)] p-2.5 text-[var(--text-tertiary)]">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
