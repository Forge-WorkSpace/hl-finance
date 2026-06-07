"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { formatIDR } from "@/lib/calculations";
import {
  sumCustomerRecap,
  sumOverallMonths,
  sumTypeRecap,
} from "@/lib/reports/aggregations";
import type { ReportData } from "@/lib/reports/types";
import { ReportsDownloadButton } from "@/components/reports/ReportsDownloadButton";

type ReportTab = "customer" | "type" | "overall";

interface RecapTableProps {
  data: ReportData;
  periodLabel: string;
}

export function RecapTable({ data, periodLabel }: RecapTableProps) {
  const [tab, setTab] = useState<ReportTab>("customer");

  const customerTotal = useMemo(
    () => sumCustomerRecap(data.byCustomer),
    [data.byCustomer],
  );
  const typeTotal = useMemo(() => sumTypeRecap(data.byType), [data.byType]);
  const overallTotal = useMemo(
    () => sumOverallMonths(data.overallByMonth),
    [data.overallByMonth],
  );

  const tabs: { key: ReportTab; label: string }[] = [
    { key: "customer", label: "Per Pelanggan" },
    { key: "type", label: "Per Tipe (LM/BR)" },
    { key: "overall", label: "Overall" },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-white p-1">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`h-9 rounded-md px-4 text-sm font-medium transition-colors ${
                tab === item.key
                  ? "bg-[var(--primary-subtle)] text-[var(--primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-dim)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <ReportsDownloadButton data={data} periodLabel={periodLabel} activeTab={tab} />
      </div>

      {tab === "customer" ? (
        <ReportTableShell>
          <thead>
            <ReportHeadRow
              columns={[
                "Pelanggan",
                "Omzet LM",
                "Omzet BR",
                "Total Omzet",
                "Laba",
                "Piutang",
              ]}
            />
          </thead>
          <tbody>
            {data.byCustomer.length === 0 ? (
              <EmptyRow colSpan={6} />
            ) : (
              <>
                {data.byCustomer.map((row) => (
                  <tr
                    key={row.customerId}
                    className="border-t border-[var(--border)]"
                  >
                    <ReportCell>
                      <Link
                        href={`/customers/${row.customerId}`}
                        className="font-medium text-[var(--text-primary)] hover:text-[var(--primary)]"
                      >
                        {row.customerNama}
                      </Link>
                    </ReportCell>
                    <ReportCell align="right" mono>
                      {formatIDR(row.omzetLm)}
                    </ReportCell>
                    <ReportCell align="right" mono>
                      {formatIDR(row.omzetBr)}
                    </ReportCell>
                    <ReportCell align="right" mono>
                      {formatIDR(row.totalOmzet)}
                    </ReportCell>
                    <ReportCell align="right" mono>
                      {formatIDR(row.laba)}
                    </ReportCell>
                    <ReportCell align="right" mono tone="piutang">
                      {formatIDR(row.piutang)}
                    </ReportCell>
                  </tr>
                ))}
                <FooterRow
                  cells={[
                    "TOTAL",
                    formatIDR(customerTotal.omzetLm),
                    formatIDR(customerTotal.omzetBr),
                    formatIDR(customerTotal.totalOmzet),
                    formatIDR(customerTotal.laba),
                    formatIDR(customerTotal.piutang),
                  ]}
                />
              </>
            )}
          </tbody>
        </ReportTableShell>
      ) : null}

      {tab === "type" ? (
        <ReportTableShell>
          <thead>
            <ReportHeadRow
              columns={["Bulan", "Omzet LM", "Omzet BR", "Total Omzet", "Laba"]}
            />
          </thead>
          <tbody>
            {data.byType.length === 0 ? (
              <EmptyRow colSpan={5} />
            ) : (
              <>
                {data.byType.map((row) => (
                  <tr
                    key={`${row.year}-${row.month}`}
                    className="border-t border-[var(--border)]"
                  >
                    <ReportCell>{row.label}</ReportCell>
                    <ReportCell align="right" mono>
                      {formatIDR(row.omzetLm)}
                    </ReportCell>
                    <ReportCell align="right" mono>
                      {formatIDR(row.omzetBr)}
                    </ReportCell>
                    <ReportCell align="right" mono>
                      {formatIDR(row.totalOmzet)}
                    </ReportCell>
                    <ReportCell align="right" mono>
                      {formatIDR(row.laba)}
                    </ReportCell>
                  </tr>
                ))}
                <FooterRow
                  cells={[
                    "TOTAL",
                    formatIDR(typeTotal.omzetLm),
                    formatIDR(typeTotal.omzetBr),
                    formatIDR(typeTotal.totalOmzet),
                    formatIDR(typeTotal.laba),
                  ]}
                />
              </>
            )}
          </tbody>
        </ReportTableShell>
      ) : null}

      {tab === "overall" ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <BigStat label="Total Omzet" value={data.overallSummary.totalOmzet} />
            <BigStat
              label="Total Laba HL"
              value={data.overallSummary.totalLaba}
              tone="lunas"
            />
            <BigStat
              label="Total Piutang Outstanding"
              value={data.overallSummary.totalPiutang}
              tone="piutang"
            />
            <BigStat
              label="Total Sudah Dibayar"
              value={data.overallSummary.totalSudahBayar}
            />
          </div>

          <ReportTableShell>
            <thead>
              <ReportHeadRow
                columns={["Bulan", "Omzet", "Laba", "Piutang", "Sudah Bayar"]}
              />
            </thead>
            <tbody>
              {data.overallByMonth.length === 0 ? (
                <EmptyRow colSpan={5} />
              ) : (
                <>
                  {data.overallByMonth.map((row) => (
                    <tr
                      key={`${row.year}-${row.month}`}
                      className="border-t border-[var(--border)]"
                    >
                      <ReportCell>{row.label}</ReportCell>
                      <ReportCell align="right" mono>
                        {formatIDR(row.omzet)}
                      </ReportCell>
                      <ReportCell align="right" mono>
                        {formatIDR(row.laba)}
                      </ReportCell>
                      <ReportCell align="right" mono tone="piutang">
                        {formatIDR(row.piutang)}
                      </ReportCell>
                      <ReportCell align="right" mono>
                        {formatIDR(row.sudahBayar)}
                      </ReportCell>
                    </tr>
                  ))}
                  <FooterRow
                    cells={[
                      "TOTAL",
                      formatIDR(overallTotal.omzet),
                      formatIDR(overallTotal.laba),
                      formatIDR(overallTotal.piutang),
                      formatIDR(overallTotal.sudahBayar),
                    ]}
                  />
                </>
              )}
            </tbody>
          </ReportTableShell>
        </div>
      ) : null}
    </div>
  );
}

function ReportTableShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
      <div className="table-scroll">
        <table className="min-w-[760px] w-full border-collapse">{children}</table>
      </div>
    </div>
  );
}

function ReportHeadRow({ columns }: { columns: string[] }) {
  return (
    <tr className="bg-[var(--surface-dim)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
      {columns.map((column, index) => (
        <th
          key={column}
          className={`px-[18px] py-3 ${index === 0 ? "" : "text-right"}`}
        >
          {column}
        </th>
      ))}
    </tr>
  );
}

function ReportCell({
  children,
  align = "left",
  mono,
  tone,
}: {
  children: ReactNode;
  align?: "left" | "right";
  mono?: boolean;
  tone?: "piutang";
}) {
  return (
    <td
      className={`px-[18px] py-3.5 text-sm ${
        align === "right" ? "text-right" : ""
      } ${mono ? "mono" : ""} ${
        tone === "piutang" ? "text-[var(--piutang)]" : "text-[var(--text-primary)]"
      }`}
    >
      {children}
    </td>
  );
}

function FooterRow({ cells }: { cells: string[] }) {
  return (
    <tr className="border-t-2 border-[var(--border-strong)] bg-[var(--surface-dim)] font-semibold">
      {cells.map((cell, index) => (
        <td
          key={`${cell}-${index}`}
          className={`mono px-[18px] py-3.5 text-sm ${
            index === 0 ? "" : "text-right"
          }`}
        >
          {cell}
        </td>
      ))}
    </tr>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-[18px] py-12 text-center text-sm text-[var(--text-secondary)]"
      >
        Tidak ada data pada periode ini.
      </td>
    </tr>
  );
}

function BigStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "piutang" | "lunas";
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        {label}
      </div>
      <div
        className={`mono mt-2 text-2xl font-bold ${
          tone === "piutang"
            ? "text-[var(--piutang)]"
            : tone === "lunas"
              ? "text-[var(--lunas)]"
              : "text-[var(--text-primary)]"
        }`}
      >
        {formatIDR(value)}
      </div>
    </div>
  );
}
