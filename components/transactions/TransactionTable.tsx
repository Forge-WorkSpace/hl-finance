"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import type { TransactionListItem } from "@/lib/transactions/types";
import { formatIDR } from "@/lib/calculations";
import { formatDateId } from "@/lib/utils";
import { CustomerAvatar } from "@/components/shared/CustomerAvatar";
import { StatusBadge } from "@/components/transactions/StatusBadge";
import { BonusBadge } from "@/components/transactions/BonusBadge";
import { DeleteTransactionDialog } from "@/components/transactions/DeleteTransactionDialog";
import { deleteTransaction } from "@/app/(dashboard)/transactions/actions";

type StatusFilter = "all" | "piutang" | "lunas";

interface TransactionTableProps {
  transactions: TransactionListItem[];
  customers: { id: string; nama: string }[];
}

export function TransactionTable({
  transactions,
  customers,
}: TransactionTableProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<TransactionListItem | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const tx of transactions) {
      set.add(new Date(`${tx.tanggal}T00:00:00`).getFullYear());
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [transactions]);

  const filtered = useMemo(() => {
    let list = transactions;

    if (statusFilter !== "all") {
      list = list.filter((tx) => tx.status === statusFilter);
    }

    if (customerFilter !== "all") {
      list = list.filter((tx) => tx.customer_id === customerFilter);
    }

    if (yearFilter !== "all") {
      list = list.filter(
        (tx) =>
          new Date(`${tx.tanggal}T00:00:00`).getFullYear() ===
          Number(yearFilter),
      );
    }

    if (monthFilter !== "all") {
      list = list.filter(
        (tx) =>
          new Date(`${tx.tanggal}T00:00:00`).getMonth() + 1 ===
          Number(monthFilter),
      );
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (tx) =>
          tx.nomor_bon.toLowerCase().includes(q) ||
          tx.customer_nama.toLowerCase().includes(q),
      );
    }

    return list;
  }, [
    transactions,
    statusFilter,
    customerFilter,
    monthFilter,
    yearFilter,
    query,
  ]);

  const statusFilters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: transactions.length },
    {
      key: "piutang",
      label: "Piutang",
      count: transactions.filter((tx) => tx.status === "piutang").length,
    },
    {
      key: "lunas",
      label: "Lunas",
      count: transactions.filter((tx) => tx.status === "lunas").length,
    },
  ];

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
    });
  }

  return (
    <div className="animate-[fadeUp_280ms_ease]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Transaksi
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Semua bon penjualan beserta status pembayaran
          </p>
        </div>
        <Link
          href="/transactions/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Transaksi Baru
        </Link>
      </div>

      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-white p-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setStatusFilter(filter.key)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors ${
                statusFilter === filter.key
                  ? "bg-[var(--primary-subtle)] text-[var(--primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
              }`}
            >
              {filter.label}
              <span className="mono rounded-full bg-[var(--surface-dim)] px-1.5 py-px text-[11px]">
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        <select
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-blue-600"
        >
          <option value="all">Semua pelanggan</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.nama}
            </option>
          ))}
        </select>

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-blue-600"
        >
          <option value="all">Semua bulan</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>
              {new Date(2026, month - 1, 1).toLocaleDateString("id-ID", {
                month: "long",
              })}
            </option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-blue-600"
        >
          <option value="all">Semua tahun</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <div className="relative ml-auto w-full max-w-[280px]">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nomor bon atau pelanggan..."
            className="h-10 w-full rounded-md border border-[var(--border)] bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
        <div className="table-scroll">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-[var(--surface-dim)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="px-[18px] py-3">Tanggal</th>
                <th className="px-[18px] py-3">Nomor Bon</th>
                <th className="px-[18px] py-3">Pelanggan</th>
                <th className="px-[18px] py-3 text-right">Total</th>
                <th className="px-[18px] py-3">Status</th>
                <th className="px-[18px] py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center px-6 py-16 text-center">
                      <div className="mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[13px] bg-[var(--surface-dim)] text-[var(--text-tertiary)]">
                        <FileText size={24} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                        {query ? "Tidak ada hasil" : "Belum ada transaksi"}
                      </h3>
                      <p className="mt-1 text-[13.5px] text-[var(--text-secondary)]">
                        {query
                          ? `Tidak ada transaksi yang cocok dengan "${query}".`
                          : "Belum ada transaksi. Buat bon pertama."}
                      </p>
                      {!query && transactions.length === 0 ? (
                        <Link
                          href="/transactions/new"
                          className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          <Plus size={16} />
                          Transaksi Baru
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="group border-t border-[var(--border)] transition-colors hover:bg-[rgba(243,243,243,0.6)]"
                  >
                    <td className="mono px-[18px] py-3.5 text-sm text-[var(--text-secondary)]">
                      {formatDateId(tx.tanggal)}
                    </td>
                    <td className="px-[18px] py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/transactions/${tx.id}`}
                          className="mono text-sm font-medium text-[var(--primary)] hover:underline"
                        >
                          {tx.nomor_bon}
                        </Link>
                        {tx.is_bonus ? <BonusBadge /> : null}
                      </div>
                    </td>
                    <td className="px-[18px] py-3.5">
                      <Link
                        href={`/customers/${tx.customer_id}`}
                        className="flex items-center gap-3 hover:opacity-80"
                      >
                        <CustomerAvatar name={tx.customer_nama} />
                        <span className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary)]">
                          {tx.customer_nama}
                        </span>
                      </Link>
                    </td>
                    <td className="mono px-[18px] py-3.5 text-right text-sm font-medium text-[var(--text-primary)]">
                      {formatIDR(tx.total)}
                    </td>
                    <td className="px-[18px] py-3.5">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-[18px] py-3.5 text-right">
                      <div className="row-actions inline-flex items-center gap-1">
                        <Link
                          href={`/transactions/${tx.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
                          aria-label="Detail"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/transactions/${tx.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(tx)}
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
          Menampilkan {filtered.length} dari {transactions.length} transaksi
        </p>
      ) : null}

      <DeleteTransactionDialog
        open={deleteTarget !== null}
        nomorBon={deleteTarget?.nomor_bon ?? ""}
        isPending={isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export function TransactionTableSkeleton() {
  return (
    <div className="animate-[fadeUp_280ms_ease]">
      <div className="mb-6 flex justify-between gap-4">
        <div>
          <div className="skel h-8 w-36" />
          <div className="skel mt-2 h-4 w-64" />
        </div>
        <div className="skel h-10 w-40 rounded-md" />
      </div>
      <div className="skel mb-3.5 h-10 w-full rounded-lg" />
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skel mb-3 h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
