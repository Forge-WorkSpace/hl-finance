import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calcBonusesAvailable,
  getBonusAccumulator,
  getBonusGranted,
} from "@/lib/calculations";
import type {
  BonFormCustomer,
  BonFormProduct,
  CustomerBonusContext,
  TransactionDetail,
  TransactionDetailLine,
  TransactionListItem,
} from "./types";

type DiscountRow = {
  product_type: "LM" | "BR";
  discount_steps: number[] | string;
};

function parseDiscountSteps(steps: number[] | string | null | undefined): number[] {
  if (!steps) return [];
  if (Array.isArray(steps)) return steps.map(Number);
  try {
    const parsed = JSON.parse(steps as string) as unknown;
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
}

function buildDiscounts(rows: DiscountRow[] | null | undefined) {
  const lm = rows?.find((r) => r.product_type === "LM");
  const br = rows?.find((r) => r.product_type === "BR");
  return {
    LM: parseDiscountSteps(lm?.discount_steps),
    BR: parseDiscountSteps(br?.discount_steps),
  };
}

function computeTotal(
  ongkir: number,
  lines: { line_omzet: number }[] | null | undefined,
): number {
  const lineTotal = (lines ?? []).reduce(
    (sum, line) => sum + Number(line.line_omzet),
    0,
  );
  return lineTotal + Number(ongkir);
}

export async function getTransactionsForList(
  supabase: SupabaseClient,
): Promise<TransactionListItem[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, nomor_bon, tanggal, customer_id, ongkir, is_bonus, status, created_at, customers(nama), transaction_lines(line_omzet)",
    )
    .order("tanggal", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const customerRaw = row.customers as { nama: string } | { nama: string }[] | null;
    const customer = Array.isArray(customerRaw) ? customerRaw[0] : customerRaw;
    const lines = row.transaction_lines as { line_omzet: number }[] | null;

    return {
      id: row.id,
      nomor_bon: row.nomor_bon,
      tanggal: row.tanggal,
      customer_id: row.customer_id,
      customer_nama: customer?.nama ?? "—",
      ongkir: Number(row.ongkir),
      is_bonus: row.is_bonus,
      status: row.status as TransactionListItem["status"],
      total: computeTotal(Number(row.ongkir), lines),
      created_at: row.created_at,
    };
  });
}

export async function getCustomersForBonForm(
  supabase: SupabaseClient,
): Promise<BonFormCustomer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("id, nama, customer_discounts(product_type, discount_steps)")
    .is("deleted_at", null)
    .order("nama", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    nama: row.nama,
    discounts: buildDiscounts(row.customer_discounts as DiscountRow[]),
  }));
}

export async function getProductsForBonForm(
  supabase: SupabaseClient,
): Promise<BonFormProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, nama, harga_base, harga_modal, tipe")
    .is("deleted_at", null)
    .order("nama", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    nama: row.nama,
    harga_base: Number(row.harga_base),
    harga_modal: Number(row.harga_modal),
    tipe: row.tipe as BonFormProduct["tipe"],
  }));
}

export async function getTransactionById(
  supabase: SupabaseClient,
  id: string,
): Promise<TransactionDetail | null> {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "*, customers(nama), transaction_lines(*, products(nama, tipe))",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const customerRaw = data.customers as { nama: string } | { nama: string }[] | null;
  const customer = Array.isArray(customerRaw) ? customerRaw[0] : customerRaw;
  const rawLines = (data.transaction_lines ?? []) as Array<{
    id: string;
    product_id: string;
    quantity: number;
    snapshot_harga_base: number;
    snapshot_harga_modal: number;
    snapshot_discounts: number[] | string;
    discounted_unit_price: number;
    line_omzet: number;
    line_laba: number;
    products: { nama: string; tipe: "LM" | "BR" } | null;
  }>;

  const lines: TransactionDetailLine[] = rawLines.map((line) => ({
    id: line.id,
    product_id: line.product_id,
    product_nama: line.products?.nama ?? "—",
    product_tipe: line.products?.tipe ?? "LM",
    quantity: line.quantity,
    snapshot_harga_base: Number(line.snapshot_harga_base),
    snapshot_harga_modal: Number(line.snapshot_harga_modal),
    snapshot_discounts: parseDiscountSteps(line.snapshot_discounts),
    discounted_unit_price: Number(line.discounted_unit_price),
    line_omzet: Number(line.line_omzet),
    line_laba: Number(line.line_laba),
  }));

  return {
    id: data.id,
    nomor_bon: data.nomor_bon,
    tanggal: data.tanggal,
    customer_id: data.customer_id,
    customer_nama: customer?.nama ?? "—",
    ongkir: Number(data.ongkir),
    deskripsi: data.deskripsi,
    is_bonus: data.is_bonus,
    status: data.status as TransactionDetail["status"],
    tanggal_lunas: data.tanggal_lunas,
    created_at: data.created_at,
    lines,
  };
}

export async function isNomorBonTaken(
  supabase: SupabaseClient,
  nomorBon: string,
  excludeId?: string,
): Promise<boolean> {
  let query = supabase
    .from("transactions")
    .select("id")
    .eq("nomor_bon", nomorBon.trim());

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return Boolean(data);
}

export async function getCustomerDiscounts(
  supabase: SupabaseClient,
  customerId: string,
) {
  const { data, error } = await supabase
    .from("customer_discounts")
    .select("product_type, discount_steps")
    .eq("customer_id", customerId);

  if (error) throw error;
  return buildDiscounts(data as DiscountRow[]);
}

export async function getProductsByIds(
  supabase: SupabaseClient,
  productIds: string[],
): Promise<BonFormProduct[]> {
  if (productIds.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select("id, nama, harga_base, harga_modal, tipe")
    .in("id", productIds)
    .is("deleted_at", null);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    nama: row.nama,
    harga_base: Number(row.harga_base),
    harga_modal: Number(row.harga_modal),
    tipe: row.tipe as BonFormProduct["tipe"],
  }));
}

export async function generateNextNomorBon(
  supabase: SupabaseClient,
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `BON-${year}-`;

  const { data, error } = await supabase
    .from("transactions")
    .select("nomor_bon")
    .like("nomor_bon", `${prefix}%`)
    .order("nomor_bon", { ascending: false })
    .limit(100);

  if (error) throw error;

  let maxSeq = 0;
  for (const row of data ?? []) {
    const match = row.nomor_bon.match(
      new RegExp(`^${prefix.replace(/-/g, "\\-")}(\\d+)$`),
    );
    if (match) {
      maxSeq = Math.max(maxSeq, Number.parseInt(match[1], 10));
    }
  }

  return `${prefix}${String(maxSeq + 1).padStart(4, "0")}`;
}

export async function getCustomerBonusContext(
  supabase: SupabaseClient,
  customerId: string,
): Promise<CustomerBonusContext | null> {
  const { data: customer, error } = await supabase
    .from("customers")
    .select("bonus_threshold")
    .eq("id", customerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!customer) return null;

  const threshold = Number(customer.bonus_threshold);
  const [accumulator, granted] = await Promise.all([
    getBonusAccumulator(supabase, customerId),
    getBonusGranted(supabase, customerId),
  ]);

  return {
    bonusThreshold: threshold,
    bonusAccumulator: accumulator,
    bonusesGranted: granted,
    bonusesAvailable: calcBonusesAvailable(accumulator, threshold, granted),
  };
}
