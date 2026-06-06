"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Gift, Loader2, Plus, Trash2 } from "lucide-react";
import {
  bonusDiscountLabel,
  calculateLineItem,
  calculateTransactionSummary,
  formatIDR,
  stepsLabel,
} from "@/lib/calculations";
import { ProductTypeBadge } from "@/components/products/ProductTypeBadge";
import type { TransactionActionState } from "@/app/(dashboard)/transactions/actions";
import type {
  BonFormCustomer,
  BonFormProduct,
  TransactionDetail,
} from "@/lib/transactions/types";
import type { ProductType } from "@/types";

interface LineRow {
  uid: number;
  productId: string;
  qty: number;
}

interface BonFormProps {
  title?: string;
  customers: BonFormCustomer[];
  products: BonFormProduct[];
  initialData?: TransactionDetail;
  transactionId?: string;
  action: (
    prevState: TransactionActionState,
    formData: FormData,
  ) => Promise<TransactionActionState>;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

let nextUid = 1;
function createRow(): LineRow {
  return { uid: nextUid++, productId: "", qty: 1 };
}

export function BonForm({
  title = "Bon Baru",
  customers,
  products,
  initialData,
  action,
}: BonFormProps) {
  const [state, formAction, isPending] = useActionState(action, { error: null });
  const [nomorBon, setNomorBon] = useState(initialData?.nomor_bon ?? "");
  const [tanggal, setTanggal] = useState(initialData?.tanggal ?? todayIsoDate());
  const [customerId, setCustomerId] = useState(initialData?.customer_id ?? "");
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi ?? "");
  const [isBonus, setIsBonus] = useState(initialData?.is_bonus ?? false);
  const [ongkir, setOngkir] = useState(initialData?.ongkir ?? 0);
  const [customerQuery, setCustomerQuery] = useState("");
  const [rows, setRows] = useState<LineRow[]>(() => {
    if (initialData?.lines.length) {
      return initialData.lines.map((line) => ({
        uid: nextUid++,
        productId: line.product_id,
        qty: line.quantity,
      }));
    }
    return [createRow()];
  });

  const customer = useMemo(
    () => customers.find((item) => item.id === customerId) ?? null,
    [customers, customerId],
  );

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const computedRows = useMemo(() => {
    return rows.map((row) => {
      const product = productMap.get(row.productId);
      if (!product || !customer) {
        return { ...row, product: null, steps: [] as number[], calc: null };
      }

      const steps = customer.discounts[product.tipe];
      const calc = calculateLineItem({
        hargaBase: product.harga_base,
        hargaModal: product.harga_modal,
        discountSteps: steps,
        quantity: row.qty,
        isBonus,
      });

      return { ...row, product, steps, calc };
    });
  }, [rows, productMap, customer, isBonus]);

