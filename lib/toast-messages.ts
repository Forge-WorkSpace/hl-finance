export const TOAST_MESSAGES = {
  "customer-created": "Pelanggan berhasil ditambahkan",
  "customer-updated": "Pelanggan berhasil diperbarui",
  "customer-deleted": "Pelanggan berhasil dihapus",
  "product-created": "Produk berhasil ditambahkan",
  "product-updated": "Produk berhasil diperbarui",
  "product-deleted": "Produk berhasil dihapus",
  "transaction-created": "Transaksi berhasil disimpan",
  "transaction-updated": "Transaksi berhasil diperbarui",
  "transaction-deleted": "Transaksi berhasil dihapus",
  "bonus-saved": "Bon bonus berhasil disimpan",
  "bon-settled": "Bon telah dilunasi",
  "month-settled": "Semua bon bulan ini telah dilunasi",
  "login-success": "Login berhasil",
} as const;

export type ToastKey = keyof typeof TOAST_MESSAGES;

export function withToastParam(path: string, toast: ToastKey): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}toast=${toast}`;
}
