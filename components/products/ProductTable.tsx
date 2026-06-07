"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import type { ProductListItem } from "@/lib/products/types";
import { formatIDR } from "@/lib/calculations";
import { ProductTypeBadge } from "@/components/products/ProductTypeBadge";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { deleteProduct } from "@/app/(dashboard)/products/actions";

type FilterKey = "all" | "LM" | "BR";

interface ProductTableProps {
  products: ProductListItem[];
}

function ProductIcon({ tipe }: { tipe: "LM" | "BR" }) {
  const isLm = tipe === "LM";
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
        isLm ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"
      }`}
    >
      <Package size={18} />
    </div>
  );
}

export function ProductTable({ products }: ProductTableProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [deleteTarget, setDeleteTarget] = useState<ProductListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const lmCount = useMemo(
    () => products.filter((p) => p.tipe === "LM").length,
    [products],
  );
  const brCount = useMemo(
    () => products.filter((p) => p.tipe === "BR").length,
    [products],
  );

  const filtered = useMemo(() => {
    let list = products;
    if (filter !== "all") list = list.filter((p) => p.tipe === filter);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => p.nama.toLowerCase().includes(q));
    }
    return list;
  }, [products, filter, query]);

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: products.length },
    { key: "LM", label: "LM", count: lmCount },
    { key: "BR", label: "BR", count: brCount },
  ];

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
    });
  }

  return (
    <div className="animate-[fadeUp_280ms_ease]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Produk
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Daftar produk beserta harga base dan tipe
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={16} />
          Tambah Produk
        </Link>
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
            placeholder="Cari nama produk..."
            className="h-10 w-full rounded-md border border-[var(--border)] bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full border-collapse">
            <thead>
              <tr className="bg-[var(--surface-dim)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="px-[18px] py-3">Nama</th>
                <th className="px-[18px] py-3">Tipe</th>
                <th className="px-[18px] py-3 text-right">Harga Base</th>
                <th className="px-[18px] py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center px-6 py-16 text-center">
                      <div className="mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[13px] bg-[var(--surface-dim)] text-[var(--text-tertiary)]">
                        <Package size={24} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                        {query ? "Tidak ada hasil" : "Belum ada produk"}
                      </h3>
                      <p className="mt-1 text-[13.5px] text-[var(--text-secondary)]">
                        {query
                          ? `Tidak ada produk yang cocok dengan "${query}".`
                          : "Belum ada produk. Tambah sekarang."}
                      </p>
                      {!query && products.length === 0 ? (
                        <Link
                          href="/products/new"
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
                filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="group border-t border-[var(--border)] transition-colors hover:bg-[rgba(243,243,243,0.6)]"
                  >
                    <td className="px-[18px] py-3.5">
                      <div className="flex items-center gap-3">
                        <ProductIcon tipe={product.tipe} />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            {product.nama}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-[18px] py-3.5">
                      <ProductTypeBadge tipe={product.tipe} />
                    </td>
                    <td className="mono px-[18px] py-3.5 text-right text-sm text-[var(--text-primary)]">
                      {formatIDR(product.harga_base)}
                    </td>
                    <td className="px-[18px] py-3.5 text-right">
                      <div className="row-actions inline-flex items-center gap-1">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
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
          Menampilkan {filtered.length} dari {products.length} produk
        </p>
      ) : null}

      <DeleteProductDialog
        open={deleteTarget !== null}
        productName={deleteTarget?.nama ?? ""}
        isPending={isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export function ProductTableSkeleton() {
  return (
    <div className="animate-[fadeUp_280ms_ease]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="skel h-8 w-32" />
          <div className="skel mt-2 h-4 w-64" />
        </div>
        <div className="skel h-10 w-36 rounded-md" />
      </div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="skel h-10 w-64 rounded-lg" />
        <div className="skel h-10 w-[280px] rounded-md" />
      </div>
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full border-collapse">
            <thead>
              <tr className="bg-[var(--surface-dim)]">
                {["Nama", "Tipe", "Harga Base", "Aksi"].map((col) => (
                  <th
                    key={col}
                    className="px-[18px] py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="px-[18px] py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="skel h-9 w-9 rounded-lg" />
                      <div className="skel h-4 w-40" />
                    </div>
                  </td>
                  <td className="px-[18px] py-3.5">
                    <div className="skel h-5 w-10 rounded-md" />
                  </td>
                  <td className="px-[18px] py-3.5">
                    <div className="skel ml-auto h-4 w-24" />
                  </td>
                  <td className="px-[18px] py-3.5">
                    <div className="skel ml-auto h-8 w-16" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
