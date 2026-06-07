import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatPdfIdr } from "@/lib/pdf/format";
import type { ReportData } from "@/lib/reports/types";
import {
  sumCustomerRecap,
  sumOverallMonths,
  sumTypeRecap,
} from "@/lib/reports/aggregations";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    width: "47%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 10,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 700,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableFooter: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: 700,
  },
  cell: {
    fontSize: 9,
  },
  cellRight: {
    fontSize: 9,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

type ReportTab = "customer" | "type" | "overall";

interface ReportPDFDocumentProps {
  data: ReportData;
  periodLabel: string;
  activeTab: ReportTab;
}

function Header({ periodLabel }: { periodLabel: string }) {
  const generatedAt = new Date().toLocaleString("id-ID");
  return (
    <View style={styles.header}>
      <Text style={styles.title}>HL Finance — Laporan {periodLabel}</Text>
      <Text style={styles.subtitle}>Dicetak: {generatedAt}</Text>
    </View>
  );
}

function TableHeader({ columns, widths }: { columns: string[]; widths: string[] }) {
  return (
    <View style={styles.tableHeader}>
      {columns.map((column, index) => (
        <Text
          key={column}
          style={[
            index === 0 ? styles.cell : styles.cellRight,
            { width: widths[index] },
          ]}
        >
          {column}
        </Text>
      ))}
    </View>
  );
}

function TableRow({
  cells,
  widths,
  bold,
}: {
  cells: string[];
  widths: string[];
  bold?: boolean;
}) {
  const rowStyle = bold ? styles.tableFooter : styles.tableRow;
  return (
    <View style={rowStyle}>
      {cells.map((cell, index) => (
        <Text
          key={`${cell}-${index}`}
          style={[
            index === 0 ? styles.cell : styles.cellRight,
            { width: widths[index] },
          ]}
        >
          {cell}
        </Text>
      ))}
    </View>
  );
}

function CustomerTab({ data }: { data: ReportData }) {
  const total = sumCustomerRecap(data.byCustomer);
  const widths = ["28%", "14%", "14%", "16%", "14%", "14%"];

  return (
    <View>
      <Text style={styles.sectionTitle}>Rekap Per Pelanggan</Text>
      <TableHeader
        columns={[
          "Pelanggan",
          "Omzet LM",
          "Omzet BR",
          "Total Omzet",
          "Laba",
          "Piutang",
        ]}
        widths={widths}
      />
      {data.byCustomer.map((row) => (
        <TableRow
          key={row.customerId}
          widths={widths}
          cells={[
            row.customerNama,
            formatPdfIdr(row.omzetLm),
            formatPdfIdr(row.omzetBr),
            formatPdfIdr(row.totalOmzet),
            formatPdfIdr(row.laba),
            formatPdfIdr(row.piutang),
          ]}
        />
      ))}
      <TableRow
        bold
        widths={widths}
        cells={[
          "TOTAL",
          formatPdfIdr(total.omzetLm),
          formatPdfIdr(total.omzetBr),
          formatPdfIdr(total.totalOmzet),
          formatPdfIdr(total.laba),
          formatPdfIdr(total.piutang),
        ]}
      />
    </View>
  );
}

function TypeTab({ data }: { data: ReportData }) {
  const total = sumTypeRecap(data.byType);
  const widths = ["30%", "17%", "17%", "18%", "18%"];

  return (
    <View>
      <Text style={styles.sectionTitle}>Rekap Per Tipe (LM/BR)</Text>
      <TableHeader
        columns={["Bulan", "Omzet LM", "Omzet BR", "Total Omzet", "Laba"]}
        widths={widths}
      />
      {data.byType.map((row) => (
        <TableRow
          key={`${row.year}-${row.month}`}
          widths={widths}
          cells={[
            row.label,
            formatPdfIdr(row.omzetLm),
            formatPdfIdr(row.omzetBr),
            formatPdfIdr(row.totalOmzet),
            formatPdfIdr(row.laba),
          ]}
        />
      ))}
      <TableRow
        bold
        widths={widths}
        cells={[
          "TOTAL",
          formatPdfIdr(total.omzetLm),
          formatPdfIdr(total.omzetBr),
          formatPdfIdr(total.totalOmzet),
          formatPdfIdr(total.laba),
        ]}
      />
    </View>
  );
}

function OverallTab({ data }: { data: ReportData }) {
  const total = sumOverallMonths(data.overallByMonth);
  const widths = ["28%", "18%", "18%", "18%", "18%"];

  return (
    <View>
      <Text style={styles.sectionTitle}>Ringkasan Overall</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Omzet</Text>
          <Text style={styles.summaryValue}>
            {formatPdfIdr(data.overallSummary.totalOmzet)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Laba HL</Text>
          <Text style={styles.summaryValue}>
            {formatPdfIdr(data.overallSummary.totalLaba)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Piutang Outstanding</Text>
          <Text style={styles.summaryValue}>
            {formatPdfIdr(data.overallSummary.totalPiutang)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Sudah Dibayar</Text>
          <Text style={styles.summaryValue}>
            {formatPdfIdr(data.overallSummary.totalSudahBayar)}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Breakdown Per Bulan</Text>
      <TableHeader
        columns={["Bulan", "Omzet", "Laba", "Piutang", "Sudah Bayar"]}
        widths={widths}
      />
      {data.overallByMonth.map((row) => (
        <TableRow
          key={`${row.year}-${row.month}`}
          widths={widths}
          cells={[
            row.label,
            formatPdfIdr(row.omzet),
            formatPdfIdr(row.laba),
            formatPdfIdr(row.piutang),
            formatPdfIdr(row.sudahBayar),
          ]}
        />
      ))}
      <TableRow
        bold
        widths={widths}
        cells={[
          "TOTAL",
          formatPdfIdr(total.omzet),
          formatPdfIdr(total.laba),
          formatPdfIdr(total.piutang),
          formatPdfIdr(total.sudahBayar),
        ]}
      />
    </View>
  );
}

export function ReportPDFDocument({
  data,
  periodLabel,
  activeTab,
}: ReportPDFDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header periodLabel={periodLabel} />
        {activeTab === "customer" ? <CustomerTab data={data} /> : null}
        {activeTab === "type" ? <TypeTab data={data} /> : null}
        {activeTab === "overall" ? <OverallTab data={data} /> : null}
        <Text style={styles.footer}>Dicetak dari HL Finance</Text>
      </Page>
    </Document>
  );
}
