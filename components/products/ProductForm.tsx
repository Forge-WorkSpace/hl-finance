"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ProductListItem } from "@/lib/products/types";
import { formatIDR } from "@/lib/calculations";
import type { ProductActionState } from "@/app/(dashboard)/products/actions";
import type { ProductType } from "@/types";

interface ProductFormProps {
  title: string;
  submitLabel: string;
  initialData?: ProductListItem;
  action: (
    prevState: ProductActionState,
    formData: FormData,
  ) => Promise<ProductActionState>;
}

function useIdrField(initial: number) {
  const [display, setDisplay] = useState(
    initial > 0 ? initial.toLocaleString("id-ID") : "0",
  );

  const value = useMemo(
    () => Number(display.replace(/\./g, "") || 0),
    [display],
  );

  function onChange(raw: string) {
    const digits = raw.replace(/\D/g, "");
    setDisplay(digits ? Number(digits).toLocaleString("id-ID") : "0");
  }

  return { display, value, onChange };
}

export function ProductForm({
  title,
  submitLabel,
  initialData,
  action,
}: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, { error: null });
  const [tipe, setTipe] = useState<ProductType>(initialData?.tipe ?? "LM");
  const hargaBase = useIdrField(initialData?.harga_base ?? 0);
  const hargaModal = useIdrField(initialData?.harga_modal ?? 0);

  return (
    <div className="mx-auto max-w-2xl animate-[fadeUp_280ms_ease]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Isi informasi produk dan harga jual.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="mb-4 text-[15px] font-semibold text-[var(--text-primary)]">
            Info Produk
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="nama"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
              >
                Nama Produk
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

            <fieldset>
              <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                Tipe Produk
              </legend>
              <div className="flex gap-3">
                {(["LM", "BR"] as const).map((option) => (
                  <label
                    key={option}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                      tipe === option
                        ? option === "LM"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-violet-200 bg-violet-50 text-violet-700"
                        : "border-[var(--border)] bg-white text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
                    } ${isPending ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <input
                      type="radio"
                      name="tipe"
                      value={option}
                      checked={tipe === option}
                      onChange={() => setTipe(option)}
                      disabled={isPending}
                      className="sr-only"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="harga_base"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
              >
                Harga Base / Jual (IDR)
              </label>
              <input
                id="harga_base"
                name="harga_base"
                type="text"
                inputMode="numeric"
                required
                value={hargaBase.display}
                onChange={(e) => hargaBase.onChange(e.target.value)}
                disabled={isPending}
                className="mono h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
              />
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                Nilai: {formatIDR(hargaBase.value)}
              </p>
            </div>

            <div>
              <label
                htmlFor="harga_modal"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
              >
                Harga Modal (IDR)
              </label>
              <input
                id="harga_modal"
                name="harga_modal"
                type="text"
                inputMode="numeric"
                required
                value={hargaModal.display}
                onChange={(e) => hargaModal.onChange(e.target.value)}
                disabled={isPending}
                className="mono h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
              />
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                Harga modal hanya digunakan untuk kalkulasi laba internal. Tidak
                ditampilkan sebagai harga ke customer.
              </p>
            </div>
          </div>
        </section>

        {state.error ? (
          <div
            role="alert"
            className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2.5 text-sm text-[var(--danger)]"
          >
            {state.error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
          <Link
            href="/products"
            className="inline-flex h-10 items-center rounded-md border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
          >
            Batal
          </Link>
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
