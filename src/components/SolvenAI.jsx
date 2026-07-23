import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Brain, Send, X, Trash2, Zap, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

/* ══════════════════════════════════════════════════════
   SOLVEN AI — Upgraded floating assistant for HUB
   Real LLM via supabase.functions.invoke('invoke-llm')
   Cross-door awareness | localStorage memory | Bilingual
══════════════════════════════════════════════════════ */

const MEMORY_KEY = 'solven_ai_memory';
const MAX_MEMORY  = 50;

const DOOR_MAP = {
  ORACLE: { color: '#10B981', url: 'https://solven4-oracle-eight.vercel.app' },
  FORGE:  { color: '#D4A843', url: 'https://solven4-forge-pi.vercel.app' },
  EDGE:   { color: '#06B6D4', url: 'https://solven4-edge-six.vercel.app' },
  NEXUS:  { color: '#EF4444', url: 'https://solven4-nexus-self.vercel.app' },
  HUB:    { color: '#6366F1', url: 'https://solven4-hub.vercel.app' },
};

const QUICK_COMMANDS = [
  { key: 'market_brief',     label: 'Market Brief',    description: 'ORACLE intelligence summary', color: '#10B981', door: 'ORACLE' },
  { key: 'lead_score',       label: 'Score Leads',     description: 'AI lead scoring via FORGE',   color: '#D4A843', door: 'FORGE'  },
  { key: 'trade_check',      label: 'Trade Health',    description: 'EDGE performance analysis',   color: '#06B6D4', door: 'EDGE'   },
  { key: 'network_status',   label: 'Network Status',  description: 'NEXUS network overview',      color: '#EF4444', door: 'NEXUS'  },
  { key: 'portfolio_review', label: 'Portfolio Review',description: 'Vault & commission summary',  color: '#6366F1', door: 'HUB'    },
  { key: 'daily_plan',       label: 'Daily Plan',      description: 'AI-powered action agenda',    color: '#F59E0B', door: 'ALL'    },
];

const EXAMPLE_QUERIES = [
  { en: "What's the market sentiment today?",   ar: "ما هو مزاج السوق اليوم؟" },
  { en: "How are my traders performing?",        ar: "كيف أداء متداولي؟" },
  { en: "Which door should I use for signals?",  ar: "أي باب أستخدم للإشارات؟" },
  { en: "What's my commission this month?",      ar: "ما هي عمولتي هذا الشهر؟" },
  { en: "Open ORACLE intelligence",              ar: "افتح استخبارات أوراكل" },
];

const SYSTEM_PROMPT = `You are SOLVEN AI, the master intelligence assistant for SOLVEN4 — a 5-door AI financial ecosystem for MENA traders and IBs.

You have awareness of all 5 doors:
- HUB (solven4-hub.vercel.app): Central management, Profile, KYC, Subscriptions, Referral, Automation
- EDGE (solven4-edge-six.vercel.app): Trader-facing door — Trade Journal, Analytics, Signals, Risk Control, Prop Room
- FORGE (solven4-forge-pi.vercel.app): IB management — Trader networks, Lead intelligence, Live signals, Content creation
- ORACLE (solven4-oracle-eight.vercel.app): Intelligence & Education — Market signals, 11-section intelligence dashboard, Courses, Tools
- NEXUS (solven4-nexus-self.vercel.app): Business sales — CRM, Lead pipeline, Network hub, Marketing automation

Answer in the user's language (Arabic if they write Arabic, English otherwise).
Be specific, concise, and actionable. Reference which door handles what.
When asked about features, route the user to the right door.`;

/* ── Command-to-prompt map ── */
const COMMAND_PROMPTS = {
  market_brief:     'Give me a brief market intelligence summary. What should a MENA trader know right now? Reference ORACLE door.',
  lead_score:       'How can I use AI to score and prioritize my IB leads today? Reference FORGE door and its lead intelligence tools.',
  trade_check:      'Analyze the health of a typical trader portfolio. What metrics matter most? Reference EDGE door features.',
  network_status:   'Give me an overview of how to monitor and grow a trading network. Reference NEXUS door CRM and pipeline tools.',
  portfolio_review: 'Summarize what a portfolio and commission review looks like in HUB. Reference Vault and Commission Engine features.',
  daily_plan:       'Build me an AI-powered daily action plan for a MENA IB operator managing traders across all 5 SOLVEN4 doors.',
};

