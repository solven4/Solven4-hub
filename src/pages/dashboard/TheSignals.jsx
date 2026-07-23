import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Zap, Info, AlertTriangle, XCircle, Star } from 'lucide-react';
import { db } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { GlassPanel, Btn } from '@/hud';

const ACCENT = '#D4A843';

// Keyed on the real notification.type values written across every door
// (signal/commission/lead_converted/etc, not the earlier info/success/warning
// placeholders this page was designed around before any door wrote real rows).
const TYPE_CONFIG = {
  info:            { icon: Info,          color: '#3B82F6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)',  label: 'INFO' },
  success:         { icon: Zap,          color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', label: 'SUCCESS' },
  warning:         { icon: AlertTriangle, color: '#F97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.2)',  label: 'ALERT' },
  alert:           { icon: XCircle,      color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   label: 'URGENT' },
  reward:          { icon: Star,         color: '#D4A843', bg: 'rgba(212,168,67,0.08)',  border: 'rgba(212,168,67,0.2)',  label: 'REWARD' },
  signal:          { icon: Zap,          color: '#22D3EE', bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.2)',  label: 'SIGNAL' },
  commission:      { icon: Star,         color: '#D4A843', bg: 'rgba(212,168,67,0.08)',  border: 'rgba(212,168,67,0.2)',  label: 'COMMISSION' },
  trade_closed:    { icon: CheckCheck,   color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)',  label: 'TRADE' },
  lead_converted:  { icon: Zap,          color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)',  label: 'CONVERSION' },
  arena:           { icon: Star,         color: '#A855F7', bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.2)',  label: 'ARENA' },
  channel:         { icon: Bell,         color: '#3B82F6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)',  label: 'CHANNEL' },
  solven:          { icon: Info,          color: '#6366F1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)',  label: 'SOLVEN AI' },
  system:          { icon: Info,          color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', label: 'SYSTEM' },
};

const DEMO_SIGNALS = [
  { id: 'd1', title: 'New Network Member', message: 'A new trader joined your network via your referral link.', type: 'success', is_read: false, created_at: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: 'd2', title: 'Commission Approved', message: '$45.00 commission has been approved and is ready for withdrawal.', type: 'reward', is_read: false, created_at: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 'd3', title: 'XP Milestone Reached', message: 'You crossed 500 XP — rank progression to The Hooked is now possible!', type: 'warning', is_read: false, created_at: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: 'd4', title: 'AI Signal Alert', message: 'The Oracle has detected a high-probability setup in EUR/USD.', type: 'info', is_read: true, created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'd5', title: 'Weekly Intelligence Briefing', message: 'Your SOLVEN4 Intelligence weekly report is ready to view.', type: 'info', is_read: true, created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function TheSignals() {
  const { user } = useAuthStore();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) { setNotifs(DEMO_SIGNALS); setLoading(false); return; }
    db.notifications().select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(30)
      .then(({ data, error }) => {
        if (error) console.error('[TheSignals]', error);
        setNotifs(data && data.length > 0 ? data : DEMO_SIGNALS);
        setLoading(false);
      });
  }, [user]);

  const markRead = async (id) => {
    if (!user) { setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: true } : x)); return; }
    await db.notifications().update({ is_read: true }).eq('id', id);
    setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
  };

  const markAllRead = async () => {
    if (!user) { setNotifs(n => n.map(x => ({ ...x, is_read: true }))); toast.success('All signals cleared.'); return; }
    await db.notifications().update({ is_read: true }).eq('owner_id', user.id).eq('is_read', false);
    setNotifs(n => n.map(x => ({ ...x, is_read: true })));
    toast.success('All signals marked as read.');
  };

  const unread = notifs.filter(n => !n.is_read).length;
  const filtered = filter === 'all' ? notifs : filter === 'unread' ? notifs.filter(n => !n.is_read) : notifs.filter(n => n.type === filter);
  const rise = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="s4hud" style={{ ['--accent']: ACCENT, color: '#fff', fontFamily: "'Space Grotesk',sans-serif" }}>

      {/* Header */}
      <motion.div {...rise} transition={{ duration: 0.5 }} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: '22px' }}>
        <div>
          <div className="s4-label s4-accent" style={{ letterSpacing: '0.35em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={13} /> CROSS-DOOR INTELLIGENCE
            {unread > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: ACCENT, color: '#000', fontSize: '9px', fontWeight: 500, fontFamily: "'Satoshi',sans-serif", letterSpacing: 'normal' }}>
                {unread}
              </span>
            )}
          </div>
          <h1 style={{ fontFamily: "'Satoshi',sans-serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 500, lineHeight: 1.02, margin: 0,
            background: 'linear-gradient(135deg,#fff 0%,#F0DCA0 60%,#D4A843 120%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 22px rgba(212,168,67,0.35))' }}>THE SIGNALS</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 0' }}>Cross-door intelligence alerts and system notifications.</p>
        </div>
        {unread > 0 && (
          <Btn ghost onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '10px 16px' }}>
            <CheckCheck size={13} /> Mark All Read
          </Btn>
        )}
      </motion.div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total', val: notifs.length, color: '#94A3B8' },
          { label: 'Unread', val: unread, color: '#D4A843' },
          { label: 'Rewards', val: notifs.filter(n => n.type === 'reward').length, color: '#D4A843' },
          { label: 'Alerts', val: notifs.filter(n => n.type === 'alert').length, color: '#EF4444' },
        ].map(s => (
          <GlassPanel key={s.label} className="spatial lift" brackets={false} style={{ ['--accent']: s.color, textAlign: 'center' }}>
            <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '20px', fontWeight: 500, marginBottom: '3px', color: s.color }}>{s.val}</div>
            <div className="s4-label" style={{ fontSize: '9px' }}>{s.label}</div>
          </GlassPanel>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', background: 'rgba(10,12,30,0.8)', border: '1px solid var(--s4-line)', marginBottom: '20px', width: 'fit-content', flexWrap: 'wrap' }}>
        {['all', 'unread', 'reward', 'info', 'warning', 'alert'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ fontFamily: "'Satoshi',sans-serif", padding: '7px 16px', borderRadius: '8px', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: filter === f ? ACCENT : 'transparent', color: filter === f ? '#000' : '#94A3B8' }}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Signals list */}
      <GlassPanel className="spatial lift">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px', fontSize: '13px' }}>Loading signals...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '44px' }}>
            <Bell size={32} color="#94A3B8" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
            <p style={{ color: '#94A3B8', fontSize: '12.5px' }}>No signals here. The Intelligence is watching.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filtered.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
              const Icon = cfg.icon;
              return (
                <motion.div key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  style={{
                    position: 'relative', display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '12px',
                    border: `1px solid ${n.is_read ? 'var(--s4-line)' : cfg.border}`,
                    background: n.is_read ? 'rgba(255,255,255,0.015)' : cfg.bg,
                    opacity: n.is_read ? 0.65 : 1,
                  }}>

                  {!n.is_read && (
                    <div style={{ position: 'absolute', top: '14px', left: '6px', width: '6px', height: '6px', borderRadius: '50%', background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
                  )}

                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, marginLeft: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <Icon size={16} style={{ color: cfg.color }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{n.title ?? 'Signal'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '8px', fontWeight: 500, padding: '2px 6px', borderRadius: '4px', color: cfg.color, background: `${cfg.color}15` }}>{cfg.label}</span>
                        <span style={{ fontSize: '10px', color: '#94A3B8' }}>{timeAgo(n.created_at)}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', lineHeight: 1.5 }}>{n.body ?? n.message}</p>
                  </div>

                  {!n.is_read && (
                    <button onClick={() => markRead(n.id)}
                      style={{ flexShrink: 0, padding: '5px', borderRadius: '7px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>
                      <Check size={13} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
