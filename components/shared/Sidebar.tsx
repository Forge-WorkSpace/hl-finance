"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Pelanggan", icon: Users },
  { href: "/products", label: "Produk", icon: Package },
  { href: "/transactions", label: "Transaksi", icon: FileText },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
] as const;

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "nav-item flex h-[38px] w-full items-center gap-[11px] border-l-2 px-4 text-sm font-medium transition-colors",
        active
          ? "border-blue-500 bg-white/5 text-white"
          : "border-transparent text-[var(--sidebar-text)] hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon size={18} strokeWidth={active ? 2 : 1.75} />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-[#0F172A]">
      <div className="flex items-center gap-[11px] px-6 pb-5 pt-[22px]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-[15px] font-bold tracking-wide text-white">
          HL
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold text-white">HL Finance</div>
          <div className="text-[11.5px] text-[var(--sidebar-text)]">Management Portal</div>
        </div>
      </div>

      <nav className="mt-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href)}
          />
        ))}
      </nav>

      <div className="flex-1" />

      <div className="mx-4 h-px bg-white/10" />
      <nav className="flex flex-col gap-0.5 py-3">
        <button
          type="button"
          disabled
          className="nav-item flex h-[38px] w-full cursor-not-allowed items-center gap-[11px] border-l-2 border-transparent px-4 text-sm font-medium text-[var(--sidebar-text)] opacity-60"
        >
          <Settings size={18} strokeWidth={1.75} />
          <span>Settings</span>
        </button>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="nav-item flex h-[38px] w-full items-center gap-[11px] border-l-2 border-transparent px-4 text-sm font-medium text-[var(--sidebar-text)] transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} strokeWidth={1.75} />
            <span>Logout</span>
          </button>
        </form>
      </nav>
    </aside>
  );
}
