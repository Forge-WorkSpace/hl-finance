# CLAUDE.md — HL Internal Finance App

## PROJECT OVERVIEW
Nama    : HL Internal Finance App
Tujuan  : Aplikasi internal single-user untuk manajemen pelanggan, produk, transaksi (Bon), piutang, bonus, dan laporan bisnis HL
Target  : Web app — akses via browser, deploy di Vercel
Bounty  : Rp 1.400.000 — deadline 20 Juni 2026, 23:59 WIB

## TECH STACK
Frontend  : Next.js 16 (App Router) + Tailwind CSS v4
Backend   : Next.js Server Actions
Database  : Supabase (PostgreSQL)
Auth      : Supabase Auth — single user, no registration
PDF       : @react-pdf/renderer
Hosting   : Vercel
UI        : shadcn/ui + Lucide icons

## STRUKTUR FOLDER
```
hl-finance/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/
│   │   ├── dashboard/       ← ringkasan piutang, omzet, laba
│   │   ├── customers/
│   │   ├── products/
│   │   ├── transactions/
│   │   └── reports/         ← recap 3 tabs + PDF export
│   └── layout.tsx
├── components/
│   ├── customers/
│   ├── dashboard/
│   ├── products/
│   ├── reports/             ← RecapTable, PDFDocument
│   ├── shared/              ← Sidebar, TopBar, LunasModal, dll
│   └── transactions/
├── lib/
│   ├── supabase/
│   ├── calculations.ts      ← diskon, omzet, laba, bonus helpers
│   ├── customers/           ← queries, detail-utils
│   ├── transactions/        ← queries, types
│   ├── reports/             ← aggregations, queries, types
│   └── pdf/                 ← format helpers untuk react-pdf
├── ui-reference/            ← VANILLA REACT prototype (referensi visual saja)
└── types/
```

## DOMAIN & KALKULASI (WAJIB DIBACA)

### Istilah
- **Bon** = transaksi / invoice
- **LM / BR** = dua tipe produk — tiap pelanggan punya diskon berbeda per tipe
- **Harga Modal** = harga beli HL, hanya untuk hitung laba, TIDAK ditampilkan ke customer
- **Harga Base** = harga jual sebelum diskon
- **Diskon bertingkat** = cascading, BUKAN dijumlah
- **Omzet** = harga setelah diskon × qty, tanpa ongkir
- **Laba HL** = (harga setelah diskon − modal) × qty
- **Piutang** = belum dibayar
- **Lunas** = sudah dibayar
- **Ongkir** = pass-through, tidak masuk laba

### Rumus Wajib (sumber kebenaran tunggal — lihat §8 AC)
```
Discounted unit price = Base × Π(1 − dᵢ/100)
Line omzet            = discounted price × qty
Transaction omzet     = Σ line omzet (ongkir excluded)
Amount owed           = transaction omzet + ongkir
Line Laba HL          = (discounted price − modal) × qty
Transaction Laba HL   = Σ line Laba HL
Bonus accumulator     = Σ omzet where status = Lunas (per customer)
Bonuses available     = floor(accumulator / threshold) − bonuses_granted
```

### Cash Basis (PENTING)
Omzet, Laba, dan Bonus accumulator **HANYA dihitung dari transaksi Lunas**.
Transaksi Piutang = belum diakui di laporan.

## KEPUTUSAN ARSITEKTUR PENTING
- App Router — Server Components + Server Actions (Next.js 16)
- Supabase Auth untuk single user — seed 1 user saat setup, no register flow
- Semua kalkulasi diskon/omzet/laba dipusatkan di `lib/calculations.ts` — tidak boleh dihitung inline di komponen
- Agregasi laporan/dashboard di `lib/reports/` — bonus selalu di-exclude (`is_bonus=false`)
- Soft-delete untuk Customer dan Product — kolom `deleted_at` timestamp
- Bonus accumulator = computed dari query; `bonuses_consumed` di-store di `bonus_grants`
- PDF export pakai `@react-pdf/renderer` (client-side download via PDFDownloadLink)
- `redirect()` di server actions HARUS di luar blok `try/catch` (Next.js NEXT_REDIRECT)

## PATTERN WAJIB PROJECT INI
- Gunakan `supabase.auth.getUser()` bukan `getSession()` untuk validasi server-side
- Semua tabel wajib Row Level Security (RLS) di Supabase
- Format currency IDR: selalu tampilkan dengan `Rp` prefix dan titik sebagai separator ribuan
- Nomor Bon: validasi unique di level DB (unique constraint) DAN di level aplikasi
- Status transaksi: enum `'piutang' | 'lunas'` — konsisten di seluruh codebase
- Tipe produk: enum `'LM' | 'BR'` — konsisten di seluruh codebase

## UI REFERENCE — PENTING UNTUK CODING AGENT

### Sumber UI
Claude Design (claude.ai/design) sudah generate prototype UI lengkap.
File tersedia di `ui-reference/`:
```
shell.jsx, shared.jsx, data.jsx, icons.jsx, styles.css
page-login.jsx, page-dashboard.jsx, page-bon.jsx, page-bon-detail.jsx
page-customers.jsx, page-products.jsx, page-transactions.jsx, page-reports.jsx
```

### ⚠️ PERINGATAN KRITIS — WAJIB DIBACA

**File-file di atas adalah VANILLA REACT (bukan Next.js).**
Coding agent TIDAK BOLEH copy-paste langsung ke Next.js.

