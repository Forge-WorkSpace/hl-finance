import type { ProductType } from "@/types";

export function formatIDR(amount: number): string {
  const n = Math.round(amount || 0);
  return "Rp " + n.toLocaleString("id-ID");
}

export function applyCascade(price: number, steps: number[]): number {
  return steps.reduce((acc, s) => acc * (1 - s / 100), price);
}

export function effectivePct(steps: number[]): number {
  const factor = steps.reduce((acc, s) => acc * (1 - s / 100), 1);
  return (1 - factor) * 100;
}

export function stepsLabel(steps: number[]): string {
  if (!steps.length) return "—";
  return steps.map((s) => s + "%").join(" → ");
}

export function bonusDiscountLabel(isBonus: boolean): string {
  return isBonus ? "GRATIS" : "";
}

export interface LineCalcInput {
  hargaBase: number;
  hargaModal: number;
  discountSteps: number[];
  quantity: number;
  isBonus: boolean;
}

export interface LineCalcResult {
  discountedUnitPrice: number;
  lineOmzet: number;
  lineLaba: number;
}

export function calculateLineItem(input: LineCalcInput): LineCalcResult {
  const qty = Math.max(1, input.quantity);

  if (input.isBonus) {
    return { discountedUnitPrice: 0, lineOmzet: 0, lineLaba: 0 };
  }

  const discountedUnitPrice = applyCascade(input.hargaBase, input.discountSteps);
  const lineOmzet = discountedUnitPrice * qty;
  const lineLaba = (discountedUnitPrice - input.hargaModal) * qty;

  return { discountedUnitPrice, lineOmzet, lineLaba };
}

export interface TransactionSummaryLine {
  lineOmzet: number;
  productType: ProductType;
}

export interface TransactionSummaryResult {
  omzetLm: number;
  omzetBr: number;
  totalOmzet: number;
  totalTagihan: number;
}

export function calculateTransactionSummary(
  lines: TransactionSummaryLine[],
  ongkir: number,
): TransactionSummaryResult {
  const omzetLm = lines
    .filter((line) => line.productType === "LM")
    .reduce((sum, line) => sum + line.lineOmzet, 0);
  const omzetBr = lines
    .filter((line) => line.productType === "BR")
    .reduce((sum, line) => sum + line.lineOmzet, 0);
  const totalOmzet = omzetLm + omzetBr;
  const totalTagihan = totalOmzet + Math.max(0, ongkir);

  return { omzetLm, omzetBr, totalOmzet, totalTagihan };
}
