import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CustomerDetail,
  CustomerDiscounts,
  CustomerListItem,
  CustomerTransactionRow,
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

function buildDiscounts(rows: DiscountRow[] | null | undefined): CustomerDiscounts {
  const lm = rows?.find((r) => r.product_type === "LM");
  const br = rows?.find((r) => r.product_type === "BR");
  return {
    LM: parseDiscountSteps(lm?.discount_steps),
    BR: parseDiscountSteps(br?.discount_steps),
  };
}

async function fetchPiutangByCustomer(
  supabase: SupabaseClient,
): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("transactions")
    .select("customer_id, ongkir, transaction_lines(line_omzet)")
    .eq("status", "piutang");

  if (error) throw error;

  const map = new Map<string, number>();
  for (const tx of data ?? []) {
    const lines = tx.transaction_lines as { line_omzet: number }[] | null;
    const lineTotal = (lines ?? []).reduce((sum, line) => sum + Number(line.line_omzet), 0);
    const total = lineTotal + Number(tx.ongkir);
    map.set(tx.customer_id, (map.get(tx.customer_id) ?? 0) + total);
  }
  return map;
}

async function fetchBonusCountByCustomer(
  supabase: SupabaseClient,
): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("bonus_grants")
    .select("customer_id, bonuses_consumed");

  if (error) throw error;

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    map.set(
      row.customer_id,
      (map.get(row.customer_id) ?? 0) + Number(row.bonuses_consumed),
    );
  }
  return map;
}

export async function getCustomersForList(
  supabase: SupabaseClient,
): Promise<CustomerListItem[]> {
  const [customersResult, piutangMap, bonusMap] = await Promise.all([
    supabase
      .from("customers")
      .select("*, customer_discounts(product_type, discount_steps)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    fetchPiutangByCustomer(supabase),
    fetchBonusCountByCustomer(supabase),
  ]);

  if (customersResult.error) throw customersResult.error;

  return (customersResult.data ?? []).map((row) => ({
    id: row.id,
    nama: row.nama,
    bonus_threshold: Number(row.bonus_threshold),
    deleted_at: row.deleted_at,
    created_at: row.created_at,
    discounts: buildDiscounts(row.customer_discounts as DiscountRow[]),
    piutang: piutangMap.get(row.id) ?? 0,
    bonusCount: bonusMap.get(row.id) ?? 0,
  }));
}

export async function getCustomerById(
  supabase: SupabaseClient,
  id: string,
): Promise<CustomerDetail | null> {
  const { data: customer, error } = await supabase
    .from("customers")
    .select("*, customer_discounts(product_type, discount_steps)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!customer) return null;

  const [piutangMap, bonusMap, txResult] = await Promise.all([
    fetchPiutangByCustomer(supabase),
    fetchBonusCountByCustomer(supabase),
    supabase
      .from("transactions")
      .select("id, nomor_bon, tanggal, status, is_bonus, ongkir, transaction_lines(line_omzet)")
      .eq("customer_id", id)
      .order("tanggal", { ascending: false }),
  ]);

  if (txResult.error) throw txResult.error;

  const transactions: CustomerTransactionRow[] = (txResult.data ?? []).map((tx) => {
    const lines = tx.transaction_lines as { line_omzet: number }[] | null;
    const lineTotal = (lines ?? []).reduce((sum, line) => sum + Number(line.line_omzet), 0);
    return {
      id: tx.id,
      nomor_bon: tx.nomor_bon,
      tanggal: tx.tanggal,
      status: tx.status as "piutang" | "lunas",
      is_bonus: tx.is_bonus,
      total: lineTotal + Number(tx.ongkir),
    };
  });

  return {
    id: customer.id,
    nama: customer.nama,
    bonus_threshold: Number(customer.bonus_threshold),
    deleted_at: customer.deleted_at,
    created_at: customer.created_at,
    discounts: buildDiscounts(customer.customer_discounts as DiscountRow[]),
    piutang: piutangMap.get(customer.id) ?? 0,
    bonusCount: bonusMap.get(customer.id) ?? 0,
    transactionCount: transactions.length,
    lunasCount: transactions.filter((t) => t.status === "lunas").length,
    transactions,
  };
}

export async function getCustomerForEdit(
  supabase: SupabaseClient,
  id: string,
): Promise<CustomerListItem | null> {
  const { data, error } = await supabase
    .from("customers")
    .select("*, customer_discounts(product_type, discount_steps)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    nama: data.nama,
    bonus_threshold: Number(data.bonus_threshold),
    deleted_at: data.deleted_at,
    created_at: data.created_at,
    discounts: buildDiscounts(data.customer_discounts as DiscountRow[]),
    piutang: 0,
    bonusCount: 0,
  };
}
