import { createClient } from "@/lib/supabase/server";
import {
  buildReportData,
  fetchReportTransactions,
  parseReportFilters,
  reportPeriodLabel,
} from "@/lib/reports/queries";
import { ReportsPageClient } from "@/components/reports/ReportsPageClient";

interface ReportsPageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const filters = parseReportFilters(params);
  const supabase = await createClient();
  const transactions = await fetchReportTransactions(supabase);
  const data = buildReportData(transactions, filters);

  return (
    <ReportsPageClient
      data={data}
      periodLabel={reportPeriodLabel(filters)}
      month={filters.month}
      year={filters.year}
    />
  );
}
