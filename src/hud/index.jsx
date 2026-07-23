import { Suspense, lazy, useEffect, useRef, useState, Component } from 'react';
import './hud.css';

const HoloCore = lazy(() => import('./HoloCore.jsx'));

// If WebGL/3D fails on a device, fall back to the static glow — never crash the page.
class HoloBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* swallow — fallback renders */ }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

// ── Glass panel with optional corner brackets ──────────────
export function GlassPanel({ label, tag, brackets = true, hoverable = false, children, style = {}, className = '', ...rest }) {
  return (
    <div className={`s4-glass ${hoverable ? 'hoverable' : ''} ${className}`} style={{ padding: 20, ...style }} {...rest}>
      {brackets && <><span className="s4-bracket tl" /><span className="s4-bracket br" /></>}
      {label && (
        <div className="s4-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <span>{label}</span>{tag && <span className="s4-accent">{tag}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

// ── System status rail ─────────────────────────────────────
export function StatusRail({ door = 'HUB', extra }) {
  const [clock, setClock] = useState('--:--:--');
  useEffect(() => {
    const t = () => setClock(new Date().toISOString().slice(11, 19));
    t(); const id = setInterval(t, 1000); return () => clearInterval(id);
  }, []);
  return (
    <div className="s4-rail">
      <span className="brand">SOLVEN4</span>
      <span className="sep">//</span>
      <span>{door}</span>
      <span className="live"><span className="s4-dot" /> 5 PLATFORMS ONLINE</span>
      {extra}
      <span className="push" />
      <span className="s4-num">{clock} UTC</span>
      <span className="sep">//</span>
      <span>SYS NOMINAL</span>
    </div>
  );
}

// ── Count-up number ────────────────────────────────────────
export function CountUp({ to, prefix = '', suffix = '', dur = 1100, className = '', style }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setVal(to); return; }
    let raf; const st = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - st) / dur); const e = 1 - Math.pow(1 - p, 3);
      setVal(to * e); if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  const shown = Number.isInteger(to) ? Math.floor(val).toLocaleString() : val.toFixed(1);
  return <span ref={ref} className={`s4-num ${className}`} style={style}>{prefix}{shown}{suffix}</span>;
}

// ── Sparkline (seeded, themed) ─────────────────────────────
export function Sparkline({ seed = 1, w = 120, h = 34, style }) {
  const id = `s4sp${seed}`;
  let s = seed * 9301 + 49297;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const n = 24, pad = 2; const vals = []; let v = 0.5;
  for (let i = 0; i < n; i++) { v += (rnd() - 0.45) * 0.28; v = Math.max(0.08, Math.min(0.95, v)); vals.push(v); }
  const X = (i) => pad + (i / (n - 1)) * (w - pad * 2);
  const Y = (val) => h - pad - val * (h - pad * 2);
  let line = '', area = `M${pad},${h - pad}`;
  vals.forEach((val, i) => { const x = X(i).toFixed(1), y = Y(val).toFixed(1); line += (i ? 'L' : 'M') + x + ',' + y; area += 'L' + x + ',' + y; });
  area += `L${w - pad},${h - pad}Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: h, display: 'block', ...style }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="var(--accent)" stopOpacity="0.35" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
      </linearGradient></defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

// ── HUD button ─────────────────────────────────────────────
export function Btn({ children, ghost, shine = true, className = '', ...rest }) {
  return (
    <button className={`s4-btn ${ghost ? 'ghost' : ''} ${className}`} {...rest}>
      {children}{shine && !ghost && <span className="shine" />}
    </button>
  );
}

// ── Holographic hero (lazy 3D core with glow fallback) ─────
export function HoloHero({ accent = 'var(--accent)', resolvedAccent = '#6366f1', variant = 'core', children, coreStyle = {}, style = {}, className = '' }) {
  return (
    <div className={`s4-holo ${className}`} style={style}>
      <div className="canvas-wrap" style={coreStyle}>
        <HoloBoundary fallback={<div className="fallback" />}>
          <Suspense fallback={<div className="fallback" />}>
            <HoloCore accent={resolvedAccent} variant={variant} />
          </Suspense>
        </HoloBoundary>
      </div>
      <div className="content">{children}</div>
    </div>
  );
}

// ── ease hook (instrument power-on) ─────────────────────────
export function useEase(target, dur = 1500) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); return; }
    let raf; const st = performance.now();
    const step = (n) => { const p = Math.min(1, (n - st) / dur); const e = 1 - Math.pow(1 - p, 4); setV(target * e); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

// ── aerospace radial gauge (ticks · arc · needle) ───────────
function gP(c, r, deg) { const a = deg * Math.PI / 180; return [c + r * Math.cos(a), c + r * Math.sin(a)]; }
function gArc(c, r, a0, a1) { const [x0, y0] = gP(c, r, a0), [x1, y1] = gP(c, r, a1); const large = (a1 - a0) % 360 > 180 ? 1 : 0; return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)}`; }

export function Gauge({ value = 0.7, size = 200, mini = false, animate = true, style }) {
  const eased = useEase(value, 1500);
  const v = Math.max(0, Math.min(1, animate ? eased : value));
  const S = size, c = S / 2, R = S * 0.42, start = 135, sweep = 270;
  const vA = start + sweep * v, N = mini ? 30 : 60, ticks = [];
  for (let i = 0; i <= N; i++) {
    const major = i % 5 === 0, a = start + sweep * (i / N);
    const [x1, y1] = gP(c, R, a), [x2, y2] = gP(c, R - (major ? S * 0.07 : S * 0.04), a);
    ticks.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={major ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.16)'} strokeWidth={major ? 1.4 : 0.8} />);
  }
  const [nx, ny] = gP(c, R - S * 0.10, vA);
  return (
    <svg viewBox={`0 0 ${S} ${S}`} style={{ width: '100%', height: '100%', ...style }}>
      <circle cx={c} cy={c} r={R + S * 0.03} fill="none" stroke="rgba(255,255,255,0.08)" />
      <circle cx={c} cy={c} r={R - S * 0.13} fill="none" stroke="rgba(255,255,255,0.05)" />
      {ticks}
      {v > 0.01 && <path d={gArc(c, R - S * 0.065, start, vA)} fill="none" stroke="var(--accent)" strokeWidth={S * 0.03} strokeLinecap="round"  />}
      <line x1={c} y1={c} x2={nx} y2={ny} stroke="#fff" strokeWidth={S * 0.012} strokeLinecap="round" />
      <circle cx={c} cy={c} r={S * 0.03} fill="var(--accent)"  />
      <circle cx={c} cy={c} r={S * 0.012} fill="#fff" />
    </svg>
  );
}

// ── spatial parallax deck (3D tilt on mouse) ────────────────
export function SpatialDeck({ children, intensity = 6, className = '', style }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current; if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const inner = el.firstElementChild; if (!inner) return;
    const move = (e) => { const r = el.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; inner.style.transform = `rotateX(${(-py * intensity).toFixed(2)}deg) rotateY(${(px * intensity).toFixed(2)}deg)`; };
    const leave = () => { inner.style.transform = 'rotateX(0deg) rotateY(0deg)'; };
    el.addEventListener('mousemove', move); el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
  }, [intensity]);
  return <div ref={ref} className={className} style={{ perspective: '1400px', ...style }}><div style={{ transformStyle: 'preserve-3d', transition: 'transform .25s ease-out' }}>{children}</div></div>;
}

