# CHECKPOINT — HL Internal Finance App
Last updated: 2026-06-06

## STATUS PHASE

| Phase | Status | Catatan |
|-------|--------|---------|
| Phase 0 — Setup & Init | ✅ Done | Infrastructure selesai |
| Phase 1 — Auth | ✅ Done | Login, logout, session protection |
| Phase 2 — Customer CRUD | ✅ Done | CRUD + diskon bertingkat + app shell |
| Phase 3 — Product CRUD | 🔄 Active | |
| Phase 4 — Transaksi (Bon) + Kalkulasi | ⬜ Queue | |
| Phase 5 — Settlement (Lunas/Piutang) | ⬜ Queue | |
| Phase 6 — Bonus Logic | ⬜ Queue | |
| Phase 7 — Customer Detail Page | ⬜ Queue | |
| Phase 8 — Recap + PDF Export | ⬜ Queue | |
| Phase 9 — Polish UI + Bug Fix | ⬜ Queue | |
| Phase 10 — Final Deploy + README | ⬜ Queue | |

## PHASE AKTIF SEKARANG
Phase: 3 — Product CRUD
Task aktif: CRUD produk LM/BR + harga modal/base

## CUSTOMERS (Phase 2 ✅)

### App Shell
- `components/shared/Sidebar.tsx` — nav + logout POST `/api/auth/logout`
- `components/shared/TopBar.tsx` — search, actions, avatar
- `app/(dashboard)/layout.tsx` — sidebar + topbar + protected layout

### Customer CRUD
- `app/(dashboard)/customers/page.tsx` — list + stats
- `components/customers/CustomerTable.tsx` — filter, search, actions
- `components/customers/CustomerForm.tsx` — create/edit + discount editor
- `app/(dashboard)/customers/actions.ts` — create, update, soft delete
- `app/(dashboard)/customers/[id]/page.tsx` — detail ringkas
- `lib/customers/queries.ts` — Supabase queries + piutang aggregation

### Verified
- `npm run build` → 0 errors
- Soft delete via `deleted_at`
- Diskon preview: 100.000 × [20,20,10] → Rp 57.600
- formatIDR / stepsLabel / applyCascade dari lib/calculations.ts

## SUPABASE
- URL: `https://vgwgfnsmcmlrbbumdoey.supabase.co`
- Demo user: `admin@hl-finance.com`

## NEXT TASK (Phase 3)
1. Product list page
2. Create / edit product (nama, tipe LM|BR, harga_modal, harga_base)
3. Soft-delete products

## LAST COMMIT
- feat(customers): customer CRUD, cascading discount editor, app shell
