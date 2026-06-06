"use client";

import { Loader2 } from "lucide-react";

interface DeleteProductDialogProps {
  open: boolean;
  productName: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteProductDialog({
  open,
  productName,
  isPending,
  onCancel,
  onConfirm,
}: DeleteProductDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[overlayIn_150ms_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-product-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-modal)] animate-[modalIn_200ms_ease-out]">
        <h2
          id="delete-product-title"
          className="text-lg font-semibold text-[var(--text-primary)]"
        >
          Hapus produk?
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Hapus produk <strong>{productName}</strong>? Produk tidak akan muncul
          di transaksi baru, tapi history tetap tersimpan.
        </p>
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
            onClick={onConfirm}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--danger)] px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-70"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
