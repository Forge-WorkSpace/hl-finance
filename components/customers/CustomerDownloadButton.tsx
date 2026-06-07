"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { CustomerPDFDocument } from "@/components/customers/CustomerPDFDocument";
import { customerPdfFilename } from "@/lib/pdf/format";
import type { CustomerPdfData } from "@/lib/reports/types";

interface CustomerDownloadButtonProps {
  data: CustomerPdfData;
}

export function CustomerDownloadButton({ data }: CustomerDownloadButtonProps) {
  const filename = customerPdfFilename(data.nama);

  return (
    <PDFDownloadLink
      document={<CustomerPDFDocument data={data} />}
      fileName={filename}
      className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
    >
      {({ loading }) => (
        <>
          <Download size={16} />
          {loading ? "Menyiapkan PDF..." : "Download PDF"}
        </>
      )}
    </PDFDownloadLink>
  );
}
