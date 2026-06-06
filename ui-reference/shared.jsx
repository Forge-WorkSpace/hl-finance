/* HL Finance — shared UI primitives */
(function () {
  const { useState, useEffect, useRef } = React;
  const { formatIDR, initials, avatarColor } = window.HLData;

  // ---------- Avatar ----------
  function Avatar({ name, size = 36 }) {
    const [bg, fg] = avatarColor(name);
    return React.createElement('div', {
      style: {
        width: size, height: size, borderRadius: 8, background: bg, color: fg,
        display: 'grid', placeItems: 'center', fontWeight: 600, flexShrink: 0,
        fontSize: size * 0.36, letterSpacing: '0.02em',
      },
    }, initials(name));
  }

  // ---------- StatusBadge ----------
  function StatusBadge({ status }) {
    const map = {
      piutang: { bg: 'var(--piutang-bg)', fg: 'var(--piutang)', bd: 'var(--piutang-border)', dot: '#F59E0B', label: 'Piutang' },
      lunas: { bg: 'var(--lunas-bg)', fg: 'var(--lunas)', bd: 'var(--lunas-border)', dot: '#22C55E', label: 'Lunas' },
    };
    const c = map[status] || map.piutang;
    return (
      <span className="mono" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px',
        borderRadius: 999, fontSize: 12, fontWeight: 500, background: c.bg, color: c.fg,
        border: `1px solid ${c.bd}`, whiteSpace: 'nowrap',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: c.dot }} />
        {c.label}
      </span>
    );
  }

  function BonusBadge() {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px',
        borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
        background: 'var(--bonus-bg)', color: 'var(--bonus)', border: '1px solid var(--bonus-border)',
      }}>
        <Icon name="gift" size={12} strokeWidth={2} /> BONUS
      </span>
    );
  }

  function TypeBadge({ tipe }) {
    const lm = tipe === 'LM';
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', padding: '1px 8px', borderRadius: 5,
        fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
        background: lm ? '#EFF6FF' : '#F5F3FF', color: lm ? '#1D4ED8' : '#7C3AED',
        border: `1px solid ${lm ? '#BFDBFE' : '#DDD6FE'}`,
      }}>{tipe}</span>
    );
  }

  // ---------- Currency ----------
  function Currency({ amount, tone = 'normal', size = 'sm', bold = false, className = '' }) {
    const color = tone === 'piutang' ? 'var(--piutang)'
      : tone === 'danger' ? 'var(--danger)'
      : tone === 'muted' ? 'var(--text-tertiary)'
      : tone === 'lunas' ? 'var(--lunas)'
      : tone === 'primary' ? 'var(--primary)'
      : 'var(--text-primary)';
    const fs = size === '2xl' ? 26 : size === 'xl' ? 20 : size === 'lg' ? 16 : 14;
    return (
      <span className={'mono ' + className} style={{
        color, fontSize: fs, fontWeight: bold ? 700 : (size === '2xl' ? 700 : 500),
        letterSpacing: size === '2xl' ? '-0.01em' : 0, whiteSpace: 'nowrap',
      }}>{formatIDR(amount)}</span>
    );
  }

  // ---------- Button ----------
  function Button({ variant = 'primary', size = 'md', icon, iconRight, children, full, style = {}, ...rest }) {
    const base = {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      height: size === 'lg' ? 44 : size === 'sm' ? 32 : 40,
      padding: size === 'sm' ? '0 12px' : '0 16px',
      fontSize: size === 'sm' ? 13 : 14, fontWeight: 500, borderRadius: 6,
      width: full ? '100%' : undefined, whiteSpace: 'nowrap', border: '1px solid transparent',
    };
    const variants = {
      primary: { background: 'var(--primary)', color: '#fff' },
      secondary: { background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
      danger: { background: 'var(--danger)', color: '#fff' },
      success: { background: 'var(--lunas)', color: '#fff' },
      ghost: { background: 'transparent', color: 'var(--text-secondary)' },
    };
    const hoverBg = { primary: 'var(--primary-hover)', secondary: 'var(--surface-dim)', danger: '#B91C1C', success: '#15803D', ghost: 'var(--surface-dim)' };
    const [hover, setHover] = useState(false);
    const v = variants[variant];
    const sty = { ...base, ...v, ...style };
    if (hover && !rest.disabled) {
      sty.background = hoverBg[variant];
      if (variant === 'ghost') sty.color = 'var(--text-primary)';
      if (variant === 'secondary') sty.borderColor = 'var(--border-strong)';
    }
    if (rest.disabled) { sty.opacity = 0.5; sty.cursor = 'not-allowed'; }
    return (
      <button className="btn focusable" style={sty} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} {...rest}>
        {icon && <Icon name={icon} size={size === 'sm' ? 15 : 16} strokeWidth={2} />}
        {children}
        {iconRight && <Icon name={iconRight} size={size === 'sm' ? 15 : 16} strokeWidth={2} />}
      </button>
    );
  }

  // ---------- Input ----------
  function Field({ label, hint, error, children, required }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {label && (
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
            {label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}
          </label>
        )}
        {children}
        {error
          ? <span style={{ fontSize: 12, color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="alert-circle" size={13} strokeWidth={2} />{error}</span>
          : hint ? <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{hint}</span> : null}
      </div>
    );
  }

  function Input({ error, mono, icon, style = {}, ...rest }) {
    const [focus, setFocus] = useState(false);
    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && <span style={{ position: 'absolute', left: 11, color: 'var(--text-tertiary)', display: 'flex' }}><Icon name={icon} size={16} /></span>}
        <input
          className={mono ? 'mono' : ''}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            height: 40, width: '100%', padding: icon ? '0 12px 0 34px' : '0 12px', fontSize: 14,
            borderRadius: 6, color: 'var(--text-primary)', background: 'var(--surface)',
            border: `1px solid ${error ? 'var(--danger)' : focus ? 'var(--primary)' : 'var(--border)'}`,
            boxShadow: focus ? `0 0 0 3px ${error ? 'rgba(220,38,38,0.16)' : 'rgba(37,99,235,0.16)'}` : 'none',
            outline: 'none', transition: 'border-color 120ms, box-shadow 120ms', ...style,
          }}
          {...rest}
        />
      </div>
    );
  }

  // ---------- Card ----------
  function Card({ children, style = {}, pad = 24, hover = false }) {
    const [h, setH] = useState(false);
    return (
      <div className={hover ? 'card-hover' : ''}
        onMouseEnter={() => hover && setH(true)} onMouseLeave={() => hover && setH(false)}
        style={{
          background: 'var(--surface)', border: `1px solid ${h ? 'var(--border-strong)' : 'var(--border)'}`,
          borderRadius: 8, boxShadow: 'var(--shadow-card)', padding: pad, ...style,
        }}>{children}</div>
    );
  }

  // ---------- SummaryCard ----------
  function SummaryCard({ label, value, tone, icon, trend, trendTone = 'lunas', loading }) {
    if (loading) {
      return (
        <Card pad={24}>
          <div className="skel" style={{ width: 90, height: 11, marginBottom: 16 }} />
          <div className="skel" style={{ width: 130, height: 26 }} />
        </Card>
      );
    }
    return (
      <Card pad={24} hover>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</p>
            <p style={{ margin: '12px 0 0' }}><Currency amount={value} tone={tone} size="2xl" /></p>
            {trend && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: `var(--${trendTone})`, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="trending-up" size={13} strokeWidth={2} />{trend}
              </p>
            )}
          </div>
          <div style={{ padding: 9, background: 'var(--surface-dim)', borderRadius: 8, color: 'var(--text-tertiary)', display: 'flex' }}>
            <Icon name={icon} size={20} />
          </div>
        </div>
      </Card>
    );
  }

  // ---------- Toast ----------
  function Toast({ toast }) {
    if (!toast) return null;
    const isErr = toast.type === 'error';
    return (
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, animation: 'toastIn 220ms cubic-bezier(0.2,0.7,0.2,1)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', minWidth: 280,
          background: '#0F172A', color: '#fff', borderRadius: 8, boxShadow: 'var(--shadow-modal)', fontSize: 14,
        }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 999, background: isErr ? 'var(--danger)' : 'var(--lunas)', flexShrink: 0 }}>
            <Icon name={isErr ? 'x' : 'check'} size={14} strokeWidth={3} />
          </span>
          <span style={{ fontWeight: 500 }}>{toast.msg}</span>
        </div>
      </div>
    );
  }

  // ---------- Dropdown (searchable select) ----------
  function Select({ value, onChange, options, placeholder = 'Pilih...', search = false, renderOption, width }) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const ref = useRef(null);
    useEffect(() => {
      function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, []);
    const sel = options.find((o) => o.value === value);
    const filtered = search && q ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())) : options;
    return (
      <div ref={ref} style={{ position: 'relative', width: width || '100%' }}>
        <button type="button" className="btn focusable" onClick={() => setOpen(!open)} style={{
          height: 40, width: '100%', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, background: 'var(--surface)', border: `1px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 6, fontSize: 14, color: sel ? 'var(--text-primary)' : 'var(--text-tertiary)',
          boxShadow: open ? '0 0 0 3px rgba(37,99,235,0.16)' : 'none', fontWeight: 400, textAlign: 'left',
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sel ? sel.label : placeholder}</span>
          <Icon name="chevron-down" size={16} style={{ flexShrink: 0, color: 'var(--text-tertiary)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
        </button>
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
            boxShadow: 'var(--shadow-dropdown)', overflow: 'hidden', animation: 'fadeUp 150ms ease',
          }}>
            {search && (
              <div style={{ padding: 8, borderBottom: '1px solid var(--border)' }}>
                <Input icon="search" autoFocus placeholder="Cari..." value={q} onChange={(e) => setQ(e.target.value)} style={{ height: 34 }} />
              </div>
            )}
            <div style={{ maxHeight: 240, overflowY: 'auto', padding: 4 }}>
              {filtered.length === 0 && <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-tertiary)' }}>Tidak ditemukan</div>}
              {filtered.map((o) => (
                <button key={o.value} type="button" className="btn" onClick={() => { onChange(o.value); setOpen(false); setQ(''); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 6, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    background: o.value === value ? 'var(--primary-subtle)' : 'transparent',
                    color: 'var(--text-primary)', fontWeight: 400,
                  }}
                  onMouseEnter={(e) => { if (o.value !== value) e.currentTarget.style.background = 'var(--surface-dim)'; }}
                  onMouseLeave={(e) => { if (o.value !== value) e.currentTarget.style.background = 'transparent'; }}>
                  {renderOption ? renderOption(o) : <span>{o.label}</span>}
                  {o.value === value && <Icon name="check" size={15} strokeWidth={2.5} style={{ color: 'var(--primary)' }} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  Object.assign(window, { Avatar, StatusBadge, BonusBadge, TypeBadge, Currency, Button, Field, Input, Card, SummaryCard, Toast, Select });
})();
