import { useEffect, useState, useCallback } from 'react';
import { Settings, Users, DollarSign, TrendingUp, Zap, ShieldCheck, AlertTriangle, RefreshCw, Globe, Database, Activity, Bot, BarChart2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const DOOR_COLOR = { EDGE: '#06B6D4', FORGE: '#D4A843', ORACLE: '#10B981', NEXUS: '#EF4444' };

export default function OperatorHub() {
  const [inventory,     setInventory]     = useState([]);
  const [members,       setMembers]       = useState([]);
  const [balances,      setBalances]      = useState([]);
  const [aiCostToday,   setAiCostToday]   = useState(0);
  const [securityScore, setSecurityScore] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const yesterday = new Date(Date.now() - 86400000).toISOString();

      const [inv, mems, bals, aiCost, secEvents] = await Promise.all([
        supabase.from('founding_seat_inventory').select('*').order('tier'),
        supabase.from('founding_members').select('*').order('created_at', { ascending: false }).limit(25),
        supabase.from('ledger_balances').select('*').order('category'),
        supabase.from('ai_cost_log').select('cost_usd').gte('created_at', yesterday),
        supabase.from('security_events').select('event_type').gte('created_at', yesterday),
      ]);

      setInventory(inv.data  || []);
      setMembers(mems.data   || []);
      setBalances(bals.data  || []);

      const todayCost = (aiCost.data || []).reduce((s, r) => s + Number(r.cost_usd), 0);
      setAiCostToday(todayCost);

      // Compute security score
      let score = 100;
      const counts = {};
      (secEvents.data || []).forEach(e => { counts[e.event_type] = (counts[e.event_type] || 0) + 1; });
      score -= Math.min(30, (counts.auth_failed         || 0) * 2);
      score -= Math.min(25, (counts.rate_limit_hit      || 0));
      score -= (counts.invalid_webhook_signature || 0) * 15;
      score -= (counts.suspicious_ip             || 0) * 10;
      score -= (counts.duplicate_payment_attempt || 0) * 20;
      setSecurityScore(Math.max(0, Math.round(score)));
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30_000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const handleRefresh = () => { setRefreshing(true); loadAll(); };

  const totalRevenue = members.reduce((s, m) => s + Number(m.amount_paid_usd || 0), 0);
  const scoreColor   = securityScore === null ? '#8899B4' : securityScore >= 80 ? '#10B981' : securityScore >= 60 ? '#D4A843' : '#EF4444';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#D4A843', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={18} className="text-gold" />
            <h1 className="font-heading text-2xl font-black text-white tracking-wider">OPERATOR HUB</h1>
          </div>
          <p className="text-sm text-opiom-muted">Live platform command center — auto-refreshes every 30s</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-opiom-border text-opiom-muted hover:text-white hover:border-gold/40 transition-all text-xs disabled:opacity-50">
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',       val: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, color: '#10B981', icon: DollarSign },
          { label: 'Founding Members',    val: members.length,         color: '#6366F1', icon: Users },
          { label: 'AI Cost (24h)',        val: `$${aiCostToday.toFixed(2)}`, color: '#D4A843', icon: Bot },
          { label: 'Security Score',       val: securityScore !== null ? `${securityScore}/100` : '—', color: scoreColor, icon: ShieldCheck },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="relative rounded-2xl border border-opiom-border p-5 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #060D18, #0B1220)' }}>
              <div className="absolute top-0 right-0 w-20 h-20"
                style={{ background: `radial-gradient(circle at top right, ${k.color}15, transparent)` }} />
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] text-opiom-muted uppercase tracking-widest">{k.label}</div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${k.color}12`, border: `1px solid ${k.color}20` }}>
                  <Icon size={14} style={{ color: k.color }} />
                </div>
              </div>
              <div className="font-heading text-3xl font-black" style={{ color: k.color }}>{k.val}</div>
            </div>
          );
        })}
      </div>

      {/* Seat Inventory */}
      <div className="rounded-2xl border border-opiom-border overflow-hidden" style={{ background: '#060D18' }}>
        <div className="px-5 py-4 border-b border-opiom-border flex items-center justify-between">
          <div className="text-[11px] text-opiom-muted font-heading tracking-widest uppercase flex items-center gap-2">
            <Globe size={11} className="text-gold" /> FOUNDING SEAT INVENTORY
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-opiom-border/50">
          {inventory.map(row => {
            const available = row.total_seats - row.seats_confirmed - row.seats_reserved;
            const pct = (row.seats_confirmed / row.total_seats) * 100;
            const color = DOOR_COLOR[row.tier] || '#6366F1';
            return (
              <div key={row.tier} className="p-5">
                <div className="text-sm font-heading font-black mb-1" style={{ color }}>{row.tier}</div>
                <div className="font-heading text-4xl font-black text-white">{available}</div>
                <div className="text-[10px] text-opiom-muted mb-3">of {row.total_seats} available</div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="flex justify-between mt-2 text-[9px] text-opiom-muted">
                  <span>{row.seats_confirmed} sold</span>
                  <span>{row.seats_reserved} reserved</span>
                </div>
              </div>
            );
          })}
          {inventory.length === 0 && (
            <div className="col-span-4 p-8 text-center text-opiom-muted text-sm">
              Run the Supabase migration to populate seat inventory.
            </div>
          )}
        </div>
      </div>

      {/* Treasury Ledger */}
      {balances.length > 0 && (
        <div className="rounded-2xl border border-opiom-border overflow-hidden" style={{ background: '#060D18' }}>
          <div className="px-5 py-4 border-b border-opiom-border">
            <div className="text-[11px] text-opiom-muted font-heading tracking-widest uppercase flex items-center gap-2">
              <BarChart2 size={11} className="text-gold" /> TREASURY LEDGER
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {balances.map(b => (
              <div key={b.category} className="p-4" style={{ background: '#060D18' }}>
                <div className="text-[10px] text-opiom-muted uppercase tracking-wider mb-1">
                  {b.category.replace(/_/g, ' ')}
                </div>
                <div className="font-heading text-xl font-black" style={{ color: Number(b.balance_usd) < 0 ? '#EF4444' : '#10B981' }}>
                  ${Number(b.balance_usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Founding Members */}
      <div className="rounded-2xl border border-opiom-border overflow-hidden" style={{ background: '#060D18' }}>
        <div className="px-5 py-4 border-b border-opiom-border">
          <div className="text-[11px] text-opiom-muted font-heading tracking-widest uppercase flex items-center gap-2">
            <Users size={11} className="text-gold" /> RECENT FOUNDING MEMBERS
          </div>
        </div>
        {members.length === 0 ? (
          <div className="p-8 text-center text-opiom-muted text-sm">No founding members yet — payments not yet live.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-opiom-border/50">
                  {['Tier', 'Doors', 'Amount', 'Processor', 'Date'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] text-opiom-muted uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-opiom-border/30">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-heading font-black text-xs" style={{ color: DOOR_COLOR[m.founding_tier] || '#6366F1' }}>
                        {m.founding_tier}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-opiom-muted text-xs">{(m.founding_doors || []).join(', ')}</td>
                    <td className="px-5 py-3">
                      <span className="font-heading font-black text-xs text-emerald-400">${m.amount_paid_usd}</span>
                    </td>
                    <td className="px-5 py-3 text-opiom-muted text-xs uppercase">{m.payment_processor}</td>
                    <td className="px-5 py-3 text-opiom-muted text-xs">
                      {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="rounded-2xl border border-opiom-border overflow-hidden" style={{ background: '#060D18' }}>
        <div className="px-5 py-4 border-b border-opiom-border">
          <div className="text-[11px] text-opiom-muted font-heading tracking-widest uppercase flex items-center gap-2">
            <Activity size={11} className="text-gold" /> SYSTEM STATUS
          </div>
        </div>
        <div className="divide-y divide-opiom-border/50">
          {[
            { name: 'Supabase Database',    status: 'operational', note: 'Connected' },
            { name: 'Dodo Payments',        status: inventory.length > 0 ? 'operational' : 'pending', note: inventory.length > 0 ? 'Active' : 'Apply at dodopayments.com' },
            { name: 'AI Brain Interface',   status: 'operational', note: 'Claude Sonnet 5' },
            { name: 'Seat Concurrency',     status: 'operational', note: 'PostgreSQL locks active' },
            { name: 'Treasury Ledger',      status: balances.length > 0 ? 'operational' : 'pending', note: balances.length > 0 ? 'Auto-allocation active' : 'Run migration' },
            { name: 'Security SOC',         status: 'operational', note: `Score: ${securityScore ?? '—'}/100` },
          ].map(s => (
            <div key={s.name} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full"
                  style={{
                    background: s.status === 'operational' ? '#10B981' : '#D4A843',
                    boxShadow: `0 0 6px ${s.status === 'operational' ? '#10B981' : '#D4A843'}80`,
                  }} />
                <span className="text-sm text-white">{s.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-opiom-muted">{s.note}</span>
                <span className="text-[10px] font-heading font-black"
                  style={{ color: s.status === 'operational' ? '#10B981' : '#D4A843' }}>
                  {s.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
