import type { CustomerDetail } from "@/lib/customers/types";
import type { CustomerPdfData } from "@/lib/reports/types";

export function buildCustomerPdfData(customer: CustomerDetail): CustomerPdfData {
  return {
    nama: customer.nama,
    piutang: customer.piutang,
    sudahBayar: customer.sudahBayar,
    totalOmzet: customer.totalOmzetLunas,
    totalLaba: customer.totalLabaLunas,
    monthGroups: customer.monthGroups.map((group) => ({
      label: group.label,
      piutangTotal: group.piutangTotal,
      sudahBayarTotal: group.sudahBayarTotal,
      totalOmzetLunas: group.totalOmzetLunas,
      totalLabaLunas: group.totalLabaLunas,
      transactions: group.transactions.map((tx) => ({
        tanggal: tx.tanggal,
        nomor_bon: tx.nomor_bon,
        status: tx.status,
        total: tx.total,
      })),
    })),
  };
}
