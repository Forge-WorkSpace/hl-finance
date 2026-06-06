import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTransactionById } from "@/lib/transactions/queries";
import { BonDetailView } from "@/components/transactions/BonDetailView";

interface TransactionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const transaction = await getTransactionById(supabase, id);

  if (!transaction) notFound();

  return <BonDetailView transaction={transaction} />;
}
