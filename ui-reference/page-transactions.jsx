/* HL Finance — Page: Transaksi (list) */
(function () {
  const { useState, useEffect, useMemo } = React;
  const { TX } = window.HLData;
  const { PageHeader, Th, Td, fmtDate } = window;

  function TransactionsPage({ navigate, openTx }) {
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState('all'); // all | piutang | lunas | bonus
    useEffect(() => { const t = setTimeout(() => setLoading(false), 650); return () => clearTimeout(t); }, []);

    const filtered = useMemo(() => {
      let list = TX;
      if (filter === 'piutang') list = list.filter((t) => t.status === 'piutang');
      else if (filter === 'lunas') list = list.filter((t) => t.status === 'lunas');
      else if (filter === 'bonus') list = list.filter((t) => t.isBonus);
      if (q.trim()) {
        const s = q.toLowerCase();
        list = list.filter((t) => t.id.toLowerCase().includes(s) || t.custNama.toLowerCase().includes(s));
      }
      return list;
    }, [q, filter]);

    const totalPiutang = TX.filter((t) => t.status === 'piutang').reduce((s, t) => s + t.total, 0);
    const totalLunas = TX.filter((t) => t.status === 'lunas').reduce((s, t) => s + t.total, 0);

    const stats = [
      { label: 'Total Transaksi', plain: TX.length, icon: 'file-text' },
      { label: 'Nilai Piutang', money: totalPiutang, tone: 'piutang', icon: 'receipt-text' },
      { label: 'Nilai Lunas', money: totalLunas, tone: 'lunas', icon: 'circle-check' },
    ];

    const filters = [
      { key: 'all', label: 'Semua', count: TX.length },
      { key: 'piutang', label: 'Piutang', count: TX.filter((t) => t.status === 'piutang').length },
      { key: 'lunas', label: 'Lunas', count: TX.filter((t) => t.status === 'lunas').length },
      { key: 'bonus', label: 'Bonus', count: TX.filter((t) => t.isBonus).length },
    ];

    return (
      <div style={{ animation: 'fadeUp 280ms ease' }}>
        <PageHeader title="Transaksi" subtitle="Semua bon penjualan beserta status pembayaran"
          right={<Button icon="plus" onClick={() => navigate('bon-new')}>Transaksi Baru</Button>} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }} className="cust-stat-grid">
          {stats.map((s) => (
            <Card key={s.label} pad={18}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ width: 42, height: 42, borderRadius: 9, background: 'var(--surface-dim)', display: 'grid', placeItems: 'center', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                  <Icon name={s.icon} size={20} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{s.label}</div>
                  <div style={{ marginTop: 3 }}>
                    {s.money != null
                      ? <Currency amount={s.money} tone={s.tone} size="lg" bold />
                      : <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{s.plain}</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
            {filters.map((f) => (
              <button key={f.key} className="btn" onClick={() => setFilter(f.key)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, height: 32, padding: '0 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, border: 'none',
                background: filter === f.key ? 'var(--primary-subtle)' : 'transparent',
                color: filter === f.key ? 'var(--primary)' : 'var(--text-secondary)',
              }}>
                {f.label}
                <span className="mono" style={{ fontSize: 11, padding: '1px 6px', borderRadius: 999, background: filter === f.key ? 'rgba(37,99,235,0.14)' : 'var(--surface-dim)', color: filter === f.key ? 'var(--primary)' : 'var(--text-tertiary)' }}>{f.count}</span>
              </button>
            ))}
          </div>
          <div style={{ width: 280, maxWidth: '100%' }}>
            <Input icon="search" placeholder="Cari nomor bon atau pelanggan..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead>
                <tr style={{ background: 'var(--surface-dim)' }}>
                  <Th>Tanggal</Th>
                  <Th>Nomor Bon</Th>
                  <Th>Pelanggan</Th>
                  <Th align="right">Total</Th>
                  <Th>Status</Th>
                  <Th align="right"> </Th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 7 }).map((_, i) => <TxSkelRow key={i} />)
                  : filtered.length === 0
                    ? <tr><td colSpan={6}><EmptyTx q={q} /></td></tr>
                    : filtered.map((t) => (
                      <tr key={t.id} style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }}
                        onClick={() => openTx(t)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(243,243,243,0.6)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <Td><span className="mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmtDate(t.tgl)}</span></Td>
                        <Td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <span className="mono" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>#{t.id}</span>
                            {t.isBonus && <BonusBadge />}
                          </span>
                        </Td>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={t.custNama} size={28} />
                            <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t.custNama}</span>
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
        {!loading && filtered.length > 0 && (
          <p style={{ margin: '12px 2px 0', fontSize: 12.5, color: 'var(--text-tertiary)' }}>
            Menampilkan {filtered.length} dari {TX.length} transaksi
          </p>
        )}
      </div>
    );
  }

  function TxSkelRow() {
    return (
      <tr style={{ borderTop: '1px solid var(--border)' }}>
        <td style={{ padding: '14px 18px' }}><div className="skel" style={{ width: 80, height: 14 }} /></td>
        <td style={{ padding: '14px 18px' }}><div className="skel" style={{ width: 110, height: 14 }} /></td>
        <td style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="skel" style={{ width: 28, height: 28, borderRadius: 8 }} />
            <div className="skel" style={{ width: 140, height: 13 }} />
          </div>
        </td>
        {[90, 70, 20].map((w, i) => <td key={i} style={{ padding: '14px 18px' }}><div className="skel" style={{ width: w, height: 14 }} /></td>)}
      </tr>
    );
  }
  function EmptyTx({ q }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '64px 24px' }}>
        <div style={{ width: 52, height: 52, borderRadius: 13, background: 'var(--surface-dim)', display: 'grid', placeItems: 'center', color: 'var(--text-tertiary)', marginBottom: 14 }}><Icon name="inbox" size={24} strokeWidth={1.5} /></div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Tidak ada transaksi</h3>
        <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--text-secondary)' }}>{q ? `Tidak ada transaksi yang cocok dengan "${q}".` : 'Belum ada transaksi pada filter ini.'}</p>
      </div>
    );
  }

  Object.assign(window, { TransactionsPage });
})();