// ── live telemetry rows (with jitter) ───────────────────────
export function Telemetry({ rows }) {
  const [vals, setVals] = useState(() => rows.map(r => r.base));
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setVals(rows.map(r => Math.round(r.base + (Math.random() - 0.5) * r.base * 0.004))), 1500);
    return () => clearInterval(id);
  }, [rows]);
  return (
    <div className="s4-telem">
      {rows.map((r, i) => (
        <div className="s4-trow" key={r.k}>
          <span className="k">{r.k}</span>
          <span className="val">{r.prefix || ''}<b>{vals[i].toLocaleString()}</b>{r.suffix || ''}</span>
        </div>
      ))}
    </div>
  );
}

// ── attitude horizon (banks + pitches in --accent) ──────────
export function Horizon({ height = 44 }) {
  const ref = useRef();
  useEffect(() => {
    const cv = ref.current; if (!cv) return; const hx = cv.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf, ht = 0, hw, hh;
    const sz = () => { const r = cv.getBoundingClientRect(); hw = cv.width = r.width * 2; hh = cv.height = r.height * 2; hx.setTransform(2, 0, 0, 2, 0, 0); };
    const hexA = (hex, a) => { hex = (hex || '#6366F1').replace('#', ''); if (hex.length === 3) hex = hex.split('').map(x => x + x).join(''); const n = parseInt(hex, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
    sz();
    const draw = () => {
      const w = hw / 2, h = hh / 2; hx.clearRect(0, 0, w, h);
      const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      const mid = h / 2 + (reduce ? 0 : Math.sin(ht * 0.02) * 6), tilt = reduce ? 0 : Math.sin(ht * 0.013) * 0.08;
      hx.save(); hx.translate(w / 2, mid); hx.rotate(tilt);
      hx.fillStyle = hexA(acc, 0.14); hx.fillRect(-w, -h, w * 2, h);
      hx.fillStyle = 'rgba(255,255,255,0.03)'; hx.fillRect(-w, 0, w * 2, h);
      hx.strokeStyle = hexA(acc, 0.8); hx.lineWidth = 1.4; hx.beginPath(); hx.moveTo(-w, 0); hx.lineTo(w, 0); hx.stroke();
      for (let i = -2; i <= 2; i++) { if (!i) continue; const y = i * 10; hx.strokeStyle = 'rgba(255,255,255,0.25)'; hx.lineWidth = 1; hx.beginPath(); hx.moveTo(-14, y); hx.lineTo(14, y); hx.stroke(); }
      hx.restore();
      hx.strokeStyle = '#fff'; hx.lineWidth = 1.5; hx.beginPath();
      hx.moveTo(w / 2 - 16, h / 2); hx.lineTo(w / 2 - 4, h / 2); hx.moveTo(w / 2 + 4, h / 2); hx.lineTo(w / 2 + 16, h / 2); hx.moveTo(w / 2, h / 2 - 3); hx.lineTo(w / 2, h / 2 + 3); hx.stroke();
      ht++; if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', sz);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', sz); };
  }, []);
  return <div className="s4-horizon" style={{ height }}><canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} /></div>;
}

