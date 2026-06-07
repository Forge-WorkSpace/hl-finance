"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { formatIDR } from "@/lib/calculations";

interface LunasModalProps {
  open: boolean;
  customerName: string;
  totalTagihan: number;
  isPending: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (tanggalLunas: string) => void;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function LunasModal({
  open,
  customerName,
  totalTagihan,
  isPending,
  error,
  onCancel,
  onConfirm,
}: LunasModalProps) {
  const [tanggalLunas, setTanggalLunas] = useState(todayIsoDate);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lunas-modal-title"
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2
          id="lunas-modal-title"
          className="text-lg font-semibold text-[var(--text-primary)]"
        >
          Konfirmasi Pelunasan
        </h2>

        <div className="mt-4 rounded-lg bg-[var(--surface-dim)] px-4 py-3">
          <p className="text-sm text-[var(--text-secondary)]">{customerName}</p>
          <p className="mono mt-1 text-2xl font-bold text-[var(--primary)]">
            {formatIDR(totalTagihan)}
          </p>
        </div>

        <div className="mt-4">
          <label
            htmlFor="tanggal_lunas"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
          >
            Tanggal Pelunasan
          </label>
          <input
            id="tanggal_lunas"
            type="date"
            required
            value={tanggalLunas}
            onChange={(event) => setTanggalLunas(event.target.value)}
            disabled={isPending}
            className="h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
          />
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="inline-flex h-10 items-center rounded-md border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-dim)] disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onConfirm(tanggalLunas)}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-70"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Memproses...
              </>
            ) : (
              "Konfirmasi Lunas"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
