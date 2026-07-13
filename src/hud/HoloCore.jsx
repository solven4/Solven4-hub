import { useEffect, useRef } from 'react';

// SOLVEN4 holographic core — pure Canvas 3D (rotating wireframe geodesic +
// orbiting nodes, perspective-projected). No WebGL library → renders everywhere,
// zero white-screen risk. Tinted by `accent`.
const PHI = 1.618033988749;
// icosahedron vertices
const V = [
  [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
  [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
  [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
];
// edges (pairs within edge length)
const E = (() => {
  const e = [];
  for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) {
    const d = (V[i][0] - V[j][0]) ** 2 + (V[i][1] - V[j][1]) ** 2 + (V[i][2] - V[j][2]) ** 2;
    if (d < 4.05) e.push([i, j]);
  }
  return e;
})();

function hexToRgb(h) {
  h = (h || '#6366f1').replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join('');
  const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function HoloCore({ accent = '#6366f1', className, style }) {
  const ref = useRef();
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf, W, H, DPR, t = 0;
    const [r, g, b] = hexToRgb(accent);
    const rgb = `${r},${g},${b}`;

    const size = () => {
      DPR = Math.min(devicePixelRatio || 1, 2);
      const rect = cv.getBoundingClientRect(); W = rect.width || 300; H = rect.height || 300;
      cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    size();

    const rot = (p, ax, ay) => {
      let [x, y, z] = p;
      let x1 = x * Math.cos(ay) + z * Math.sin(ay), z1 = -x * Math.sin(ay) + z * Math.cos(ay);
      let y1 = y * Math.cos(ax) - z1 * Math.sin(ax), z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
      return [x1, y1, z2];
    };

    const drawWire = (ax, ay, scale, alpha, lw) => {
      const cx = W / 2, cy = H / 2, f = 5;
      const pts = V.map(p => {
        const [x, y, z] = rot(p, ax, ay);
        const pp = f / (f + z); return [cx + x * pp * scale, cy + y * pp * scale, z];
      });
      // edges
      E.forEach(([i, j]) => {
        const depth = (pts[i][2] + pts[j][2]) / 2;
        const a = alpha * (0.35 + 0.4 * (1 - (depth + PHI) / (2 * PHI)));
        ctx.strokeStyle = `rgba(${rgb},${a.toFixed(3)})`;
        ctx.lineWidth = lw; ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke();
      });
      // vertices
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p[0], p[1], 1.8, 0, 7);
        ctx.fillStyle = `rgba(${rgb},${alpha})`; ctx.shadowColor = accent; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.34;
      // soft core glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.8);
      grad.addColorStop(0, `rgba(${rgb},0.16)`); grad.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

      const spin = reduce ? 0.6 : t * 0.0004;
      // two nested wireframes counter-rotating (depth)
      drawWire(spin * 0.7, spin, R, 0.7, 1.1);
      drawWire(-spin * 0.5 + 0.6, -spin * 1.3, R * 0.6, 0.4, 0.9);

      // orbiting nodes
      const n = 6;
      for (let i = 0; i < n; i++) {
        const a = (reduce ? 0 : t * 0.0009) * (i % 2 ? 1 : -1) + (i / n) * Math.PI * 2;
        const rr = R * (1.25 + (i % 3) * 0.12);
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.9;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, 7);
        ctx.fillStyle = `rgba(${rgb},0.9)`; ctx.shadowColor = accent; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
      }
      // pulsing center
      const pr = R * 0.12 * (1 + (reduce ? 0 : Math.sin(t * 0.003) * 0.15));
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr * 3);
      cg.addColorStop(0, 'rgba(255,255,255,0.9)'); cg.addColorStop(0.4, `rgba(${rgb},0.8)`); cg.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, pr * 3, 0, 7); ctx.fill();

      t += 16;
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', size);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size); };
  }, [accent]);

  return <canvas ref={ref} className={className} style={{ width: '100%', height: '100%', display: 'block', ...style }} />;
}
