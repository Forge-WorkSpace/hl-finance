"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Search, Trash2, Users, Wallet } from "lucide-react";
import type { CustomerListItem } from "@/lib/customers/types";
import { formatIDR, stepsLabel } from "@/lib/calculations";
import { CustomerAvatar } from "@/components/shared/CustomerAvatar";
import { DiscountChips } from "@/components/customers/DiscountChips";
import { deleteCustomer } from "@/app/(dashboard)/customers/actions";

type FilterKey = "all" | "piutang" | "bonus";

interface CustomerTableProps {
  customers: CustomerListItem[];
}

function StatCard({
  label,
  value,
  suffix,
  money,
  icon: Icon,
  tone,
}: {
  label: string;
  value?: number;
  suffix?: string;
  money?: number;
  icon: React.ComponentType<{ size?: number }>;
  tone?: "piutang";
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-[18px] shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg bg-[var(--surface-dim)] text-[var(--text-tertiary)]">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {label}
          </div>
          <div className="mt-0.5">
            {money != null ? (
              <span
                className={`mono text-xl font-bold ${tone === "piutang" ? "text-[var(--piutang)]" : "text-[var(--text-primary)]"}`}
              >
                {formatIDR(money)}
              </span>
            ) : (
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {value}
                {suffix ? (
                  <span className="text-[13px] font-medium text-[var(--text-tertiary)]">
                    {suffix}
                  </span>
                ) : null}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const stats = useMemo(() => {
    const withPiutang = customers.filter((c) => c.piutang > 0).length;
    const totalPiutang = customers.reduce((sum, c) => sum + c.piutang, 0);
    return { withPiutang, totalPiutang };
  }, [customers]);

  const filtered = useMemo(() => {
    let list = customers;
    if (filter === "piutang") list = list.filter((c) => c.piutang > 0);
    if (filter === "bonus") list = list.filter((c) => c.bonusCount > 0);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.nama.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q),
      );
    }
    return list;
  }, [customers, filter, query]);

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: customers.length },
    {
      key: "piutang",
      label: "Ada Piutang",
      count: customers.filter((c) => c.piutang > 0).length,
    },
    {
      key: "bonus",
      label: "Punya Bonus",
      count: customers.filter((c) => c.bonusCount > 0).length,
    },
  ];

  async function handleDelete(id: string, nama: string) {
    if (!window.confirm(`Hapus pelanggan "${nama}"? Data tetap tersimpan (soft delete).`)) {
      return;
    }
    await deleteCustomer(id);
  }

  return (
    <div className="page-content animate-[fadeUp_280ms_ease]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Pelanggan
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Kelola daftar pelanggan beserta ketentuan diskon bertingkat
          </p>
        </div>
        <Link
          href="/customers/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={16} />
          Tambah Pelanggan
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Pelanggan" value={customers.length} icon={Users} />
        <StatCard
          label="Punya Piutang"
          value={stats.withPiutang}
          suffix=" pelanggan"
          icon={Wallet}
        />
        <StatCard
          label="Total Piutang"
          money={stats.totalPiutang}
          icon={Wallet}
          tone="piutang"
        />
      </div>

      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-white p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors ${
                filter === f.key
                  ? "bg-[var(--primary-subtle)] text-[var(--primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
              }`}
            >
              {f.label}
              <span
                className={`mono rounded-full px-1.5 py-px text-[11px] ${
                  filter === f.key
                    ? "bg-blue-100 text-[var(--primary)]"
                    : "bg-[var(--surface-dim)] text-[var(--text-tertiary)]"
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-[280px]">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau ID..."
            className="h-10 w-full rounded-md border border-[var(--border)] bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>
      </div>

      <div className="min-w-0 max-w-full overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
        <div className="table-scroll">
          <table className="min-w-[880px] w-full border-collapse">
            <thead>
              <tr className="bg-[var(--surface-dim)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="px-[18px] py-3">Pelanggan</th>
                <th className="px-[18px] py-3">Diskon LM</th>
                <th className="px-[18px] py-3">Diskon BR</th>
                <th className="px-[18px] py-3 text-right">Threshold Bonus</th>
                <th className="px-[18px] py-3 text-right">Piutang</th>
                <th className="px-[18px] py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center px-6 py-16 text-center">
                      <div className="mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[13px] bg-[var(--surface-dim)] text-[var(--text-tertiary)]">
                        <Search size={24} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                        {query ? "Tidak ada hasil" : "Belum ada pelanggan"}
                      </h3>
                      <p className="mt-1 text-[13.5px] text-[var(--text-secondary)]">
                        {query
                          ? `Tidak ada pelanggan yang cocok dengan "${query}".`
                          : "Belum ada pelanggan. Tambah sekarang."}
                      </p>
                      {!query && customers.length === 0 ? (
                        <Link
                          href="/customers/new"
                          className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          <Plus size={16} />
                          Tambah Pertama
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    className="group border-t border-[var(--border)] transition-colors hover:bg-[rgba(243,243,243,0.6)]"
                  >
                    <td className="px-[18px] py-3.5">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="flex items-center gap-3"
                      >
                        <CustomerAvatar name={customer.nama} />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            {customer.nama}
                          </div>
                          <div className="mono mt-0.5 text-[11.5px] text-[var(--text-tertiary)]">
                            {customer.id.slice(0, 8).toUpperCase()}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-[18px] py-3.5">
                      <span className="text-[13px] text-[var(--text-secondary)]">
                        {stepsLabel(customer.discounts.LM)}
                      </span>
                    </td>
                    <td className="px-[18px] py-3.5">
                      <span className="text-[13px] text-[var(--text-secondary)]">
                        {stepsLabel(customer.discounts.BR)}
                      </span>
                    </td>
                    <td className="mono px-[18px] py-3.5 text-right text-sm text-[var(--text-primary)]">
                      {formatIDR(customer.bonus_threshold)}
                    </td>
                    <td className="mono px-[18px] py-3.5 text-right text-sm">
                      {customer.piutang > 0 ? (
                        <span className="font-medium text-[var(--piutang)]">
                          {formatIDR(customer.piutang)}
                        </span>
                      ) : (
                        <span className="text-[var(--text-tertiary)]">—</span>
                      )}
                    </td>
                    <td className="px-[18px] py-3.5 text-right">
                      <div className="row-actions inline-flex items-center gap-1">
                        <Link
                          href={`/customers/${customer.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </Link>
                        <Link
                          href={`/customers/${customer.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
                          aria-label="Detail"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(customer.id, customer.nama)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
                          aria-label="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > 0 ? (
        <p className="mt-3 text-[12.5px] text-[var(--text-tertiary)]">
          Menampilkan {filtered.length} dari {customers.length} pelanggan
        </p>
      ) : null}
    </div>
  );
}
