export function formatPdfIdr(amount: number): string {
  const n = Math.round(amount || 0);
  return "Rp " + n.toLocaleString("id-ID");
}

export function slugifyFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function reportPdfFilename(periodLabel: string): string {
  const slug = slugifyFilename(periodLabel);
  return `laporan-${slug || "semua"}.pdf`;
}

export function customerPdfFilename(nama: string): string {
  return `customer-${slugifyFilename(nama) || "statement"}.pdf`;
}