// ── CommandDeck — per-door instrument hero (consistent system, unique signature) ──
export function CommandDeck({
  door, accent, variant = 'core', concept, code,
  integrity = 0.9, integrityLabel = 'System Integrity',
  vitals = [], telemetry = [], actions,
}) {
  const pct = +(integrity * 100).toFixed(1);
  return (
    <div className="s4hud" style={{ ['--accent']: accent, color: '#fff' }}>
      <StatusRail door={door} />
      <SpatialDeck intensity={5} style={{ marginTop: 16 }}>
        <div className="s4-deck-grid">
          {/* SYSTEM VITALS */}
          <GlassPanel className="spatial lift" label="System Vitals" tag="LIVE">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {vitals.map(v => (
                <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', ['--accent']: v.color || accent }}>
                  <div style={{ width: 40, height: 40, flexShrink: 0 }}><Gauge value={v.pct / 100} size={40} mini /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#CBD5E1', fontSize: 11 }}>{v.label}</div>
                    <div className="s4-num" style={{ color: v.color || accent, fontSize: 11, fontWeight: 700, fontFamily: "'Satoshi',sans-serif", letterSpacing: '0.06em' }}>{v.pct}%</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* SIGNATURE HERO */}
          <HoloHero resolvedAccent={accent} variant={variant} className="s4-glass spatial lift"
            style={{ padding: 18, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} coreStyle={{ opacity: 0.5 }}>
            <span className="s4-bracket tl" /><span className="s4-bracket tr" /><span className="s4-bracket bl" /><span className="s4-bracket br" />
            <div className="s4-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>{integrityLabel}</span><span className="s4-accent">{code}</span>
            </div>
            <div style={{ position: 'relative', width: '100%', maxWidth: 300, aspectRatio: '1', margin: '0 auto', flex: 1, display: 'grid', placeItems: 'center' }}>
              <div style={{ position: 'absolute', inset: 0 }}><Gauge value={integrity} size={280} /></div>
              <svg className="s4-radar" viewBox="0 0 280 280" style={{ position: 'absolute', inset: 0 }}>
                <defs><linearGradient id={`rg${code}`} x1="0" x2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity="0.5" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs>
                <line x1="140" y1="140" x2="140" y2="24" stroke={`url(#rg${code})`} strokeWidth="2" />
              </svg>
              <div className="s4-readcenter">
                <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontWeight: 500, fontSize: 34, color: '#fff' }}><CountUp to={pct} /></div>
                <div className="s4-label" style={{ marginTop: 4 }}>{integrityLabel}</div>
              </div>
            </div>
            {actions && <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>{actions}</div>}
          </HoloHero>

          {/* TELEMETRY + HORIZON */}
          <GlassPanel className="spatial lift" label="Telemetry" tag="STREAM" style={{ display: 'flex', flexDirection: 'column' }}>
            <Telemetry rows={telemetry} />
            <div className="s4-label" style={{ marginTop: 14, marginBottom: 8 }}><span>Attitude</span><span className="s4-accent">±</span></div>
            <Horizon height={46} />
          </GlassPanel>
        </div>
      </SpatialDeck>

      {concept && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 12,
          background: `color-mix(in srgb, ${accent} 7%, transparent)`, border: `1px solid color-mix(in srgb, ${accent} 22%, transparent)` }}>
          <span className="s4-dot" />
          <span className="s4-label s4-accent">{code}</span>
          <span style={{ color: '#CBD5E1', fontSize: 12.5, flex: 1 }}>{concept}</span>
        </div>
      )}
    </div>
  );
}

export { HoloCore };
