# CHECKPOINT — HL Internal Finance App
Last updated: 2026-06-06

## STATUS PHASE

| Phase | Status | Catatan |
|-------|--------|---------|
| Phase 0 — Setup & Init | ✅ Done | Infrastructure selesai |
| Phase 1 — Auth | ✅ Done | Login, logout, session protection |
| Phase 2 — Customer CRUD | 🔄 Active | |
| Phase 3 — Product CRUD | ⬜ Queue | |
| Phase 4 — Transaksi (Bon) + Kalkulasi | ⬜ Queue | |
| Phase 5 — Settlement (Lunas/Piutang) | ⬜ Queue | |
| Phase 6 — Bonus Logic | ⬜ Queue | |
| Phase 7 — Customer Detail Page | ⬜ Queue | |
| Phase 8 — Recap + PDF Export | ⬜ Queue | |
| Phase 9 — Polish UI + Bug Fix | ⬜ Queue | |
| Phase 10 — Final Deploy + README | ⬜ Queue | |

## PHASE AKTIF SEKARANG
Phase: 2 — Customer CRUD
Task aktif: CRUD pelanggan + diskon LM/BR

## AUTH (Phase 1 ✅)

### Supabase
- URL: `https://vgwgfnsmcmlrbbumdoey.supabase.co`
- Anon key: configured di `.env.local`

### Demo user (buat manual di Supabase Dashboard)
- Email: `admin@hl-finance.com`
- Password: `HLFinance2026!`

### Files
- `app/(auth)/login/page.tsx` + `login-form.tsx` — UI login
- `app/(auth)/login/actions.ts` — signInWithPassword + getUser()
- `app/(auth)/logout/route.ts` — POST signOut → /login
- `app/(dashboard)/layout.tsx` — protected via getUser()

### Verified
- `npm run build` → 0 errors
- Login UI sesuai spec (card, toggle password, loading, error banner)
- Middleware: /login saat auth → /dashboard, /dashboard tanpa auth → /login

## NEXT TASK (Phase 2)
1. Customer list page
2. Create / edit customer
3. Diskon LM & BR per customer (discount_steps jsonb)
4. Soft-delete support

## TARGET TIMELINE
```
06 Jun → Setup + Init ✅ | Auth ✅
07-08 Jun → Customer + Product CRUD
09-10 Jun → Transaksi (Bon) + Kalkulasi
11-12 Jun → Settlement + Bonus Logic
13-14 Jun → Customer Detail Page
15-16 Jun → Recap + PDF Export
17-18 Jun → Polish UI + Bug Fix
19 Jun → Final deploy + README
20 Jun → SUBMIT sebelum 23:59 WIB
```

## KNOWN ISSUES
- Demo user harus di-seed manual di Supabase Auth dashboard (lihat README)

## LAST COMMIT
- feat(auth): login page, server action, session protection, logout
