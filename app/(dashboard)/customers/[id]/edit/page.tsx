import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCustomerForEdit } from "@/lib/customers/queries";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { updateCustomer } from "../../actions";

interface EditCustomerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const customer = await getCustomerForEdit(supabase, id);

  if (!customer) {
    notFound();
  }

  const boundUpdate = updateCustomer.bind(null, id);

  return (
    <CustomerForm
      title="Edit Pelanggan"
      submitLabel="Simpan Perubahan"
      initialData={customer}
      customerId={id}
      action={boundUpdate}
    />
  );
}
