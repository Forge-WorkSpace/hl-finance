"use server";

import { revalidatePath } from "next/cache";
import { redirectWithToast } from "@/lib/redirect-with-toast";
import {
  calculateLineItem,
  calculateTransactionSummary,
  calcBonusesAvailable,
  getBonusAccumulator,
  getBonusGranted,
} from "@/lib/calculations";
import { createClient } from "@/lib/supabase/server";
import {
  getCustomerDiscounts,
  getProductsByIds,
  isNomorBonTaken,
} from "@/lib/transactions/queries";
import type {
  BonFormLineInput,
  TransactionPayload,
} from "@/lib/transactions/types";
import type { ProductType } from "@/types";

export type TransactionActionState = {
  error: string | null;
};

function parsePayload(formData: FormData): {
  payload?: TransactionPayload;
  error?: string;
} {
  const raw = String(formData.get("payload") ?? "");
  if (!raw) return { error: "Data transaksi tidak valid." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Format data transaksi tidak valid." };
  }

  const data = parsed as Partial<TransactionPayload>;
  const nomorBon = String(data.nomor_bon ?? "").trim();
  const customerId = String(data.customer_id ?? "").trim();
  const tanggal = String(data.tanggal ?? "").trim();
  const ongkir = Number(data.ongkir ?? 0);
  const lines = Array.isArray(data.lines) ? data.lines : [];

  if (!nomorBon) return { error: "Nomor bon wajib diisi." };
  if (!customerId) return { error: "Pelanggan wajib dipilih." };
  if (!tanggal) return { error: "Tanggal wajib diisi." };
  if (Number.isNaN(ongkir) || ongkir < 0) {
    return { error: "Ongkir harus angka ≥ 0." };
  }

  const validLines: BonFormLineInput[] = [];
  for (const line of lines) {
    const productId = String(line?.product_id ?? "").trim();
    const quantity = Number(line?.quantity ?? 0);
    if (!productId) continue;
    if (Number.isNaN(quantity) || quantity < 1) {
      return { error: "Qty minimal 1 untuk setiap produk." };
    }
    validLines.push({ product_id: productId, quantity });
  }

  if (validLines.length === 0) {
    return { error: "Tambahkan minimal satu produk pada line items." };
  }

  const isBonus = Boolean(data.is_bonus);
  const bonusesToClaim = Number(data.bonuses_to_claim ?? 0);

  if (isBonus) {
    if (!Number.isInteger(bonusesToClaim) || bonusesToClaim < 1) {
      return { error: "Jumlah bonus diklaim minimal 1." };
    }
  }

  return {
    payload: {
      nomor_bon: nomorBon,
      tanggal,
      customer_id: customerId,
      deskripsi: data.deskripsi ? String(data.deskripsi).trim() : null,
      is_bonus: isBonus,
      ongkir: isBonus ? 0 : ongkir,
      lines: validLines,
      bonuses_to_claim: isBonus ? bonusesToClaim : undefined,
    },
  };
}

async function buildLineRecords(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: TransactionPayload,
) {
  const productIds = payload.lines.map((line) => line.product_id);
  const [products, discounts] = await Promise.all([
    getProductsByIds(supabase, productIds),
    getCustomerDiscounts(supabase, payload.customer_id),
  ]);

  const productMap = new Map(products.map((product) => [product.id, product]));
  const summaryLines: { lineOmzet: number; productType: ProductType }[] = [];
  const inserts: Array<{
    product_id: string;
    quantity: number;
    snapshot_harga_base: number;
    snapshot_harga_modal: number;
    snapshot_discounts: number[];
    discounted_unit_price: number;
    line_omzet: number;
    line_laba: number;
  }> = [];

  for (const line of payload.lines) {
    const product = productMap.get(line.product_id);
    if (!product) {
      throw new Error("Produk tidak ditemukan atau sudah dihapus.");
    }

    const discountSteps = discounts[product.tipe];
    const calc = calculateLineItem({
      hargaBase: product.harga_base,
      hargaModal: product.harga_modal,
      discountSteps,
      quantity: line.quantity,
      isBonus: payload.is_bonus,
    });

    summaryLines.push({
      lineOmzet: calc.lineOmzet,
      productType: product.tipe,
    });

    inserts.push({
      product_id: product.id,
      quantity: line.quantity,
      snapshot_harga_base: product.harga_base,
      snapshot_harga_modal: product.harga_modal,
      snapshot_discounts: discountSteps,
      discounted_unit_price: calc.discountedUnitPrice,
      line_omzet: calc.lineOmzet,
      line_laba: calc.lineLaba,
    });
  }

  const summary = calculateTransactionSummary(summaryLines, payload.ongkir);
  return { inserts, summary };
}

