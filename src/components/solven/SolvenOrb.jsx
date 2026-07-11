import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Brain, Send, X, ArrowRight, Zap, ChevronUp } from 'lucide-react';

/* ══════════════════════════════════════════════════════
   SOLVEN FLOATING ORBS — Persistent cross-door assistant
   Lives in AppLayout, overlays every page including iframes
══════════════════════════════════════════════════════ */

const DOOR_CONTEXT = {
  edge: {
    name: 'S4 EDGE', color: '#06B6D4', emoji: '📊',
    greeting: 'Monitoring your live trades & market setups.',
    insights: [
      { text: 'Your London session win rate is 74% — 3 setups forming now', type: 'PATTERN' },
      { text: 'EURUSD open risk at 2.1% — above your 1.5% limit', type: 'RISK' },
      { text: 'Gold breakout confirmed above 2,380 — watching trigger', type: 'MARKET' },
    ],
    quick: ['View open trades', 'Check risk exposure', 'See active signals'],
  },
  forge: {
    name: 'S4 FORGE', color: '#D4A843', emoji: '🔥',
    greeting: 'Managing your IB network & commissions.',
    insights: [
      { text: '3 inactive traders haven\'t placed trades in 14 days — re-engage now', type: 'NETWORK' },
      { text: 'Your XAUUSD signal reached 47 traders — 12 opened positions', type: 'SIGNAL' },
      { text: 'Commission opportunity: $340 pending from 8 uncommissioned traders', type: 'REVENUE' },
    ],
    quick: ['Broadcast signal', 'View my traders', 'Check commissions'],
  },
  oracle: {
    name: 'S4 ORACLE', color: '#10B981', emoji: '🎓',
    greeting: 'Tracking your learning progress & schedule.',
    insights: [
      { text: 'You\'re 3 days behind your learning schedule — Lesson 4 awaits', type: 'LEARNING' },
      { text: 'Completing SMC module unlocks Copy Trading feature', type: 'MILESTONE' },
      { text: 'Today\'s macro brief is live: DXY divergence — read before trading', type: 'BRIEFING' },
    ],
    quick: ['Resume lesson', 'View my progress', 'Read today\'s brief'],
  },
  nexus: {
    name: 'S4 NEXUS', color: '#EF4444', emoji: '🚀',
    greeting: 'Managing your pipeline & business growth.',
    insights: [
      { text: 'Lead @imad qualified — move to "Offer Sent" stage now', type: 'LEAD' },
      { text: '$2,100 in uncommitted pipeline — 3 deals need follow-up', type: 'PIPELINE' },
      { text: 'Engagement drops 40% without weekly performance posts', type: 'GROWTH' },
    ],
    quick: ['View pipeline', 'Follow up leads', 'Draft post'],
  },
};

const HUB_CONTEXT = {
  name: 'SOLVEN4 HUB', color: '#6366F1', emoji: '⚡',
  greeting: 'Your AI operating system is fully active.',
  insights: [
    { text: 'Platform revenue up 12% — biggest lever is FORGE network activation', type: 'CEO' },
    { text: '5 execution orders pending across all 4 doors — approve to execute', type: 'COO' },
    { text: 'Your 30-day forecast: $8,090 combined revenue if all orders executed', type: 'CFO' },
  ],
  quick: ['View SOLVEN AI', 'Open EDGE', 'Check all orders'],
};

