# HL Finance — Internal Sales & Receivables Management

Aplikasi manajemen penjualan dan piutang internal untuk bisnis HL. Single-user web app untuk pelanggan, produk, transaksi (Bon), pelunasan, bonus, dan laporan.

## Tech Stack

- **Next.js 16** (App Router) + **Tailwind CSS v4**
- **Supabase** (PostgreSQL + Auth)
- **shadcn/ui** + Lucide icons
- **@react-pdf/renderer** — export PDF laporan & statement pelanggan
- **sonner** — toast notifications
- **Vercel** — hosting

## Demo

🔗 **Live URL:** _(set after Vercel deploy — update this line)_

## Demo Credentials

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `admin@hl-finance.com` |
| Password | `HLFinance2026!`       |

> User harus sudah di-seed di Supabase Auth (Authentication → Users).

## Fitur

- Manajemen pelanggan dengan **diskon bertingkat (cascading)** per tipe LM/BR
- Manajemen produk (tipe LM / BR) dengan soft-delete
- Pencatatan transaksi (Bon) dengan kalkulasi otomatis real-time
- Snapshot harga & diskon di setiap line item
- Pelunasan per bon atau massal per bulan
- Sistem bonus pelanggan (accumulator + klaim bonus bon)
- Dashboard ringkasan piutang, omzet, laba
- Laporan omzet, laba, piutang (per pelanggan, per tipe LM/BR, overall)
- Export PDF laporan dan statement pelanggan

## Kalkulasi

Menggunakan **cash basis**:

- Omzet dan Laba hanya diakui saat transaksi **Lunas**
- Diskon bertingkat (cascading): `Base × (1-d₁) × (1-d₂) × … × (1-dₙ)`
- Ongkir = pass-through, tidak masuk laba
- Bonus: `floor(accumulator / threshold) − bonuses_granted`
- Transaksi bonus (`is_bonus=true`) excluded dari omzet/laba/piutang laporan

## Setup (Development)

### Prerequisites

- Node.js 20+
- Akun Supabase (project + schema)

### 1. Clone & install

```bash
git clone https://github.com/Forge-WorkSpace/hl-finance.git
cd hl-finance
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Isi `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database

Jalankan `schema.sql` di Supabase SQL Editor, lalu `supabase/fix-grants.sql` jika perlu.

Seed demo user di **Supabase → Authentication → Users → Add user**.

### 4. Run locally

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

1. Push repo ke GitHub
2. [vercel.com](https://vercel.com) → **New Project** → import repo
3. Framework: **Next.js** (auto-detect)
4. Environment variables (Production):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # production server
npm run lint    # ESLint
```

## Project Structure

```
app/
  (auth)/login/          # Login
  (dashboard)/           # Protected routes
    dashboard/           # Summary cards + recent transactions
    customers/           # CRUD + detail + settlement
    products/            # CRUD
    transactions/        # Bon form, detail, settlement
    reports/             # Recap 3 tabs + PDF
components/              # UI components per domain
lib/
  calculations.ts        # Diskon, omzet, laba, bonus
  reports/               # Aggregations & queries
  supabase/              # Client, server, middleware
ui-reference/            # Vanilla React prototype (visual reference only)
```

## License

Private — internal use only.
