import type { CustomerMonthGroup, CustomerTransactionRow } from "./types";
import type { ProductType } from "@/types";

type RawLine = {
  line_omzet: number;
  line_laba: number;
  products: { tipe: ProductType } | { tipe: ProductType }[] | null;
};

type RawTransaction = {
  id: string;
  nomor_bon: string;
  tanggal: string;
  status: "piutang" | "lunas";
  is_bonus: boolean;
  ongkir: number;
  transaction_lines: RawLine[] | null;
};

function getProductType(line: RawLine): ProductType {
  const product = line.products;
  if (!product) return "LM";
  if (Array.isArray(product)) return product[0]?.tipe ?? "LM";
  return product.tipe;
}

function mapTransaction(tx: RawTransaction): CustomerTransactionRow {
  const lines = tx.transaction_lines ?? [];
  const lineTotal = lines.reduce(
    (sum, line) => sum + Number(line.line_omzet),
    0,
  );

  return {
    id: tx.id,
    nomor_bon: tx.nomor_bon,
    tanggal: tx.tanggal,
    status: tx.status,
    is_bonus: tx.is_bonus,
    total: lineTotal + Number(tx.ongkir),
  };
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

function monthLabel(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

export function buildCustomerMonthGroups(
  rawTransactions: RawTransaction[],
): CustomerMonthGroup[] {
  const grouped = new Map<string, RawTransaction[]>();

  for (const tx of rawTransactions) {
    const date = new Date(`${tx.tanggal}T00:00:00`);
    const key = monthKey(date);
    const list = grouped.get(key) ?? [];
    list.push(tx);
    grouped.set(key, list);
  }

  const groups: CustomerMonthGroup[] = [];

  for (const [key, txs] of grouped.entries()) {
    const [yearStr, monthStr] = key.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);

    let piutangTotal = 0;
    let sudahBayarTotal = 0;
    let omzetLmLunas = 0;
    let omzetBrLunas = 0;
    let totalOmzetLunas = 0;
    let totalLabaLunas = 0;
    let hasSettleablePiutang = false;

    const transactions = txs
      .map(mapTransaction)
      .sort(
        (a, b) =>
          new Date(`${b.tanggal}T00:00:00`).getTime() -
          new Date(`${a.tanggal}T00:00:00`).getTime(),
      );

    for (const tx of txs) {
      const row = mapTransaction(tx);
      if (tx.status === "piutang") {
        piutangTotal += row.total;
        if (!tx.is_bonus) hasSettleablePiutang = true;
      } else {
        sudahBayarTotal += row.total;
      }

      if (tx.status === "lunas" && !tx.is_bonus) {
        for (const line of tx.transaction_lines ?? []) {
          const omzet = Number(line.line_omzet);
          const laba = Number(line.line_laba);
          totalOmzetLunas += omzet;
          totalLabaLunas += laba;
          if (getProductType(line) === "LM") omzetLmLunas += omzet;
          else omzetBrLunas += omzet;
        }
      }
    }

    groups.push({
      month,
      year,
      label: monthLabel(month, year),
      transactions,
      piutangTotal,
      sudahBayarTotal,
      omzetLmLunas,
      omzetBrLunas,
      totalOmzetLunas,
      totalLabaLunas,
      hasSettleablePiutang,
      allLunas: !txs.some((tx) => tx.status === "piutang"),
    });
  }

  return groups.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}

export function calculateBonusAvailable(
  accumulator: number,
  threshold: number,
  bonusesGranted: number,
): number {
  if (threshold <= 0) return 0;
  return Math.max(0, Math.floor(accumulator / threshold) - bonusesGranted);
}

export function summarizeCustomerTransactions(rawTransactions: RawTransaction[]) {
  let sudahBayar = 0;
  let totalOmzetLunas = 0;
  let totalLabaLunas = 0;
  let bonusAccumulator = 0;

  for (const tx of rawTransactions) {
    const row = mapTransaction(tx);
    if (tx.status === "lunas") {
      sudahBayar += row.total;
    }

    if (tx.status === "lunas" && !tx.is_bonus) {
      for (const line of tx.transaction_lines ?? []) {
        const omzet = Number(line.line_omzet);
        const laba = Number(line.line_laba);
        totalOmzetLunas += omzet;
        totalLabaLunas += laba;
        bonusAccumulator += omzet;
      }
    }
  }

  return { sudahBayar, totalOmzetLunas, totalLabaLunas, bonusAccumulator };
}
