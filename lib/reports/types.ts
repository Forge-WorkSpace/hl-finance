import type { TransactionStatus } from "@/types";

export interface ReportFilters {
  month: number | null;
  year: number;
}

export interface ReportTransactionLine {
  line_omzet: number;
  line_laba: number;
  products: { tipe: "LM" | "BR" } | { tipe: "LM" | "BR" }[] | null;
}

export interface ReportTransaction {
  id: string;
  nomor_bon: string;
  tanggal: string;
  status: TransactionStatus;
  is_bonus: boolean;
  ongkir: number;
  tanggal_lunas: string | null;
  customer_id: string;
  customer_nama: string;
  transaction_lines: ReportTransactionLine[];
}

export interface DashboardStats {
  totalPiutang: number;
  lunasBulanIni: number;
  omzetBulanIni: number;
  labaBulanIni: number;
  lunasTrend: string;
  omzetTrend: string;
  labaTrend: string;
  piutangSubtext: string;
}

export interface RecentTransactionRow {
  id: string;
  nomor_bon: string;
  tanggal: string;
  customer_nama: string;
  total: number;
  status: TransactionStatus;
}

export interface CustomerRecapRow {
  customerId: string;
  customerNama: string;
  omzetLm: number;
  omzetBr: number;
  totalOmzet: number;
  laba: number;
  piutang: number;
}

export interface TypeRecapRow {
  month: number;
  year: number;
  label: string;
  omzetLm: number;
  omzetBr: number;
  totalOmzet: number;
  laba: number;
}

export interface OverallSummary {
  totalOmzet: number;
  totalLaba: number;
  totalPiutang: number;
  totalSudahBayar: number;
}

export interface OverallMonthRow {
  month: number;
  year: number;
  label: string;
  omzet: number;
  laba: number;
  piutang: number;
  sudahBayar: number;
}

export interface ReportData {
  filters: ReportFilters;
  byCustomer: CustomerRecapRow[];
  byType: TypeRecapRow[];
  overallSummary: OverallSummary;
  overallByMonth: OverallMonthRow[];
}

export interface CustomerPdfData {
  nama: string;
  piutang: number;
  sudahBayar: number;
  totalOmzet: number;
  totalLaba: number;
  monthGroups: {
    label: string;
    transactions: {
      tanggal: string;
      nomor_bon: string;
      status: TransactionStatus;
      total: number;
    }[];
    piutangTotal: number;
    sudahBayarTotal: number;
    totalOmzetLunas: number;
    totalLabaLunas: number;
  }[];
}