  const summary = useMemo(() => {
    const summaryLines = computedRows
      .filter((row) => row.product && row.calc)
      .map((row) => ({
        lineOmzet: row.calc!.lineOmzet,
        productType: row.product!.tipe as ProductType,
      }));

    return calculateTransactionSummary(summaryLines, ongkir);
  }, [computedRows, ongkir]);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((item) => item.nama.toLowerCase().includes(q));
  }, [customers, customerQuery]);

  function setRow(uid: number, patch: Partial<LineRow>) {
    setRows((current) =>
      current.map((row) => (row.uid === uid ? { ...row, ...patch } : row)),
    );
  }

  function addRow() {
    setRows((current) => [...current, createRow()]);
  }

  function removeRow(uid: number) {
    setRows((current) =>
      current.length > 1 ? current.filter((row) => row.uid !== uid) : current,
    );
  }

  return (
    <div className="animate-[fadeUp_280ms_ease]">
      <div className="mb-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <Link href="/transactions" className="hover:text-[var(--text-primary)]">
          Transaksi
        </Link>
        <span>/</span>
        <span className="font-medium text-[var(--text-primary)]">{title}</span>
      </div>

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-5">
          <section className="rounded-xl border border-[var(--border)] bg-white p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {title}
              </h1>
              <div className="text-right">
                <label
                  htmlFor="nomor_bon"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
                >
                  No. Bon
                </label>
                <input
                  id="nomor_bon"
                  type="text"
                  required
                  value={nomorBon}
                  onChange={(e) => setNomorBon(e.target.value)}
                  disabled={isPending}
                  placeholder="BON-001"
                  className="mono mt-1 h-10 w-44 rounded-md border border-[var(--border)] px-3 text-right text-sm font-medium text-[var(--primary)] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="tanggal"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
                >
                  Tanggal
                </label>
                <input
                  id="tanggal"
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  disabled={isPending}
                  className="h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
                />
              </div>
              <div>
                <label
                  htmlFor="customer_search"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
                >
                  Pelanggan
                </label>
                <input
                  id="customer_search"
                  type="search"
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                  placeholder="Cari pelanggan..."
                  disabled={isPending}
                  className="mb-2 h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
                />
                <select
                  id="customer_id"
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  disabled={isPending}
                  className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
                >
                  <option value="">Pilih pelanggan...</option>
                  {filteredCustomers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="deskripsi"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
              >
                Deskripsi
              </label>
              <textarea
                id="deskripsi"
                rows={2}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                disabled={isPending}
                placeholder="Catatan opsional untuk bon ini..."
                className="w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
              />
            </div>

            <div
              className={`mt-4 flex items-center justify-between gap-4 rounded-lg border p-3.5 ${
                isBonus
                  ? "border-[var(--bonus-border)] bg-[var(--bonus-bg)]"
                  : "border-[var(--border)] bg-[var(--surface-dim)]"
              }`}
            >
              <div className="flex gap-3">
                <Gift
                  size={18}
                  className={isBonus ? "text-[var(--bonus)]" : "text-[var(--text-tertiary)]"}
                />
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    Tandai sebagai Transaksi Bonus
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    Bon bonus tidak masuk omzet dan laba
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isBonus}
                disabled={isPending}
                onClick={() => setIsBonus((value) => !value)}
                className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
                  isBonus ? "bg-[var(--bonus)]" : "bg-[var(--border-strong)]"
                } disabled:opacity-60`}
              >
                <span
                  className={`absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    isBonus ? "translate-x-[18px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                Line Items
              </h2>
              <button
                type="button"
                disabled={isPending}
                onClick={addRow}
                className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary-subtle)] disabled:opacity-60"
              >
                <Plus size={16} />
                Tambah Produk
              </button>
            </div>

            {!customer ? (
              <div className="flex items-center gap-2 border-b border-[var(--piutang-border)] bg-[var(--piutang-bg)] px-5 py-2.5 text-xs text-[var(--piutang)]">
                <AlertCircle size={14} />
                Pilih pelanggan dulu agar diskon bertingkat terhitung otomatis.
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-dim)] text-left text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    <th className="px-5 py-2.5">Produk</th>
                    <th className="px-3 py-2.5 text-center">Qty</th>
                    <th className="px-3 py-2.5 text-right">Harga Base</th>
                    <th className="px-3 py-2.5 text-center">Diskon</th>
                    <th className="px-3 py-2.5 text-right">Harga Final</th>
                    <th className="px-3 py-2.5 text-right">Omzet</th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {computedRows.map((row) => (
                    <tr key={row.uid} className="border-t border-[var(--border)]">
                      <td className="px-5 py-2.5">
                        <select
                          value={row.productId}
                          onChange={(e) =>
                            setRow(row.uid, { productId: e.target.value })
                          }
                          disabled={isPending}
                          className="h-10 w-full min-w-[180px] rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-blue-600 disabled:opacity-60"
                        >
                          <option value="">Pilih produk...</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              [{product.tipe}] {product.nama}
                            </option>
                          ))}
                        </select>
                        {row.product ? (
                          <div className="mt-1.5">
                            <ProductTypeBadge tipe={row.product.tipe} />
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="number"
                          min={1}
                          value={row.qty}
                          onChange={(e) =>
                            setRow(row.uid, {
                              qty: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                          disabled={isPending}
                          className="mono h-9 w-14 rounded-md border border-[var(--border)] text-center text-sm outline-none focus:border-blue-600 disabled:opacity-60"
                        />
                      </td>
                      <td className="mono px-3 py-2.5 text-right text-sm text-[var(--text-secondary)]">
                        {row.product ? formatIDR(row.product.harga_base) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {row.product ? (
                          <span className="mono rounded bg-[var(--surface-dim)] px-2 py-1 text-xs text-[var(--text-secondary)]">
                            {isBonus
                              ? bonusDiscountLabel(true)
                              : stepsLabel(row.steps)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="mono px-3 py-2.5 text-right text-sm">
                        {row.calc ? formatIDR(row.calc.discountedUnitPrice) : "—"}
                      </td>
                      <td className="mono px-3 py-2.5 text-right text-sm font-semibold">
                        {row.calc ? formatIDR(row.calc.lineOmzet) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          disabled={isPending || rows.length === 1}
                          onClick={() => removeRow(row.uid)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-tertiary)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] disabled:opacity-40"
                          aria-label="Hapus baris"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-80">
          <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-[15px] font-semibold text-[var(--text-primary)]">
              Ringkasan Transaksi
            </h2>

            <SummaryLine label="Omzet LM" value={summary.omzetLm} />
            <SummaryLine label="Omzet BR" value={summary.omzetBr} />
            <hr className="my-2.5 border-[var(--border)]" />
            <SummaryLine label="Total Omzet" value={summary.totalOmzet} strong />

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm text-[var(--text-secondary)]">Ongkir</span>
              <div className="relative w-32">
                <span className="mono pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)]">
                  Rp
                </span>
                <input
                  type="number"
                  min={0}
                  value={ongkir}
                  onChange={(e) =>
                    setOngkir(Math.max(0, Number(e.target.value) || 0))
                  }
                  disabled={isPending}
                  className="mono h-9 w-full rounded-md border border-[var(--border)] pr-2 pl-8 text-right text-sm outline-none focus:border-blue-600 disabled:opacity-60"
                />
              </div>
            </div>

            <hr className="my-2.5 border-[var(--border)]" />
            <div className="flex items-end justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Total Tagihan
              </span>
              <span className="mono text-xl font-bold text-[var(--primary)]">
                {formatIDR(summary.totalTagihan)}
              </span>
            </div>

            {state.error ? (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2.5 text-xs text-[var(--danger)]"
              >
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {state.error}
              </div>
            ) : null}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData();
                formData.set(
                  "payload",
                  JSON.stringify({
                    nomor_bon: nomorBon,
                    tanggal,
                    customer_id: customerId,
                    deskripsi: deskripsi.trim() || null,
                    is_bonus: isBonus,
                    ongkir,
                    lines: computedRows
                      .filter((row) => row.productId)
                      .map((row) => ({
                        product_id: row.productId,
                        quantity: Math.max(1, row.qty),
                      })),
                  }),
                );
                formAction(formData);
              }}
              className="mt-5 space-y-2"
            >
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : initialData ? (
                  "Simpan Perubahan"
                ) : (
                  "Simpan sebagai Piutang"
                )}
              </button>
              <Link
                href="/transactions"
                className="inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
              >
                Batal
              </Link>
            </form>
          </div>
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
