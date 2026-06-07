# CHECKPOINT — HL Internal Finance App
Last updated: 2026-06-06 (Phase 6 complete)

## STATUS PHASE

| Phase | Status | Catatan |
|-------|--------|---------|
| Phase 0 — Setup & Init | ✅ Done | Infrastructure selesai |
| Phase 1 — Auth | ✅ Done | Login, logout, session protection |
| Phase 2 — Customer CRUD | ✅ Done | CRUD + diskon bertingkat + app shell |
| Phase 3 — Product CRUD | ✅ Done | List, create/edit, soft delete, LM/BR filter |
| Phase 4 — Transaksi (Bon) + Kalkulasi | ✅ Done | Bon form, real-time calc, snapshot, detail |
| Phase 5 — Settlement (Lunas/Piutang) | ✅ Done | LunasModal, settle single/monthly, customer detail |
| Phase 6 — Bonus Logic | ✅ Done | Klaim bonus flow, bonus_grants, validation |
| Phase 7 — Customer Detail Page | ✅ Done | Full detail di Phase 5 |
| Phase 8 — Recap + PDF Export | 🔄 Active | Mulai sesi berikutnya |
| Phase 9 — Polish UI + Bug Fix | ⬜ Queue | |
| Phase 10 — Final Deploy + README | ⬜ Queue | |

## PHASE AKTIF SEKARANG
Phase: **8 — Recap + PDF Export**
Task aktif: Laporan omzet/laba, export PDF customer & recap

## SCREENS DONE

| Screen | Route | Status |
|--------|-------|--------|
| Login | `/login` | ✅ Done |
| Dashboard shell | `/dashboard` | 🔄 Placeholder |
| Customer list | `/customers` | ✅ Done |
| Customer new/edit | `/customers/new`, `[id]/edit` | ✅ Done |
| Customer detail | `/customers/[id]` | ✅ Done (full: summary, monthly history, settlement, bonus banner) |
| App shell (Sidebar/TopBar) | dashboard layout | ✅ Done |
| Produk list | `/products` | ✅ Done |
| Produk new/edit | `/products/new`, `[id]/edit` | ✅ Done |
| Transaksi list | `/transactions` | ✅ Done (customer link, bonus badge) |
| Bon baru / edit | `/transactions/new`, `[id]/edit` | ✅ Done (bonus claim mode) |
| Detail bon | `/transactions/[id]` | ✅ Done (Tandai Lunas) |
| Laporan | `/reports` | ⬜ Phase 8 |

## SUPABASE
- URL: `https://vgwgfnsmcmlrbbumdoey.supabase.co`
- Demo user: `admin@hl-finance.com` / `HLFinance2026!`
- Schema + RLS: `schema.sql` (termasuk GRANT §7)
- Fix GRANT: `supabase/fix-grants.sql` ✅ dijalankan di project

## GIT / REMOTE
- Repo: `https://github.com/Forge-WorkSpace/hl-finance`
- Branch: `feature/mobile-integration`

## TODO NEXT (Phase 8)
1. Halaman laporan omzet/laba per periode
2. PDF export customer detail
3. Recap bulanan / tahunan

## KNOWN ISSUES
- Sidebar link `/reports` → 404 (expected, belum Phase 8)
- TopBar search global belum wired (placeholder UI only)
- Dashboard page masih placeholder
- Download PDF di customer detail masih placeholder (Phase 8)

## COMMIT HISTORY (terakhir)

```
feat(bonus): bonus claim flow, bonus grants, bonus validation
afeea76 feat(settlement): lunas modal, settle single bon, settle monthly, customer detail
56b29fb fix(transactions): auto nomor bon, form action, redirect outside try/catch
826a18e feat(transactions): bon form, real-time calculation, snapshot, detail page
```

## LAST COMMIT
- `feat(bonus): bonus claim flow, bonus grants, bonus validation` — Phase 6 complete
