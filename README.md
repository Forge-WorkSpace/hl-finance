# HL Internal Finance App

Aplikasi internal single-user untuk manajemen pelanggan, produk, transaksi (Bon), piutang, bonus, dan laporan bisnis HL.

## Tech Stack

- Next.js 16 (App Router) + Tailwind CSS
- Supabase (PostgreSQL + Auth)
- shadcn/ui

## Getting Started

```bash
cd hl-finance
npm install
cp .env.example .env.local
# Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Demo Credentials

Buat user berikut di **Supabase Dashboard → Authentication → Users → Add user**:

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `admin@hl-finance.com` |
| Password | `HLFinance2026!`       |

Login hanya untuk single user — tidak ada register flow.

## Scripts

```bash
npm run dev    # development server
npm run build  # production build
npm run start  # production server
npm run lint   # ESLint
```

## Project Structure

```
app/
  (auth)/login/     # Login page
  (auth)/logout/    # Logout route handler
  (dashboard)/      # Protected routes
lib/
  supabase/         # Supabase clients
  calculations.ts   # Business logic (discount, omzet, laba)
types/              # TypeScript types
ui-reference/       # Vanilla React UI prototype (reference only)
```
