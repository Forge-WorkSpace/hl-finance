import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Package,
  Users,
} from "lucide-react";

export const MAIN_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Pelanggan", icon: Users },
  { href: "/products", label: "Produk", icon: Package },
  { href: "/transactions", label: "Transaksi", icon: FileText },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
] as const;

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}
