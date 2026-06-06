import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BonForm } from "@/components/transactions/BonForm";
import {
  getCustomersForBonForm,
  getProductsForBonForm,
  getTransactionById,
} from "@/lib/transactions/queries";
import { updateTransaction } from "../../actions";

interface EditTransactionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [transaction, customers, products] = await Promise.all([
    getTransactionById(supabase, id),
    getCustomersForBonForm(supabase),
    getProductsForBonForm(supabase),
  ]);

  if (!transaction) notFound();

  const boundUpdate = updateTransaction.bind(null, id);

  return (
    <BonForm
      title="Edit Bon"
      customers={customers}
      products={products}
      initialData={transaction}
      transactionId={id}
      action={boundUpdate}
    />
  );
}