/* ── Parse door mentions from AI text ── */
function parseDoors(text) {
  return Object.keys(DOOR_MAP).filter(d => text.includes(d));
}

/* ── Load / save memory ── */
function loadMemory() {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveMemory(msgs) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(msgs.slice(-MAX_MEMORY)));
  } catch {}
}

/* ══════════════════ TYPING INDICATOR ══════════════════ */
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center', padding: '2px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: '#6366F1',
          animation: `sai-bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  );
}

/* ══════════════════ DOOR CHIP ══════════════════ */
function DoorChip({ doorName }) {
  const door = DOOR_MAP[doorName];
  if (!door) return null;
  return (
    <button
      onClick={() => window.open(door.url, '_blank')}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 9px', borderRadius: '20px', marginTop: '6px', marginRight: '5px',
        background: `${door.color}15`, border: `1px solid ${door.color}40`,
        color: door.color, fontSize: '10px', fontWeight: 700,
        fontFamily: "'Satoshi', sans-serif", letterSpacing: '0.05em',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = `${door.color}28`; }}
      onMouseLeave={e => { e.currentTarget.style.background = `${door.color}15`; }}>
      → Open {doorName}
    </button>
  );
}

/* ══════════════════ MAIN COMPONENT ══════════════════ */
export default function SolvenAI() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, profile } = useAuthStore();

  const [open, setOpen]               = useState(false);
  const [messages, setMessages]       = useState(() => loadMemory());
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [activeCommand, setActiveCommand] = useState(null);
  const [showExamples, setShowExamples]   = useState(false);
  const [pulsing, setPulsing]         = useState(false);

  const chatRef  = useRef(null);
  const inputRef = useRef(null);

  // Don't show on the dedicated agent page
  const isAgentPage = location.pathname === '/dashboard/agent';

  /* Persist on every change */
  useEffect(() => {
    saveMemory(messages);
  }, [messages]);

  /* Auto-scroll */
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  /* Pulse every 90s to remind user */
  useEffect(() => {
    const id = setInterval(() => {
      if (!open) { setPulsing(true); setTimeout(() => setPulsing(false), 3000); }
    }, 90_000);
    return () => clearInterval(id);
  }, [open]);

  /* Focus input when panel opens */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  /* ── Send a message (text or command) ── */
  const sendMessage = useCallback(async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setActiveCommand(null);

    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${text}`;

    try {
      const { data, error } = await supabase.functions.invoke('invoke-llm', {
        body: { prompt: fullPrompt },
      });

      if (error) throw error;

      const reply = data?.response || data?.text || data?.content || data?.message
        || (typeof data === 'string' ? data : null)
        || 'SOLVEN AI is warming up. Please try again in a moment.';

      const doors = parseDoors(reply);
      setMessages(prev => [...prev, { role: 'agent', text: reply, doors, id: Date.now() + 1 }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'agent',
        text: 'SOLVEN AI is warming up. Please try again in a moment.',
        doors: [],
        id: Date.now() + 1,
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  /* ── Fire a quick command ── */
  const fireCommand = useCallback((cmd) => {
    setActiveCommand(cmd.key);
    sendMessage(COMMAND_PROMPTS[cmd.key]);
  }, [sendMessage]);

  /* ── Clear memory ── */
  const clearMemory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(MEMORY_KEY);
  }, []);

  if (isAgentPage) return null;

  /* ════════════════ RENDER ════════════════ */
  return (
    <>
      {/* ─── Keyframes injected once ─── */}
      <style>{`
        @keyframes sai-bounce {
          0%,80%,100% { transform:translateY(0); opacity:0.5 }
          40%          { transform:translateY(-4px); opacity:1 }
        }
        @keyframes sai-pulse-ring {
          0%   { transform:scale(1); opacity:0.8 }
          100% { transform:scale(1.7); opacity:0 }
        }
        @keyframes sai-glow {
          0%,100% { box-shadow: 0 0 20px rgba(99,102,241,0.4), 0 8px 32px rgba(0,0,0,0.6) }
          50%      { box-shadow: 0 0 36px rgba(99,102,241,0.7), 0 8px 32px rgba(0,0,0,0.6) }
        }
        @keyframes sai-panel-in {
          from { opacity:0; transform:translateY(16px) scale(0.96) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }
        @keyframes sai-spin {
          from { transform:rotate(0deg) } to { transform:rotate(360deg) }
        }
      `}</style>

      {/* ─── Floating container ─── */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px',
      }}>

        {/* ═══════ PANEL ═══════ */}
        {open && (
          <div style={{
            width: '420px',
            maxHeight: '640px',
            background: '#14161B',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(99,102,241,0.12)',
            animation: 'sai-panel-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>

            {/* ── Panel Header ── */}
            <div style={{
              padding: '14px 16px',
              background: 'rgba(99,102,241,0.08)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: '12px',
              flexShrink: 0,
            }}>
              {/* Logo */}
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: 'linear-gradient(135deg,#6366F1,#818CF8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Satoshi', sans-serif", fontSize: '11px', fontWeight: 500, color: '#fff',
                boxShadow: '0 0 16px rgba(99,102,241,0.4)',
              }}>S4</div>

              {/* Title */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.15em' }}>
                  SOLVEN AI
                </div>
                <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '8px', color: '#6366F1', letterSpacing: '0.2em', marginTop: '2px' }}>
                  CONNECTED TO 5 DOORS
                </div>
              </div>

              {/* Door status dots */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {Object.entries(DOOR_MAP).map(([name, d]) => (
                  <div key={name} title={name} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: d.color, boxShadow: `0 0 6px ${d.color}`,
                  }} />
                ))}
              </div>

              {/* Clear memory */}
              <button
                onClick={clearMemory}
                title="Clear memory"
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '7px', padding: '5px', cursor: 'pointer',
                  color: '#94A3B8', display: 'flex', alignItems: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                <Trash2 size={13} />
              </button>

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '7px', padding: '5px', cursor: 'pointer',
                  color: '#94A3B8', display: 'flex', alignItems: 'center',
                }}>
                <X size={13} />
              </button>
            </div>

            {/* ── Quick Commands Grid ── */}
            <div style={{
              padding: '12px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}>
              <div style={{
                fontFamily: "'Satoshi', sans-serif", fontSize: '8px',
                letterSpacing: '0.22em', color: '#94A3B8', marginBottom: '9px',
              }}>
                QUICK COMMANDS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {QUICK_COMMANDS.map(cmd => (
                  <button
                    key={cmd.key}
                    onClick={() => fireCommand(cmd)}
                    disabled={loading}
                    style={{
                      padding: '8px 7px',
                      borderRadius: '9px',
                      background: activeCommand === cmd.key ? `${cmd.color}22` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${activeCommand === cmd.key ? cmd.color + '50' : 'rgba(255,255,255,0.06)'}`,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      opacity: loading && activeCommand !== cmd.key ? 0.5 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!loading) {
                        e.currentTarget.style.background = `${cmd.color}18`;
                        e.currentTarget.style.borderColor = `${cmd.color}40`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (activeCommand !== cmd.key) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      }
                    }}>
                    {/* Door tag */}
                    <div style={{
                      fontFamily: "'Satoshi', sans-serif", fontSize: '7px', fontWeight: 700,
                      color: cmd.color, marginBottom: '4px', letterSpacing: '0.05em',
                    }}>{cmd.door}</div>
                    {/* Label */}
                    <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#fff', lineHeight: 1.2, marginBottom: '3px' }}>
                      {cmd.label}
                    </div>
                    {/* Description */}
                    <div style={{ fontSize: '9px', color: '#94A3B8', lineHeight: 1.3 }}>
                      {cmd.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Chat Messages ── */}
            <div
              ref={chatRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 14px',
                display: 'flex', flexDirection: 'column', gap: '10px',
                minHeight: 0,
              }}>

              {messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: '#94A3B8' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', margin: '0 auto 12px',
                    background: 'linear-gradient(135deg,#6366F1,#818CF8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Brain size={22} color="#fff" />
                  </div>
                  <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '10px', color: '#fff', marginBottom: '6px', letterSpacing: '0.1em' }}>
                    SOLVEN AI READY
                  </div>
                  <div style={{ fontSize: '11px', lineHeight: 1.6 }}>
                    Ask me anything about your 5 doors.<br />Use quick commands or type below.
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: '7px',
                  alignItems: 'flex-start',
                }}>
                  {/* Agent avatar */}
                  {msg.role === 'agent' && (
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
                      background: 'linear-gradient(135deg,#6366F1,#818CF8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: '2px',
                    }}>
                      <Brain size={13} color="#fff" />
                    </div>
                  )}

                  <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column' }}>
                    {/* Bubble */}
                    <div style={{
                      padding: '9px 12px',
                      borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                      background: msg.role === 'user' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`,
                      fontSize: '12px', lineHeight: 1.6, color: '#CBD5E1',
                    }}>
                      {msg.text}
                    </div>

                    {/* Door-link chips */}
                    {msg.role === 'agent' && msg.doors && msg.doors.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '4px' }}>
                        {msg.doors.map(d => <DoorChip key={d} doorName={d} />)}
                      </div>
                    )}
                  </div>

                  {/* User avatar */}
                  {msg.role === 'user' && (
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
                      background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 700, color: '#818CF8', marginTop: '2px',
                    }}>
                      {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
                    background: 'linear-gradient(135deg,#6366F1,#818CF8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Brain size={13} color="#fff" />
                  </div>
                  <div style={{
                    padding: '9px 12px', borderRadius: '12px 12px 12px 3px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* ── Example Queries (collapsible) ── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
              <button
                onClick={() => setShowExamples(v => !v)}
                style={{
                  width: '100%', padding: '7px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#94A3B8',
                }}>
                <span style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '8px', letterSpacing: '0.2em' }}>
                  EXAMPLE QUERIES
                </span>
                <ChevronDown size={12} style={{ transform: showExamples ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>
              {showExamples && (
                <div style={{ padding: '0 14px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {EXAMPLE_QUERIES.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { sendMessage(q.en); setShowExamples(false); }}
                      style={{
                        padding: '6px 10px', borderRadius: '8px', textAlign: 'left',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                      <div style={{ fontSize: '11px', color: '#CBD5E1' }}>{q.en}</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '1px', direction: 'rtl' }}>{q.ar}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Input Bar ── */}
            <div style={{
              padding: '10px 14px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', gap: '8px', alignItems: 'center',
              flexShrink: 0,
              background: 'rgba(0,0,0,0.2)',
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask SOLVEN AI anything..."
                disabled={loading}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '9px 12px',
                  color: '#fff', fontSize: '12px', outline: 'none',
                  transition: 'border-color 0.15s',
                  opacity: loading ? 0.6 : 1,
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{
                  background: loading || !input.trim()
                    ? 'rgba(99,102,241,0.3)'
                    : 'linear-gradient(135deg,#6366F1,#818CF8)',
                  border: 'none', borderRadius: '10px',
                  width: '38px', height: '38px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: loading || !input.trim() ? 'none' : '0 0 16px rgba(99,102,241,0.4)',
                }}>
                {loading
                  ? <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'sai-spin 0.8s linear infinite' }} />
                  : <Send size={14} color="#fff" />
                }
              </button>
            </div>
          </div>
        )}

        {/* ═══════ FLOATING BUTTON ═══════ */}
        <div style={{ position: 'relative' }}>
          {/* Pulse ring */}
          {pulsing && !open && (
            <div style={{
              position: 'absolute', inset: '-8px', borderRadius: '50%',
              border: '2px solid #6366F1',
              animation: 'sai-pulse-ring 1.5s ease-out 3',
              pointerEvents: 'none',
            }} />
          )}

          {/* Unread badge */}
          {messages.length > 0 && !open && (
            <div style={{
              position: 'absolute', top: '-5px', right: '-5px',
              width: '18px', height: '18px', borderRadius: '50%',
              background: '#6366F1', border: '2px solid #1A1B1E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Satoshi', sans-serif", fontSize: '8px', fontWeight: 700, color: '#fff',
              zIndex: 1,
            }}>
              {Math.min(messages.filter(m => m.role === 'agent').length, 9)}
            </div>
          )}

          <button
            onClick={() => setOpen(v => !v)}
            title="SOLVEN AI"
            style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: open
                ? 'linear-gradient(135deg,#6366F1,#818CF8)'
                : 'rgba(10,12,30,0.95)',
              border: `2px solid ${open ? '#818CF8' : 'rgba(99,102,241,0.55)'}`,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(20px)',
              animation: open ? 'sai-glow 2s ease-in-out infinite' : 'none',
              transition: 'background 0.3s, border-color 0.3s',
              boxShadow: open
                ? '0 0 30px rgba(99,102,241,0.6), 0 8px 32px rgba(0,0,0,0.5)'
                : '0 8px 32px rgba(0,0,0,0.5)',
            }}>
            <Brain size={26} color={open ? '#fff' : '#818CF8'} />
          </button>
        </div>
      </div>
    </>
  );
}
