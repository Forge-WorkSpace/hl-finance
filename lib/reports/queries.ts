import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildCustomerRecap,
  buildOverallRecap,
  buildTypeRecap,
  formatTrend,
  lineOmzetTotal,
  matchesLunasPeriod,
  transactionTotal,
} from "./aggregations";
import type {
  DashboardStats,
  RecentTransactionRow,
  ReportData,
  ReportFilters,
  ReportTransaction,
} from "./types";

type RawTransactionRow = {
  id: string;
  nomor_bon: string;
  tanggal: string;
  status: "piutang" | "lunas";
  is_bonus: boolean;
  ongkir: number;
  tanggal_lunas: string | null;
  customer_id: string;
  customers: { nama: string } | { nama: string }[] | null;
  transaction_lines: ReportTransaction["transaction_lines"] | null;
};

function mapReportTransaction(row: RawTransactionRow): ReportTransaction {
  const customerRaw = row.customers;
  const customer = Array.isArray(customerRaw) ? customerRaw[0] : customerRaw;

  return {
    id: row.id,
    nomor_bon: row.nomor_bon,
    tanggal: row.tanggal,
    status: row.status,
    is_bonus: row.is_bonus,
    ongkir: Number(row.ongkir),
    tanggal_lunas: row.tanggal_lunas,
    customer_id: row.customer_id,
    customer_nama: customer?.nama ?? "—",
    transaction_lines: row.transaction_lines ?? [],
  };
}

export async function fetchReportTransactions(
  supabase: SupabaseClient,
): Promise<ReportTransaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, nomor_bon, tanggal, status, is_bonus, ongkir, tanggal_lunas, customer_id, customers(nama), transaction_lines(line_omzet, line_laba, products(tipe))",
    )
    .eq("is_bonus", false)
    .order("tanggal", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapReportTransaction(row as RawTransactionRow));
}

export async function getDashboardData(supabase: SupabaseClient): Promise<{
  stats: DashboardStats;
  recentTransactions: RecentTransactionRow[];
}> {
  const transactions = await fetchReportTransactions(supabase);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  let totalPiutang = 0;
  let piutangCount = 0;
  let lunasBulanIni = 0;
  let lunasBulanLalu = 0;
  let omzetBulanIni = 0;
  let omzetBulanLalu = 0;
  let labaBulanIni = 0;
  let labaBulanLalu = 0;

  for (const tx of transactions) {
    const total = transactionTotal(tx);

    if (tx.status === "piutang") {
      totalPiutang += total;
      piutangCount += 1;
    }

    if (tx.status === "lunas") {
      if (matchesLunasPeriod(tx.tanggal_lunas, currentMonth, currentYear)) {
        lunasBulanIni += total;
        omzetBulanIni += lineOmzetTotal(tx);
        for (const line of tx.transaction_lines) {
          labaBulanIni += Number(line.line_laba);
        }
      }

      if (matchesLunasPeriod(tx.tanggal_lunas, prevMonth, prevYear)) {
        lunasBulanLalu += total;
        omzetBulanLalu += lineOmzetTotal(tx);
        for (const line of tx.transaction_lines) {
          labaBulanLalu += Number(line.line_laba);
        }
      }
    }
  }

  const marginPct =
    omzetBulanIni > 0
      ? ((labaBulanIni / omzetBulanIni) * 100).toFixed(1).replace(".", ",")
      : "0";

  const stats: DashboardStats = {
    totalPiutang,
    lunasBulanIni,
    omzetBulanIni,
    labaBulanIni,
    piutangSubtext: `${piutangCount} bon belum lunas`,
    lunasTrend: formatTrend(lunasBulanIni, lunasBulanLalu),
    omzetTrend: formatTrend(omzetBulanIni, omzetBulanLalu),
    labaTrend: `Margin ${marginPct}%`,
  };

  const recentTransactions: RecentTransactionRow[] = transactions
    .slice(0, 5)
    .map((tx) => ({
      id: tx.id,
      nomor_bon: tx.nomor_bon,
      tanggal: tx.tanggal,
      customer_nama: tx.customer_nama,
      total: transactionTotal(tx),
      status: tx.status,
    }));

  return { stats, recentTransactions };
}

export function buildReportData(
  transactions: ReportTransaction[],
  filters: ReportFilters,
): ReportData {
  const byCustomer = buildCustomerRecap(transactions, filters);
  const byType = buildTypeRecap(transactions, filters);
  const { summary: overallSummary, byMonth: overallByMonth } = buildOverallRecap(
    transactions,
    filters,
  );

  return {
    filters,
    byCustomer,
    byType,
    overallSummary,
    overallByMonth,
  };
}

export function parseReportFilters(searchParams: {
  month?: string;
  year?: string;
}): ReportFilters {
  const now = new Date();
  const year = Number(searchParams.year) || now.getFullYear();
  const monthRaw = searchParams.month;

  if (!monthRaw || monthRaw === "all") {
    return { month: null, year };
  }

  const month = Number(monthRaw);
  return {
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : null,
    year,
  };
}

export function reportPeriodLabel(filters: ReportFilters): string {
  if (filters.month === null) {
    return `Tahun ${filters.year}`;
  }
  return new Date(filters.year, filters.month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}
