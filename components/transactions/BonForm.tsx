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
import { CustomerCombobox } from "@/components/transactions/CustomerCombobox";
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
  defaultNomorBon?: string;
  initialCustomerId?: string;
  bonusMode?: boolean;
  bonusesAvailable?: number;
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
  defaultNomorBon,
  initialCustomerId,
  bonusMode = false,
  bonusesAvailable = 0,
  initialData,
  action,
}: BonFormProps) {
  const [state, formAction, isPending] = useActionState(action, { error: null });
  const nomorBon = initialData?.nomor_bon ?? defaultNomorBon ?? "";
  const [tanggal, setTanggal] = useState(initialData?.tanggal ?? todayIsoDate());
  const [customerId, setCustomerId] = useState(
    initialData?.customer_id ?? initialCustomerId ?? "",
  );
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi ?? "");
  const [isBonus, setIsBonus] = useState(initialData?.is_bonus ?? bonusMode);
  const [bonusesToClaim, setBonusesToClaim] = useState(
    bonusMode && bonusesAvailable > 0 ? 1 : 0,
  );
  const [ongkir, setOngkir] = useState(
    bonusMode ? 0 : (initialData?.ongkir ?? 0),
  );
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

  const hasValidLines = computedRows.some((row) => row.productId);
  const bonusClaimValid =
    !isBonus || (bonusesToClaim >= 1 && bonusesToClaim <= bonusesAvailable);
  const canSubmit =
    Boolean(customerId) &&
    hasValidLines &&
    bonusClaimValid &&
    (!bonusMode || bonusesAvailable > 0);

  const payloadJson = useMemo(
    () =>
      JSON.stringify({
        nomor_bon: nomorBon,
        tanggal,
        customer_id: customerId,
        deskripsi: deskripsi.trim() || null,
        is_bonus: isBonus,
        ongkir: isBonus ? 0 : ongkir,
        bonuses_to_claim: isBonus ? bonusesToClaim : undefined,
        lines: computedRows
          .filter((row) => row.productId)
          .map((row) => ({
            product_id: row.productId,
            quantity: Math.max(1, row.qty),
          })),
      }),
    [
      nomorBon,
      tanggal,
      customerId,
      deskripsi,
      isBonus,
      ongkir,
      bonusesToClaim,
      computedRows,
    ],
  );

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
          {bonusMode ? (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3.5">
              <Gift size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Bon Bonus — produk yang ditambahkan gratis, tidak masuk omzet
                </p>
                <p className="mt-0.5 text-xs text-amber-700">
                  Transaksi Bonus: {bonusesAvailable} bonus tersedia untuk pelanggan
                  ini
                </p>
              </div>
            </div>
          ) : null}

          {bonusMode && bonusesAvailable === 0 ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              Pelanggan belum memiliki bonus yang bisa diklaim.
            </div>
          ) : null}

          <section className="rounded-xl border border-[var(--border)] bg-white p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {title}
              </h1>
              <div className="text-right">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  No. Bon
                </span>
                <span className="mono mt-1 block text-[15px] font-medium text-[var(--primary)]">
                  {nomorBon || "—"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                  htmlFor="customer_id"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
                >
                  Pelanggan
                </label>
                <CustomerCombobox
                  customers={customers}
                  value={customerId}
                  onChange={setCustomerId}
                  disabled={isPending || bonusMode}
                />
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
                disabled={isPending || bonusMode}
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

            {isBonus ? (
              <div className="mt-4">
                <label
                  htmlFor="bonuses_to_claim"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
                >
                  Jumlah Bonus Diklaim
                </label>
                <input
                  id="bonuses_to_claim"
                  type="number"
                  min={1}
                  max={Math.max(1, bonusesAvailable)}
                  value={bonusesToClaim || ""}
                  onChange={(e) =>
                    setBonusesToClaim(
                      Math.max(1, Math.min(bonusesAvailable, Number(e.target.value) || 1)),
                    )
                  }
                  disabled={isPending || bonusesAvailable === 0}
                  required
                  className="mono h-11 w-full max-w-[160px] rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
                />
                <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                  Maksimal {bonusesAvailable} bonus tersedia
                </p>
              </div>
            ) : null}
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

            <div className="table-scroll">
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
                        {row.calc
                          ? isBonus
                            ? "GRATIS"
                            : formatIDR(row.calc.discountedUnitPrice)
                          : "—"}
                      </td>
                      <td className="mono px-3 py-2.5 text-right text-sm font-semibold">
                        {row.calc
                          ? isBonus
                            ? "GRATIS"
                            : formatIDR(row.calc.lineOmzet)
                          : "—"}
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

        <aside className="order-last w-full shrink-0 lg:order-none lg:sticky lg:top-24 lg:w-80">
          <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-[15px] font-semibold text-[var(--text-primary)]">
              Ringkasan Transaksi
            </h2>

            <SummaryLine
              label="Omzet LM"
              value={summary.omzetLm}
              isBonus={isBonus}
            />
            <SummaryLine
              label="Omzet BR"
              value={summary.omzetBr}
              isBonus={isBonus}
            />
            <hr className="my-2.5 border-[var(--border)]" />
            <SummaryLine
              label="Total Omzet"
              value={summary.totalOmzet}
              strong
              isBonus={isBonus}
            />

            {!isBonus ? (
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
            ) : null}

            <hr className="my-2.5 border-[var(--border)]" />
            <div className="flex items-end justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Total Tagihan
              </span>
              <span className="mono text-xl font-bold text-[var(--primary)]">
                {isBonus ? "GRATIS" : formatIDR(summary.totalTagihan)}
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

            <form action={formAction} className="mt-5 space-y-2">
              <input type="hidden" name="payload" value={payloadJson} readOnly />
              <button
                type="submit"
                disabled={isPending || !canSubmit}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : initialData ? (
                  "Simpan Perubahan"
                ) : isBonus ? (
                  "Simpan Bon Bonus"
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
  isBonus,
}: {
  label: string;
  value: number;
  strong?: boolean;
  isBonus?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span
        className={`text-sm ${strong ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
      >
        {label}
      </span>
      <span className={`mono text-sm ${strong ? "font-semibold" : ""}`}>
        {isBonus ? "GRATIS" : formatIDR(value)}
      </span>
    </div>
  );
}
