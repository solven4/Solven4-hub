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
export function HoloHero({ accent = 'var(--accent)', resolvedAccent = '#6366f1', children, coreStyle = {}, style = {}, className = '' }) {
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <div className={`s4-holo ${className}`} style={style}>
      <div className="canvas-wrap" style={coreStyle}>
        {reduce
          ? <div className="fallback" />
          : <HoloBoundary fallback={<div className="fallback" />}>
              <Suspense fallback={<div className="fallback" />}>
                <HoloCore accent={resolvedAccent} />
              </Suspense>
            </HoloBoundary>}
      </div>
      <div className="content">{children}</div>
    </div>
  );
}

export { HoloCore };
