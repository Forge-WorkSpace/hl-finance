import { CustomerForm } from "@/components/customers/CustomerForm";
import { createCustomer } from "../actions";

export default function NewCustomerPage() {
  return (
    <CustomerForm
      title="Tambah Pelanggan"
      submitLabel="Simpan"
      action={createCustomer}
    />
  );
}
