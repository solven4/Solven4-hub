import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SOLVEN4 3D Avatar — uses Canvas2D (no npm needed) to simulate a WebGL-like
// holographic sphere with orbiting rings, particle swarm, and pulsing core.
// 5 states: idle, thinking, speaking, alert, celebratin

const DOOR_COLORS = {
  hub:    '#6366F1',
  edge:   '#06B6D4',
  forge:  '#D4A843',
  oracle: '#10B981',
  nexus:  '#EF4444',
};

const STATE_CONFIG = {
  idle:        { label: 'SOLVEN READY',    color: '#6366F1', speed: 0.4,  particleCount: 120, pulseScale: 1.0 },
  thinking:    { label: 'PROCESSING...',   color: '#3B82F6', speed: 1.2,  particleCount: 200, pulseScale: 1.1 },
  speaking:    { label: 'BROADCASTING',    color: '#10B981', speed: 0.8,  particleCount: 160, pulseScale: 1.15 },
  alert:       { label: 'ALERT DETECTED',  color: '#EF4444', speed: 2.0,  particleCount: 240, pulseScale: 1.2 },
  celebrating: { label: 'GOAL ACHIEVED',   color: '#D4A843', speed: 1.5,  particleCount: 280, pulseScale: 1.25 },
};

function initParticles(count, radius) {
  return Array.from({ length: count }, (_, i) => {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = radius * (0.8 + Math.random() * 0.8);
    return {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: (Math.random() - 0.5) * 0.3,
      size: 1 + Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    };
  });
}

export default function SolvenAvatar({ state = 'idle', size = 280, activeDoor = 'hub', className = '' }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const stateRef  = useRef(state);
  const particles = useRef([]);
  const angle     = useRef(0);
  const pulse     = useRef(0);

  const cfg = STATE_CONFIG[state] ?? STATE_CONFIG.idle;
  const doorColor = DOOR_COLORS[activeDoor] ?? cfg.color;

  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = size, H = size, CX = W / 2, CY = H / 2;
    const R = size * 0.28;

    canvas.width  = W;
    canvas.height = H;

    particles.current = initParticles(200, R);

    const draw = (ts) => {
      const c = STATE_CONFIG[stateRef.current] ?? STATE_CONFIG.idle;
      angle.current += 0.005 * c.speed;
      pulse.current  = (Math.sin(ts * 0.002 * c.speed) + 1) / 2;

      ctx.clearRect(0, 0, W, H);

      // --- Outer ambient glow ---
      const ambGlow = ctx.createRadialGradient(CX, CY, R * 0.5, CX, CY, R * 1.8);
      ambGlow.addColorStop(0,   hexAlpha(c.color, 0.12));
      ambGlow.addColorStop(0.5, hexAlpha(c.color, 0.04));
      ambGlow.addColorStop(1,   'transparent');
      ctx.fillStyle = ambGlow;
      ctx.fillRect(0, 0, W, H);

      // --- Orbiting rings (projected ellipses) ---
      const rings = [
        { tilt: 0.3,  phase: 0,             color: c.color,    alpha: 0.5 },
        { tilt: 0.9,  phase: Math.PI / 2,   color: doorColor,  alpha: 0.35 },
        { tilt: -0.5, phase: Math.PI * 1.3, color: '#ffffff',  alpha: 0.15 },
      ];

      rings.forEach(ring => {
        const a = angle.current + ring.phase;
        const rx = R * 1.35;
        const ry = rx * Math.abs(Math.sin(ring.tilt + a * 0.3));

        ctx.save();
        ctx.strokeStyle = hexAlpha(ring.color, ring.alpha);
        ctx.lineWidth   = 1;
        ctx.shadowColor = ring.color;
        ctx.shadowBlur  = 8;
        ctx.beginPath();
        ctx.ellipse(CX, CY, rx, Math.max(ry, 4), ring.tilt + a * 0.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // --- Particle swarm ---
      const cosA = Math.cos(angle.current);
      const sinA = Math.sin(angle.current);

      particles.current.forEach(p => {
        // Slow drift
        p.x += p.vx * 0.02 * c.speed;
        p.y += p.vy * 0.02 * c.speed;
        p.z += p.vz * 0.02 * c.speed;

        // Keep near sphere surface
        const dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        const target = R * (0.85 + 0.3 * Math.random());
        if (dist > target * 1.2 || dist < R * 0.5) {
          p.vx *= -0.5; p.vy *= -0.5; p.vz *= -0.5;
        }

        // Y-axis rotation
        const rx2 =  p.x * cosA + p.z * sinA;
        const rz  = -p.x * sinA + p.z * cosA;

        // Simple perspective
        const perspective = 400 / (400 + rz);
        const sx = CX + rx2 * perspective;
        const sy = CY + p.y  * perspective;

        const fade = (p.z + R * 1.5) / (R * 3);
        const alpha = p.opacity * fade * (0.6 + 0.4 * Math.sin(ts * 0.003 + p.phase));

        ctx.save();
        ctx.globalAlpha  = alpha * (0.5 + 0.5 * pulse.current);
        ctx.fillStyle    = fade > 0.5 ? c.color : doorColor;
        ctx.shadowColor  = c.color;
        ctx.shadowBlur   = 4;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * perspective, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // --- Core sphere ---
      const sphereGrad = ctx.createRadialGradient(
        CX - R * 0.25, CY - R * 0.25, R * 0.05,
        CX, CY, R,
      );
      sphereGrad.addColorStop(0,   hexAlpha('#ffffff', 0.25));
      sphereGrad.addColorStop(0.3, hexAlpha(c.color, 0.3 + 0.15 * pulse.current));
      sphereGrad.addColorStop(0.7, hexAlpha(doorColor, 0.15));
      sphereGrad.addColorStop(1,   hexAlpha('#000000', 0.6));

      ctx.save();
      ctx.shadowColor = c.color;
      ctx.shadowBlur  = 24 + 16 * pulse.current;
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();
      ctx.restore();

      // --- Glass highlight ---
      const hlGrad = ctx.createRadialGradient(
        CX - R * 0.35, CY - R * 0.38, 0,
        CX - R * 0.1,  CY - R * 0.1,  R * 0.65,
      );
      hlGrad.addColorStop(0,   'rgba(255,255,255,0.22)');
      hlGrad.addColorStop(0.5, 'rgba(255,255,255,0.04)');
      hlGrad.addColorStop(1,   'transparent');
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = hlGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // --- Inner pulsing core ---
      const coreR = R * (0.15 + 0.05 * pulse.current);
      const coreGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreR);
      coreGrad.addColorStop(0, hexAlpha('#ffffff', 0.9));
      coreGrad.addColorStop(0.4, hexAlpha(c.color, 0.7));
      coreGrad.addColorStop(1, 'transparent');
      ctx.save();
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur  = 12;
      ctx.beginPath();
      ctx.arc(CX, CY, coreR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [size, doorColor]);

  return (
    <div className={`relative flex flex-col items-center gap-3 select-none ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="rounded-full"
      />

      {/* State label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase"
          style={{
            background: `${cfg.color}15`,
            borderColor: `${cfg.color}40`,
            color: cfg.color,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: cfg.color }}
          />
          {cfg.label}
        </motion.div>
      </AnimatePresence>

      {/* Door color dots */}
      <div className="flex items-center gap-1.5">
        {Object.entries(DOOR_COLORS).map(([door, color]) => (
          <div
            key={door}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: color,
              opacity: door === activeDoor ? 1 : 0.25,
              transform: door === activeDoor ? 'scale(1.5)' : 'scale(1)',
              boxShadow: door === activeDoor ? `0 0 6px ${color}` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
