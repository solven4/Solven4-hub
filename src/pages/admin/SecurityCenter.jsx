import { useEffect, useState, useCallback } from 'react';
import { Shield, AlertTriangle, Activity, Eye, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { computeSecurityScore } from '@/lib/security';
import { toast } from 'sonner';

const SEV_STYLE = {
  high:   { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
  medium: { color: '#D4A843', bg: 'rgba(212,168,67,0.08)',  border: 'rgba(212,168,67,0.2)'  },
  info:   { color: '#6366F1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)'  },
  low:    { color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
};

const EVENT_LABEL = {
  auth_failed:               'Auth Failed',
  auth_succeeded:            'Auth Success',
  rate_limit_hit:            'Rate Limit Hit',
  invalid_webhook_signature: '⚠️ Invalid Webhook Sig',
  seat_sold_out:             'Seat Sold Out',
  duplicate_payment_attempt: '🚨 Duplicate Payment',
  suspicious_ip:             '🚨 Suspicious IP',
  admin_action:              'Admin Action',
  ai_quota_exceeded:         'AI Quota Exceeded',
  refund_flagged:            '🚨 Refund Flagged',
};

const INCIDENT_RUNBOOKS = [
  {
    trigger: 'invalid_webhook_signature',
    title: 'Invalid Webhook Signature',
    steps: [
      'Check DODO_WEBHOOK_SECRET in Vercel env vars',
      'If repeated attacks, rotate the secret in Dodo dashboard → update Vercel simultaneously',
      'IP should be flagged automatically in Dodo dashboard',
    ],
  },
  {
    trigger: 'duplicate_payment_attempt',
    title: 'Duplicate Payment Attempt',
    steps: [
      'Check founding_members table for duplicate payment_id',
      'Idempotency check in webhook handler should have blocked this — verify logs',
      'Contact Dodo support with the payment ID if funds were captured twice',
    ],
  },
  {
    trigger: 'auth_failed',
    title: 'Auth Failure Spike (>20 in 24h)',
    steps: [
      'IP auto-blocked by rate limiter for 1 hour',
      'Check security_events for source_ip pattern — add to Vercel Edge blocklist if bot',
      'Alert Telegram bot has fired — verify message received',
    ],
  },
];

export default function SecurityCenter() {
  const [events,    setEvents]    = useState([]);
  const [score,     setScore]     = useState(null);
  const [stats,     setStats]     = useState({});
  const [loading,   setLoading]   = useState(true);
  const [resolving, setResolving] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [evs, s] = await Promise.all([
        supabase.from('security_events').select('*').order('created_at', { ascending: false }).limit(150),
        computeSecurityScore(),
      ]);
      setEvents(evs.data || []);
      setScore(s);

      const counts = {};
      (evs.data || []).forEach(e => { counts[e.event_type] = (counts[e.event_type] || 0) + 1; });
      setStats(counts);
    } catch (err) {
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();

    // Real-time feed via Supabase Realtime
    const channel = supabase
      .channel('security_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'security_events' }, payload => {
        setEvents(prev => [payload.new, ...prev].slice(0, 150));
        setStats(prev => {
          const key = payload.new.event_type;
          return { ...prev, [key]: (prev[key] || 0) + 1 };
        });
      })
      .subscribe();

    // Refresh score every 60s
    const interval = setInterval(async () => {
      const s = await computeSecurityScore();
      setScore(s);
    }, 60_000);

    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [loadAll]);

  const markResolved = async (id) => {
    setResolving(id);
    await supabase.from('security_events').update({ resolved: true }).eq('id', id);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
    setResolving(null);
    toast.success('Event marked as resolved');
  };

  const scoreColor = score === null ? '#8899B4' : score >= 80 ? '#10B981' : score >= 60 ? '#D4A843' : '#EF4444';
  const scoreLabel = score === null ? 'Calculating...' : score >= 80 ? '● All systems secure' : score >= 60 ? '⚠ Elevated activity detected' : '🚨 Immediate action required';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield size={18} className="text-danger" />
        <h1 className="font-heading text-2xl font-black text-white tracking-wider">SECURITY OPERATIONS CENTER</h1>
        <button onClick={loadAll} disabled={loading}
          className="ml-auto p-2 rounded-lg text-opiom-muted hover:text-white hover:bg-white/5 transition-all">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Score + Stats row */}
      <div className="flex gap-4">
        {/* Security Score */}
        <div className="w-48 flex-shrink-0 rounded-2xl border p-6 text-center"
          style={{ borderColor: `${scoreColor}40`, background: `${scoreColor}06` }}>
          <div className="font-heading text-6xl font-black mb-1" style={{ color: scoreColor }}>
            {score ?? '—'}
          </div>
          <div className="text-[10px] text-opiom-muted uppercase tracking-wider mb-2">SECURITY SCORE</div>
          <div className="text-[11px]" style={{ color: scoreColor }}>{scoreLabel}</div>
        </div>

        {/* Stat chips */}
        <div className="flex-1 grid grid-cols-3 gap-3">
          {[
            ['Auth Failures (24h)', stats.auth_failed             || 0, '#EF4444'],
            ['Rate Limits (24h)',   stats.rate_limit_hit          || 0, '#D4A843'],
            ['Invalid Webhooks',   stats.invalid_webhook_signature || 0, '#EF4444'],
            ['Duplicate Payments', stats.duplicate_payment_attempt || 0, '#EF4444'],
            ['Suspicious IPs',     stats.suspicious_ip            || 0, '#D4A843'],
            ['AI Quota Hits',      stats.ai_quota_exceeded        || 0, '#6366F1'],
          ].map(([label, val, color]) => (
            <div key={label} className="rounded-xl border border-opiom-border p-3"
              style={{ background: '#060D18' }}>
              <div className="text-[10px] text-opiom-muted mb-1">{label}</div>
              <div className="font-heading text-2xl font-black" style={{ color }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident Runbooks */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
          <div className="text-[11px] text-danger font-heading tracking-widest uppercase flex items-center gap-2">
            <AlertTriangle size={11} /> INCIDENT RESPONSE RUNBOOKS
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(239,68,68,0.1)' }}>
          {INCIDENT_RUNBOOKS.map(r => (
            <details key={r.trigger} className="px-5 py-3 group">
              <summary className="text-sm text-white cursor-pointer flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle size={12} className="text-danger" />
                  {r.title}
                </span>
                <span className="text-opiom-muted text-xs group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <ol className="mt-3 space-y-1 pl-4">
                {r.steps.map((s, i) => (
                  <li key={i} className="text-[12px] text-opiom-muted flex gap-2">
                    <span className="text-danger font-bold">{i + 1}.</span> {s}
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </div>

      {/* Live Event Feed */}
      <div className="rounded-2xl border border-opiom-border overflow-hidden" style={{ background: '#060D18' }}>
        <div className="px-5 py-4 border-b border-opiom-border flex items-center justify-between">
          <div className="text-[11px] text-opiom-muted font-heading tracking-widest uppercase flex items-center gap-2">
            <Eye size={11} className="text-gold" /> LIVE EVENT FEED
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-heading">LIVE</span>
          </div>
        </div>
        <div className="divide-y divide-opiom-border/30 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="p-8 text-center text-opiom-muted text-sm">No security events yet.</div>
          ) : events.map(e => {
            const sev = SEV_STYLE[e.severity] || SEV_STYLE.info;
            return (
              <div key={e.id} className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
                style={{ opacity: e.resolved ? 0.5 : 1 }}>
                <span className="text-[10px] font-heading font-black mt-0.5 min-w-[48px]"
                  style={{ color: sev.color }}>[{(e.severity || 'info').toUpperCase()}]</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">
                    {EVENT_LABEL[e.event_type] || e.event_type}
                    {e.door && <span className="ml-2 text-xs text-opiom-muted">[{e.door}]</span>}
                  </div>
                  {e.source_ip && <div className="text-[10px] text-opiom-muted">IP: {e.source_ip}</div>}
                </div>
                <span className="text-[10px] text-opiom-muted whitespace-nowrap">
                  {new Date(e.created_at).toLocaleTimeString()}
                </span>
                {!e.resolved && e.severity === 'high' && (
                  <button onClick={() => markResolved(e.id)} disabled={resolving === e.id}
                    className="ml-2 p-1 rounded text-opiom-muted hover:text-emerald-400 transition-colors flex-shrink-0"
                    title="Mark resolved">
                    {resolving === e.id
                      ? <RefreshCw size={11} className="animate-spin" />
                      : <CheckCircle size={11} />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