async function validateBonusClaim(
  supabase: Awaited<ReturnType<typeof createClient>>,
  customerId: string,
  bonusesToClaim: number,
  excludeTransactionId?: string,
): Promise<string | null> {
  const { data: customer, error } = await supabase
    .from("customers")
    .select("bonus_threshold")
    .eq("id", customerId)
    .maybeSingle();

  if (error || !customer) {
    return "Pelanggan tidak ditemukan.";
  }

  const threshold = Number(customer.bonus_threshold);
  const [accumulator, granted] = await Promise.all([
    getBonusAccumulator(supabase, customerId),
    getBonusGranted(supabase, customerId),
  ]);

  let adjustedGranted = granted;
  if (excludeTransactionId) {
    const { data: existingGrant } = await supabase
      .from("bonus_grants")
      .select("bonuses_consumed")
      .eq("transaction_id", excludeTransactionId)
      .maybeSingle();
    if (existingGrant) {
      adjustedGranted -= Number(existingGrant.bonuses_consumed);
    }
  }

  const available = calcBonusesAvailable(accumulator, threshold, adjustedGranted);

  if (bonusesToClaim > available) {
    return "Bonus tidak cukup untuk diklaim.";
  }

  return null;
}

async function upsertBonusGrant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  transactionId: string,
  customerId: string,
  isBonus: boolean,
  bonusesConsumed: number,
) {
  await supabase.from("bonus_grants").delete().eq("transaction_id", transactionId);

  if (!isBonus) return;

  const { error } = await supabase.from("bonus_grants").insert({
    customer_id: customerId,
    transaction_id: transactionId,
    bonuses_consumed: bonusesConsumed,
  });

  if (error) {
    throw new Error("Gagal menyimpan bonus grant.");
  }
}

export async function createTransaction(
  _prevState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const parsed = parsePayload(formData);
  if (parsed.error || !parsed.payload) {
    return { error: parsed.error ?? "Data tidak valid." };
  }

  const supabase = await createClient();

  if (await isNomorBonTaken(supabase, parsed.payload.nomor_bon)) {
    return { error: "Nomor bon sudah digunakan. Gunakan nomor lain." };
  }

  if (parsed.payload.is_bonus) {
    const bonusError = await validateBonusClaim(
      supabase,
      parsed.payload.customer_id,
      parsed.payload.bonuses_to_claim ?? 0,
    );
    if (bonusError) return { error: bonusError };
  }

  try {
    const { inserts } = await buildLineRecords(supabase, parsed.payload);

    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        nomor_bon: parsed.payload.nomor_bon,
        tanggal: parsed.payload.tanggal,
        customer_id: parsed.payload.customer_id,
        ongkir: parsed.payload.ongkir,
        deskripsi: parsed.payload.deskripsi,
        is_bonus: parsed.payload.is_bonus,
        status: "piutang",
      })
      .select("id")
      .single();

    if (txError || !tx) {
      if (txError?.code === "23505") {
        return { error: "Nomor bon sudah digunakan. Gunakan nomor lain." };
      }
      return { error: "Gagal menyimpan transaksi." };
    }

    const lineRows = inserts.map((line) => ({
      ...line,
      transaction_id: tx.id,
    }));

    const { error: linesError } = await supabase
      .from("transaction_lines")
      .insert(lineRows);

    if (linesError) {
      await supabase.from("transactions").delete().eq("id", tx.id);
      return { error: "Gagal menyimpan line items." };
    }

    if (parsed.payload.is_bonus) {
      await upsertBonusGrant(
        supabase,
        tx.id,
        parsed.payload.customer_id,
        true,
        parsed.payload.bonuses_to_claim ?? 1,
      );
    }

  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Gagal menyimpan transaksi.",
    };
  }

  revalidatePath("/transactions");
  revalidatePath("/customers");
  revalidatePath(`/customers/${parsed.payload.customer_id}`);

  if (parsed.payload.is_bonus) {
    redirectWithToast(`/customers/${parsed.payload.customer_id}`, "bonus-saved");
  }

  redirectWithToast("/transactions", "transaction-created");
}

