import React, { useState } from 'react';
import { X, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DOOR_CONFIG = {
  EDGE:   { label: 'S4 EDGE',   color: '#06B6D4', url: 'https://solven4-edge-six.vercel.app',    subtitle: 'Trading Terminal' },
  FORGE:  { label: 'S4 FORGE',  color: '#D4A843', url: 'https://solven4-forge-pi.vercel.app',    subtitle: 'IB Management' },
  ORACLE: { label: 'S4 ORACLE', color: '#10B981', url: 'https://solven4-oracle-eight.vercel.app', subtitle: 'AI Analytics' },
  NEXUS:  { label: 'S4 NEXUS',  color: '#EF4444', url: 'https://solven4-nexus-self.vercel.app',  subtitle: 'Business Hub' },
};

export default function DoorEmbed({ door, onClose }) {
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const config = DOOR_CONFIG[door];
  if (!config || !door) return null;

  const url = config.url;

  // Minimized taskbar chip
  if (minimized) {
    return (
      <div style={{
        position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 9998, display: 'flex', gap: '8px',
      }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            background: 'rgba(10,12,30,0.95)',
            border: `1px solid ${config.color}40`,
            borderRadius: '12px',
            padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: `0 0 20px ${config.color}20`,
            backdropFilter: 'blur(20px)',
          }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: config.color, boxShadow: `0 0 8px ${config.color}`,
          }} />
          <span style={{
            fontFamily: "'Orbitron',sans-serif", fontSize: '10px',
            color: config.color, fontWeight: 700, letterSpacing: '0.1em',
          }}>
            {config.label}
          </span>
          <button
            onClick={() => setMinimized(false)}
            style={{
              background: `${config.color}20`, border: `1px solid ${config.color}40`,
              borderRadius: '6px', padding: '3px 10px',
              color: config.color, fontSize: '10px', cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
            Restore
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none',
              color: '#94A3B8', cursor: 'pointer', padding: '2px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <X size={12} />
          </button>
        </motion.div>
      </div>
    );
  }

  // Full embed modal dimensions
  const W = maximized ? '100vw' : 'min(1200px, calc(100vw - 280px))';
  const H = maximized ? '100vh' : 'calc(100vh - 40px)';
  const L = maximized ? '0' : '264px'; // 248px sidebar + 16px gap
  const T = maximized ? '0' : '20px';

  return (
    <AnimatePresence>
      <motion.div
        key="door-embed"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          left: L,
          top: T,
          width: W,
          height: H,
          zIndex: 9990,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: maximized ? '0' : '16px',
          overflow: 'hidden',
          boxShadow: `0 0 80px ${config.color}15, 0 40px 80px rgba(0,0,0,0.6)`,
          border: maximized ? 'none' : `1px solid ${config.color}30`,
        }}>

        {/* Header bar */}
        <div style={{
          background: 'rgba(5,5,12,0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${config.color}20`,
          padding: '0 16px',
          height: '48px',
          display: 'flex', alignItems: 'center', gap: '12px',
          flexShrink: 0,
        }}>
          {/* Door identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: `${config.color}15`, border: `1px solid ${config.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: config.color, boxShadow: `0 0 8px ${config.color}`,
              }} />
            </div>
            <div>
              <div style={{
                fontFamily: "'Orbitron',sans-serif", fontSize: '11px',
                color: config.color, fontWeight: 700, letterSpacing: '0.12em',
              }}>
                {config.label}
              </div>
              <div style={{ fontSize: '9px', color: '#94A3B8' }}>{config.subtitle}</div>
            </div>
            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '8px' }}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#10B981', boxShadow: '0 0 6px #10B981',
                animation: 'embedPulse 2s infinite',
              }} />
              <span style={{
                fontSize: '9px', color: '#10B981',
                fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.08em',
              }}>LIVE</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {/* Minimize */}
            <button
              onClick={() => setMinimized(true)}
              style={{
                width: '28px', height: '28px', borderRadius: '7px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer', color: '#94A3B8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Minimize">
              <Minimize2 size={12} />
            </button>
            {/* Maximize / Restore */}
            <button
              onClick={() => setMaximized(v => !v)}
              style={{
                width: '28px', height: '28px', borderRadius: '7px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer', color: '#94A3B8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title={maximized ? 'Restore' : 'Maximize'}>
              {maximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
            {/* Open in new tab */}
            <button
              onClick={() => window.open(url, '_blank')}
              style={{
                width: '28px', height: '28px', borderRadius: '7px',
                background: `${config.color}15`, border: `1px solid ${config.color}30`,
                cursor: 'pointer', color: config.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Open in new tab">
              <ExternalLink size={12} />
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              style={{
                width: '28px', height: '28px', borderRadius: '7px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                cursor: 'pointer', color: '#EF4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Close">
              <X size={12} />
            </button>
          </div>
        </div>

        {/* iFrame */}
        <iframe
          src={url}
          style={{ flex: 1, border: 'none', background: '#05050C' }}
          title={config.label}
          allow="clipboard-read; clipboard-write"
        />

        {/* Pulse animation keyframe injected inline */}
        <style>{`
          @keyframes embedPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
