import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    <div className="app-shell">
      <aside className="w-64 shrink-0 bg-[var(--sidebar-bg)] p-4 text-[var(--sidebar-text)]">
        <p className="text-sm font-medium text-[var(--sidebar-active)]">HL Finance</p>
        <p className="mt-4 text-xs">Sidebar placeholder</p>
      </aside>
      <div className="content-area">
        <header className="border-b border-[var(--border)] bg-[var(--surface)] px-8 py-4">
          <p className="text-sm text-[var(--text-secondary)]">Topbar placeholder</p>
        </header>
        <main className="page-scroll">{children}</main>
      </div>
    </div>
  );
}
