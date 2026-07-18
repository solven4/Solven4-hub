import { useState, useRef, useEffect, useCallback } from 'react';
import { Brain, Send, Trash2, Download, Copy, Sparkles, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useLang } from '@/lib/LanguageContext';

const PERSONAS = [
  {
    id: 'oracle',
    name: 'THE ORACLE',
    sub: 'Market Intelligence',
    emoji: '🔮',
    color: '#D4A843',
    bg: 'rgba(212,168,67,0.06)',
    border: 'rgba(212,168,67,0.2)',
    welcome: "I am The Oracle — patterns are my language. The market speaks to those who listen. What intelligence do you seek today?",
    starters: ['Analyze current market conditions', 'What signals should I watch?', 'Predict sentiment for this week'],
  },
  {
    id: 'strategist',
    name: 'THE STRATEGIST',
    sub: 'IB & Network Growth',
    emoji: '♟️',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.06)',
    border: 'rgba(16,185,129,0.2)',
    welcome: "The Strategist at your service. Every great network is built on a precise strategy. Tell me your target — I'll map the path.",
    starters: ['How do I grow my IB network?', 'Best referral strategies for traders', 'Maximize commission tiers'],
  },
  {
    id: 'operator',
    name: 'THE OPERATOR',
    sub: 'Business Automation',
    emoji: '⚙️',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.2)',
    welcome: "The Operator online. Systems are my obsession. Give me a process — I'll automate it into a machine.",
    starters: ['Build an automation for lead follow-up', 'Create a content calendar system', 'Optimize my CRM workflow'],
  },
  {
    id: 'signal',
    name: 'THE SIGNAL',
    sub: 'Trading & Execution',
    emoji: '📡',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.06)',
    border: 'rgba(59,130,246,0.2)',
    welcome: "Signal acquired. I live in the noise and find the edge. Tell me your trade — I'll sharpen it.",
    starters: ['Review my EUR/USD setup', 'Risk management for swing trades', 'Best entry strategies right now'],
  },
];

const LS_KEY = (id) => `opiom_brain_${id}`;