/* Mini canvas orb animation */
function OrbCanvas({ color = '#6366F1', size = 44, active = false }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = size * 2;
    const H = canvas.height = size * 2;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    const cx = W / 2, cy = H / 2, R = size * 0.65;

    const rgb = color.slice(1).match(/.{2}/g).map(h => parseInt(h, 16)).join(',');

    const particles = Array.from({ length: 28 }, (_, i) => ({
      angle: (i / 28) * Math.PI * 2,
      r: R * (0.85 + Math.random() * 0.4),
      speed: 0.015 + Math.random() * 0.02,
      sz: 1 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    }));

    function draw(t) {
      ctx.clearRect(0, 0, W, H);

      // Outer glow
      if (active) {
        const atmo = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.5);
        atmo.addColorStop(0, `rgba(${rgb},0.15)`);
        atmo.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(cx, cy, R * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = atmo; ctx.fill();
      }

      // Particles
      particles.forEach(p => {
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle) * p.r;
        const y = cy + Math.sin(p.angle) * p.r;
        const pulse = 0.4 + 0.6 * Math.sin(t * 3 + p.phase);
        ctx.beginPath(); ctx.arc(x, y, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${pulse * 0.7})`; ctx.fill();
      });

      // Core
      const core = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, 1, cx, cy, R * 0.7);
      core.addColorStop(0, '#fff');
      core.addColorStop(0.3, color);
      core.addColorStop(1, '#0B1220');
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = core; ctx.fill();

      // Scan ring
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 1.5);
      ctx.beginPath(); ctx.arc(0, 0, R * 0.5, 0, Math.PI * 0.8);
      ctx.strokeStyle = `rgba(255,255,255,0.35)`; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();

      // Center eye
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill();
    }

    function loop() {
      tRef.current += 0.016;
      draw(tRef.current);
      animRef.current = requestAnimationFrame(loop);
    }
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [color, size, active]);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
}

/* ════════════════ MAIN FLOATING COMPONENT ════════════════ */
export default function SolvenOrb() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pulse, setPulse] = useState(false);
  const chatRef = useRef(null);

  // Detect current door
  const doorId = location.pathname.startsWith('/dashboard/door/')
    ? location.pathname.split('/dashboard/door/')[1]?.split('/')[0]
    : null;

  const ctx = doorId ? DOOR_CONTEXT[doorId] || HUB_CONTEXT : HUB_CONTEXT;
  const isAgentPage = location.pathname === '/dashboard/agent';

  // Greet on door change
  useEffect(() => {
    setMessages([{
      role: 'agent',
      text: `${ctx.emoji} ${ctx.greeting}`,
    }]);
    if (!open) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 3000);
      return () => clearTimeout(t);
    }
  }, [doorId]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isTyping]);

  function sendMessage() {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages(p => [...p, { role: 'user', text: msg }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        `Analyzing your ${ctx.name} data... Based on your current activity, I recommend focusing on your highest-leverage action: ${ctx.insights[0]?.text?.split('—')[0]?.trim() || 'reviewing your pending orders'}.`,
        `As your AI business assistant, I see 3 opportunities in ${ctx.name} right now. The most urgent: ${ctx.insights[1]?.text || 'check your pending notifications'}.`,
        `Understood. I'm cross-referencing this with your performance history across all 4 doors. My recommendation: ${ctx.quick[0] || 'review your dashboard'} — that will have the highest impact today.`,
      ];
      setMessages(p => [...p, { role: 'agent', text: responses[Math.floor(Math.random() * responses.length)] }]);
    }, 1800);
  }

  if (isAgentPage) return null; // Don't show orb on the full SOLVEN AI page

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>

      {/* Expanded Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              width: '320px',
              background: 'rgba(11,18,32,0.98)',
              border: `1px solid ${ctx.color}30`,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 40px ${ctx.color}15`,
              backdropFilter: 'blur(40px)',
            }}>

            {/* Header */}
            <div style={{
              padding: '14px 16px',
              background: `${ctx.color}10`,
              borderBottom: `1px solid ${ctx.color}20`,
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <OrbCanvas color={ctx.color} size={32} active />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em' }}>
                  SOLVEN AI
                </div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: ctx.color, letterSpacing: '0.15em' }}>
                  {ctx.name}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => { navigate('/dashboard/agent'); setOpen(false); }}
                  style={{ background: `${ctx.color}20`, border: `1px solid ${ctx.color}40`, borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: ctx.color, fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  Full AI <ArrowRight size={9} />
                </button>
                <button onClick={() => setOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#8899B4', display: 'flex', alignItems: 'center' }}>
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Live Insights */}
            <div style={{ padding: '12px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', letterSpacing: '0.2em', color: '#8899B4', marginBottom: '8px' }}>
                LIVE INSIGHTS · {ctx.name}
              </div>
              {ctx.insights.map((ins, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '8px', alignItems: 'flex-start',
                  marginBottom: i < ctx.insights.length - 1 ? '7px' : 0,
                  padding: '6px 8px', borderRadius: '7px',
                  background: i === 0 ? `${ctx.color}10` : 'transparent',
                  border: `1px solid ${i === 0 ? ctx.color + '20' : 'transparent'}`,
                }}>
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif", fontSize: '7px', fontWeight: 700,
                    color: ctx.color, background: `${ctx.color}18`, borderRadius: '3px', padding: '1px 4px',
                    flexShrink: 0, marginTop: '1px',
                  }}>{ins.type}</div>
                  <p style={{ color: '#CBD5E1', fontSize: '11px', lineHeight: 1.5, margin: 0 }}>{ins.text}</p>
                </div>
              ))}
            </div>

            {/* Chat */}
            <div ref={chatRef} style={{ height: '160px', overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '6px' }}>
                  {msg.role === 'agent' && (
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: `linear-gradient(135deg,${ctx.color},${ctx.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Brain size={11} color="#fff" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '80%', padding: '7px 10px', fontSize: '11px', lineHeight: 1.5, color: '#CBD5E1',
                    borderRadius: msg.role === 'user' ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
                    background: msg.role === 'user' ? `${ctx.color}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${msg.role === 'user' ? ctx.color + '30' : 'rgba(255,255,255,0.06)'}`,
                  }}>{msg.text}</div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: `linear-gradient(135deg,${ctx.color},${ctx.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Brain size={11} color="#fff" />
                  </div>
                  <div style={{ padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {[0,1,2].map(d => <div key={d} style={{ width: '4px', height: '4px', borderRadius: '50%', background: ctx.color, animation: `sorb-bounce 1.2s ${d * 0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {ctx.quick.map((q, i) => (
                <button key={i} onClick={() => { setInput(q); }}
                  style={{
                    padding: '4px 8px', borderRadius: '5px', border: `1px solid ${ctx.color}25`,
                    background: `${ctx.color}10`, color: ctx.color, fontSize: '10px',
                    cursor: 'pointer', fontWeight: 600,
                  }}>{q}</button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '6px' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={`Ask SOLVEN about ${ctx.name}...`}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '7px', padding: '7px 10px', color: '#fff', fontSize: '11px', outline: 'none',
                }}
              />
              <button onClick={sendMessage}
                style={{
                  background: `linear-gradient(135deg,${ctx.color},${ctx.color}cc)`,
                  border: 'none', borderRadius: '7px', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                }}>
                <Send size={12} color="#fff" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Orb Button */}
      <div style={{ position: 'relative' }}>
        {/* Pulse ring when notification */}
        {pulse && !open && (
          <div style={{
            position: 'absolute', inset: '-6px', borderRadius: '50%',
            border: `2px solid ${ctx.color}`,
            animation: 'sorb-ring 1.5s ease-out 3',
            pointerEvents: 'none',
          }} />
        )}

        {/* Notification badge */}
        <div style={{
          position: 'absolute', top: '-4px', right: '-4px',
          width: '16px', height: '16px', borderRadius: '50%',
          background: '#EF4444', border: '2px solid #03080F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Orbitron', sans-serif", fontSize: '8px', fontWeight: 700, color: '#fff',
          zIndex: 1,
        }}>3</div>

        <motion.button
          onClick={() => setOpen(v => !v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'rgba(11,18,32,0.98)',
            border: `2px solid ${ctx.color}60`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${ctx.color}30`,
            backdropFilter: 'blur(20px)',
            transition: 'border-color 0.3s',
          }}>
          <OrbCanvas color={ctx.color} size={44} active={open} />
        </motion.button>
      </div>

      <style>{`
        @keyframes sorb-bounce {
          0%,80%,100% { transform: translateY(0) }
          40% { transform: translateY(-4px) }
        }
        @keyframes sorb-ring {
          0% { transform: scale(1); opacity: 0.8 }
          100% { transform: scale(1.6); opacity: 0 }
        }
      `}</style>
    </div>
  );
}
