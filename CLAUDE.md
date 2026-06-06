# CLAUDE.md — HL Internal Finance App

## PROJECT OVERVIEW
Nama    : HL Internal Finance App
Tujuan  : Aplikasi internal single-user untuk manajemen pelanggan, produk, transaksi (Bon), piutang, bonus, dan laporan bisnis HL
Target  : Web app — akses via browser, deploy di Vercel
Bounty  : Rp 1.400.000 — deadline 20 Juni 2026, 23:59 WIB

## TECH STACK
Frontend  : Next.js 14 (App Router) + Tailwind CSS
Backend   : Next.js API Routes / Server Actions
Database  : Supabase (PostgreSQL)
Auth      : Supabase Auth — single user, no registration
PDF       : react-pdf
Hosting   : Vercel

## STRUKTUR FOLDER
```
hl-finance/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── products/
│   │   ├── transactions/
│   │   └── reports/
│   └── layout.tsx
├── components/
│   ├── ui/           ← shadcn components
│   ├── customers/
│   ├── products/
│   ├── transactions/
│   └── reports/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── calculations.ts   ← semua logika hitung (diskon, omzet, laba, bonus)
│   └── utils.ts
├── hooks/
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
- App Router dipilih untuk Next.js 14 — Server Components + Server Actions
- Supabase Auth untuk single user — seed 1 user saat setup, no register flow
- Semua kalkulasi diskon/omzet/laba dipusatkan di `lib/calculations.ts` — tidak boleh dihitung inline di komponen
- Soft-delete untuk Customer dan Product — kolom `deleted_at` timestamp
- Bonus accumulator = computed dari query (tidak di-store), kecuali `bonuses_granted` yang di-store
- PDF export pakai react-pdf

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
File tersedia di root project:
```
shell.jsx          ← layout sidebar + topbar
app.jsx            ← router + state management
shared.jsx         ← komponen shared (Button, Input, Card, Badge, dll)
data.jsx           ← dummy data + helper functions (formatIDR, applyCascade, dll)
icons.jsx          ← icon wrapper
styles.css         ← CSS variables + base styles
page-login.jsx     ← halaman login
page-dashboard.jsx ← halaman dashboard
page-bon.jsx       ← form bon baru
page-bon-detail.jsx← detail bon
page-customers.jsx ← daftar pelanggan + detail pelanggan
page-products.jsx  ← daftar produk
page-transactions.jsx ← daftar transaksi
page-reports.jsx   ← laporan
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

**Phase 3 — Product CRUD** (active next session)

| Phase | Status |
|-------|--------|
| 0 Setup & Init | ✅ Done |
| 1 Auth | ✅ Done |
| 2 Customer CRUD | ✅ Done |
| 3 Product CRUD | 🔄 Next |
| 4–10 | ⬜ Queue |

## SCREEN STATUS

| Screen | Route | Status |
|--------|-------|--------|
| Login | `/login` | ✅ Done — form, server action, error/loading |
| Dashboard | `/dashboard` | 🔄 Placeholder |
| Pelanggan (list) | `/customers` | ✅ Done — stats, filter, search, CRUD actions |
| Tambah pelanggan | `/customers/new` | ✅ Done — cascading discount editor |
| Edit pelanggan | `/customers/[id]/edit` | ✅ Done |
| Detail pelanggan | `/customers/[id]` | ✅ Done — ringkas (settlement Phase 5) |
| Produk | `/products` | ⬜ Belum — sidebar link 404 |
| Transaksi | `/transactions` | ⬜ Belum — sidebar link 404 |
| Laporan | `/reports` | ⬜ Belum — sidebar link 404 |

## SESSION NOTES (2026-06-06)

- Supabase project: `https://vgwgfnsmcmlrbbumdoey.supabase.co`
- Demo user seeded: `admin@hl-finance.com` / `HLFinance2026!`
- **Bug fixed:** error `42501 permission denied` — role `authenticated` butuh GRANT tabel. Fix: jalankan `supabase/fix-grants.sql` (juga ditambah di `schema.sql` §7)
- App shell: Sidebar + TopBar live di semua dashboard routes
- UI reference files ada di `ui-reference/` (bukan root) — tetap VANILLA REACT, convert only
- Stack aktual: Next.js **16.2.7** + Tailwind v4 + shadcn/ui (bukan Next 14 — update mental model)
- Git branch kerja: `feature/mobile-integration`