export async function updateTransaction(
  transactionId: string,
  _prevState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const parsed = parsePayload(formData);
  if (parsed.error || !parsed.payload) {
    return { error: parsed.error ?? "Data tidak valid." };
  }

  const supabase = await createClient();

  if (
    await isNomorBonTaken(supabase, parsed.payload.nomor_bon, transactionId)
  ) {
    return { error: "Nomor bon sudah digunakan. Gunakan nomor lain." };
  }

  if (parsed.payload.is_bonus) {
    const bonusError = await validateBonusClaim(
      supabase,
      parsed.payload.customer_id,
      parsed.payload.bonuses_to_claim ?? 1,
      transactionId,
    );
    if (bonusError) return { error: bonusError };
  }

  try {
    const { inserts } = await buildLineRecords(supabase, parsed.payload);

    const { error: txError } = await supabase
      .from("transactions")
      .update({
        nomor_bon: parsed.payload.nomor_bon,
        tanggal: parsed.payload.tanggal,
        customer_id: parsed.payload.customer_id,
        ongkir: parsed.payload.ongkir,
        deskripsi: parsed.payload.deskripsi,
        is_bonus: parsed.payload.is_bonus,
      })
      .eq("id", transactionId);

    if (txError) {
      if (txError.code === "23505") {
        return { error: "Nomor bon sudah digunakan. Gunakan nomor lain." };
      }
      return { error: "Gagal memperbarui transaksi." };
    }

    const { error: deleteError } = await supabase
      .from("transaction_lines")
      .delete()
      .eq("transaction_id", transactionId);

    if (deleteError) {
      return { error: "Gagal memperbarui line items." };
    }

    const lineRows = inserts.map((line) => ({
      ...line,
      transaction_id: transactionId,
    }));

    const { error: linesError } = await supabase
      .from("transaction_lines")
      .insert(lineRows);

    if (linesError) {
      return { error: "Gagal menyimpan line items baru." };
    }

    await upsertBonusGrant(
      supabase,
      transactionId,
      parsed.payload.customer_id,
      parsed.payload.is_bonus,
      parsed.payload.bonuses_to_claim ?? 1,
    );
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Gagal memperbarui transaksi.",
    };
  }

  revalidatePath("/transactions");
  revalidatePath("/customers");
  revalidatePath(`/customers/${parsed.payload.customer_id}`);
  revalidatePath(`/transactions/${transactionId}`);
  redirectWithToast(`/transactions/${transactionId}`, "transaction-updated");
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  const supabase = await createClient();

  await supabase.from("bonus_grants").delete().eq("transaction_id", transactionId);

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId);

  if (error) {
    throw new Error("Gagal menghapus transaksi.");
  }

  revalidatePath("/transactions");
  redirectWithToast("/transactions", "transaction-deleted");
}
