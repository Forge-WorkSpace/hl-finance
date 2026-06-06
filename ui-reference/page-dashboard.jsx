/* HL Finance — Page 2: Dashboard */
(function () {
  const { useState, useEffect } = React;
  const { formatIDR, SUMMARY, TX } = window.HLData;

  function PageHeader({ title, subtitle, right }) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{title}</h1>
          {subtitle && <p style={{ margin: '5px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>{subtitle}</p>}
        </div>
        {right}
      </div>
    );
  }

  function DashboardPage({ navigate, openTx }) {
    const [loading, setLoading] = useState(true);
    useEffect(() => { const t = setTimeout(() => setLoading(false), 750); return () => clearTimeout(t); }, []);

    const today = new Date('2026-06-06').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const recent = TX.slice(0, 5);

    const cards = [
      { label: 'Total Piutang', value: SUMMARY.totalPiutang, tone: 'piutang', icon: 'receipt-text', trend: '4 bon belum lunas', trendTone: 'piutang' },
      { label: 'Lunas Bulan Ini', value: SUMMARY.lunasBulan, tone: 'lunas', icon: 'circle-check', trend: '+12,4% vs Mei', trendTone: 'lunas' },
      { label: 'Omzet Bulan Ini', value: SUMMARY.omzetBulan, tone: 'normal', icon: 'trending-up', trend: '+8,1% vs Mei', trendTone: 'lunas' },
      { label: 'Laba Bulan Ini', value: SUMMARY.labaBulan, tone: 'normal', icon: 'wallet', trend: 'Margin 23,9%', trendTone: 'lunas' },
    ];

    return (
      <div style={{ animation: 'fadeUp 280ms ease' }}>
        <PageHeader title="Dashboard" subtitle="Ringkasan performa keuangan bisnis Anda"
          right={<div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-secondary)', paddingTop: 4 }}>
            <Icon name="calendar" size={15} /><span style={{ textTransform: 'capitalize' }}>{today}</span>
          </div>} />

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="summary-grid">
          {cards.map((c) => <SummaryCard key={c.label} {...c} loading={loading} />)}
        </div>

        {/* Recent transactions */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Transaksi Terbaru</h2>
            <button className="btn" onClick={() => navigate('transactions')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none',
              color: 'var(--primary)', fontSize: 13.5, fontWeight: 500, padding: 4,
            }}>Lihat Semua <Icon name="arrow-right" size={14} strokeWidth={2} /></button>
          </div>

          <Card pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-dim)' }}>
                    <Th>Tanggal</Th><Th>Nomor Bon</Th><Th>Pelanggan</Th>
                    <Th align="right">Total</Th><Th>Status</Th><Th align="right"> </Th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => <SkelRow key={i} />)
                    : recent.map((t) => (
                      <tr key={t.id} className="tx-row" style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }}
                        onClick={() => openTx(t)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(243,243,243,0.6)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <Td><span className="mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmtDate(t.tgl)}</span></Td>
                        <Td><span className="mono" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>#{t.id}</span></Td>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={t.custNama} size={28} />
                            <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t.custNama}</span>
                            {t.isBonus && <BonusBadge />}
                          </div>
                        </Td>
                        <Td align="right"><Currency amount={t.total} tone={t.status === 'piutang' ? 'piutang' : 'normal'} /></Td>
                        <Td><StatusBadge status={t.status} /></Td>
                        <Td align="right"><Icon name="chevron-right" size={16} style={{ color: 'var(--text-tertiary)' }} /></Td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  function Th({ children, align }) {
    return <th style={{
      textAlign: align || 'left', padding: '11px 18px', fontSize: 11, fontWeight: 600,
      letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap',
    }}>{children}</th>;
  }
  function Td({ children, align }) {
    return <td style={{ padding: '13px 18px', textAlign: align || 'left', verticalAlign: 'middle' }}>{children}</td>;
  }
  function SkelRow() {
    return (
      <tr style={{ borderTop: '1px solid var(--border)' }}>
        {[80, 110, 180, 90, 70, 20].map((w, i) => (
          <td key={i} style={{ padding: '15px 18px' }}><div className="skel" style={{ width: w, height: 14, marginLeft: i >= 3 && i !== 5 ? 'auto' : 0 }} /></td>
        ))}
      </tr>
    );
  }
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  Object.assign(window, { DashboardPage, PageHeader, Th, Td, fmtDate });
})();
