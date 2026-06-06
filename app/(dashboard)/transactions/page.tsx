import { createClient } from "@/lib/supabase/server";
import {
  getCustomersForBonForm,
  getTransactionsForList,
} from "@/lib/transactions/queries";
import { TransactionTable } from "@/components/transactions/TransactionTable";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const [transactions, customers] = await Promise.all([
    getTransactionsForList(supabase),
    getCustomersForBonForm(supabase),
  ]);

  const customerOptions = customers.map((customer) => ({
    id: customer.id,
    nama: customer.nama,
  }));

  return (
    <TransactionTable
      transactions={transactions}
      customers={customerOptions}
    />
  );
}
