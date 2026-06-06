export type ProductType = "LM" | "BR";
export type TransactionStatus = "piutang" | "lunas";

export interface Customer {
  id: string;
  nama: string;
  bonus_threshold: number;
  deleted_at: string | null;
  created_at: string;
}

export interface CustomerDiscount {
  id: string;
  customer_id: string;
  product_type: ProductType;
  discount_steps: number[];
}

export interface Product {
  id: string;
  nama: string;
  harga_modal: number;
  harga_base: number;
  tipe: ProductType;
  deleted_at: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  nomor_bon: string;
  tanggal: string;
  customer_id: string;
  ongkir: number;
  deskripsi: string | null;
  is_bonus: boolean;
  status: TransactionStatus;
  tanggal_lunas: string | null;
  created_at: string;
}

export interface TransactionLine {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  snapshot_harga_base: number;
  snapshot_harga_modal: number;
  snapshot_discounts: number[];
  discounted_unit_price: number;
  line_omzet: number;
  line_laba: number;
}

export interface BonusGrant {
  id: string;
  customer_id: string;
  transaction_id: string;
  bonuses_consumed: number;
  created_at: string;
}
