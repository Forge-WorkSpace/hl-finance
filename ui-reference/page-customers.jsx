/* HL Finance — Pages: Daftar Pelanggan + Detail Pelanggan */
(function () {
  const { useState, useEffect, useMemo } = React;
  const { formatIDR, effectivePct, stepsLabel, CUSTOMERS, TX } = window.HLData;
  const { PageHeader, Th, Td, fmtDate } = window;

  // ---------- Customer status pill (active / inactive) ----------
  function CustStatus({ status }) {
    const active = status === 'active';
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px', borderRadius: 999,
        fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
        background: active ? 'var(--lunas-bg)' : 'var(--surface-dim)',
        color: active ? 'var(--lunas)' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--lunas-border)' : 'var(--border)'}`,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: active ? '#22C55E' : '#9CA3AF' }} />
        {active ? 'Aktif' : 'Nonaktif'}
      </span>
    );
  }

  // ---------- Cascading discount chips ----------
  function DiscountChips({ steps, tipe }) {
    if (!steps || !steps.length) return <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>—</span>;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <span className="mono" style={{
              fontSize: 12, fontWeight: 500, padding: '2px 7px', borderRadius: 5,
              background: tipe === 'LM' ? '#EFF6FF' : '#F5F3FF',
              color: tipe === 'LM' ? '#1D4ED8' : '#7C3AED',
              border: `1px solid ${tipe === 'LM' ? '#DBEAFE' : '#EDE9FE'}`,
            }}>{s}%</span>
            {i < steps.length - 1 && <Icon name="chevron-right" size={12} style={{ color: 'var(--text-tertiary)' }} />}
          </React.Fragment>
        ))}
      </span>
    );
  }

  // =========================================================
  //  DAFTAR PELANGGAN
  // =========================================================
  function CustomersPage({ navigate, openCustomer }) {
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState('all');
    useEffect(() => { const t = setTimeout(() => setLoading(false), 650); return () => clearTimeout(t); }, []);

    const filtered = useMemo(() => {
      let list = CUSTOMERS;
      if (filter === 'piutang') list = list.filter((c) => c.piutang > 0);
      else if (filter === 'bonus') list = list.filter((c) => c.bonuses > 0);
      if (q.trim()) {
        const s = q.toLowerCase();
        list = list.filter((c) => c.nama.toLowerCase().includes(s) || c.id.toLowerCase().includes(s) || c.kota.toLowerCase().includes(s));
      }
      return list;
    }, [q, filter]);

    const totalPiutang = CUSTOMERS.reduce((s, c) => s + c.piutang, 0);
    const withPiutang = CUSTOMERS.filter((c) => c.piutang > 0).length;

    const stats = [
      { label: 'Total Pelanggan', value: CUSTOMERS.length, suffix: '', icon: 'users' },
      { label: 'Punya Piutang', value: withPiutang, suffix: ' pelanggan', icon: 'receipt-text' },
      { label: 'Total Piutang', money: totalPiutang, icon: 'wallet', tone: 'piutang' },
    ];

    const filters = [
      { key: 'all', label: 'Semua', count: CUSTOMERS.length },
      { key: 'piutang', label: 'Ada Piutang', count: CUSTOMERS.filter((c) => c.piutang > 0).length },
      { key: 'bonus', label: 'Punya Bonus', count: CUSTOMERS.filter((c) => c.bonuses > 0).length },
    ];

    return (
      <div style={{ animation: 'fadeUp 280ms ease' }}>
        <PageHeader title="Pelanggan" subtitle="Kelola daftar pelanggan beserta ketentuan diskon bertingkat"
          right={<Button icon="plus" onClick={() => {}}>Tambah Pelanggan</Button>} />

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
                      : <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)' }}>{s.suffix}</span></span>}
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
            <Input icon="search" placeholder="Cari nama, ID, atau kota..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 880 }}>
              <thead>
                <tr style={{ background: 'var(--surface-dim)' }}>
                  <Th>Pelanggan</Th>
                  <Th>Diskon LM</Th>
                  <Th>Diskon BR</Th>
                  <Th align="right">Piutang</Th>
                  <Th align="center">Bonus</Th>
                  <Th>Status</Th>
                  <Th align="right"> </Th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <CustSkelRow key={i} />)
                  : filtered.length === 0
                    ? <tr><td colSpan={7}><EmptyState q={q} /></td></tr>
                    : filtered.map((c) => (
                      <tr key={c.id} style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }}
                        onClick={() => openCustomer(c.id)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(243,243,243,0.6)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Avatar name={c.nama} size={36} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{c.nama}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{c.id}</span>
                                <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--border-strong)' }} />
                                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{c.kota}</span>
                              </div>
                            </div>
                          </div>
                        </Td>
                        <Td><DiscountChips steps={c.diskonLM} tipe="LM" /></Td>
                        <Td><DiscountChips steps={c.diskonBR} tipe="BR" /></Td>
                        <Td align="right">
                          {c.piutang > 0
                            ? <Currency amount={c.piutang} tone="piutang" />
                            : <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>—</span>}
                        </Td>
                        <Td align="center">
                          {c.bonuses > 0
                            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'var(--bonus-bg)', color: 'var(--bonus)', border: '1px solid var(--bonus-border)' }}>
                                <Icon name="gift" size={12} strokeWidth={2} />{c.bonuses}
                              </span>
                            : <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>0</span>}
                        </Td>
                        <Td><CustStatus status={c.status} /></Td>
                        <Td align="right"><Icon name="chevron-right" size={16} style={{ color: 'var(--text-tertiary)' }} /></Td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </Card>
        {!loading && filtered.length > 0 && (
          <p style={{ margin: '12px 2px 0', fontSize: 12.5, color: 'var(--text-tertiary)' }}>
            Menampilkan {filtered.length} dari {CUSTOMERS.length} pelanggan
          </p>
        )}
      </div>
    );
  }

  function CustSkelRow() {
    return (
      <tr style={{ borderTop: '1px solid var(--border)' }}>
        <td style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="skel" style={{ width: 36, height: 36, borderRadius: 8 }} />
            <div><div className="skel" style={{ width: 130, height: 13 }} /><div className="skel" style={{ width: 80, height: 10, marginTop: 7 }} /></div>
          </div>
        </td>
        {[120, 120, 80, 50, 70, 20].map((w, i) => (
          <td key={i} style={{ padding: '14px 18px' }}><div className="skel" style={{ width: w, height: 14 }} /></td>
        ))}
      </tr>
    );
  }

  function EmptyState({ q }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '64px 24px' }}>
        <div style={{ width: 52, height: 52, borderRadius: 13, background: 'var(--surface-dim)', display: 'grid', placeItems: 'center', color: 'var(--text-tertiary)', marginBottom: 14 }}>
          <Icon name="search" size={24} strokeWidth={1.5} />
        </div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Tidak ada hasil</h3>
        <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--text-secondary)' }}>
          {q ? <>Tidak ada pelanggan yang cocok dengan "{q}".</> : 'Belum ada pelanggan pada filter ini.'}
        </p>
      </div>
    );
  }

  // =========================================================
  //  DETAIL PELANGGAN
  // =========================================================
  function CustomerDetailPage({ custId, navigate, openTx, pushToast }) {
    const c = CUSTOMERS.find((x) => x.id === custId) || CUSTOMERS[0];
    const txs = TX.filter((t) => t.cust === c.id);
    const totalTx = txs.length;
    const lunasCount = txs.filter((t) => t.status === 'lunas').length;
    const progressPct = Math.min(100, Math.round((c.progresBonus / c.threshold) * 100));
    const sisa = Math.max(0, c.threshold - c.progresBonus);

    return (
      <div style={{ animation: 'fadeUp 280ms ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
          <button className="btn" onClick={() => navigate('customers')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: 0, fontSize: 13 }}>Pelanggan</button>
          <Icon name="chevron-right" size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.nama}</span>
        </div>

        <Card pad={24} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 16, minWidth: 0 }}>
              <Avatar name={c.nama} size={60} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{c.nama}</h1>
                  <CustStatus status={c.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                  <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>{c.id}</span>
                  <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--border-strong)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pelanggan sejak {fmtDate(c.sejak)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
                  <Meta icon="users" label="PIC" value={c.pic} />
                  <Meta icon="bell" label="Telepon" value={c.telp} mono />
                  <Meta icon="tag" label="Kota" value={c.kota} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" icon="pencil" onClick={() => pushToast && pushToast('Mode edit pelanggan (demo)')}>Edit</Button>
              <Button icon="plus" onClick={() => navigate('bon-new')}>Transaksi Baru</Button>
            </div>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }} className="cust-stat-grid">
          <MiniStat label="Total Piutang" money={c.piutang} tone={c.piutang > 0 ? 'piutang' : 'normal'} icon="receipt-text" />
          <MiniStat label="Total Transaksi" plain={`${totalTx}`} sub={`${lunasCount} lunas · ${totalTx - lunasCount} piutang`} icon="file-text" />
          <MiniStat label="Bonus Terkumpul" plain={`${c.bonuses}`} sub="klaim bonus" icon="gift" tone="bonus" />
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }} className="cust-detail-layout">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Card pad={0}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Riwayat Transaksi</h2>
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{totalTx} bon</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-dim)' }}>
                      <Th>Tanggal</Th><Th>Nomor Bon</Th><Th align="right">Total</Th><Th>Status</Th><Th align="right"> </Th>
                    </tr>
                  </thead>
                  <tbody>
                    {txs.map((t) => (
                      <tr key={t.id} style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }}
                        onClick={() => openTx && openTx(t)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(243,243,243,0.6)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <Td><span className="mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmtDate(t.tgl)}</span></Td>
                        <Td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <span className="mono" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>#{t.id}</span>
                            {t.isBonus && <BonusBadge />}
                          </span>
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

          <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }} className="cust-detail-side">
            <Card pad={20}>
              <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>Diskon Bertingkat</h2>
              <p style={{ margin: '0 0 16px', fontSize: 12.5, color: 'var(--text-secondary)' }}>Diterapkan berurutan dari harga base.</p>
              <TierBlock tipe="LM" label="Produk LM" steps={c.diskonLM} />
              <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
              <TierBlock tipe="BR" label="Produk BR" steps={c.diskonBR} />
            </Card>

            <Card pad={20}>
              <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Progres Bonus</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                <Currency amount={c.progresBonus} tone="primary" size="lg" bold />
                <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>dari {formatIDR(c.threshold)}</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-dim)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: progressPct + '%', borderRadius: 999, background: progressPct >= 100 ? 'var(--lunas)' : 'linear-gradient(90deg,#3B82F6,#2563EB)', transition: 'width 400ms ease' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: progressPct >= 100 ? 'var(--lunas)' : 'var(--primary)' }}>{progressPct}% tercapai</span>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  {sisa > 0 ? <>Kurang {formatIDR(sisa)}</> : 'Bonus siap diklaim'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 16, padding: '11px 13px', background: 'var(--bonus-bg)', border: '1px solid var(--bonus-border)', borderRadius: 8 }}>
                <Icon name="gift" size={17} style={{ color: 'var(--bonus)', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>
                  <strong>{c.bonuses}</strong> bonus telah diklaim sepanjang kerja sama.
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  function Meta({ icon, label, value, mono }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name={icon} size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{label}:</span>
        <span className={mono ? 'mono' : ''} style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
      </div>
    );
  }

  function MiniStat({ label, money, plain, sub, tone, icon }) {
    return (
      <Card pad={18} hover>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{label}</div>
            <div style={{ marginTop: 8 }}>
              {money != null
                ? <Currency amount={money} tone={tone} size="xl" bold />
                : <span style={{ fontSize: 24, fontWeight: 700, color: tone === 'bonus' ? 'var(--bonus)' : 'var(--text-primary)' }}>{plain}</span>}
            </div>
            {sub && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{sub}</div>}
          </div>
          <div style={{ padding: 8, background: 'var(--surface-dim)', borderRadius: 8, color: 'var(--text-tertiary)', display: 'flex' }}>
            <Icon name={icon} size={18} />
          </div>
        </div>
      </Card>
    );
  }

  function TierBlock({ tipe, label, steps }) {
    const eff = effectivePct(steps);
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TypeBadge tipe={tipe} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: tipe === 'LM' ? '#1D4ED8' : '#7C3AED' }}>Efektif {eff.toFixed(1).replace('.', ',')}%</span>
        </div>
        <DiscountChips steps={steps} tipe={tipe} />
      </div>
    );
  }

  Object.assign(window, { CustomersPage, CustomerDetailPage });
})();
