import type { ProductType, TransactionStatus } from "@/types";
import type { CustomerDiscounts } from "@/lib/customers/types";

export interface TransactionListItem {
  id: string;
  nomor_bon: string;
  tanggal: string;
  customer_id: string;
  customer_nama: string;
  ongkir: number;
  is_bonus: boolean;
  status: TransactionStatus;
  total: number;
  created_at: string;
}

export interface BonFormCustomer {
  id: string;
  nama: string;
  discounts: CustomerDiscounts;
}

export interface BonFormProduct {
  id: string;
  nama: string;
  harga_base: number;
  harga_modal: number;
  tipe: ProductType;
}

export interface BonFormLineInput {
  product_id: string;
  quantity: number;
}

export interface TransactionDetailLine {
  id: string;
  product_id: string;
  product_nama: string;
  product_tipe: ProductType;
  quantity: number;
  snapshot_harga_base: number;
  snapshot_harga_modal: number;
  snapshot_discounts: number[];
  discounted_unit_price: number;
  line_omzet: number;
  line_laba: number;
}

export interface TransactionDetail {
  id: string;
  nomor_bon: string;
  tanggal: string;
  customer_id: string;
  customer_nama: string;
  ongkir: number;
  deskripsi: string | null;
  is_bonus: boolean;
  status: TransactionStatus;
  tanggal_lunas: string | null;
  created_at: string;
  lines: TransactionDetailLine[];
}

export interface TransactionPayload {
  nomor_bon: string;
  tanggal: string;
  customer_id: string;
  deskripsi: string | null;
  is_bonus: boolean;
  ongkir: number;
  lines: BonFormLineInput[];
  bonuses_to_claim?: number;
}

export interface CustomerBonusContext {
  bonusesAvailable: number;
  bonusThreshold: number;
  bonusAccumulator: number;
  bonusesGranted: number;
}
