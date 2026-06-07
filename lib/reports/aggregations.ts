import type {
  CustomerRecapRow,
  OverallMonthRow,
  OverallSummary,
  ReportFilters,
  ReportTransaction,
  TypeRecapRow,
} from "./types";
import type { ProductType } from "@/types";

function getLineProductType(
  line: ReportTransaction["transaction_lines"][number],
): ProductType {
  const product = line.products;
  if (!product) return "LM";
  if (Array.isArray(product)) return product[0]?.tipe ?? "LM";
  return product.tipe;
}

export function lineOmzetTotal(tx: ReportTransaction): number {
  return tx.transaction_lines.reduce(
    (sum, line) => sum + Number(line.line_omzet),
    0,
  );
}

export function transactionTotal(tx: ReportTransaction): number {
  return lineOmzetTotal(tx) + Number(tx.ongkir);
}

export function matchesTransactionPeriod(
  tanggal: string,
  filters: ReportFilters,
): boolean {
  const date = new Date(`${tanggal}T00:00:00`);
  if (date.getFullYear() !== filters.year) return false;
  if (filters.month !== null && date.getMonth() + 1 !== filters.month) {
    return false;
  }
  return true;
}

export function matchesLunasPeriod(
  tanggalLunas: string | null,
  month: number,
  year: number,
): boolean {
  if (!tanggalLunas) return false;
  const date = new Date(`${tanggalLunas}T00:00:00`);
  return date.getMonth() + 1 === month && date.getFullYear() === year;
}

function monthLabel(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function createEmptyCustomerRow(
  customerId: string,
  customerNama: string,
): CustomerRecapRow {
  return {
    customerId,
    customerNama,
    omzetLm: 0,
    omzetBr: 0,
    totalOmzet: 0,
    laba: 0,
    piutang: 0,
  };
}

export function buildCustomerRecap(
  transactions: ReportTransaction[],
  filters: ReportFilters,
): CustomerRecapRow[] {
  const map = new Map<string, CustomerRecapRow>();

  for (const tx of transactions) {
    if (!matchesTransactionPeriod(tx.tanggal, filters)) continue;

    const row =
      map.get(tx.customer_id) ??
      createEmptyCustomerRow(tx.customer_id, tx.customer_nama);
    const total = transactionTotal(tx);

    if (tx.status === "piutang") {
      row.piutang += total;
    }

    if (tx.status === "lunas") {
      for (const line of tx.transaction_lines) {
        const omzet = Number(line.line_omzet);
        const laba = Number(line.line_laba);
        row.laba += laba;
        if (getLineProductType(line) === "LM") row.omzetLm += omzet;
        else row.omzetBr += omzet;
      }
      row.totalOmzet = row.omzetLm + row.omzetBr;
    }

    map.set(tx.customer_id, row);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.customerNama.localeCompare(b.customerNama, "id"),
  );
}

export function buildTypeRecap(
  transactions: ReportTransaction[],
  filters: ReportFilters,
): TypeRecapRow[] {
  const map = new Map<string, TypeRecapRow>();

  for (const tx of transactions) {
    if (!matchesTransactionPeriod(tx.tanggal, filters)) continue;
    if (tx.status !== "lunas") continue;

    const date = new Date(`${tx.tanggal}T00:00:00`);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${year}-${month}`;

    const row = map.get(key) ?? {
      month,
      year,
      label: monthLabel(month, year),
      omzetLm: 0,
      omzetBr: 0,
      totalOmzet: 0,
      laba: 0,
    };

    for (const line of tx.transaction_lines) {
      const omzet = Number(line.line_omzet);
      const laba = Number(line.line_laba);
      row.laba += laba;
      if (getLineProductType(line) === "LM") row.omzetLm += omzet;
      else row.omzetBr += omzet;
    }
    row.totalOmzet = row.omzetLm + row.omzetBr;
    map.set(key, row);
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

export function buildOverallRecap(
  transactions: ReportTransaction[],
  filters: ReportFilters,
): { summary: OverallSummary; byMonth: OverallMonthRow[] } {
  const summary: OverallSummary = {
    totalOmzet: 0,
    totalLaba: 0,
    totalPiutang: 0,
    totalSudahBayar: 0,
  };
  const map = new Map<string, OverallMonthRow>();

  for (const tx of transactions) {
    if (!matchesTransactionPeriod(tx.tanggal, filters)) continue;

    const date = new Date(`${tx.tanggal}T00:00:00`);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${year}-${month}`;
    const total = transactionTotal(tx);

    const row = map.get(key) ?? {
      month,
      year,
      label: monthLabel(month, year),
      omzet: 0,
      laba: 0,
      piutang: 0,
      sudahBayar: 0,
    };

    if (tx.status === "piutang") {
      summary.totalPiutang += total;
      row.piutang += total;
    }

    if (tx.status === "lunas") {
      summary.totalSudahBayar += total;
      row.sudahBayar += total;

      for (const line of tx.transaction_lines) {
        const omzet = Number(line.line_omzet);
        const laba = Number(line.line_laba);
        summary.totalOmzet += omzet;
        summary.totalLaba += laba;
        row.omzet += omzet;
        row.laba += laba;
      }
    }

    map.set(key, row);
  }

  return {
    summary,
    byMonth: Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    }),
  };
}

export function sumCustomerRecap(rows: CustomerRecapRow[]): CustomerRecapRow {
  return rows.reduce(
    (acc, row) => ({
      customerId: "",
      customerNama: "TOTAL",
      omzetLm: acc.omzetLm + row.omzetLm,
      omzetBr: acc.omzetBr + row.omzetBr,
      totalOmzet: acc.totalOmzet + row.totalOmzet,
      laba: acc.laba + row.laba,
      piutang: acc.piutang + row.piutang,
    }),
    createEmptyCustomerRow("", "TOTAL"),
  );
}

export function sumTypeRecap(rows: TypeRecapRow[]): TypeRecapRow {
  return rows.reduce(
    (acc, row) => ({
      month: 0,
      year: 0,
      label: "TOTAL",
      omzetLm: acc.omzetLm + row.omzetLm,
      omzetBr: acc.omzetBr + row.omzetBr,
      totalOmzet: acc.totalOmzet + row.totalOmzet,
      laba: acc.laba + row.laba,
    }),
    {
      month: 0,
      year: 0,
      label: "TOTAL",
      omzetLm: 0,
      omzetBr: 0,
      totalOmzet: 0,
      laba: 0,
    },
  );
}

export function sumOverallMonths(rows: OverallMonthRow[]): OverallMonthRow {
  return rows.reduce(
    (acc, row) => ({
      month: 0,
      year: 0,
      label: "TOTAL",
      omzet: acc.omzet + row.omzet,
      laba: acc.laba + row.laba,
      piutang: acc.piutang + row.piutang,
      sudahBayar: acc.sudahBayar + row.sudahBayar,
    }),
    {
      month: 0,
      year: 0,
      label: "TOTAL",
      omzet: 0,
      laba: 0,
      piutang: 0,
      sudahBayar: 0,
    },
  );
}

export function formatTrend(current: number, previous: number): string {
  if (previous <= 0) {
    return current > 0 ? "Baru bulan ini" : "—";
  }
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1).replace(".", ",")}% vs bulan lalu`;
}
