import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductForEdit } from "@/lib/products/queries";
import { ProductForm } from "@/components/products/ProductForm";
import { updateProduct } from "../../actions";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const product = await getProductForEdit(supabase, id);

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, id);

  return (
    <ProductForm
      title="Edit Produk"
      submitLabel="Simpan"
      initialData={product}
      action={boundUpdate}
    />
  );
}
