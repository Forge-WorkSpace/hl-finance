import { ProductForm } from "@/components/products/ProductForm";
import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <ProductForm
      title="Tambah Produk"
      submitLabel="Simpan"
      action={createProduct}
    />
  );
}
