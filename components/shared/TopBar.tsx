"use client";

import Link from "next/link";
import { Bell, HelpCircle, Plus, Search } from "lucide-react";

function IconButton({
  icon: Icon,
  badge = false,
  className,
}: {
  icon: React.ComponentType<{ size?: number }>;
  badge?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`relative flex h-9 w-9 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-dim)] ${className ?? ""}`}
    >
      <Icon size={18} />
      {badge ? (
        <span className="absolute right-[9px] top-2 h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-[var(--danger)]" />
      ) : null}
    </button>
  );
}

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 min-w-0 shrink-0 items-center gap-3 overflow-x-hidden border-b border-[var(--border)] bg-white px-4 md:gap-4 md:px-6">
      <div className="relative hidden max-w-[420px] flex-1 md:block">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
        />
        <input
          type="search"
          placeholder="Cari pelanggan, nomor bon..."
          className="h-[38px] w-full rounded-md border border-[var(--border)] bg-[var(--bg)] pl-9 pr-3 text-[13.5px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
        />
      </div>

      <div className="hidden flex-1 md:block" />

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <IconButton icon={Bell} badge />
        <IconButton icon={HelpCircle} className="hidden md:flex" />
        <div className="mx-1.5 hidden h-6 w-px bg-[var(--border)] md:block" />
        <Link
          href="/transactions/new"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 max-[380px]:px-2.5 max-[380px]:text-xs sm:gap-2 sm:px-3.5"
        >
          <Plus size={16} className="shrink-0" />
          Transaksi Baru
        </Link>
        <div className="ml-1.5 hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-[13px] font-semibold text-white md:flex">
          HL
        </div>
      </div>
    </header>
  );
}
