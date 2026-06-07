import { createClient } from "@/lib/supabase/server";
import { BonForm } from "@/components/transactions/BonForm";
import {
  generateNextNomorBon,
  getCustomersForBonForm,
  getProductsForBonForm,
} from "@/lib/transactions/queries";
import { createTransaction } from "../actions";

export default async function NewTransactionPage() {
  const supabase = await createClient();
  const [customers, products, defaultNomorBon] = await Promise.all([
    getCustomersForBonForm(supabase),
    getProductsForBonForm(supabase),
    generateNextNomorBon(supabase),
  ]);

  return (
    <BonForm
      customers={customers}
      products={products}
      defaultNomorBon={defaultNomorBon}
      action={createTransaction}
    />
  );
}
