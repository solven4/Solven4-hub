import { useEffect, useState } from 'react';
import { Network, Users, Link2, TrendingUp, DollarSign, GitBranch, ArrowUpRight, Trophy, Zap, MessageCircle, Send, Globe } from 'lucide-react';
import { db } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

// SOLVEN4 FORGE (S4-II) — IB command center full feature map
const NETWORK_MODULES = [
  {
    group: 'INTELLIGENCE',
    color: 'text-gold',
    border: 'border-gold/20',
    bg: 'bg-gold/5',
    items: ['Network Hub (Tree view)', 'Network CRM (Trader Kanban)', 'Lead Intelligence (Kanban)', 'Leads & Clients (Table)', 'Activity Log', 'Analytics (7 tabs)'],
  },
  {
    group: 'AI TOOLS',
    color: 'text-pulse',
    border: 'border-pulse/20',
    bg: 'bg-pulse/5',
    items: ['Market Signals', 'Deposit Predictor', 'Churn Predictor', 'Retention Bot', 'Client Segmentation', 'Content Generator', 'Lead Generator', 'Smart Calendar'],
  },
  {
    group: 'MESSAGING',
    color: 'text-ascend',
    border: 'border-ascend/20',
    bg: 'bg-ascend/5',
    items: ['Social Hub (6 tabs)', 'WhatsApp Broadcast & DM', 'Telegram Bot & Channels', 'Live Signals', 'Unified Inbox', 'Alerts Center'],
  },
  {
    group: 'FINANCE & NETWORK',
    color: 'text-network',
    border: 'border-gold/20',
    bg: 'bg-gold/5',
    items: ['Finance Hub', 'Commission Engine', 'Broker Rebate Config', 'Tier Upgrade Panel', 'Referral Link Generator', 'Payout Rules & Scheduler'],
  },
  {
    group: 'GAMIFICATION',
    color: 'text-command',
    border: 'border-command/20',
    bg: 'bg-command/5',
    items: ['XP Leaderboard', 'Arena Challenges', 'Trade Heatmap', 'Milestone Notifier', 'Public Leaderboard', 'Referral Leaderboard'],
  },
  {
    group: 'TOOLS',
    color: 'text-fire',
    border: 'border-fire/20',
    bg: 'bg-fire/5',
    items: ['Content Studio (AI)', 'Automation Center', 'MT4/MT5 Sync', 'Brand Share Cards', 'Content Calendar', 'Social Accounts Manager'],
  },
];

