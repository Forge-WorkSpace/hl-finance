/* HL Finance — Page: Laporan (Reports) */
(function () {
  const { useState, useMemo } = React;
  const { formatIDR, bonItems, TX } = window.HLData;
  const { PageHeader } = window;

  function compact(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace('.', ',') + ' M';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',') + ' jt';
    if (n >= 1e3) return Math.round(n / 1e3) + ' rb';
    return '' + Math.round(n);
  }
  function monthOf(iso) { return iso.slice(0, 7); }

  function ReportsPage({ navigate, pushToast }) {
    const [period, setPeriod] = useState('all'); // all | 2026-06 | 2026-05

    const txs = useMemo(() => period === 'all' ? TX : TX.filter((t) => monthOf(t.tgl) === period), [period]);

    const agg = useMemo(() => {
      let omzet = 0, modal = 0, omzetLM = 0, omzetBR = 0, piutang = 0, lunas = 0;
      const byCust = {}, byDate = {};
      txs.forEach((t) => {
        const bon = bonItems(t);
        const modalCost = bon.lines.reduce((s, l) => s + l.product.modal * l.qty, 0);
        omzet += bon.omzet; modal += modalCost;
        omzetLM += bon.omzetLM; omzetBR += bon.omzetBR;
        if (t.status === 'piutang') piutang += t.total; else lunas += t.total;
        byCust[t.custNama] = (byCust[t.custNama] || 0) + bon.omzet;
        byDate[t.tgl] = (byDate[t.tgl] || 0) + bon.omzet;
      });
      const laba = omzet - modal;
      const topCust = Object.entries(byCust).map(([nama, v]) => ({ nama, v })).sort((a, b) => b.v - a.v).slice(0, 5);
      const daily = Object.entries(byDate).map(([tgl, v]) => ({ tgl, v })).sort((a, b) => a.tgl.localeCompare(b.tgl));
      return { omzet, laba, modal, omzetLM, omzetBR, piutang, lunas, topCust, daily, margin: omzet ? laba / omzet : 0, count: txs.length };
    }, [txs]);

    const periods = [
      { key: 'all', label: 'Semua Periode' },
      { key: '2026-06', label: 'Juni 2026' },
      { key: '2026-05', label: 'Mei 2026' },
    ];

    const kpis = [
      { label: 'Total Omzet', value: agg.omzet, tone: 'normal', icon: 'trending-up', sub: `${agg.count} transaksi` },
      { label: 'Total Laba', value: agg.laba, tone: 'lunas', icon: 'wallet', sub: `Margin ${(agg.margin * 100).toFixed(1).replace('.', ',')}%` },
      { label: 'Piutang', value: agg.piutang, tone: 'piutang', icon: 'receipt-text', sub: 'Belum tertagih' },
      { label: 'Lunas', value: agg.lunas, tone: 'lunas', icon: 'circle-check', sub: 'Sudah dibayar' },
    ];

    return (
      <div style={{ animation: 'fadeUp 280ms ease' }}>
        <PageHeader title="Laporan" subtitle="Analisis omzet, laba, dan komposisi penjualan"
          right={<Button variant="secondary" icon="download" onClick={() => pushToast && pushToast('Ekspor laporan (demo)')}>Ekspor</Button>} />

        {/* Period selector */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, marginBottom: 24, width: 'fit-content' }}>
          {periods.map((p) => (
            <button key={p.key} className="btn" onClick={() => setPeriod(p.key)} style={{
              height: 34, padding: '0 16px', borderRadius: 6, fontSize: 13, fontWeight: 500, border: 'none',
              background: period === p.key ? 'var(--primary-subtle)' : 'transparent',
              color: period === p.key ? 'var(--primary)' : 'var(--text-secondary)',
            }}>{p.label}</button>
          ))}
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }} className="summary-grid">
          {kpis.map((k) => (
            <Card key={k.label} pad={22} hover>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{k.label}</div>
                  <div style={{ margin: '12px 0 0' }}><Currency amount={k.value} tone={k.tone} size="2xl" /></div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>{k.sub}</div>
                </div>
                <div style={{ padding: 9, background: 'var(--surface-dim)', borderRadius: 8, color: 'var(--text-tertiary)', display: 'flex' }}>
                  <Icon name={k.icon} size={20} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'stretch', marginBottom: 24 }} className="report-charts">
          <Card pad={22} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Omzet Harian</h2>
              <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>{agg.daily.length} hari transaksi</span>
            </div>
            <p style={{ margin: '0 0 18px', fontSize: 12.5, color: 'var(--text-secondary)' }}>Total omzet per tanggal bon (sebelum ongkir).</p>
            <DailyBars data={agg.daily} />
          </Card>

          <Card pad={22} style={{ width: 320, flexShrink: 0 }} className="report-donut-card">
            <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>Komposisi Omzet</h2>
            <p style={{ margin: '0 0 18px', fontSize: 12.5, color: 'var(--text-secondary)' }}>Produk LM vs BR.</p>
            <Donut lm={agg.omzetLM} br={agg.omzetBR} />
          </Card>
        </div>

        {/* Top customers */}
        <Card pad={22}>
          <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>Top Pelanggan</h2>
          <p style={{ margin: '0 0 20px', fontSize: 12.5, color: 'var(--text-secondary)' }}>Lima pelanggan dengan kontribusi omzet terbesar pada periode ini.</p>
          <TopCustomers data={agg.topCust} />
        </Card>
      </div>
    );
  }

  // ---------- Daily omzet bars ----------
  function DailyBars({ data }) {
    if (!data.length) return <Empty />;
    const max = Math.max(...data.map((d) => d.v));
    const H = 180;
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: data.length > 12 ? 4 : 10, height: H + 40, paddingTop: 8 }}>
        {data.map((d, i) => {
          const h = Math.max(4, Math.round(d.v / max * H));
          const day = new Date(d.tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
          return (
            <div key={i} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }} className="bar-col" title={`${day}: ${formatIDR(d.v)}`}>
              <span className="mono bar-val" style={{ fontSize: 10, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', opacity: 0, transition: 'opacity 150ms' }}>{compact(d.v)}</span>
              <div style={{ width: '100%', maxWidth: 30, height: h, borderRadius: '5px 5px 2px 2px', background: 'linear-gradient(180deg,#3B82F6,#2563EB)', transition: 'height 400ms cubic-bezier(0.2,0.7,0.2,1)' }} />
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', transform: data.length > 10 ? 'rotate(-45deg)' : 'none', transformOrigin: 'center', marginTop: data.length > 10 ? 6 : 0 }}>{new Date(d.tgl).getDate()}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // ---------- Donut LM vs BR ----------
  function Donut({ lm, br }) {
    const total = lm + br || 1;
    const lmPct = lm / total, brPct = br / total;
    const C = 2 * Math.PI * 52;
    const lmLen = lmPct * C;
    return (
      <div>
        <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 20px' }}>
          <svg width="160" height="160" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="52" fill="none" stroke="var(--surface-dim)" strokeWidth="18" />
            <circle cx="70" cy="70" r="52" fill="none" stroke="#7C3AED" strokeWidth="18" strokeDasharray={`${brPct * C} ${C}`} strokeDashoffset={-lmLen} strokeLinecap="butt" />
            <circle cx="70" cy="70" r="52" fill="none" stroke="#2563EB" strokeWidth="18" strokeDasharray={`${lmLen} ${C}`} strokeLinecap="butt" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em' }}>TOTAL</span>
            <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{compact(total)}</span>
          </div>
        </div>
        <LegendRow color="#2563EB" label="Produk LM" value={lm} pct={lmPct} />
        <div style={{ height: 10 }} />
        <LegendRow color="#7C3AED" label="Produk BR" value={br} pct={brPct} />
      </div>
    );
  }
  function LegendRow({ color, label, value, pct }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
        <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{(pct * 100).toFixed(0)}%</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-tertiary)', width: 56, textAlign: 'right' }}>{compact(value)}</span>
      </div>
    );
  }

  // ---------- Top customers ranking ----------
  function TopCustomers({ data }) {
    if (!data.length) return <Empty />;
    const max = Math.max(...data.map((d) => d.v));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', width: 18, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
            <Avatar name={d.nama} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nama}</span>
                <Currency amount={d.v} bold />
              </div>
              <div style={{ height: 7, borderRadius: 999, background: 'var(--surface-dim)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: Math.max(3, d.v / max * 100) + '%', borderRadius: 999, background: i === 0 ? 'linear-gradient(90deg,#3B82F6,#2563EB)' : 'var(--border-strong)', transition: 'width 500ms cubic-bezier(0.2,0.7,0.2,1)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function Empty() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px', color: 'var(--text-tertiary)' }}>
        <Icon name="bar-chart-3" size={28} strokeWidth={1.5} />
        <p style={{ margin: '10px 0 0', fontSize: 13.5 }}>Tidak ada data pada periode ini.</p>
      </div>
    );
  }

  Object.assign(window, { ReportsPage });
})();
