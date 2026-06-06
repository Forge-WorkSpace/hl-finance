# DECISIONS — HL Internal Finance App

---

## KEPUTUSAN DARI ACCEPTANCE CRITERIA (D1–D9)

### D1 — Ongkir & Profit
**Konteks:** Ongkir ditagihkan ke pelanggan tapi bukan pendapatan HL
**Yang dipilih:** Pass-through — ongkir tidak masuk Laba HL
**Konsekuensi:** Laba = omzet − modal. Ongkir hanya masuk "amount owed", tidak masuk kalkulasi laba sama sekali.

### D2 — Receivable vs Omzet
**Konteks:** Perlu jelas apa yang "dihutang" pelanggan
**Yang dipilih:** Amount owed = omzet + ongkir. Omzet sendiri tidak termasuk ongkir.
**Konsekuensi:** Dua angka berbeda — omzet (untuk laporan) dan total tagihan (untuk piutang).

### D3 — Basis Pengakuan Omzet
**Konteks:** Kapan omzet, laba, dan bonus dihitung?
**Yang dipilih:** Cash basis — HANYA transaksi Lunas yang diakui
**Konsekuensi:** Transaksi Piutang tidak boleh masuk laporan omzet/laba/bonus accumulator.

### D4 — Mekanisme Bonus
**Konteks:** Bagaimana bonus dihitung dan diberikan?
**Yang dipilih:** Bonus stack — bisa dapat lebih dari 1 bonus, bisa digabung dalam 1 bon. Sisa omzet carry over.
**Konsekuensi:** Perlu tabel `bonus_grants` untuk track berapa bonus sudah dikonsumsi per customer.

### D5 — Biaya Produk Bonus
**Konteks:** Apakah produk bonus mengurangi laba?
**Yang dipilih:** Tidak — bonus product cost diabaikan, tidak mengurangi Laba HL
**Konsekuensi:** Line items di bonus bon = 0 omzet, 0 laba. Jangan hitung modal produk bonus.

### D6 — Delete dengan History
**Konteks:** Customer/product yang sudah punya transaksi tidak boleh dihapus permanen
**Yang dipilih:** Soft-delete — kolom `deleted_at`, hidden dari pilihan baru, history tetap ada
**Konsekuensi:** Semua query untuk dropdown/pilihan harus filter `deleted_at IS NULL`. Query laporan tetap include semua record.

### D7 — Nomor Bon
**Konteks:** Nomor bon harus bisa diidentifikasi unik
**Yang dipilih:** Unique constraint di DB + validasi di aplikasi
**Konsekuensi:** Duplicate nomor bon ditolak dengan error message yang jelas.

### D8 — Format Export
**Konteks:** User butuh download laporan
**Yang dipilih:** PDF menggunakan react-pdf
**Konsekuensi:** Jangan implementasi format lain (Excel, CSV) kecuali diminta.

### D9 — Currency & Tax
**Konteks:** Bisnis HL beroperasi dalam IDR, tidak ada PPN
**Yang dipilih:** IDR only, no tax/PPN calculation
**Konsekuensi:** Tidak ada field pajak di manapun. Format tampilan: `Rp 1.400.000` (titik sebagai separator ribuan).

---

## KEPUTUSAN TEKNIS PROJECT

### 2026-06-06 — Tech Stack
**Konteks:** Bounty competitive, butuh deploy cepat dan UI bagus
**Pilihan:** berbagai kombinasi stack
**Yang dipilih:** Next.js 14 (App Router) + Tailwind CSS + Supabase + Vercel
**Alasan:** Recommended di bounty posting, ekosistem solid, deploy ke Vercel paling cepat
**Konsekuensi:** Gunakan App Router — Server Components + Server Actions. Jangan pakai Pages Router.

### 2026-06-06 — Auth Strategy
**Konteks:** Single user, no registration (AC-1.2), ada demo credentials untuk submission
**Pilihan:** Supabase Auth vs custom JWT vs hardcode session
**Yang dipilih:** Supabase Auth — seed 1 user via Supabase dashboard
**Alasan:** Secure, session management built-in, tidak perlu custom auth
**Konsekuensi:** Gunakan `getUser()` bukan `getSession()` di server-side. Password di-hash Supabase otomatis. README cukup cantumkan email + password demo.

### 2026-06-06 — Kalkulasi Terpusat
**Konteks:** Diskon bertingkat, omzet, laba, bonus — logika kompleks yang harus konsisten
**Pilihan:** Hitung inline di komponen vs dipusatkan di satu file
**Yang dipilih:** Semua kalkulasi di `lib/calculations.ts`
**Alasan:** Single source of truth, mudah di-test, mencegah inkonsistensi antar halaman
**Konsekuensi:** Dilarang hitung diskon/omzet/laba di luar `lib/calculations.ts`.

### 2026-06-06 — Snapshot Harga di Transaction Lines
**Konteks:** Harga dan diskon bisa berubah di masa depan — history transaksi harus tetap akurat
**Pilihan:** Query harga real-time vs simpan snapshot saat transaksi dibuat
**Yang dipilih:** Snapshot — simpan `snapshot_harga_base`, `snapshot_harga_modal`, `snapshot_discounts` di tabel `transaction_lines`
**Alasan:** Perubahan harga/diskon di masa depan tidak boleh mengubah nilai transaksi lama
**Konsekuensi:** Saat edit transaksi, snapshot di-update ulang. Laporan harus pakai snapshot, bukan harga produk saat ini.

### 2026-06-06 — Bonus Accumulator: Computed bukan Stored
**Konteks:** Bonus accumulator = Σ omzet Lunas per customer
**Pilihan:** Computed setiap query vs stored di kolom tersendiri
**Yang dipilih:** Computed dari query — `bonuses_granted` saja yang di-store di tabel `bonus_grants`
**Alasan:** Lebih akurat, tidak ada risiko data out of sync. Data transaksi sudah ada, tinggal di-sum.
**Konsekuensi:** Query bonus accumulator = SUM(line_omzet) dari transactions Lunas per customer. Performa acceptable untuk single-user app.

### 2026-06-06 — UX Standards (Permintaan Client)
**Konteks:** Client minta app harus user-friendly, bukan sekadar fungsional
**Yang dipilih:** Wajib implement semua standar UX berikut di setiap halaman
**Konsekuensi:**
- Setiap aksi punya feedback: loading state, success toast, error message
- Form validation inline — error muncul di bawah field, bukan alert
- Konfirmasi modal sebelum aksi destruktif (delete, lunas massal)
- Empty state dengan CTA button yang jelas
- Semua angka format IDR: `Rp 1.400.000` (DM Mono font)
- Status selalu visible via color-coded badge (Amber=Piutang, Green=Lunas)
- Aksi umum bisa dilakukan dalam 1 klik
- Responsive — jalan di mobile dan desktop

### 2026-06-06 — PDF Export Library
**Konteks:** AC-6.4 dan AC-7.8 butuh download PDF
**Pilihan:** react-pdf vs puppeteer vs jsPDF
**Yang dipilih:** react-pdf
**Alasan:** Ringan, client-side, tidak butuh server extra, cocok untuk Next.js
**Konsekuensi:** Jangan install puppeteer atau jsPDF.
