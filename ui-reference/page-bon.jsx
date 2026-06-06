/* HL Finance — Page 6: Form Bon Baru (most complex) */
(function () {
  const { useState, useMemo } = React;
  const { formatIDR, applyCascade, effectivePct, stepsLabel, PRODUCTS, CUSTOMERS, nextBonNo } = window.HLData;

  function BonNewPage({ navigate, pushToast }) {
    const [bonNo] = useState(() => nextBonNo());
    const [tgl, setTgl] = useState('2026-06-06');
    const [custId, setCustId] = useState('');
    const [desc, setDesc] = useState('');
    const [isBonus, setIsBonus] = useState(false);
    const [ongkir, setOngkir] = useState(0);
    const [rows, setRows] = useState([{ uid: 1, productId: '', qty: 1 }]);
    const [submitErr, setSubmitErr] = useState('');
    const [saving, setSaving] = useState(false);
    let uidRef = React.useRef(2);

    const cust = CUSTOMERS.find((c) => c.id === custId);

    function discFor(tipe) {
      if (!cust) return [];
      return tipe === 'LM' ? cust.diskonLM : cust.diskonBR;
    }

    const computed = rows.map((r) => {
      const p = PRODUCTS.find((x) => x.id === r.productId);
      if (!p) return { ...r, product: null, base: 0, steps: [], final: 0, omzet: 0 };
      const steps = discFor(p.tipe);
      const final = applyCascade(p.base, steps);
      const qty = Math.max(1, r.qty || 1);
      return { ...r, product: p, base: p.base, steps, final, omzet: final * qty, qty };
    });

    const omzetLM = computed.filter((r) => r.product?.tipe === 'LM').reduce((s, r) => s + r.omzet, 0);
    const omzetBR = computed.filter((r) => r.product?.tipe === 'BR').reduce((s, r) => s + r.omzet, 0);
    const totalOmzet = omzetLM + omzetBR;
    const totalTagihan = totalOmzet + (Number(ongkir) || 0);

    function addRow() { setRows((rs) => [...rs, { uid: uidRef.current++, productId: '', qty: 1 }]); }
    function removeRow(uid) { setRows((rs) => rs.length > 1 ? rs.filter((r) => r.uid !== uid) : rs); }
    function setRow(uid, patch) { setRows((rs) => rs.map((r) => r.uid === uid ? { ...r, ...patch } : r)); }

    function save() {
      setSubmitErr('');
      if (!cust) { setSubmitErr('Pilih pelanggan terlebih dahulu.'); return; }
      const valid = computed.filter((r) => r.product);
      if (valid.length === 0) { setSubmitErr('Tambahkan minimal satu produk pada line items.'); return; }
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        pushToast(`Bon ${bonNo} disimpan sebagai piutang · ${formatIDR(totalTagihan)}`);
        navigate('dashboard');
      }, 900);
    }

    const custOptions = CUSTOMERS.map((c) => ({ value: c.id, label: c.nama, sub: c.id }));
    const prodOptions = PRODUCTS.map((p) => ({ value: p.id, label: p.nama, tipe: p.tipe }));

    return (
      <div style={{ animation: 'fadeUp 280ms ease' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
          <button className="btn" onClick={() => navigate('transactions')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: 0, fontSize: 13 }}>Transaksi</button>
          <Icon name="chevron-right" size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Bon Baru</span>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }} className="bon-layout">
          {/* LEFT PANEL */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card pad={24}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Bon Baru</h1>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>No. Bon</div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 500, color: 'var(--primary)', marginTop: 3 }}>{bonNo}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="bon-fields">
                <Field label="Tanggal" required>
                  <Input type="date" value={tgl} onChange={(e) => setTgl(e.target.value)} />
                </Field>
                <Field label="Pelanggan" required>
                  <Select value={custId} onChange={setCustId} search placeholder="Pilih pelanggan..."
                    options={custOptions}
                    renderOption={(o) => (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={o.label} size={24} />
                        <span><span style={{ fontWeight: 500 }}>{o.label}</span> <span className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{o.sub}</span></span>
                      </span>
                    )} />
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <Field label="Deskripsi" hint="Opsional — catatan untuk bon ini">
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Mis. Pesanan rutin bulanan, pengiriman ke gudang utama..."
                    className="focusable" style={{
                      width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 6, resize: 'vertical',
                      border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', lineHeight: 1.5,
                    }} />
                </Field>
              </div>

              {/* Bonus toggle */}
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 14px', background: isBonus ? 'var(--bonus-bg)' : 'var(--surface-dim)', border: `1px solid ${isBonus ? 'var(--bonus-border)' : 'var(--border)'}`, borderRadius: 8, transition: 'background 150ms, border-color 150ms' }}>
                <div style={{ display: 'flex', gap: 11 }}>
                  <Icon name="gift" size={18} strokeWidth={1.75} style={{ color: isBonus ? 'var(--bonus)' : 'var(--text-tertiary)', marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Tandai sebagai Transaksi Bonus</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>Bon ini akan dihitung sebagai klaim bonus pelanggan, bukan penjualan reguler.</div>
                  </div>
                </div>
                <Toggle on={isBonus} onChange={setIsBonus} />
              </div>
            </Card>

            {/* Line items */}
            <Card pad={0}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Line Items</h2>
                <Button variant="ghost" size="sm" icon="plus" onClick={addRow}>Tambah Produk</Button>
              </div>

              {!cust && (
                <div style={{ padding: '10px 20px', background: 'var(--piutang-bg)', borderBottom: '1px solid var(--piutang-border)', fontSize: 12.5, color: 'var(--piutang)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon name="alert-circle" size={14} strokeWidth={2} /> Pilih pelanggan dulu agar diskon bertingkat terhitung otomatis.
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-dim)' }}>
                      <LiTh w="26%">Produk</LiTh>
                      <LiTh w={64} align="center">Qty</LiTh>
                      <LiTh align="right">Harga Base</LiTh>
                      <LiTh align="center">Diskon</LiTh>
                      <LiTh align="right">Harga Final</LiTh>
                      <LiTh align="right">Omzet</LiTh>
                      <LiTh w={40}> </LiTh>
                    </tr>
                  </thead>
                  <tbody>
                    {computed.map((r) => (
                      <tr key={r.uid} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px 10px 20px', minWidth: 200 }}>
                          <Select value={r.productId} onChange={(v) => setRow(r.uid, { productId: v })} search placeholder="Pilih produk..."
                            options={prodOptions}
                            renderOption={(o) => (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <TypeBadge tipe={o.tipe} /><span>{o.label}</span>
                              </span>
                            )} />
                          {r.product && <div style={{ marginTop: 6 }}><TypeBadge tipe={r.product.tipe} /></div>}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <input type="number" min={1} value={r.qty} onChange={(e) => setRow(r.uid, { qty: Math.max(1, parseInt(e.target.value || '1', 10)) })}
                            className="mono focusable" style={{
                              width: 56, height: 36, textAlign: 'center', fontSize: 14, borderRadius: 6,
                              border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none',
                            }} />
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          {r.product ? <Currency amount={r.base} tone="muted" /> : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {r.product
                            ? <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-secondary)', background: 'var(--surface-dim)', padding: '3px 8px', borderRadius: 5, whiteSpace: 'nowrap' }}>{stepsLabel(r.steps)}</span>
                            : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          {r.product ? <Currency amount={r.final} /> : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          {r.product ? <Currency amount={r.omzet} bold /> : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 20px 10px 8px', textAlign: 'center' }}>
                          <button className="btn focusable" onClick={() => removeRow(r.uid)} disabled={rows.length === 1} style={{
                            width: 30, height: 30, display: 'grid', placeItems: 'center', borderRadius: 6, border: 'none',
                            background: 'transparent', color: 'var(--text-tertiary)', opacity: rows.length === 1 ? 0.35 : 1,
                          }}
                            onMouseEnter={(e) => { if (rows.length > 1) { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; } }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
                            <Icon name="trash-2" size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* RIGHT PANEL (sticky) */}
          <div style={{ width: 320, flexShrink: 0, position: 'sticky', top: 88 }} className="bon-summary">
            <Card pad={20}>
              <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Ringkasan Transaksi</h2>
              <SummaryLine label="Omzet LM" value={omzetLM} />
              <SummaryLine label="Omzet BR" value={omzetBR} />
              <Divider />
              <SummaryLine label="Total Omzet" value={totalOmzet} strong />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '14px 0 0' }}>
                <span style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>Ongkir</span>
                <div style={{ position: 'relative', width: 130 }}>
                  <span className="mono" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-tertiary)' }}>Rp</span>
                  <input type="number" min={0} value={ongkir} onChange={(e) => setOngkir(Math.max(0, parseInt(e.target.value || '0', 10)))}
                    className="mono focusable" style={{
                      width: '100%', height: 36, padding: '0 10px 0 32px', textAlign: 'right', fontSize: 13.5, borderRadius: 6,
                      border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none',
                    }} />
                </div>
              </div>

              <Divider />
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Total Tagihan</span>
                <Currency amount={totalTagihan} tone="primary" size="xl" bold />
              </div>

              {submitErr && (
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 7, color: 'var(--danger)', fontSize: 12.5 }}>
                  <Icon name="alert-circle" size={14} strokeWidth={2} style={{ flexShrink: 0 }} />{submitErr}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
                <Button full size="lg" onClick={save} disabled={saving}>
                  {saving ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Spinner /> Menyimpan...</span> : 'Simpan sebagai Piutang'}
                </Button>
                <Button full variant="ghost" onClick={() => navigate('transactions')}>Batal</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  function LiTh({ children, w, align }) {
    return <th style={{ width: w, textAlign: align || 'left', padding: '10px 12px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{children}</th>;
  }
  function SummaryLine({ label, value, strong }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '6px 0' }}>
        <span style={{ fontSize: strong ? 14 : 13.5, fontWeight: strong ? 600 : 400, color: strong ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
        <Currency amount={value} bold={strong} />
      </div>
    );
  }
  function Divider() { return <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />; }

  function Toggle({ on, onChange }) {
    return (
      <button type="button" className="btn focusable" onClick={() => onChange(!on)} style={{
        width: 40, height: 23, borderRadius: 999, border: 'none', padding: 2, flexShrink: 0,
        background: on ? 'var(--bonus)' : 'var(--border-strong)', transition: 'background 150ms', position: 'relative',
      }}>
        <span style={{ display: 'block', width: 19, height: 19, borderRadius: 999, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', transform: on ? 'translateX(17px)' : 'translateX(0)', transition: 'transform 150ms cubic-bezier(0.2,0.7,0.2,1)' }} />
      </button>
    );
  }

  Object.assign(window, { BonNewPage, Toggle });
})();
