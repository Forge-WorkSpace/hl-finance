# CHECKPOINT — HL Internal Finance App
Last updated: 2026-06-07 (end of session)

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
| Phase 7 — Dashboard + Laporan + PDF | ✅ Done | Dashboard real data, recap 3 tabs, react-pdf export |
| Phase 8 — Deploy + Polish | ✅ Done | Redirect, sonner, README, main pushed |
| Vercel Production | 🔄 In progress | New Project configured — env vars + Deploy pending |
| Phase 9 — Optional polish | ⬜ Queue | TopBar search |

## PHASE AKTIF SEKARANG
**Vercel deploy** — isi env vars → Deploy → catat live URL → post-deploy QA

## LIVE URL
- Vercel: _(pending — user on New Project screen, belum klik Deploy)_
- Repo: https://github.com/Forge-WorkSpace/hl-finance

## SCREENS DONE

| Screen | Route | Status |
|--------|-------|--------|
| Login | `/login` | ✅ Done |
| Dashboard | `/dashboard` | ✅ Done |
| Customer list / new / edit / detail | `/customers/*` | ✅ Done |
| Product list / new / edit | `/products/*` | ✅ Done |
| Transaksi list / bon / detail | `/transactions/*` | ✅ Done |
| Laporan | `/reports` | ✅ Done |

## SUPABASE
- URL: `https://vgwgfnsmcmlrbbumdoey.supabase.co`
- Demo user: `admin@hl-finance.com` / `HLFinance2026!`
- Schema + RLS: `schema.sql` | Fix GRANT: `supabase/fix-grants.sql` ✅

## GIT / REMOTE
- Repo: `https://github.com/Forge-WorkSpace/hl-finance`
- Branch dev: `feature/mobile-integration` (pushed)
- Branch prod: `main` @ `56b8e95` (pushed, merged from feature)

## TODO NEXT
1. Vercel: set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **Deploy**
2. Copy live URL → update README.md + CHECKPOINT.md
3. Post-deploy QA: login, tambah pelanggan, buat bon, tandai lunas, download PDF, mobile check
4. (Optional) Wire TopBar global search

## KNOWN ISSUES
- Live URL belum ada — Vercel deploy belum selesai
- TopBar search global masih placeholder UI only
- Supabase Auth: pastikan redirect URL Vercel ditambahkan di Supabase dashboard setelah deploy

## COMMIT HISTORY (terakhir)

```
40d61be docs: mark Phase 8 complete in CLAUDE.md
0285d33 chore: polish UX, redirect after action, README, deploy prep
3ff988b feat(reports): dashboard real data, recap laporan, PDF export
3f74852 feat(bonus): bonus claim flow, bonus grants, bonus validation
afeea76 feat(settlement): lunas modal, settle single bon, settle monthly, customer detail
```

## LAST COMMIT
- `40d61be` — `docs: mark Phase 8 complete in CLAUDE.md`
