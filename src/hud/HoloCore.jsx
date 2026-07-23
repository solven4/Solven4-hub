import { useEffect, useRef } from 'react';

// SOLVEN4 signature instrument — pure Canvas (no WebGL lib → renders everywhere).
// variant per door concept: core (HUB) · pulse (EDGE) · globe-ish/network (FORGE) ·
// neural (ORACLE) · reactor (NEXUS). Tinted by `accent`.
const PHI = 1.618033988749;
const V = [
  [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
  [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
  [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
];
const E = (() => { const e = []; for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) { const d = (V[i][0] - V[j][0]) ** 2 + (V[i][1] - V[j][1]) ** 2 + (V[i][2] - V[j][2]) ** 2; if (d < 4.05) e.push([i, j]); } return e; })();
function hexToRgb(h) { h = (h || '#6366f1').replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }

export default function HoloCore({ accent = '#6366f1', variant = 'core', className, style }) {
  const ref = useRef();
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf, W, H, DPR, t = 0;
    const [r, g, b] = hexToRgb(accent); const rgb = `${r},${g},${b}`;

    const size = () => { DPR = Math.min(devicePixelRatio || 1, 2); const rect = cv.getBoundingClientRect(); W = rect.width || 300; H = rect.height || 300; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
    size();

    // per-variant state
    let neural = [], parts = [], wave = [];
    const rand = (a, b2) => a + Math.random() * (b2 - a);
    if (variant === 'neural' || variant === 'network') {
      neural = Array.from({ length: variant === 'network' ? 22 : 15 }, () => {
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        return { x: Math.sin(ph) * Math.cos(th), y: Math.sin(ph) * Math.sin(th), z: Math.cos(ph), p: Math.random() * 6 };
      });
    }
    if (variant === 'reactor') parts = Array.from({ length: 46 }, () => ({ a: rand(0, 7), r: rand(0.2, 1.3), sp: rand(0.004, 0.012), rr: rand(0.001, 0.004) }));

    const glow = () => { const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.5; const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, `rgba(${rgb},0.15)`); gr.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); };
    const rot = (p, ax, ay) => { let [x, y, z] = p; let x1 = x * Math.cos(ay) + z * Math.sin(ay), z1 = -x * Math.sin(ay) + z * Math.cos(ay); let y1 = y * Math.cos(ax) - z1 * Math.sin(ax), z2 = y * Math.sin(ax) + z1 * Math.cos(ax); return [x1, y1, z2]; };

    function drawCore() {
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.34, f = 5, spin = reduce ? 0.6 : t * 0.0004;
      const wire = (ax, ay, scale, alpha, lw) => {
        const pts = V.map(p => { const [x, y, z] = rot(p, ax, ay); const pp = f / (f + z); return [cx + x * pp * scale, cy + y * pp * scale, z]; });
        E.forEach(([i, j]) => { const depth = (pts[i][2] + pts[j][2]) / 2; const a = alpha * (0.35 + 0.4 * (1 - (depth + PHI) / (2 * PHI))); ctx.strokeStyle = `rgba(${rgb},${a.toFixed(3)})`; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke(); });
        pts.forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 1.8, 0, 7); ctx.fillStyle = `rgba(${rgb},${alpha})`;  ctx.fill(); });
      };
      wire(spin * 0.7, spin, R, 0.7, 1.1); wire(-spin * 0.5 + 0.6, -spin * 1.3, R * 0.6, 0.4, 0.9);
      centerPulse(cx, cy, R * 0.12);
    }

    function drawNeural() { // ORACLE brain / FORGE network
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.36, f = 5, spin = reduce ? 0.5 : t * 0.00035;
      const pts = neural.map(n => { const [x, y, z] = rot([n.x, n.y, n.z], spin * 0.6, spin); const pp = f / (f + z * 1.4); return { x: cx + x * pp * R, y: cy + y * pp * R * (variant === 'network' ? 0.62 : 1), z, p: n.p }; });
      // connections between near nodes
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
        if (d < R * 0.9) { const a = (1 - d / (R * 0.9)) * 0.35; ctx.strokeStyle = `rgba(${rgb},${a.toFixed(3)})`; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
      }
      if (variant === 'network') { // wireframe glass globe
        ctx.strokeStyle = `rgba(${rgb},0.22)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.62, 0, 0, 7); ctx.stroke();           // equator
        [0.5, 0.85].forEach(lat => { const ry = R * 0.62 * Math.cos(Math.asin(lat)); const oy = R * lat * 0.62;
          ctx.strokeStyle = `rgba(${rgb},0.12)`; ctx.beginPath(); ctx.ellipse(cx, cy - oy, R * Math.cos(Math.asin(lat)), ry, 0, 0, 7); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(cx, cy + oy, R * Math.cos(Math.asin(lat)), ry, 0, 0, 7); ctx.stroke(); });
        ctx.strokeStyle = `rgba(${rgb},0.16)`; ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.34, R, 0, 0, 7); ctx.stroke(); // meridian
        ctx.strokeStyle = `rgba(${rgb},0.30)`; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();               // limb
      }
      pts.forEach(p => { const pr = 2 + (reduce ? 0 : Math.sin(t * 0.004 + p.p) * 1.2); ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.6, pr), 0, 7); ctx.fillStyle = `rgba(${rgb},0.95)`;  ctx.fill(); });
      centerPulse(cx, cy, R * 0.1);
    }

    function drawPulse() { // EDGE market oscilloscope
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.42;
      // grid
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
      for (let gx = cx - R; gx <= cx + R; gx += R / 4) { ctx.beginPath(); ctx.moveTo(gx, cy - R * 0.6); ctx.lineTo(gx, cy + R * 0.6); ctx.stroke(); }
      for (let gy = cy - R * 0.6; gy <= cy + R * 0.6; gy += R * 0.3) { ctx.beginPath(); ctx.moveTo(cx - R, gy); ctx.lineTo(cx + R, gy); ctx.stroke(); }
      // waveform
      ctx.beginPath(); const N = 120;
      for (let i = 0; i <= N; i++) {
        const x = cx - R + (i / N) * R * 2; const ph = i * 0.22 - (reduce ? 0 : t * 0.006);
        let y = Math.sin(ph) * R * 0.18 + Math.sin(ph * 2.3) * R * 0.09;
        if (i % 30 === 12) y += Math.sin(ph * 6) * R * 0.22; // spikes
        i ? ctx.lineTo(x, cy + y) : ctx.moveTo(x, cy + y);
      }
      ctx.strokeStyle = `rgba(${rgb},0.9)`; ctx.lineWidth = 2;  ctx.stroke();
      // scan dot
      const sx = cx - R + ((reduce ? 0.5 : (t * 0.06 % (R * 2)) / (R * 2))) * R * 2;
      ctx.beginPath(); ctx.arc(sx, cy, 3, 0, 7); ctx.fillStyle = '#fff';  ctx.fill();
    }

    function drawReactor() { // NEXUS business power core
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.36, spin = reduce ? 0 : t * 0.001;
      [1, 0.72, 0.46].forEach((rf, i) => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(spin * (i % 2 ? -1 : 1) + i); ctx.strokeStyle = `rgba(${rgb},${0.4 - i * 0.08})`; ctx.lineWidth = 1.2; ctx.setLineDash([4, 8]); ctx.beginPath(); ctx.ellipse(0, 0, R * rf, R * rf * 0.9, 0, 0, 7); ctx.stroke(); ctx.restore(); });
      ctx.setLineDash([]);
      parts.forEach(p => { if (!reduce) { p.a += p.sp; p.r -= p.rr; if (p.r < 0.16) p.r = 1.3; } const x = cx + Math.cos(p.a) * R * p.r, y = cy + Math.sin(p.a) * R * p.r * 0.9; ctx.beginPath(); ctx.arc(x, y, 1.5, 0, 7); ctx.fillStyle = `rgba(${rgb},${(1.3 - p.r).toFixed(2)})`; ctx.fill(); });
      centerPulse(cx, cy, R * 0.16);
    }

    function centerPulse(cx, cy, base) { const pr = base * (1 + (reduce ? 0 : Math.sin(t * 0.003) * 0.15)); const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr * 1.6); cg.addColorStop(0, `rgba(${rgb},0.35)`); cg.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, pr * 1.6, 0, 7); ctx.fill(); }

    const draw = () => {
      ctx.clearRect(0, 0, W, H); glow();
      if (variant === 'pulse') drawPulse();
      else if (variant === 'reactor') drawReactor();
      else if (variant === 'neural' || variant === 'network') drawNeural();
      else drawCore();
      t += 16; if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', size);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size); };
  }, [accent, variant]);

  return <canvas ref={ref} className={className} style={{ width: '100%', height: '100%', display: 'block', ...style }} />;
}