export default function TheWeb() {
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [links, setLinks] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      db.networkMembers().select('*').eq('referrer_id', user.id).order('created_at', { ascending: false }).limit(20),
      db.referralLinks().select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(5),
      db.commissions().select('amount, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    ]).then(([m, l, c]) => {
      setMembers(m.data ?? []);
      setLinks(l.data ?? []);
      setCommissions(c.data ?? []);
      setLoading(false);
    });
  }, [user]);

  const totalCommissions = commissions.reduce((s, c) => s + (c.amount ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white tracking-wider">THE WEB</h1>
          <p className="text-sm text-opiom-muted mt-0.5">
            S4 FORGE (S4-II) — IB empire, referrals, commissions & network intelligence.
          </p>
        </div>
        <a
          href="https://solven4-forge-pi.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold text-xs font-heading font-bold px-4 py-2 rounded-xl hover:bg-gold/20 transition-colors tracking-wider"
        >
          ENTER S4 FORGE <ArrowUpRight size={13} />
        </a>
      </div>

      {/* Quick stats from Supabase shared DB */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Network Members', val: members.length,                     icon: Users,       color: 'text-ascend' },
          { label: 'Referral Links',  val: links.length,                       icon: Link2,       color: 'text-pulse' },
          { label: 'Commissions',     val: `$${totalCommissions.toFixed(0)}`,  icon: DollarSign,  color: 'text-gold' },
          { label: 'Network Depth',   val: '3 Levels',                         icon: GitBranch,   color: 'text-command' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-opiom-surface border border-opiom-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] text-opiom-muted uppercase tracking-widest">{s.label}</div>
                <Icon size={14} className={s.color} />
              </div>
              <div className={`font-heading text-xl font-black ${s.color}`}>{loading ? '—' : s.val}</div>
            </div>
          );
        })}
      </div>

      {/* Live data panels */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Network Members */}
          <div className="bg-opiom-surface border border-opiom-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-opiom-border flex items-center justify-between">
              <div className="text-[11px] text-opiom-muted font-heading tracking-widest uppercase">Network Members</div>
              <Users size={13} className="text-ascend" />
            </div>
            {members.length === 0 ? (
              <div className="p-6 text-center text-opiom-muted text-xs">No members yet. Share your link to grow The Web.</div>
            ) : (
              <div className="divide-y divide-opiom-border">
                {members.slice(0, 6).map(m => (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-7 h-7 rounded-full bg-ascend/20 border border-ascend/30 flex items-center justify-center text-ascend text-xs font-bold flex-shrink-0">
                      {m.member_name?.[0] ?? 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{m.member_name ?? 'Agent'}</div>
                      <div className="text-[10px] text-opiom-muted">{new Date(m.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-[9px] bg-ascend/10 text-ascend px-1.5 py-0.5 rounded-full font-bold">Lv.{m.level ?? 1}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Referral Links */}
          <div className="bg-opiom-surface border border-opiom-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-opiom-border flex items-center justify-between">
              <div className="text-[11px] text-opiom-muted font-heading tracking-widest uppercase">Referral Links</div>
              <Link2 size={13} className="text-pulse" />
            </div>
            {links.length === 0 ? (
              <div className="p-6 text-center text-opiom-muted text-xs">No links yet. Create them in S4 FORGE.</div>
            ) : (
              <div className="divide-y divide-opiom-border">
                {links.map(l => (
                  <div key={l.id} className="px-5 py-3">
                    <div className="text-xs font-semibold text-white mb-1">{l.name ?? 'Referral Link'}</div>
                    <div className="text-[10px] text-opiom-muted font-mono truncate mb-1">{l.slug}</div>
                    <div className="flex gap-3 text-[10px] text-opiom-muted">
                      <span><span className="text-gold font-bold">{l.click_count ?? 0}</span> clicks</span>
                      <span><span className="text-ascend font-bold">{l.conversion_count ?? 0}</span> converted</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Commissions */}
          <div className="bg-opiom-surface border border-opiom-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-opiom-border flex items-center justify-between">
              <div className="text-[11px] text-opiom-muted font-heading tracking-widest uppercase">Recent Commissions</div>
              <DollarSign size={13} className="text-gold" />
            </div>
            {commissions.length === 0 ? (
              <div className="p-6 text-center text-opiom-muted text-xs">No commissions yet.</div>
            ) : (
              <div className="divide-y divide-opiom-border">
                {commissions.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white">{c.description ?? 'Commission'}</div>
                      <div className="text-[10px] text-opiom-muted">{new Date(c.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-xs font-bold text-gold">${(c.amount ?? 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* NETWORK Door Feature Map */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Network size={16} className="text-gold" />
          <div className="text-[11px] text-opiom-muted font-heading tracking-[0.3em] uppercase">S4 FORGE — Full Module Map</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NETWORK_MODULES.map(mod => (
            <div key={mod.group} className={`border ${mod.border} ${mod.bg} rounded-xl p-4`}>
              <div className={`text-[10px] font-heading font-black tracking-widest uppercase mb-3 ${mod.color}`}>{mod.group}</div>
              <div className="space-y-1.5">
                {mod.items.map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-opiom-muted">
                    <div className={`w-1 h-1 rounded-full flex-shrink-0 ${mod.color.replace('text-', 'bg-')}`} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messaging channels quick-access */}
      <div className="bg-opiom-surface border border-opiom-border rounded-2xl p-5">
        <div className="text-[11px] text-opiom-muted font-heading tracking-widest uppercase mb-4">Messaging Channels (in S4 FORGE)</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'WhatsApp',    sub: 'Broadcast & DM',   icon: MessageCircle, color: 'text-[#25D366] bg-[#25D366]/10 border-[#25D366]/20' },
            { label: 'Telegram',    sub: 'Bot & Channels',   icon: Send,          color: 'text-[#2AABEE] bg-[#2AABEE]/10 border-[#2AABEE]/20' },
            { label: 'Social Hub',  sub: '6 Platforms',      icon: Globe,         color: 'text-pulse bg-pulse/10 border-pulse/20' },
            { label: 'Live Signals',sub: 'Trading Alerts',   icon: TrendingUp,    color: 'text-gold bg-gold/10 border-gold/20' },
          ].map(ch => {
            const Icon = ch.icon;
            return (
              <div key={ch.label} className={`border rounded-xl p-3 ${ch.color}`}>
                <Icon size={16} className="mb-2" />
                <div className="text-xs font-heading font-bold">{ch.label}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{ch.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
