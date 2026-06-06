/* HL Finance — Page: Detail Bon */
(function () {
  const { useState } = React;
  const { formatIDR, stepsLabel, bonItems, CUSTOMERS, TX } = window.HLData;
  const { Th, Td, fmtDate } = window;

  function BonDetailPage({ txId, navigate, openCustomer, pushToast }) {
    const tx = TX.find((t) => t.id === txId) || TX[0];
    const cust = CUSTOMERS.find((c) => c.id === tx.cust);
    const bon = bonItems(tx);
    const [status, setStatus] = useState(tx.status);
    const [lunasTgl, setLunasTgl] = useState(tx.lunasTgl || null);
    const [marking, setMarking] = useState(false);

    function markLunas() {
      setMarking(true);
      setTimeout(() => {
        setMarking(false);
        setStatus('lunas');
        setLunasTgl('2026-06-06');
        pushToast && pushToast(`Bon #${tx.id} ditandai LUNAS · ${formatIDR(tx.total)}`);
      }, 800);
    }

    return (
      <div style={{ animation: 'fadeUp 280ms ease' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
          <button className="btn" onClick={() => navigate('transactions')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: 0, fontSize: 13 }}>Transaksi</button>
          <Icon name="chevron-right" size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>#{tx.id}</span>
        </div>

        {/* Header card */}
        <Card pad={24} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h1 className="mono" style={{ margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: '-0.01em' }}>#{tx.id}</h1>
                <StatusBadge status={status} />
                {tx.isBonus && <BonusBadge />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="calendar" size={15} style={{ color: 'var(--text-tertiary)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Tanggal bon:</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{fmtDate(tx.tgl)}</span>
                </div>
                {status === 'lunas' && lunasTgl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="circle-check" size={15} style={{ color: 'var(--lunas)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Lunas:</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--lunas)' }}>{fmtDate(lunasTgl)}</span>
                  </div>
                )}
              </div>
              {/* Customer chip */}
              <button className="btn" onClick={() => openCustomer && openCustomer(tx.cust)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 11, marginTop: 16, padding: '8px 14px 8px 8px',
                background: 'var(--surface-dim)', border: '1px solid var(--border)', borderRadius: 999, cursor: 'pointer',
              }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                <Avatar name={tx.custNama} size={30} />
                <span style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{tx.custNama}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 8 }}>{tx.cust}</span>
                </span>
                <Icon name="chevron-right" size={15} style={{ color: 'var(--text-tertiary)' }} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" icon="download" onClick={() => pushToast && pushToast('Cetak bon (demo)')}>Cetak</Button>
              {status === 'piutang' && (
                <Button variant="success" icon="check" onClick={markLunas} disabled={marking}>
                  {marking ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Spinner /> Memproses...</span> : 'Tandai Lunas'}
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }} className="bon-layout">
          {/* LEFT: line items */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Card pad={0}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Line Items</h2>
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{bon.lines.length} item</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-dim)' }}>
                      <LiTh>Produk</LiTh>
                      <LiTh align="center">Qty</LiTh>
                      <LiTh align="right">Harga Base</LiTh>
                      <LiTh align="center">Diskon</LiTh>
                      <LiTh align="right">Harga Final</LiTh>
                      <LiTh align="right">Omzet</LiTh>
                    </tr>
                  </thead>
                  <tbody>
                    {bon.lines.map((ln, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 12px 12px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <TypeBadge tipe={ln.tipe} />
                            <span style={{ fontSize: 13.5, fontWeight: 500 }}>{ln.product.nama}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}><span className="mono" style={{ fontSize: 13.5, fontWeight: 500 }}>{ln.qty}</span></td>
                        <td style={{ padding: '12px', textAlign: 'right' }}><Currency amount={ln.base} tone="muted" /></td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-secondary)', background: 'var(--surface-dim)', padding: '3px 8px', borderRadius: 5, whiteSpace: 'nowrap' }}>{stepsLabel(ln.steps)}</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}><Currency amount={ln.final} /></td>
                        <td style={{ padding: '12px 20px 12px 12px', textAlign: 'right' }}><Currency amount={ln.omzet} bold /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            {tx.isBonus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '12px 16px', background: 'var(--bonus-bg)', border: '1px solid var(--bonus-border)', borderRadius: 8 }}>
                <Icon name="gift" size={18} style={{ color: 'var(--bonus)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Transaksi ini ditandai sebagai <strong>bonus pelanggan</strong> — dihitung sebagai klaim bonus, bukan penjualan reguler.</span>
              </div>
            )}
          </div>

          {/* RIGHT: summary + payment */}
          <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }} className="bon-summary">
            <Card pad={20}>
              <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Ringkasan</h2>
              <SumLine label="Omzet LM" value={bon.omzetLM} />
              <SumLine label="Omzet BR" value={bon.omzetBR} />
              <Divider />
              <SumLine label="Total Omzet" value={bon.omzet} strong />
              <SumLine label="Ongkir" value={bon.ongkir} />
              <Divider />
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Total Tagihan</span>
                <Currency amount={bon.total} tone="primary" size="xl" bold />
              </div>
            </Card>

            <Card pad={20}>
              <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>Status Pembayaran</h2>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 8,
                background: status === 'lunas' ? 'var(--lunas-bg)' : 'var(--piutang-bg)',
                border: `1px solid ${status === 'lunas' ? 'var(--lunas-border)' : 'var(--piutang-border)'}`,
              }}>
                <span style={{ width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', background: status === 'lunas' ? 'var(--lunas)' : 'var(--piutang)', color: '#fff', flexShrink: 0 }}>
                  <Icon name={status === 'lunas' ? 'circle-check' : 'receipt-text'} size={19} strokeWidth={2} />
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: status === 'lunas' ? 'var(--lunas)' : 'var(--piutang)' }}>{status === 'lunas' ? 'Lunas' : 'Piutang'}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 1 }}>
                    {status === 'lunas' ? (lunasTgl ? `Dibayar ${fmtDate(lunasTgl)}` : 'Sudah dibayar') : 'Menunggu pembayaran'}
                  </div>
                </div>
              </div>
              {status === 'piutang' && (
                <Button full variant="success" icon="check" onClick={markLunas} disabled={marking} style={{ marginTop: 14 }}>
                  {marking ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Spinner /> Memproses...</span> : 'Tandai Lunas'}
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  function LiTh({ children, align }) {
    return <th style={{ textAlign: align || 'left', padding: '10px 12px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{children}</th>;
  }
  function SumLine({ label, value, strong }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '6px 0' }}>
        <span style={{ fontSize: strong ? 14 : 13.5, fontWeight: strong ? 600 : 400, color: strong ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
        <Currency amount={value} bold={strong} />
      </div>
    );
  }
  function Divider() { return <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />; }

  Object.assign(window, { BonDetailPage });
})();
