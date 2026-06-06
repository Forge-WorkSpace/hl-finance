"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProductType } from "@/types";

export type ProductActionState = {
  error: string | null;
};

function parseIdrField(raw: string, label: string): number | { error: string } {
  const value = Number(raw.replace(/\./g, "").replace(/,/g, ""));
  if (Number.isNaN(value) || value < 0) {
    return { error: `${label} harus angka ≥ 0.` };
  }
  return value;
}

function parseFormData(formData: FormData): {
  data?: {
    nama: string;
    tipe: ProductType;
    harga_base: number;
    harga_modal: number;
  };
  error?: string;
} {
  const nama = String(formData.get("nama") ?? "").trim();
  const tipe = String(formData.get("tipe") ?? "") as ProductType;

  if (nama.length < 2) {
    return { error: "Nama produk minimal 2 karakter." };
  }

  if (tipe !== "LM" && tipe !== "BR") {
    return { error: "Tipe produk harus LM atau BR." };
  }

  const hargaBase = parseIdrField(
    String(formData.get("harga_base") ?? ""),
    "Harga base",
  );
  if (typeof hargaBase !== "number") return { error: hargaBase.error };

  const hargaModal = parseIdrField(
    String(formData.get("harga_modal") ?? ""),
    "Harga modal",
  );
  if (typeof hargaModal !== "number") return { error: hargaModal.error };

  return {
    data: {
      nama,
      tipe,
      harga_base: hargaBase,
      harga_modal: hargaModal,
    },
  };
}

export async function createProduct(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = parseFormData(formData);
  if (parsed.error || !parsed.data) {
    return { error: parsed.error ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    nama: parsed.data.nama,
    tipe: parsed.data.tipe,
    harga_base: parsed.data.harga_base,
    harga_modal: parsed.data.harga_modal,
  });

  if (error) {
    return { error: "Gagal menyimpan produk. Silakan coba lagi." };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(
  productId: string,
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = parseFormData(formData);
  if (parsed.error || !parsed.data) {
    return { error: parsed.error ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      nama: parsed.data.nama,
      tipe: parsed.data.tipe,
      harga_base: parsed.data.harga_base,
      harga_modal: parsed.data.harga_modal,
    })
    .eq("id", productId)
    .is("deleted_at", null);

  if (error) {
    return { error: "Gagal memperbarui produk. Silakan coba lagi." };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProduct(productId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", productId)
    .is("deleted_at", null);

  if (error) {
    throw new Error("Gagal menghapus produk.");
  }

  revalidatePath("/products");
}
