/* HL Finance — Page: Produk */
(function () {
  const { useState, useEffect, useMemo } = React;
  const { formatIDR, PRODUCTS } = window.HLData;
  const { PageHeader, Th, Td } = window;

  function ProductsPage({ navigate, pushToast }) {
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState('all'); // all | LM | BR
    useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

    const filtered = useMemo(() => {
      let list = PRODUCTS;
      if (filter !== 'all') list = list.filter((p) => p.tipe === filter);
      if (q.trim()) {
        const s = q.toLowerCase();
        list = list.filter((p) => p.nama.toLowerCase().includes(s) || p.id.toLowerCase().includes(s));
      }
      return list;
    }, [q, filter]);

    const lmCount = PRODUCTS.filter((p) => p.tipe === 'LM').length;
    const brCount = PRODUCTS.filter((p) => p.tipe === 'BR').length;
    const avgMargin = Math.round(PRODUCTS.reduce((s, p) => s + (p.base - p.modal) / p.base, 0) / PRODUCTS.length * 100);

    const stats = [
      { label: 'Total Produk', plain: PRODUCTS.length, icon: 'package' },
      { label: 'Produk LM / BR', plain: `${lmCount} / ${brCount}`, icon: 'tag' },
      { label: 'Rata-rata Margin', plain: `${avgMargin}%`, icon: 'trending-up', tone: 'lunas' },
    ];

    const filters = [
      { key: 'all', label: 'Semua', count: PRODUCTS.length },
      { key: 'LM', label: 'LM', count: lmCount },
      { key: 'BR', label: 'BR', count: brCount },
    ];

    return (
      <div style={{ animation: 'fadeUp 280ms ease' }}>
        <PageHeader title="Produk" subtitle="Daftar produk beserta harga base, modal, dan margin"
          right={<Button icon="plus" onClick={() => pushToast && pushToast('Form tambah produk (demo)')}>Tambah Produk</Button>} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }} className="cust-stat-grid">
          {stats.map((s) => (
            <Card key={s.label} pad={18}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ width: 42, height: 42, borderRadius: 9, background: 'var(--surface-dim)', display: 'grid', placeItems: 'center', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                  <Icon name={s.icon} size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginTop: 3, color: s.tone === 'lunas' ? 'var(--lunas)' : 'var(--text-primary)' }}>{s.plain}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
            {filters.map((f) => (
              <button key={f.key} className="btn" onClick={() => setFilter(f.key)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, height: 32, padding: '0 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, border: 'none',
                background: filter === f.key ? 'var(--primary-subtle)' : 'transparent',
                color: filter === f.key ? 'var(--primary)' : 'var(--text-secondary)',
              }}>
                {f.label}
                <span className="mono" style={{ fontSize: 11, padding: '1px 6px', borderRadius: 999, background: filter === f.key ? 'rgba(37,99,235,0.14)' : 'var(--surface-dim)', color: filter === f.key ? 'var(--primary)' : 'var(--text-tertiary)' }}>{f.count}</span>
              </button>
            ))}
          </div>
          <div style={{ width: 280, maxWidth: '100%' }}>
            <Input icon="search" placeholder="Cari nama atau kode produk..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ background: 'var(--surface-dim)' }}>
                  <Th>Produk</Th>
                  <Th>Tipe</Th>
                  <Th align="right">Harga Base</Th>
                  <Th align="right">Harga Modal</Th>
                  <Th align="right">Margin</Th>
                  <Th align="right"> </Th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <ProdSkelRow key={i} />)
                  : filtered.length === 0
                    ? <tr><td colSpan={6}><EmptyProd q={q} /></td></tr>
                    : filtered.map((p) => {
                      const margin = p.base - p.modal;
                      const marginPct = Math.round(margin / p.base * 100);
                      return (
                        <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }} className="prod-row"
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(243,243,243,0.6)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <Td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 8, background: p.tipe === 'LM' ? '#EFF6FF' : '#F5F3FF', color: p.tipe === 'LM' ? '#2563EB' : '#7C3AED', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                <Icon name="package" size={18} />
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.nama}</div>
                                <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 2 }}>{p.id}</div>
                              </div>
                            </div>
                          </Td>
                          <Td><TypeBadge tipe={p.tipe} /></Td>
                          <Td align="right"><Currency amount={p.base} /></Td>
                          <Td align="right"><Currency amount={p.modal} tone="muted" /></Td>
                          <Td align="right">
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                              <Currency amount={margin} tone="lunas" />
                              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--lunas)', background: 'var(--lunas-bg)', border: '1px solid var(--lunas-border)', padding: '1px 7px', borderRadius: 999 }}>{marginPct}%</span>
                            </div>
                          </Td>
                          <Td align="right">
                            <div className="row-actions" style={{ display: 'inline-flex', gap: 4 }}>
                              <RowAct icon="pencil" onClick={() => pushToast && pushToast(`Edit ${p.nama} (demo)`)} />
                            </div>
                          </Td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </Card>
        {!loading && filtered.length > 0 && (
          <p style={{ margin: '12px 2px 0', fontSize: 12.5, color: 'var(--text-tertiary)' }}>
            Menampilkan {filtered.length} dari {PRODUCTS.length} produk
          </p>
        )}
      </div>
    );
  }

  function RowAct({ icon, onClick }) {
    return (
      <button className="btn focusable" onClick={onClick} style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
        <Icon name={icon} size={15} />
      </button>
    );
  }
  function ProdSkelRow() {
    return (
      <tr style={{ borderTop: '1px solid var(--border)' }}>
        <td style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="skel" style={{ width: 36, height: 36, borderRadius: 8 }} />
            <div><div className="skel" style={{ width: 150, height: 13 }} /><div className="skel" style={{ width: 50, height: 10, marginTop: 7 }} /></div>
          </div>
        </td>
        {[40, 90, 90, 110, 30].map((w, i) => <td key={i} style={{ padding: '14px 18px' }}><div className="skel" style={{ width: w, height: 14 }} /></td>)}
      </tr>
    );
  }
  function EmptyProd({ q }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '64px 24px' }}>
        <div style={{ width: 52, height: 52, borderRadius: 13, background: 'var(--surface-dim)', display: 'grid', placeItems: 'center', color: 'var(--text-tertiary)', marginBottom: 14 }}><Icon name="package" size={24} strokeWidth={1.5} /></div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Tidak ada produk</h3>
        <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--text-secondary)' }}>{q ? `Tidak ada produk yang cocok dengan "${q}".` : 'Belum ada produk pada filter ini.'}</p>
      </div>
    );
  }

  Object.assign(window, { ProductsPage });
})();
