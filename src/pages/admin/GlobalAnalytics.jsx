import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Zap, Globe, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { db } from '@/lib/supabase';

const CHART_STYLE = {
  contentStyle: { background: '#0B1220', border: '1px solid #1A2540', borderRadius: 12, color: '#fff', fontSize: 11 },
  cursor: { fill: 'rgba(212,168,67,0.04)' },
};

const DEMO_MONTHLY = [
  { month: 'Jan', revenue: 1240, users: 12, commissions: 980 },
  { month: 'Feb', revenue: 2100, users: 18, commissions: 1650 },
  { month: 'Mar', revenue: 1800, users: 22, commissions: 1400 },
  { month: 'Apr', revenue: 3200, users: 31, commissions: 2600 },
  { month: 'May', revenue: 4100, users: 45, commissions: 3300 },
  { month: 'Jun', revenue: 5600, users: 62, commissions: 4500 },
];

const DEMO_RANK_DIST = [
  { name: 'Curious',  value: 38, color: '#8899B4' },
  { name: 'Hooked',   value: 28, color: '#3B82F6' },
  { name: 'Obsessed', value: 18, color: '#10B981' },
  { name: 'Addict',   value: 10, color: '#F97316' },
  { name: 'Dealer',   value: 5,  color: '#D4A843' },
  { name: 'Legend',   value: 1,  color: '#A855F7' },
];

const DEMO_DOORS = [
  { door: 'PULSE',   sessions: 1840, color: '#3B82F6' },
  { door: 'NETWORK', sessions: 2310, color: '#D4A843' },
  { door: 'ASCEND',  sessions: 960,  color: '#10B981' },
  { door: 'COMMAND', sessions: 1420, color: '#8B5CF6' },
];

export default function GlobalAnalytics() {
  const [stats, setStats]   = useState({ users: 0, revenue: 0, commissions: 0, payouts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      db.profiles().select('id', { count: 'exact', head: true }),
      db.commissions().select('amount'),
      db.payouts().select('amount').eq('status', 'paid'),
    ]).then(([u, c, p]) => {
      const commissions = (c.data ?? []).reduce((s, x) => s + (x.amount ?? 0), 0);
      const payouts     = (p.data ?? []).reduce((s, x) => s + (x.amount ?? 0), 0);
      setStats({ users: u.count ?? 0, revenue: commissions, commissions, payouts });
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={18} className="text-gold" />
          <h1 className="font-heading text-2xl font-black text-white tracking-wider">GLOBAL ANALYTICS</h1>
        </div>
        <p className="text-sm text-opiom-muted">Platform-wide intelligence — all doors, all agents, all time.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Agents',     val: stats.users,        color: '#D4A843', icon: Users,     prefix: '' },
          { label: 'Total Revenue',    val: stats.revenue,      color: '#10B981', icon: DollarSign, prefix: '$' },
          { label: 'Commissions Paid', val: stats.commissions,  color: '#3B82F6', icon: TrendingUp, prefix: '$' },
          { label: 'Total Paid Out',   val: stats.payouts,      color: '#8B5CF6', icon: Activity,   prefix: '$' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="relative rounded-2xl border border-opiom-border p-5 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #060D18, #0B1220)' }}>
              <div className="absolute top-0 right-0 w-20 h-20"
                style={{ background: `radial-gradient(circle at top right, ${s.color}15, transparent)` }} />
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] text-opiom-muted uppercase tracking-widest">{s.label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
                  <Icon size={13} style={{ color: s.color }} />
                </div>
              </div>
              <div className="font-heading text-3xl font-black" style={{ color: s.color }}>
                {s.prefix}{loading ? '—' : s.val.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue + Users trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-opiom-border p-5" style={{ background: '#060D18' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={12} className="text-gold" />
            <div className="text-[11px] text-opiom-muted font-heading tracking-[0.3em] uppercase">Monthly Revenue</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={DEMO_MONTHLY}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#8899B4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8899B4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_STYLE} formatter={v => [`$${v}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-opiom-border p-5" style={{ background: '#060D18' }}>
          <div className="flex items-center gap-2 mb-5">
            <Users size={12} className="text-gold" />
            <div className="text-[11px] text-opiom-muted font-heading tracking-[0.3em] uppercase">New Agents / Month</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={DEMO_MONTHLY}>
              <XAxis dataKey="month" tick={{ fill: '#8899B4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8899B4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_STYLE} formatter={v => [v, 'New Agents']} />
              <Bar dataKey="users" fill="#D4A843" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rank distribution + Door sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rank donut */}
        <div className="rounded-2xl border border-opiom-border p-5" style={{ background: '#060D18' }}>
          <div className="flex items-center gap-2 mb-5">
            <Award size={12} className="text-gold" />
            <div className="text-[11px] text-opiom-muted font-heading tracking-[0.3em] uppercase">Rank Distribution</div>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={DEMO_RANK_DIST} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                  {DEMO_RANK_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {DEMO_RANK_DIST.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-[11px] text-opiom-muted">{d.name}</span>
                  </div>
                  <span className="text-[11px] font-heading font-black" style={{ color: d.color }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Door sessions */}
        <div className="rounded-2xl border border-opiom-border p-5" style={{ background: '#060D18' }}>
          <div className="flex items-center gap-2 mb-5">
            <Globe size={12} className="text-gold" />
            <div className="text-[11px] text-opiom-muted font-heading tracking-[0.3em] uppercase">Door Sessions (30d)</div>
          </div>
          <div className="space-y-3">
            {DEMO_DOORS.map(d => {
              const max = Math.max(...DEMO_DOORS.map(x => x.sessions));
              const pct = Math.round((d.sessions / max) * 100);
              return (
                <div key={d.door}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-heading font-black" style={{ color: d.color }}>{d.door}</span>
                    <span className="text-[11px] text-opiom-muted">{d.sessions.toLocaleString()} sessions</span>
                  </div>
                  <div className="h-2 bg-opiom-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${d.color}60, ${d.color})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Commissions trend */}
      <div className="rounded-2xl border border-opiom-border p-5" style={{ background: '#060D18' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-gold" />
            <div className="text-[11px] text-opiom-muted font-heading tracking-[0.3em] uppercase">Commission Flow</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={DEMO_MONTHLY}>
            <CartesianGrid stroke="#1A2540" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#8899B4', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8899B4', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip {...CHART_STYLE} formatter={v => [`$${v}`, 'Commissions']} />
            <Line type="monotone" dataKey="commissions" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
