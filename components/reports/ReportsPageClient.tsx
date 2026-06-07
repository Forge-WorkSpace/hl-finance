"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RecapTable } from "@/components/reports/RecapTable";
import type { ReportData } from "@/lib/reports/types";

interface ReportsFilterBarProps {
  month: number | null;
  year: number;
}

const MONTH_OPTIONS = [
  { value: "all", label: "Semua Bulan" },
  ...Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: new Date(2026, index, 1).toLocaleDateString("id-ID", {
      month: "long",
    }),
  })),
];

export function ReportsFilterBar({ month, year }: ReportsFilterBarProps) {
  const router = useRouter();
  const [draftMonth, setDraftMonth] = useState(month ? String(month) : "all");
  const [draftYear, setDraftYear] = useState(String(year));

  function applyFilters() {
    const params = new URLSearchParams();
    params.set("month", draftMonth);
    params.set("year", draftYear);
    router.push(`/reports?${params.toString()}`);
  }

  const yearOptions = Array.from({ length: 5 }, (_, index) => year - 2 + index);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
          Bulan
        </label>
        <select
          value={draftMonth}
          onChange={(e) => setDraftMonth(e.target.value)}
          className="h-10 min-w-[160px] rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-blue-600"
        >
          {MONTH_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
          Tahun
        </label>
        <select
          value={draftYear}
          onChange={(e) => setDraftYear(e.target.value)}
          className="h-10 min-w-[120px] rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-blue-600"
        >
          {yearOptions.map((optionYear) => (
            <option key={optionYear} value={optionYear}>
              {optionYear}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={applyFilters}
        className="inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
      >
        Terapkan
      </button>
    </div>
  );
}

interface ReportsPageClientProps {
  data: ReportData;
  periodLabel: string;
  month: number | null;
  year: number;
}

export function ReportsPageClient({
  data,
  periodLabel,
  month,
  year,
}: ReportsPageClientProps) {
  return (
    <div className="animate-[fadeUp_280ms_ease]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Laporan
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Rekap omzet, laba, dan piutang — {periodLabel}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <ReportsFilterBar month={month} year={year} />
      </div>

      <RecapTable data={data} periodLabel={periodLabel} />
    </div>
  );
}
