import { createClient } from "@/lib/supabase/server";
import { getProductsForList } from "@/lib/products/queries";
import { ProductTable } from "@/components/products/ProductTable";

export default async function ProductsPage() {
  const supabase = await createClient();
  const products = await getProductsForList(supabase);

  return <ProductTable products={products} />;
}
