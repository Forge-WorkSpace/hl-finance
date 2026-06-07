"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { CustomerListItem } from "@/lib/customers/types";
import {
  applyCascade,
  effectivePct,
  formatIDR,
} from "@/lib/calculations";
import {
  deleteCustomer,
  type CustomerActionState,
} from "@/app/(dashboard)/customers/actions";
import type { ProductType } from "@/types";

const PREVIEW_BASE = 100_000;

interface CustomerFormProps {
  title: string;
  submitLabel: string;
  initialData?: CustomerListItem;
  action: (
    prevState: CustomerActionState,
    formData: FormData,
  ) => Promise<CustomerActionState>;
  customerId?: string;
}

function DiscountSection({
  tipe,
  label,
  steps,
  onChange,
  disabled,
}: {
  tipe: ProductType;
  label: string;
  steps: number[];
  onChange: (steps: number[]) => void;
  disabled: boolean;
}) {
  const previewPrice = applyCascade(PREVIEW_BASE, steps);
  const previewPct = effectivePct(steps);

  function updateStep(index: number, value: string) {
    const next = [...steps];
    next[index] = value === "" ? 0 : Number(value);
    onChange(next);
  }

  function addStep() {
    onChange([...steps, 0]);
  }

  function removeStep(index: number) {
    onChange(steps.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">{label}</h2>
          <span className="rounded-full bg-[var(--primary-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--primary)]">
            Cascading
          </span>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold ${
            tipe === "LM"
              ? "bg-blue-50 text-blue-700"
              : "bg-violet-50 text-violet-700"
          }`}
        >
          {tipe}
        </span>
      </div>

      <div className="space-y-2">
        {steps.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)]">Belum ada step diskon.</p>
        ) : (
          steps.map((step, index) => (
            <div key={`${tipe}-${index}`} className="flex items-center gap-2">
              <span className="w-16 text-xs text-[var(--text-tertiary)]">
                Step {index + 1}
              </span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={step}
                disabled={disabled}
                onChange={(e) => updateStep(index, e.target.value)}
                className="h-10 w-24 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
              />
              <span className="text-sm text-[var(--text-secondary)]">%</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeStep(index)}
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-[var(--text-tertiary)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] disabled:opacity-60"
                aria-label="Hapus step"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={addStep}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-blue-700 disabled:opacity-60"
      >
        <Plus size={16} />
        Tambah Step
      </button>

      <div className="mono mt-4 break-words rounded-lg bg-[var(--surface-dim)] px-3 py-2.5 text-[13px] text-[var(--text-secondary)]">
        Harga {formatIDR(PREVIEW_BASE)} → {formatIDR(previewPrice)} (efektif{" "}
        {previewPct.toFixed(1).replace(".", ",")}%)
      </div>
    </section>
  );
}

export function CustomerForm({
  title,
  submitLabel,
  initialData,
  action,
  customerId,
}: CustomerFormProps) {
  const [state, formAction, isPending] = useActionState(action, { error: null });
  const [discountLm, setDiscountLm] = useState<number[]>(
    initialData?.discounts.LM ?? [],
  );
  const [discountBr, setDiscountBr] = useState<number[]>(
    initialData?.discounts.BR ?? [],
  );
  const [thresholdDisplay, setThresholdDisplay] = useState(
    initialData ? String(initialData.bonus_threshold) : "0",
  );

  const thresholdValue = useMemo(
    () => Number(thresholdDisplay.replace(/\./g, "") || 0),
    [thresholdDisplay],
  );

  function formatThresholdInput(value: string) {
    const digits = value.replace(/\D/g, "");
    setThresholdDisplay(digits ? Number(digits).toLocaleString("id-ID") : "");
  }

  async function handleDelete() {
    if (!customerId) return;
    if (
      !window.confirm(
        "Hapus pelanggan ini? Data tetap tersimpan (soft delete).",
      )
    ) {
      return;
    }
    await deleteCustomer(customerId);
  }

  return (
    <div className="page-content mx-auto w-full min-w-0 max-w-2xl animate-[fadeUp_280ms_ease]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Isi informasi pelanggan dan ketentuan diskon bertingkat.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="mb-4 text-[15px] font-semibold text-[var(--text-primary)]">
            Info Dasar
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="nama"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
              >
                Nama Pelanggan
              </label>
              <input
                id="nama"
                name="nama"
                type="text"
                required
                minLength={2}
                defaultValue={initialData?.nama ?? ""}
                disabled={isPending}
                className="h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
              />
            </div>
            <div>
              <label
                htmlFor="bonus_threshold"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
              >
                Threshold Bonus (IDR)
              </label>
              <input
                id="bonus_threshold"
                name="bonus_threshold"
                type="text"
                inputMode="numeric"
                required
                value={thresholdDisplay}
                onChange={(e) => formatThresholdInput(e.target.value)}
                disabled={isPending}
                className="mono h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
              />
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                Nilai: {formatIDR(thresholdValue)}
              </p>
            </div>
          </div>
        </section>

        <input type="hidden" name="discount_lm" value={JSON.stringify(discountLm)} />
        <input type="hidden" name="discount_br" value={JSON.stringify(discountBr)} />

        <DiscountSection
          tipe="LM"
          label="Diskon LM"
          steps={discountLm}
          onChange={setDiscountLm}
          disabled={isPending}
        />

        <DiscountSection
          tipe="BR"
          label="Diskon BR"
          steps={discountBr}
          onChange={setDiscountBr}
          disabled={isPending}
        />

        {state.error ? (
          <div
            role="alert"
            className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2.5 text-sm text-[var(--danger)]"
          >
            {state.error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
          <div className="flex gap-2">
            <Link
              href={initialData ? `/customers/${initialData.id}` : "/customers"}
              className="inline-flex h-10 items-center rounded-md border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
            >
              Batal
            </Link>
            {customerId ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="inline-flex h-10 items-center rounded-md border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 text-sm font-medium text-[var(--danger)] hover:opacity-90 disabled:opacity-60"
              >
                Hapus
              </button>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
