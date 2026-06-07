import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/shared/BottomNav";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopBar } from "@/components/shared/TopBar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[var(--bg)]">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 max-w-full flex-1 flex-col lg:ml-60">
        <TopBar />
        <main className="page-scroll flex-1 pb-20 lg:pb-0">
          <div className="page-inner">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
