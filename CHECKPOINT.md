# CHECKPOINT — HL Internal Finance App
Last updated: 2026-06-06

## STATUS PHASE

| Phase | Status | Catatan |
|-------|--------|---------|
| Phase 0 — Setup & Init | ✅ Done | Infrastructure selesai |
| Phase 1 — Auth | 🔄 Active | Login page + seed user |
| Phase 2 — Customer CRUD | ⬜ Queue | |
| Phase 3 — Product CRUD | ⬜ Queue | |
| Phase 4 — Transaksi (Bon) + Kalkulasi | ⬜ Queue | |
| Phase 5 — Settlement (Lunas/Piutang) | ⬜ Queue | |
| Phase 6 — Bonus Logic | ⬜ Queue | |
| Phase 7 — Customer Detail Page | ⬜ Queue | |
| Phase 8 — Recap + PDF Export | ⬜ Queue | |
| Phase 9 — Polish UI + Bug Fix | ⬜ Queue | |
| Phase 10 — Final Deploy + README | ⬜ Queue | |

## PHASE AKTIF SEKARANG
Phase: 1 — Auth
Task aktif: Build login page + Supabase Auth seed user

## INFRASTRUCTURE (Phase 0 ✅)

### Dependencies
- @supabase/supabase-js, @supabase/ssr
- lucide-react, @fontsource/dm-sans, @fontsource/dm-mono
- shadcn/ui (base-nova, CSS variables)

### Supabase
- URL: `https://your-project.supabase.co` (placeholder — ganti di `.env.local` dengan URL project asli)
- Anon key: placeholder di `.env.local` — isi dari Supabase dashboard
- Schema: sudah dijalankan (schema.sql)

### Files created
- `lib/supabase/client.ts`, `server.ts`, `middleware.ts`
- `middleware.ts` — auth guard (/login public, sisanya protected)
- `lib/calculations.ts` — applyCascade, formatIDR, effectivePct, stepsLabel
- `types/index.ts` — Customer, Product, Transaction, dll
- `app/(dashboard)/layout.tsx` — protected layout + sidebar/topbar placeholder
- `app/(auth)/login/page.tsx` — placeholder
- Design tokens dari `ui-reference/styles.css` → `app/globals.css`

### Verified
- `npm run build` → 0 errors
- `npm run dev` → jalan
- `/` → redirect `/login`
- `/dashboard` tanpa auth → redirect `/login`
- `applyCascade(100, [20,20,10])` === 57.6 ✅

## UI REFERENCE STATUS
✅ Claude Design prototype selesai — semua halaman ada
✅ File tersimpan di `ui-reference/`
⚠️ VANILLA REACT — convert ke Next.js, BUKAN copy-paste

## NEXT TASK (Phase 1)
1. Isi `.env.local` dengan Supabase URL + anon key asli
2. Seed 1 user di Supabase Auth
3. Build halaman login (convert dari ui-reference/page-login.jsx)
4. Login action + redirect ke /dashboard

## TARGET TIMELINE
```
06 Jun → Setup + Init ✅
07-08 Jun → Auth + Customer + Product CRUD
09-10 Jun → Transaksi (Bon) + Kalkulasi
11-12 Jun → Settlement + Bonus Logic
13-14 Jun → Customer Detail Page
15-16 Jun → Recap + PDF Export
17-18 Jun → Polish UI + Bug Fix
19 Jun → Final deploy + README
20 Jun → SUBMIT sebelum 23:59 WIB
```

## KNOWN ISSUES
- `.env.local` masih placeholder — middleware auth butuh URL + anon key valid untuk login nyata

## LAST COMMIT
- feat(setup): init infrastructure, supabase client, auth middleware, design tokens
