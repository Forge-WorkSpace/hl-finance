import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductListItem } from "./types";

export async function getProductsForList(
  supabase: SupabaseClient,
): Promise<ProductListItem[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    nama: row.nama,
    harga_modal: Number(row.harga_modal),
    harga_base: Number(row.harga_base),
    tipe: row.tipe as "LM" | "BR",
    deleted_at: row.deleted_at,
    created_at: row.created_at,
  }));
}

export async function getProductForEdit(
  supabase: SupabaseClient,
  id: string,
): Promise<ProductListItem | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    nama: data.nama,
    harga_modal: Number(data.harga_modal),
    harga_base: Number(data.harga_base),
    tipe: data.tipe as "LM" | "BR",
    deleted_at: data.deleted_at,
    created_at: data.created_at,
  };
}
