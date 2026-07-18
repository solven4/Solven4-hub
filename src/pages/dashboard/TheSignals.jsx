import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Zap, Info, AlertTriangle, XCircle, Star, Filter } from 'lucide-react';
import { db } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell size={18} className="text-gold" />
            <h1 className="font-heading text-2xl font-black text-white tracking-wider">THE SIGNALS</h1>
            {unread > 0 && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gold text-opiom-bg text-[10px] font-black font-heading">
                {unread}
              </div>
            )}
          </div>
          <p className="text-sm text-opiom-muted">Cross-door intelligence alerts and system notifications.</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-ascend/30 text-ascend text-xs font-heading font-bold tracking-wider hover:bg-ascend/10 transition-all">
            <CheckCheck size={13} /> MARK ALL READ
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total',   val: notifs.length,                              color: '#94A3B8' },
          { label: 'Unread',  val: unread,                                     color: '#D4A843' },
          { label: 'Rewards', val: notifs.filter(n => n.type === 'reward').length, color: '#D4A843' },
          { label: 'Alerts',  val: notifs.filter(n => n.type === 'alert').length,  color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-opiom-border p-3 text-center" style={{ background: '#060D18' }}>
            <div className="font-heading text-xl font-black mb-0.5" style={{ color: s.color }}>{s.val}</div>
            <div className="text-[10px] text-opiom-muted uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-opiom-surface rounded-xl border border-opiom-border w-fit flex-wrap">
        {['all', 'unread', 'reward', 'info', 'warning', 'alert'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-heading font-black tracking-wider transition-all ${filter === f ? 'bg-gold text-opiom-bg' : 'text-opiom-muted hover:text-white'}`}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Signals list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-opiom-border p-16 text-center" style={{ background: '#060D18' }}>
          <Bell size={36} className="text-opiom-muted/20 mx-auto mb-4" />
          <p className="text-opiom-muted text-sm">No signals here. The Intelligence is watching.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n, i) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div key={n.id}
                className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.005] group animate-slide-up`}
                style={{
                  animationDelay: `${i * 0.04}s`,
                  borderColor: n.is_read ? 'rgba(41,41,61,0.5)' : cfg.border,
                  background: n.is_read ? 'rgba(6,13,24,0.6)' : cfg.bg,
                  opacity: n.is_read ? 0.65 : 1,
                }}>

                {/* Unread dot */}
                {!n.is_read && (
                  <div className="absolute top-3.5 left-3.5 w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                )}

                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ml-2"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <Icon size={16} style={{ color: cfg.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-white">{n.title ?? 'Signal'}</div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-[9px] font-heading font-black px-1.5 py-0.5 rounded"
                        style={{ color: cfg.color, background: `${cfg.color}15` }}>{cfg.label}</div>
                      <div className="text-[10px] text-opiom-muted/60">{timeAgo(n.created_at)}</div>
                    </div>
                  </div>
                  <p className="text-xs text-opiom-muted mt-1 leading-relaxed">{n.body ?? n.message}</p>
                </div>

                {!n.is_read && (
                  <button onClick={() => markRead(n.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1.5 rounded-lg hover:bg-white/5 text-opiom-muted hover:text-ascend">
                    <Check size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
