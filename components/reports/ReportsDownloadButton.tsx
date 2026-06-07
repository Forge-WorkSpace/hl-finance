"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { ReportPDFDocument } from "@/components/reports/PDFDocument";
import { reportPdfFilename } from "@/lib/pdf/format";
import type { ReportData } from "@/lib/reports/types";

interface ReportsDownloadButtonProps {
  data: ReportData;
  periodLabel: string;
  activeTab: "customer" | "type" | "overall";
}

export function ReportsDownloadButton({
  data,
  periodLabel,
  activeTab,
}: ReportsDownloadButtonProps) {
  const filename = reportPdfFilename(periodLabel);

  return (
    <PDFDownloadLink
      document={
        <ReportPDFDocument
          data={data}
          periodLabel={periodLabel}
          activeTab={activeTab}
        />
      }
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
