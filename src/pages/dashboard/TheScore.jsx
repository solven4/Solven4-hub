import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowDownToLine, BarChart3, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { db } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const CHART_STYLE = {
  contentStyle: { background: '#0A0C1E', border: '1px solid #29293D', borderRadius: 12, color: '#fff', fontSize: 11 },
  cursor: { fill: 'rgba(212,168,67,0.04)' },
};

const STATUS = {
  pending:  { color: '#F97316', bg: 'rgba(249,115,22,0.1)',  label: 'PENDING' },
  approved: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'APPROVED' },
  paid:     { color: '#D4A843', bg: 'rgba(212,168,67,0.1)', label: 'PAID' },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  label: 'REJECTED' },
};

export default function TheScore() {
  const { user } = useAuthStore();
  const [commissions, setCommissions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('commissions');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      db.commissions().select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
      db.payouts().select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ]).then(([c, p]) => {
      setCommissions(c.data ?? []);
      setPayouts(p.data ?? []);
      setLoading(false);
    });
  }, [user]);

  const totalEarned = commissions.reduce((s, c) => s + (c.amount ?? 0), 0);
  const pending     = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + (c.amount ?? 0), 0);
  const paid        = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + (c.amount ?? 0), 0);
  const approved    = commissions.filter(c => c.status === 'approved').reduce((s, c) => s + (c.amount ?? 0), 0);
  const available   = approved + pending;

  // Build monthly chart data from commissions
  const monthlyMap = {};
  commissions.forEach(c => {
    const m = new Date(c.created_at).toLocaleString('default', { month: 'short' });
    monthlyMap[m] = (monthlyMap[m] ?? 0) + (c.amount ?? 0);
  });
  const chartData = Object.entries(monthlyMap).slice(-6).map(([month, amount]) => ({ month, amount: +amount.toFixed(2) }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={18} className="text-gold" />
            <h1 className="font-heading text-2xl font-black text-white tracking-wider">THE SCORE</h1>
          </div>
          <p className="text-sm text-opiom-muted">Cross-door commissions, approvals, and payout tracking.</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earned',  val: totalEarned, color: '#D4A843', icon: TrendingUp, suffix: '$', sub: 'All time' },
          { label: 'Pending',       val: pending,     color: '#F97316', icon: Clock,      suffix: '$', sub: 'Awaiting approval' },
          { label: 'Approved',      val: approved,    color: '#10B981', icon: CheckCircle,suffix: '$', sub: 'Ready to withdraw' },
          { label: 'Total Paid',    val: paid,        color: '#3B82F6', icon: ArrowDownToLine, suffix: '$', sub: 'Withdrawn' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="relative rounded-2xl overflow-hidden border border-opiom-border p-5"
              style={{ background: 'linear-gradient(135deg, #060D18, #0A0C1E)' }}>
              <div className="absolute top-0 right-0 w-16 h-16"
                style={{ background: `radial-gradient(circle at top right, ${s.color}15, transparent)` }} />
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] text-opiom-muted uppercase tracking-widest">{s.label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                  <Icon size={13} style={{ color: s.color }} />
                </div>
              </div>
              <div className="font-heading text-2xl font-black mb-1" style={{ color: s.color }}>
                {s.suffix}{loading ? '—' : s.val.toFixed(0)}
              </div>
              <div className="text-[10px] text-opiom-muted/60">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-opiom-border p-5" style={{ background: '#060D18' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="text-[11px] text-opiom-muted font-heading tracking-[0.3em] uppercase flex items-center gap-2">
              <BarChart3 size={12} className="text-gold" />
              MONTHLY COMMISSIONS
            </div>
            <div className="text-sm font-heading font-black text-gold">${totalEarned.toFixed(2)} total</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A843" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_STYLE} formatter={(v) => [`$${v}`, 'Amount']} />
              <Area type="monotone" dataKey="amount" stroke="#D4A843" strokeWidth={2} fill="url(#goldGrad)" dot={{ fill: '#D4A843', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-opiom-surface rounded-xl border border-opiom-border w-fit">
        {['commissions', 'payouts'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-xs font-heading font-black tracking-wider transition-all ${tab === t ? 'bg-gold text-opiom-bg' : 'text-opiom-muted hover:text-white'}`}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-opiom-border overflow-hidden" style={{ background: '#060D18' }}>
        <div className="px-5 py-4 border-b border-opiom-border">
          <div className="text-[11px] text-opiom-muted font-heading tracking-widest uppercase">
            {tab === 'commissions' ? `${commissions.length} Commissions` : `${payouts.length} Payouts`}
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'commissions' ? (
          commissions.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign size={32} className="text-opiom-muted/20 mx-auto mb-3" />
              <p className="text-opiom-muted text-sm">No commissions yet. Grow your network to start earning.</p>
            </div>
          ) : (
            <div className="divide-y divide-opiom-border/50">
              {commissions.map(c => {
                const s = STATUS[c.status] ?? STATUS.pending;
                return (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{c.description ?? 'Commission'}</div>
                      <div className="text-[10px] text-opiom-muted mt-0.5">{new Date(c.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className="text-[10px] font-heading font-black px-2 py-1 rounded-lg"
                      style={{ color: s.color, background: s.bg }}>{s.label}</div>
                    <div className="font-heading font-black text-gold">${(c.amount ?? 0).toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          payouts.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowDownToLine size={32} className="text-opiom-muted/20 mx-auto mb-3" />
              <p className="text-opiom-muted text-sm">No payouts yet. Request one from The Vault.</p>
            </div>
          ) : (
            <div className="divide-y divide-opiom-border/50">
              {payouts.map(p => {
                const s = STATUS[p.status] ?? STATUS.pending;
                return (
                  <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors">
                    <ArrowDownToLine size={14} style={{ color: s.color }} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{p.method ?? 'Bank Transfer'}</div>
                      <div className="text-[10px] text-opiom-muted">{new Date(p.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-[10px] font-heading font-black px-2 py-1 rounded-lg"
                      style={{ color: s.color, background: s.bg }}>{s.label}</div>
                    <div className="font-heading font-black text-gold">${(p.amount ?? 0).toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
