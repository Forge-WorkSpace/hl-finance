/* HL Finance — dummy data + helpers */
(function () {
  // ---- Helpers ----
  function formatIDR(amount) {
    const n = Math.round(amount || 0);
    return 'Rp ' + n.toLocaleString('id-ID');
  }
  // cascading discount: price * (1-d1)*(1-d2)*...  steps in percent
  function applyCascade(price, steps) {
    return steps.reduce((acc, s) => acc * (1 - s / 100), price);
  }
  function effectivePct(steps) {
    const factor = steps.reduce((acc, s) => acc * (1 - s / 100), 1);
    return (1 - factor) * 100;
  }
  function stepsLabel(steps) {
    return steps.length ? steps.map((s) => s + '%').join(' → ') : '—';
  }
  // initials + deterministic color from name
  const AVATAR_COLORS = [
    ['#EFF6FF', '#2563EB'], ['#F0FDF4', '#16A34A'], ['#FFF7ED', '#EA580C'],
    ['#F5F3FF', '#7C3AED'], ['#FEF2F2', '#DC2626'], ['#ECFEFF', '#0891B2'],
    ['#FDF4FF', '#C026D3'], ['#FFFBEB', '#D97706'],
  ];
  function initials(name) {
    const parts = name.replace(/^(PT|CV|UD|Toko|Apotek)\s+/i, '').trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase();
  }
  function avatarColor(name) {
    let s = 0; for (let i = 0; i < name.length; i++) s = (s + name.charCodeAt(i)) % 997;
    return AVATAR_COLORS[s % AVATAR_COLORS.length];
  }

  // ---- Products (LM / BR are product TYPES, not locations) ----
  const PRODUCTS = [
    { id: 'P-01', nama: 'Marina Hand Body 200ml', tipe: 'LM', base: 18500, modal: 9800 },
    { id: 'P-02', nama: 'Marina UV White 100ml', tipe: 'LM', base: 24000, modal: 12700 },
    { id: 'P-03', nama: 'Lifebuoy Sabun 250ml', tipe: 'LM', base: 16000, modal: 8400 },
    { id: 'P-04', nama: 'Citra Lulur Mandi 230ml', tipe: 'LM', base: 21000, modal: 11100 },
    { id: 'P-05', nama: 'Biore Facial Foam 100g', tipe: 'LM', base: 27500, modal: 14500 },
    { id: 'P-06', nama: 'Brasso Metal Polish 200ml', tipe: 'BR', base: 38000, modal: 20400 },
    { id: 'P-07', nama: 'Kiwi Semir Sepatu Hitam', tipe: 'BR', base: 14500, modal: 7600 },
    { id: 'P-08', nama: 'Mr. Muscle Pembersih Kaca', tipe: 'BR', base: 32000, modal: 17100 },
    { id: 'P-09', nama: 'Wipol Karbol Cemara 780ml', tipe: 'BR', base: 19500, modal: 10300 },
    { id: 'P-10', nama: 'Bayclin Pemutih 1L', tipe: 'BR', base: 22000, modal: 11700 },
  ];

  // ---- Customers ----
  const CUSTOMERS = [
    { id: 'C-1042', nama: 'PT Maju Bersama', pic: 'Budi Santoso', telp: '0812-3344-5567', kota: 'Surabaya', sejak: '2023-02-14', diskonLM: [20, 20, 10], diskonBR: [15, 10], threshold: 5000000, progresBonus: 4120000, piutang: 3480000, bonuses: 2, status: 'active' },
    { id: 'C-1043', nama: 'Toko Sumber Rezeki', pic: 'Hendra Wijaya', telp: '0813-7788-1290', kota: 'Sidoarjo', sejak: '2023-06-02', diskonLM: [25, 10], diskonBR: [20, 10, 5], threshold: 3000000, progresBonus: 980000, piutang: 0, bonuses: 0, status: 'active' },
    { id: 'C-1044', nama: 'CV Karya Mandiri', pic: 'Sri Mulyani', telp: '0857-2211-9080', kota: 'Gresik', sejak: '2022-11-20', diskonLM: [20, 15], diskonBR: [15], threshold: 4000000, progresBonus: 2640000, piutang: 1275000, bonuses: 0, status: 'active' },
    { id: 'C-1045', nama: 'UD Berkah Jaya', pic: 'Agus Salim', telp: '0821-4455-6677', kota: 'Malang', sejak: '2024-01-08', diskonLM: [30, 10, 5], diskonBR: [25, 10], threshold: 2500000, progresBonus: 1850000, piutang: 0, bonuses: 1, status: 'active' },
    { id: 'C-1046', nama: 'Apotek Sehat Sentosa', pic: 'dr. Ratna Sari', telp: '0811-3322-7788', kota: 'Surabaya', sejak: '2021-09-30', diskonLM: [15, 10], diskonBR: [10], threshold: 6000000, progresBonus: 5240000, piutang: 8920000, bonuses: 0, status: 'active' },
    { id: 'C-1047', nama: 'Toko Harapan Baru', pic: 'Yusuf Maulana', telp: '0852-9900-1122', kota: 'Mojokerto', sejak: '2023-08-17', diskonLM: [20, 20], diskonBR: [20, 5], threshold: 3500000, progresBonus: 620000, piutang: 0, bonuses: 0, status: 'active' },
    { id: 'C-1048', nama: 'PT Sentosa Abadi', pic: 'Linda Kusuma', telp: '0815-6677-3344', kota: 'Surabaya', sejak: '2020-04-11', diskonLM: [25, 15, 5], diskonBR: [20, 10], threshold: 7000000, progresBonus: 6480000, piutang: 2150000, bonuses: 3, status: 'active' },
    { id: 'C-1049', nama: 'Warung Bu Tini', pic: 'Tini Hartati', telp: '0856-1020-3040', kota: 'Sidoarjo', sejak: '2024-05-22', diskonLM: [10], diskonBR: [10], threshold: 1500000, progresBonus: 410000, piutang: 540000, bonuses: 0, status: 'inactive' },
  ];

  // ---- Transactions ----
  const TX = [
    { id: 'TRX-2026-1089', tgl: '2026-06-05', cust: 'C-1042', custNama: 'PT Maju Bersama', total: 3480000, status: 'piutang', isBonus: false },
    { id: 'TRX-2026-1088', tgl: '2026-06-05', cust: 'C-1046', custNama: 'Apotek Sehat Sentosa', total: 5240000, status: 'piutang', isBonus: false },
    { id: 'TRX-2026-1087', tgl: '2026-06-04', cust: 'C-1043', custNama: 'Toko Sumber Rezeki', total: 1890000, status: 'lunas', isBonus: false, lunasTgl: '2026-06-05' },
    { id: 'TRX-2026-1086', tgl: '2026-06-04', cust: 'C-1048', custNama: 'PT Sentosa Abadi', total: 2150000, status: 'piutang', isBonus: true },
    { id: 'TRX-2026-1085', tgl: '2026-06-03', cust: 'C-1044', custNama: 'CV Karya Mandiri', total: 1275000, status: 'piutang', isBonus: false },
    { id: 'TRX-2026-1084', tgl: '2026-06-03', cust: 'C-1045', custNama: 'UD Berkah Jaya', total: 4120000, status: 'lunas', isBonus: false, lunasTgl: '2026-06-04' },
    { id: 'TRX-2026-1083', tgl: '2026-06-02', cust: 'C-1047', custNama: 'Toko Harapan Baru', total: 990000, status: 'lunas', isBonus: false, lunasTgl: '2026-06-02' },
    { id: 'TRX-2026-1082', tgl: '2026-06-02', cust: 'C-1049', custNama: 'Warung Bu Tini', total: 540000, status: 'piutang', isBonus: false },
    { id: 'TRX-2026-1081', tgl: '2026-06-01', cust: 'C-1046', custNama: 'Apotek Sehat Sentosa', total: 3680000, status: 'piutang', isBonus: false },
    { id: 'TRX-2026-1080', tgl: '2026-05-31', cust: 'C-1043', custNama: 'Toko Sumber Rezeki', total: 2240000, status: 'lunas', isBonus: false, lunasTgl: '2026-06-01' },
    { id: 'TRX-2026-1079', tgl: '2026-05-29', cust: 'C-1042', custNama: 'PT Maju Bersama', total: 2870000, status: 'lunas', isBonus: false, lunasTgl: '2026-05-30' },
    { id: 'TRX-2026-1078', tgl: '2026-05-27', cust: 'C-1042', custNama: 'PT Maju Bersama', total: 1640000, status: 'lunas', isBonus: false, lunasTgl: '2026-05-28' },
    { id: 'TRX-2026-1077', tgl: '2026-05-26', cust: 'C-1048', custNama: 'PT Sentosa Abadi', total: 4980000, status: 'lunas', isBonus: false, lunasTgl: '2026-05-27' },
    { id: 'TRX-2026-1076', tgl: '2026-05-24', cust: 'C-1046', custNama: 'Apotek Sehat Sentosa', total: 3120000, status: 'lunas', isBonus: false, lunasTgl: '2026-05-25' },
    { id: 'TRX-2026-1075', tgl: '2026-05-21', cust: 'C-1045', custNama: 'UD Berkah Jaya', total: 2480000, status: 'lunas', isBonus: true, lunasTgl: '2026-05-21' },
    { id: 'TRX-2026-1074', tgl: '2026-05-19', cust: 'C-1044', custNama: 'CV Karya Mandiri', total: 1365000, status: 'lunas', isBonus: false, lunasTgl: '2026-05-20' },
  ];

  // ---- Dashboard summary ----
  const SUMMARY = {
    totalPiutang: 16365000,
    lunasBulan: 8590000,
    omzetBulan: 41280000,
    labaBulan: 9870000,
  };

  function nextBonNo() {
    return '#TRX-2026-' + (1090 + Math.floor(Math.random() * 9));
  }

  // ---- Deterministic line-item generator for a transaction ----
  // Reconstructs realistic line items whose omzet + ongkir == tx.total,
  // using the customer's cascading discounts (real math).
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const _bonCache = {};
  function bonItems(tx) {
    if (_bonCache[tx.id]) return _bonCache[tx.id];
    const cust = CUSTOMERS.find((c) => c.id === tx.cust);
    const rng = mulberry32(hashStr(tx.id));
    const n = 2 + Math.floor(rng() * 3); // 2..4 lines
    // deterministic shuffle of products
    const pool = PRODUCTS.slice().sort(() => rng() - 0.5).slice(0, n);
    const lines = pool.map((p) => {
      const steps = cust ? (p.tipe === 'LM' ? cust.diskonLM : cust.diskonBR) : [];
      const final = applyCascade(p.base, steps);
      return { product: p, tipe: p.tipe, base: p.base, steps, final, qty: 1, omzet: final };
    });
    // fit quantities so omzet ~ 90-96% of total
    const targetFactor = 0.9 + rng() * 0.06;
    const target = tx.total * targetFactor;
    const weights = lines.map(() => 0.5 + rng());
    const sumW = weights.reduce((s, w) => s + w, 0);
    lines.forEach((ln, i) => {
      ln.qty = Math.max(1, Math.round((weights[i] / sumW) * target / ln.final));
      ln.omzet = ln.final * ln.qty;
    });
    // ensure omzet <= total by trimming biggest lines
    let omzet = lines.reduce((s, l) => s + l.omzet, 0);
    let guard = 0;
    while (omzet > tx.total && guard < 200) {
      const big = lines.filter((l) => l.qty > 1).sort((a, b) => b.omzet - a.omzet)[0];
      if (!big) break;
      big.qty -= 1; big.omzet = big.final * big.qty;
      omzet = lines.reduce((s, l) => s + l.omzet, 0);
      guard++;
    }
    const omzetLM = lines.filter((l) => l.tipe === 'LM').reduce((s, l) => s + l.omzet, 0);
    const omzetBR = lines.filter((l) => l.tipe === 'BR').reduce((s, l) => s + l.omzet, 0);
    const ongkir = Math.max(0, Math.round(tx.total - omzet));
    const result = { lines, omzetLM, omzetBR, omzet: omzetLM + omzetBR, ongkir, total: tx.total };
    _bonCache[tx.id] = result;
    return result;
  }

  window.HLData = {
    formatIDR, applyCascade, effectivePct, stepsLabel, initials, avatarColor, nextBonNo, bonItems,
    PRODUCTS, CUSTOMERS, TX, SUMMARY,
  };
})();
