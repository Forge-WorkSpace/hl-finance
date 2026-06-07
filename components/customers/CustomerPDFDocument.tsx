import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatPdfIdr } from "@/lib/pdf/format";
import type { CustomerPdfData } from "@/lib/reports/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    marginBottom: 18,
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
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
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
  monthTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 14,
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  cell: { fontSize: 9, width: "25%" },
  cellRight: { fontSize: 9, width: "25%", textAlign: "right" },
  monthSummary: {
    marginTop: 6,
    marginBottom: 4,
    fontSize: 8,
    color: "#6B7280",
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

interface CustomerPDFDocumentProps {
  data: CustomerPdfData;
}

function formatStatus(status: string): string {
  return status === "lunas" ? "Lunas" : "Piutang";
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CustomerPDFDocument({ data }: CustomerPDFDocumentProps) {
  const generatedAt = new Date().toLocaleString("id-ID");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>HL Finance — Statement {data.nama}</Text>
          <Text style={styles.subtitle}>Dicetak: {generatedAt}</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Piutang</Text>
            <Text style={styles.summaryValue}>{formatPdfIdr(data.piutang)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Sudah Bayar</Text>
            <Text style={styles.summaryValue}>{formatPdfIdr(data.sudahBayar)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Omzet</Text>
            <Text style={styles.summaryValue}>{formatPdfIdr(data.totalOmzet)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Laba</Text>
            <Text style={styles.summaryValue}>{formatPdfIdr(data.totalLaba)}</Text>
          </View>
        </View>

        {data.monthGroups.map((group) => (
          <View key={group.label} wrap={false}>
            <Text style={styles.monthTitle}>{group.label}</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.cell}>Tanggal</Text>
              <Text style={styles.cell}>Nomor Bon</Text>
              <Text style={styles.cell}>Status</Text>
              <Text style={styles.cellRight}>Total</Text>
            </View>
            {group.transactions.map((tx) => (
              <View key={tx.nomor_bon + tx.tanggal} style={styles.tableRow}>
                <Text style={styles.cell}>{formatDate(tx.tanggal)}</Text>
                <Text style={styles.cell}>{tx.nomor_bon}</Text>
                <Text style={styles.cell}>{formatStatus(tx.status)}</Text>
                <Text style={styles.cellRight}>{formatPdfIdr(tx.total)}</Text>
              </View>
            ))}
            <Text style={styles.monthSummary}>
              Piutang: {formatPdfIdr(group.piutangTotal)} | Sudah Bayar:{" "}
              {formatPdfIdr(group.sudahBayarTotal)} | Omzet (Lunas):{" "}
              {formatPdfIdr(group.totalOmzetLunas)} | Laba:{" "}
              {formatPdfIdr(group.totalLabaLunas)}
            </Text>
          </View>
        ))}

        <Text style={styles.footer}>Dicetak dari HL Finance</Text>
      </Page>
    </Document>
  );
}
