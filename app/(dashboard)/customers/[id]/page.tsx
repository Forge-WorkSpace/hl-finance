import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCustomerById } from "@/lib/customers/queries";
import { CustomerDetailView } from "@/components/customers/CustomerDetailView";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const customer = await getCustomerById(supabase, id);

  if (!customer) {
    notFound();
  }

  return <CustomerDetailView customer={customer} />;
}