Yang harus dilakukan saat convert:

| Vanilla React (lama) | Next.js App Router (target) |
|---------------------|----------------------------|
| `window.HLData` globals | `lib/calculations.ts` + `lib/utils.ts` |
| `useState` untuk routing | Next.js `app/` folder routing |
| Dummy data di `data.jsx` | Query ke Supabase |
| Inline styles | Tailwind CSS classes |
| `(function(){ ... })()` IIFE pattern | Named exports / default exports |
| `Object.assign(window, {...})` | Proper module exports |
| No auth | Supabase Auth + middleware |
| `applyCascade()` di data.jsx | Pindah ke `lib/calculations.ts` |

### Yang BOLEH diambil langsung dari UI Reference
- Logic kalkulasi `applyCascade()` dari `data.jsx` → pindah ke `lib/calculations.ts`
- Design token & CSS variables dari `styles.css` → pindah ke `globals.css`
- Struktur komponen sebagai referensi visual
- Nama komponen dan props sebagai panduan

### Yang HARUS ditulis ulang
- Semua data fetching → pakai Supabase client
- Routing → Next.js App Router
- State management → React hooks + Server Actions
- Styling → Tailwind CSS (bukan inline styles)

## YANG TIDAK BOLEH DIUBAH
- Rumus kalkulasi di atas — ini sumber kebenaran tunggal (AC §8)
- Cash basis rule — omzet/laba HANYA dari transaksi Lunas
- Soft-delete — jangan hard-delete customer/product yang punya history transaksi
- Nomor Bon harus unique — jangan skip validasi ini
- Ongkir tidak boleh masuk perhitungan Laba HL

## DB SCHEMA (ringkasan)

```sql
customers
  id, nama, bonus_threshold, deleted_at, created_at

customer_discounts
  id, customer_id, product_type (LM|BR), discount_steps (jsonb []), position

products
  id, nama, harga_modal, harga_base, tipe (LM|BR), deleted_at, created_at

transactions
  id, nomor_bon (unique), tanggal, customer_id, ongkir, deskripsi,
  is_bonus (bool), status (piutang|lunas), tanggal_lunas, created_at

transaction_lines
  id, transaction_id, product_id, quantity,
  snapshot_harga_base, snapshot_harga_modal, snapshot_discounts (jsonb),
  discounted_unit_price, line_omzet, line_laba

bonus_grants
  id, customer_id, transaction_id, bonuses_consumed, created_at
```

> **PENTING:** `transaction_lines` menyimpan snapshot harga & diskon saat transaksi dibuat.
> Ini mencegah perubahan harga/diskon di masa depan mempengaruhi history transaksi.

## CURRENT PHASE

**Phase 8 — Deploy + Polish** (active next session)

| Phase | Status |
|-------|--------|
| 0 Setup & Init | ✅ Done |
| 1 Auth | ✅ Done |
| 2 Customer CRUD | ✅ Done |
| 3 Product CRUD | ✅ Done |
| 4 Transaksi (Bon) | ✅ Done |
| 5 Settlement (Lunas) | ✅ Done |
| 6 Bonus Logic | ✅ Done |
| 7 Dashboard + Laporan + PDF | ✅ Done |
| 8 Deploy + Polish | 🔄 Active |
| 9–10 | ⬜ Queue |

## SCREEN STATUS

| Screen | Route | Status |
|--------|-------|--------|
| Login | `/login` | ✅ Done |
| Dashboard | `/dashboard` | ✅ Done — piutang, omzet/laba bulan ini, recent tx |
| Pelanggan (list) | `/customers` | ✅ Done |
| Tambah / edit pelanggan | `/customers/new`, `[id]/edit` | ✅ Done |
| Detail pelanggan | `/customers/[id]` | ✅ Done — settlement, bonus banner, PDF |
| Produk | `/products` | ✅ Done |
| Transaksi | `/transactions` | ✅ Done — list, bon form, detail, settlement |
| Laporan | `/reports` | ✅ Done — 3 tabs, filter bulan/tahun, PDF export |

## SESSION NOTES (2026-06-06)

- Supabase project: `https://vgwgfnsmcmlrbbumdoey.supabase.co`
- Demo user: `admin@hl-finance.com` / `HLFinance2026!`
- Stack: Next.js **16.2.7** + Tailwind v4 + shadcn/ui + Supabase
- Git: `https://github.com/Forge-WorkSpace/hl-finance` — branch `feature/mobile-integration`
- GRANT fix: `supabase/fix-grants.sql` (role `authenticated` butuh GRANT tabel)
- UI reference di `ui-reference/` — VANILLA REACT, convert only (jangan copy-paste)
- Laporan & dashboard: exclude `is_bonus=true` dari semua agregasi omzet/laba/piutang
- Klaim bonus: `/transactions/new?customerId=[id]&bonus=true` → insert `bonus_grants`
- Settlement: `settlement-actions.ts` — single bon + monthly mass settle (exclude bonus bon)
- PDF: `@react-pdf/renderer` — `ReportPDFDocument`, `CustomerPDFDocument`
- UX: **sonner** toasts via `?toast=` query param setelah redirect server actions
- Redirect map: create tx → `/transactions`, bonus bon → `/customers/[id]`, settle → detail/customer

## DOCS SYNC

- Progress detail: `CHECKPOINT.md`
- Keputusan bisnis/teknis: `DECISIONS.md`
