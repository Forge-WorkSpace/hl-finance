/* HL Finance — Page 1: Login */
(function () {
  const { useState } = React;

  function Spinner({ size = 16, color = '#fff' }) {
    return (
      <span style={{
        width: size, height: size, borderRadius: 999, display: 'inline-block',
        border: `2px solid ${color}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite',
      }} />
    );
  }
  if (!document.getElementById('spin-kf')) {
    const s = document.createElement('style'); s.id = 'spin-kf';
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }

  function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('admin@hlfinance.id');
    const [pw, setPw] = useState('');
    const [err, setErr] = useState('');
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);

    const emailErr = touched && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? 'Format email tidak valid' : '';

    function submit(e) {
      e.preventDefault();
      setTouched(true);
      setErr('');
      if (emailErr || !pw) return;
      setLoading(true);
      setTimeout(() => {
        if (pw.toLowerCase() === 'salah') {
          setLoading(false);
          setErr('Email atau kata sandi salah. Silakan coba lagi.');
        } else {
          onLogin();
        }
      }, 850);
    }

    return (
      <div style={{ minHeight: '100vh', background: '#F3F4F6', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 384, animation: 'fadeUp 320ms cubic-bezier(0.2,0.7,0.2,1)' }}>
          <div style={{
            background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 24px 48px -16px rgba(15,23,42,0.12)',
            padding: 32, border: '1px solid #EFEFEF',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', color: '#fff',
                display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 22, letterSpacing: '0.02em',
                boxShadow: '0 8px 20px -6px rgba(37,99,235,0.5)',
              }}>HL</div>
              <h1 style={{ margin: '16px 0 0', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>HL Finance</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--text-tertiary)' }}>Management Portal</p>
            </div>

            {err && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', marginBottom: 18,
                background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 8,
                color: 'var(--danger)', fontSize: 13, animation: 'fadeUp 180ms',
              }}>
                <Icon name="alert-circle" size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span>{err}</span>
              </div>
            )}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Email" error={emailErr}>
                <Input type="email" icon="mail" value={email} autoComplete="username"
                  onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)}
                  error={!!emailErr} style={{ height: 44 }} placeholder="nama@perusahaan.id" />
              </Field>
              <Field label="Kata Sandi">
                <Input type="password" icon="lock" value={pw} autoComplete="current-password"
                  onChange={(e) => setPw(e.target.value)} style={{ height: 44 }} placeholder="........" />
              </Field>

              <Button type="submit" size="lg" full disabled={loading} style={{ marginTop: 6 }}>
                {loading
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Spinner /> Memproses...</span>
                  : 'Masuk'}
              </Button>
            </form>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 20 }}>
            © 2026 HL Finance · Internal use only
          </p>
        </div>
      </div>
    );
  }

  Object.assign(window, { LoginPage, Spinner });
})();
