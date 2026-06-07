import type { Customer, ProductType } from "@/types";

export type CustomerDiscounts = Record<ProductType, number[]>;

export type CustomerListItem = Customer & {
  discounts: CustomerDiscounts;
  piutang: number;
  bonusCount: number;
};

export type CustomerDetail = CustomerListItem & {
  transactionCount: number;
  lunasCount: number;
  transactions: CustomerTransactionRow[];
  sudahBayar: number;
  totalOmzetLunas: number;
  totalLabaLunas: number;
  bonusAccumulator: number;
  bonusesGranted: number;
  bonusesAvailable: number;
  monthGroups: CustomerMonthGroup[];
};

export type CustomerMonthGroup = {
  month: number;
  year: number;
  label: string;
  transactions: CustomerTransactionRow[];
  piutangTotal: number;
  sudahBayarTotal: number;
  omzetLmLunas: number;
  omzetBrLunas: number;
  totalOmzetLunas: number;
  totalLabaLunas: number;
  hasSettleablePiutang: boolean;
  allLunas: boolean;
};

export type CustomerTransactionRow = {
  id: string;
  nomor_bon: string;
  tanggal: string;
  status: "piutang" | "lunas";
  is_bonus: boolean;
  total: number;
};
