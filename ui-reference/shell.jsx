/* HL Finance — app shell: Sidebar + TopBar */
(function () {
  const { useState } = React;

  const NAV = [
    { key: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { key: 'customers', label: 'Pelanggan', icon: 'users' },
    { key: 'products', label: 'Produk', icon: 'package' },
    { key: 'transactions', label: 'Transaksi', icon: 'file-text' },
    { key: 'reports', label: 'Laporan', icon: 'bar-chart-3' },
  ];
  const NAV_BOTTOM = [
    { key: 'settings', label: 'Settings', icon: 'settings' },
    { key: 'logout', label: 'Logout', icon: 'log-out' },
  ];

  function NavItem({ item, active, onClick, collapsed }) {
    const [hover, setHover] = useState(false);
    return (
      <button className="nav-item btn" onClick={onClick}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left',
          padding: '0 16px', height: 38, fontSize: 14, fontWeight: active ? 600 : 500,
          color: active ? 'var(--sidebar-active)' : 'var(--sidebar-text)',
          background: active ? 'rgba(255,255,255,0.06)' : hover ? 'rgba(255,255,255,0.05)' : 'transparent',
          borderLeft: `2px solid ${active ? 'var(--sidebar-accent)' : 'transparent'}`,
          borderRadius: 0,
        }}>
        <Icon name={item.icon} size={18} strokeWidth={active ? 2 : 1.75} style={{ flexShrink: 0 }} />
        {!collapsed && <span>{item.label}</span>}
      </button>
    );
  }

  function Sidebar({ route, navigate, mobileOpen, setMobileOpen }) {
    const inner = (
      <aside style={{
        width: 240, background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column',
        flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '22px 24px 20px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: 'var(--primary)', color: '#fff',
            display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15, letterSpacing: '0.02em',
          }}>HL</div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>HL Finance</div>
            <div style={{ color: 'var(--sidebar-text)', fontSize: 11.5 }}>Management Portal</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
          {NAV.map((it) => (
            <NavItem key={it.key} item={it} active={route === it.key}
              onClick={() => { navigate(it.key); setMobileOpen && setMobileOpen(false); }} />
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ padding: '0 16px' }}><div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} /></div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 0 16px' }}>
          {NAV_BOTTOM.map((it) => (
            <NavItem key={it.key} item={it} active={false} onClick={() => navigate(it.key)} />
          ))}
        </nav>
      </aside>
    );

    return (
      <React.Fragment>
        {/* Desktop */}
        <div className="sidebar-desktop">{inner}</div>
        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="sidebar-mobile" style={{ position: 'fixed', inset: 0, zIndex: 120 }}>
            <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', animation: 'overlayIn 150ms' }} />
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, animation: 'fadeUp 200ms' }}>{inner}</div>
          </div>
        )}
      </React.Fragment>
    );
  }

  function TopBar({ navigate, onMenu, pushToast }) {
    return (
      <header style={{
        height: 64, flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', position: 'sticky', top: 0, zIndex: 30,
      }}>
        <button className="btn topbar-menu focusable" onClick={onMenu} style={{
          display: 'none', width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
          borderRadius: 6, color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border)',
        }}><Icon name="menu" size={18} /></button>

        <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', display: 'flex' }}><Icon name="search" size={16} /></span>
          <input placeholder="Cari pelanggan, nomor bon..." className="focusable" style={{
            height: 38, width: '100%', padding: '0 12px 0 36px', fontSize: 13.5, borderRadius: 6,
            border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none',
          }} />
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <IconBtn icon="bell" badge />
          <IconBtn icon="help-circle" />
          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 6px' }} />
          <Button icon="plus" onClick={() => navigate('bon-new')} className="topbar-new">Transaksi Baru</Button>
          <div style={{
            width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(135deg,#2563EB,#1D4ED8)',
            color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 13, marginLeft: 6, cursor: 'pointer',
          }}>HL</div>
        </div>
      </header>
    );
  }

  function IconBtn({ icon, badge }) {
    const [h, setH] = useState(false);
    return (
      <button className="btn focusable" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
        position: 'relative', width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 6,
        background: h ? 'var(--surface-dim)' : 'transparent', color: 'var(--text-secondary)', border: 'none',
      }}>
        <Icon name={icon} size={18} />
        {badge && <span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 999, background: 'var(--danger)', border: '1.5px solid var(--surface)' }} />}
      </button>
    );
  }

  Object.assign(window, { Sidebar, TopBar });
})();
