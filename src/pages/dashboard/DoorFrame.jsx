import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Maximize2, RefreshCw } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';

// HUB is the only client that ever calls Supabase's token-refresh endpoint —
// each door disabled its own autoRefreshToken (see their supabaseClient.js)
// specifically so they don't all race to refresh the same shared
// refresh_token. Instead, HUB re-pushes its current (HUB-refreshed) session
// into the iframe on this interval, well inside the ~1hr access-token
// lifetime, so the door's session never actually goes stale.
const REBRIDGE_INTERVAL_MS = 45 * 60 * 1000;

const DOORS = {
  edge:   { label: 'S4 EDGE',   color: '#06B6D4', url: 'https://solven4-edge-six.vercel.app',   desc: 'Trading Intelligence' },
  forge:  { label: 'S4 FORGE',  color: '#D4A843', url: 'https://solven4-forge-pi.vercel.app',   desc: 'IB Management' },
  oracle: { label: 'S4 ORACLE', color: '#10B981', url: 'https://solven4-oracle-eight.vercel.app', desc: 'AI Analytics' },
  nexus:  { label: 'S4 NEXUS',  color: '#EF4444', url: 'https://solven4-nexus-self.vercel.app', desc: 'Business Hub' },
};

export default function DoorFrame() {
  const { doorId } = useParams();
  const navigate = useNavigate();
  const door = DOORS[doorId?.toLowerCase()];
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);

  const bridgeSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'SOLVEN4_AUTH',
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }, '*');
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    const interval = setInterval(bridgeSession, REBRIDGE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [bridgeSession, key]);

  if (!door) {
    navigate('/dashboard/command');
    return null;
  }

  function reload() {
    setLoading(true);
    setKey(k => k + 1);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#05050C' }}>
      <Helmet><title>{door.label} | S4 HUB</title></Helmet>
      {/* Door top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 16px',
        background: 'rgba(10,12,30,0.95)',
        borderBottom: `1px solid ${door.color}30`,
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/dashboard/command')}
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            color: '#94A3B8', fontSize: '12px',
          }}
        >
          <ArrowLeft size={14} /> Back to HUB
        </button>

        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)' }} />

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: `${door.color}10`, border: `1px solid ${door.color}30`,
          borderRadius: '8px', padding: '5px 12px',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: door.color, boxShadow: `0 0 8px ${door.color}` }} />
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', fontWeight: 700, color: door.color, letterSpacing: '0.12em' }}>
            {door.label}
          </span>
          <span style={{ color: '#94A3B8', fontSize: '11px' }}>— {door.desc}</span>
        </div>

        <div style={{ flex: 1 }} />

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '11px' }}>
            <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
            Connecting...
          </div>
        )}

        <button onClick={reload}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#94A3B8', display: 'flex',
          }}>
          <RefreshCw size={13} />
        </button>

        <button
          onClick={() => {
            // window.open() must fire synchronously inside the click handler —
            // browsers drop the "trusted user gesture" the moment you await
            // anything first, and silently block the popup. Open the tab
            // immediately, then point it at the right URL once the session
            // (async) is ready.
            const win = window.open('', '_blank');
            (async () => {
              try {
                const { data: { session } } = await supabase.auth.getSession();
                const url = new URL(door.url);
                if (session) {
                  url.searchParams.set('s4_at', session.access_token);
                  url.searchParams.set('s4_rt', session.refresh_token);
                }
                if (win) win.location.href = url.toString();
              } catch {
                if (win) win.location.href = door.url;
              }
            })();
          }}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#94A3B8', display: 'flex',
          }}
          title="Open in new tab"
        >
          <Maximize2 size={13} />
        </button>
      </div>

      {/* Iframe */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: '#05050C',
            }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '24px' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `2px solid ${door.color}30`,
              }} />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `2px solid transparent`, borderTopColor: door.color,
                animation: 'spin 1s linear infinite',
              }} />
              <div style={{
                position: 'absolute', inset: '20px', borderRadius: '50%',
                background: `${door.color}15`, boxShadow: `0 0 20px ${door.color}30`,
              }} />
            </div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', color: door.color, letterSpacing: '0.2em', marginBottom: '8px' }}>
              LOADING {door.label}
            </div>
            <div style={{ color: '#94A3B8', fontSize: '12px' }}>Connecting to {door.desc}...</div>
          </motion.div>
        )}
        <iframe
          key={key}
          ref={iframeRef}
          src={door.url}
          onLoad={() => {
            setLoading(false);
            bridgeSession();
          }}
          style={{
            width: '100%', height: '100%', border: 'none',
            display: 'block',
          }}
          title={door.label}
        />
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
