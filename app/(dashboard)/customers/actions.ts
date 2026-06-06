"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProductType } from "@/types";

export type CustomerActionState = {
  error: string | null;
};

function parseDiscountJson(raw: string | null, label: string): number[] | { error: string } {
  if (!raw || raw.trim() === "") return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return { error: `${label}: format diskon tidak valid.` };
    }

    for (const step of parsed) {
      const value = Number(step);
      if (Number.isNaN(value) || value < 0 || value > 100) {
        return { error: `${label}: setiap step harus angka 0–100.` };
      }
    }

    return parsed.map(Number);
  } catch {
    return { error: `${label}: format diskon tidak valid.` };
  }
}

function parseFormData(formData: FormData): {
  data?: { nama: string; bonus_threshold: number; discount_lm: number[]; discount_br: number[] };
  error?: string;
} {
  const nama = String(formData.get("nama") ?? "").trim();
  const thresholdRaw = String(formData.get("bonus_threshold") ?? "").replace(/\./g, "");
  const bonus_threshold = Number(thresholdRaw);

  if (nama.length < 2) {
    return { error: "Nama pelanggan minimal 2 karakter." };
  }

  if (Number.isNaN(bonus_threshold) || bonus_threshold < 0) {
    return { error: "Threshold bonus harus angka ≥ 0." };
  }

  const discountLm = parseDiscountJson(
    String(formData.get("discount_lm") ?? ""),
    "Diskon LM",
  );
  if (!Array.isArray(discountLm)) return { error: discountLm.error };

  const discountBr = parseDiscountJson(
    String(formData.get("discount_br") ?? ""),
    "Diskon BR",
  );
  if (!Array.isArray(discountBr)) return { error: discountBr.error };

  return {
    data: {
      nama,
      bonus_threshold,
      discount_lm: discountLm,
      discount_br: discountBr,
    },
  };
}

async function upsertDiscounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  customerId: string,
  productType: ProductType,
  steps: number[],
): Promise<string | null> {
  const { error } = await supabase.from("customer_discounts").upsert(
    {
      customer_id: customerId,
      product_type: productType,
      discount_steps: steps,
    },
    { onConflict: "customer_id,product_type" },
  );

  return error?.message ?? null;
}

export async function createCustomer(
  _prevState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const parsed = parseFormData(formData);
  if (parsed.error || !parsed.data) {
    return { error: parsed.error ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      nama: parsed.data.nama,
      bonus_threshold: parsed.data.bonus_threshold,
    })
    .select("id")
    .single();

  if (error || !customer) {
    return { error: "Gagal menyimpan pelanggan. Silakan coba lagi." };
  }

  const lmError = await upsertDiscounts(
    supabase,
    customer.id,
    "LM",
    parsed.data.discount_lm,
  );
  if (lmError) return { error: lmError };

  const brError = await upsertDiscounts(
    supabase,
    customer.id,
    "BR",
    parsed.data.discount_br,
  );
  if (brError) return { error: brError };

  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(
  customerId: string,
  _prevState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const parsed = parseFormData(formData);
  if (parsed.error || !parsed.data) {
    return { error: parsed.error ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update({
      nama: parsed.data.nama,
      bonus_threshold: parsed.data.bonus_threshold,
    })
    .eq("id", customerId)
    .is("deleted_at", null);

  if (error) {
    return { error: "Gagal memperbarui pelanggan. Silakan coba lagi." };
  }

  const lmError = await upsertDiscounts(
    supabase,
    customerId,
    "LM",
    parsed.data.discount_lm,
  );
  if (lmError) return { error: lmError };

  const brError = await upsertDiscounts(
    supabase,
    customerId,
    "BR",
    parsed.data.discount_br,
  );
  if (brError) return { error: brError };

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", customerId)
    .is("deleted_at", null);

  if (error) {
    throw new Error("Gagal menghapus pelanggan.");
  }

  revalidatePath("/customers");
  redirect("/customers");
}