function TypingIndicator({ color }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm w-fit"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {[0, 1, 2].map(i => (
        <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: color, animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

export default function TheBrain() {
  const { t } = useLang();
  const { profile } = useAuthStore();
  const [persona, setPersona] = useState(PERSONAS[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load persona chat from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY(persona.id));
    if (saved) { try { setMessages(JSON.parse(saved)); return; } catch {} }
    setMessages([{ role: 'assistant', content: persona.welcome, ts: Date.now() }]);
  }, [persona.id]);

  // Persist + scroll
  useEffect(() => {
    if (messages.length > 0) localStorage.setItem(LS_KEY(persona.id), JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, persona.id]);

  const send = useCallback(async (text) => {
    const t = (text || input).trim();
    if (!t || thinking) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: t, ts: Date.now() }];
    setMessages(newMessages);
    setThinking(true);
    try {
      const apiMessages = newMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: persona.id,
          messages: apiMessages,
          userId: profile?.id || null,
        }),
      });

      if (res.status === 429) {
        const { error } = await res.json();
        setMessages(m => [...m, { role: 'assistant', content: `⏳ ${error}`, ts: Date.now() }]);
        return;
      }

      if (!res.ok) throw new Error('AI service error');
      const { content } = await res.json();
      setMessages(m => [...m, { role: 'assistant', content, ts: Date.now() }]);
    } catch (err) {
      setMessages(m => [...m, {
        role: 'assistant',
        content: '⚠️ AI temporarily unavailable. Please try again in a moment.',
        ts: Date.now(),
      }]);
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  }, [input, thinking, persona.id, messages, profile]);

  const clearChat = () => {
    localStorage.removeItem(LS_KEY(persona.id));
    setMessages([{ role: 'assistant', content: persona.welcome, ts: Date.now() }]);
    toast.success(t('Chat cleared.', 'تم مسح المحادثة.'));
  };

  const exportChat = () => {
    const text = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}`).join('\n\n---\n\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = `opiom_${persona.id}_${Date.now()}.txt`;
    a.click();
    toast.success(t('Chat exported.', 'تم تصدير المحادثة.'));
  };

  const copyLast = () => {
    const last = [...messages].reverse().find(m => m.role === 'assistant');
    if (last) { navigator.clipboard.writeText(last.content); toast.success(t('Copied!', 'تم النسخ!')); }
  };

  return (
    <div className="flex gap-5 animate-fade-in" style={{ height: 'calc(100vh - 112px)' }}>

      {/* Persona Panel */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-2">
        <div className="text-[10px] text-opiom-muted font-heading tracking-[0.3em] uppercase mb-1 flex items-center gap-2">
          <Sparkles size={11} className="text-gold" />
          {t('AI PERSONAS', 'شخصيات الذكاء الاصطناعي')}
        </div>
        {PERSONAS.map(p => (
          <button key={p.id} onClick={() => setPersona(p)}
            className="text-left p-3.5 rounded-2xl border transition-all duration-200 group"
            style={{
              borderColor: persona.id === p.id ? p.border : 'rgba(41,41,61,0.8)',
              background: persona.id === p.id ? p.bg : 'rgba(6,13,24,0.6)',
            }}>
            <div className="text-xl mb-2">{p.emoji}</div>
            <div className="text-[11px] font-heading font-black tracking-wider mb-0.5"
              style={{ color: persona.id === p.id ? p.color : '#fff' }}>{p.name}</div>
            <div className="text-[9px] text-opiom-muted">{p.sub}</div>
            {persona.id === p.id && (
              <div className="mt-2 flex items-center gap-1 text-[9px] font-heading font-black tracking-wider" style={{ color: p.color }}>
                {t('ACTIVE', 'نشط')} <ChevronRight size={9} />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col rounded-2xl border overflow-hidden" style={{ borderColor: persona.border, background: '#060D18' }}>
        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(41,41,61,0.6)', background: persona.bg }}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{persona.emoji}</div>
            <div>
              <div className="text-sm font-heading font-black tracking-wider" style={{ color: persona.color }}>{persona.name}</div>
              <div className="text-[10px] text-opiom-muted">{persona.sub} · {t('SOLVEN4 Intelligence', 'ذكاء SOLVEN4')}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={copyLast} title={t('Copy last response', 'نسخ آخر رد')}
              className="p-2 rounded-lg text-opiom-muted hover:text-white hover:bg-white/5 transition-all">
              <Copy size={13} />
            </button>
            <button onClick={exportChat} title={t('Export conversation', 'تصدير المحادثة')}
              className="p-2 rounded-lg text-opiom-muted hover:text-white hover:bg-white/5 transition-all">
              <Download size={13} />
            </button>
            <button onClick={clearChat} title={t('Clear conversation', 'مسح المحادثة')}
              className="p-2 rounded-lg text-opiom-muted hover:text-danger hover:bg-danger/5 transition-all">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1"
                  style={{ background: persona.bg, border: `1px solid ${persona.border}` }}>
                  {persona.emoji}
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'rounded-tr-sm text-white'
                  : 'rounded-tl-sm text-white/90'
              }`} style={m.role === 'user'
                ? { background: `${persona.color}20`, border: `1px solid ${persona.color}30` }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }
              }>
                {m.content}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm mr-2 flex-shrink-0"
                style={{ background: persona.bg, border: `1px solid ${persona.border}` }}>
                {persona.emoji}
              </div>
              <TypingIndicator color={persona.color} />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Starters */}
        {messages.length <= 1 && (
          <div className="px-5 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
            {persona.starters.map(s => (
              <button key={s} onClick={() => send(s)}
                className="flex-shrink-0 text-[10px] px-3 py-1.5 rounded-full border transition-all hover:scale-[1.03]"
                style={{ borderColor: persona.border, background: persona.bg, color: persona.color }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-5 py-4 border-t flex-shrink-0" style={{ borderColor: 'rgba(41,41,61,0.6)' }}>
          <div className="flex items-center gap-3 border rounded-xl px-4 py-3 transition-all focus-within:border-current"
            style={{ borderColor: 'rgba(41,41,61,0.8)', background: 'rgba(5,5,12,0.6)' }}>
            <Brain size={14} style={{ color: persona.color }} className="flex-shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder={`${t('Ask', 'اسأل')} ${persona.name}…`}
              className="flex-1 bg-transparent text-sm text-white placeholder-opiom-muted/40 focus:outline-none"
            />
            <button onClick={() => send()} disabled={!input.trim() || thinking}
              className="transition-all disabled:opacity-30 hover:scale-110"
              style={{ color: persona.color }}>
              <Send size={15} />
            </button>
          </div>
          <div className="text-[9px] text-opiom-muted/30 mt-2 text-center">
            {t('Press Enter to send · Shift+Enter for new line', 'اضغط Enter للإرسال · Shift+Enter لسطر جديد')}
          </div>
        </div>
      </div>
    </div>
  );
}
