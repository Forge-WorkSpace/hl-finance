import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/reports/queries";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { stats, recentTransactions } = await getDashboardData(supabase);

  return (
    <DashboardView stats={stats} recentTransactions={recentTransactions} />
  );
}
