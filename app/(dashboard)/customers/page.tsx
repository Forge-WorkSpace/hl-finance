import { createClient } from "@/lib/supabase/server";
import { getCustomersForList } from "@/lib/customers/queries";
import { CustomerTable } from "@/components/customers/CustomerTable";

export default async function CustomersPage() {
  const supabase = await createClient();
  const customers = await getCustomersForList(supabase);

  return <CustomerTable customers={customers} />;
}
