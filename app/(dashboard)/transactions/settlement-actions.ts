"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettlementActionState = {
  error: string | null;
  success?: boolean;
};

function validateTanggalLunas(tanggalLunas: string): string | null {
  if (!tanggalLunas.trim()) {
    return "Tanggal pelunasan wajib diisi.";
  }
  return null;
}

export async function settleSingleBon(
  transactionId: string,
  tanggalLunas: string,
): Promise<SettlementActionState> {
  const validationError = validateTanggalLunas(tanggalLunas);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .update({
      status: "lunas",
      tanggal_lunas: tanggalLunas,
    })
    .eq("id", transactionId)
    .eq("status", "piutang")
    .select("id, customer_id")
    .maybeSingle();

  if (error) {
    return { error: "Gagal menandai lunas. Silakan coba lagi." };
  }

  if (!data) {
    return { error: "Transaksi tidak ditemukan atau sudah lunas." };
  }

  revalidatePath("/transactions");
  revalidatePath(`/transactions/${transactionId}`);
  revalidatePath("/customers");
  revalidatePath(`/customers/${data.customer_id}`);

  return { error: null, success: true };
}

export async function settleMonthlyBons(
  customerId: string,
  month: number,
  year: number,
  tanggalLunas: string,
): Promise<SettlementActionState> {
  const validationError = validateTanggalLunas(tanggalLunas);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const { data: transactions, error: fetchError } = await supabase
    .from("transactions")
    .select("id, tanggal")
    .eq("customer_id", customerId)
    .eq("status", "piutang")
    .eq("is_bonus", false);

  if (fetchError) {
    return { error: "Gagal mengambil daftar bon piutang." };
  }

  const transactionIds = (transactions ?? [])
    .filter((tx) => {
      const date = new Date(`${tx.tanggal}T00:00:00`);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    })
    .map((tx) => tx.id);

  if (transactionIds.length === 0) {
    return { error: "Tidak ada bon piutang reguler di bulan ini." };
  }

  const { error: updateError } = await supabase
    .from("transactions")
    .update({
      status: "lunas",
      tanggal_lunas: tanggalLunas,
    })
    .in("id", transactionIds)
    .eq("status", "piutang");

  if (updateError) {
    return { error: "Gagal melunasi bon bulan ini." };
  }

  revalidatePath("/transactions");
  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);

  return { error: null, success: true };
}
