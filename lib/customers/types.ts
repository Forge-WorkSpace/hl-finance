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
};

export type CustomerTransactionRow = {
  id: string;
  nomor_bon: string;
  tanggal: string;
  status: "piutang" | "lunas";
  is_bonus: boolean;
  total: number;
};
