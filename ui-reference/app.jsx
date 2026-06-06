/* HL Finance — main app + router */
(function () {
  const { useState, useCallback } = React;

  function Placeholder({ title, icon }) {
    return (
      <div style={{ animation: 'fadeUp 280ms ease' }}>
        <window.PageHeader title={title} subtitle="Halaman ini bagian dari spesifikasi lengkap HL Finance." />
        <Card pad={0}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '72px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--surface-dim)', display: 'grid', placeItems: 'center', color: 'var(--text-tertiary)', marginBottom: 16 }}>
              <Icon name={icon} size={26} strokeWidth={1.5} />
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 360 }}>
              Fokus build saat ini: Login, Dashboard, dan Form Bon Baru. Halaman ini menyusul pada iterasi berikutnya.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  function App() {
    const [authed, setAuthed] = useState(false);
    const [route, setRoute] = useState('dashboard');
    const [selectedCust, setSelectedCust] = useState(null);
    const [selectedTx, setSelectedTx] = useState(null);
    const [toast, setToast] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const pushToast = useCallback((msg, type = 'success') => {
      setToast({ msg, type, id: Date.now() });
      setTimeout(() => setToast((t) => (t && t.id ? null : t)), 3200);
    }, []);

    const navigate = useCallback((r) => {
      if (r === 'logout') { setAuthed(false); setRoute('dashboard'); return; }
      setRoute(r);
      const sc = document.querySelector('.page-scroll');
      if (sc) sc.scrollTop = 0;
    }, []);

    const openTx = useCallback((t) => { setSelectedTx(t.id); navigate('tx-detail'); }, [navigate]);
    const openCustomer = useCallback((id) => { setSelectedCust(id); navigate('cust-detail'); }, [navigate]);

    if (!authed) {
      return (
        <React.Fragment>
          <window.LoginPage onLogin={() => { setAuthed(true); setRoute('dashboard'); pushToast('Selamat datang kembali di HL Finance'); }} />
          <Toast toast={toast} />
        </React.Fragment>
      );
    }

    let page;
    if (route === 'dashboard') page = <window.DashboardPage navigate={navigate} openTx={openTx} />;
    else if (route === 'bon-new') page = <window.BonNewPage navigate={navigate} pushToast={pushToast} />;
    else if (route === 'customers') page = <window.CustomersPage navigate={navigate} openCustomer={openCustomer} />;
    else if (route === 'cust-detail') page = <window.CustomerDetailPage custId={selectedCust} navigate={navigate} openTx={openTx} pushToast={pushToast} />;
    else if (route === 'products') page = <window.ProductsPage navigate={navigate} pushToast={pushToast} />;
    else if (route === 'transactions') page = <window.TransactionsPage navigate={navigate} openTx={openTx} />;
    else if (route === 'tx-detail') page = <window.BonDetailPage txId={selectedTx} navigate={navigate} openCustomer={openCustomer} pushToast={pushToast} />;
    else if (route === 'reports') page = <window.ReportsPage navigate={navigate} pushToast={pushToast} />;
    else if (route === 'settings') page = <Placeholder title="Settings" icon="settings" />;
    else page = <window.DashboardPage navigate={navigate} openTx={openTx} />;

    const navRoute = ['bon-new', 'tx-detail'].includes(route) ? 'transactions'
      : route === 'cust-detail' ? 'customers'
      : route;

    return (
      <div className="app-shell">
        <Sidebar route={navRoute} navigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="content-area">
          <TopBar navigate={navigate} onMenu={() => setMobileOpen(true)} pushToast={pushToast} />
          <div className="page-scroll">
            <div className="page-inner">{page}</div>
          </div>
        </div>
        <Toast toast={toast} />
      </div>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
})();
