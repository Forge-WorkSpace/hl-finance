import { createClient } from "@/lib/supabase/server";
import { BonForm } from "@/components/transactions/BonForm";
import {
  generateNextNomorBon,
  getCustomerBonusContext,
  getCustomersForBonForm,
  getProductsForBonForm,
} from "@/lib/transactions/queries";
import { createTransaction } from "../actions";

interface NewTransactionPageProps {
  searchParams: Promise<{ customerId?: string; bonus?: string }>;
}

export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const params = await searchParams;
  const bonusMode = params.bonus === "true";
  const initialCustomerId = params.customerId?.trim() ?? "";

  const supabase = await createClient();
  const [customers, products, defaultNomorBon, bonusContext] = await Promise.all([
    getCustomersForBonForm(supabase),
    getProductsForBonForm(supabase),
    generateNextNomorBon(supabase),
    bonusMode && initialCustomerId
      ? getCustomerBonusContext(supabase, initialCustomerId)
      : Promise.resolve(null),
  ]);

  return (
    <BonForm
      title={bonusMode ? "Bon Bonus" : "Bon Baru"}
      customers={customers}
      products={products}
      defaultNomorBon={defaultNomorBon}
      initialCustomerId={initialCustomerId || undefined}
      bonusMode={bonusMode}
      bonusesAvailable={bonusContext?.bonusesAvailable ?? 0}
      action={createTransaction}
    />
  );
}
