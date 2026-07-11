import { useEffect, useState } from 'react';
import { Users, Search, Shield, Zap, Crown, ChevronDown, MoreHorizontal, Mail, Ban, Star } from 'lucide-react';
import { db } from '@/lib/supabase';
import { toast } from 'sonner';

const RANKS = ['The Curious', 'The Hooked', 'The Obsessed', 'The Addict', 'The Dealer', 'The Legend'];

const RANK_STYLES = {
  'The Curious':  { color: '#8899B4', emoji: '👁️' },
  'The Hooked':   { color: '#3B82F6', emoji: '🎣' },
  'The Obsessed': { color: '#10B981', emoji: '🔥' },
  'The Addict':   { color: '#F97316', emoji: '💊' },
  'The Dealer':   { color: '#D4A843', emoji: '💰' },
  'The Legend':   { color: '#A855F7', emoji: '👑' },
};

const DEMO_USERS = [
  { id: 'u1', full_name: 'Ahmad Al-Legend',  email: 'ahmad@example.com',  rank: 'The Legend',   xp: 14800, created_at: '2024-01-10T00:00:00Z' },
  { id: 'u2', full_name: 'Omar The Dealer',  email: 'omar@example.com',   rank: 'The Dealer',   xp: 9200,  created_at: '2024-02-05T00:00:00Z' },
  { id: 'u3', full_name: 'Khalid Obsessed',  email: 'khalid@example.com', rank: 'The Obsessed', xp: 5600,  created_at: '2024-03-15T00:00:00Z' },
  { id: 'u4', full_name: 'Sara Addict',      email: 'sara@example.com',   rank: 'The Addict',   xp: 3800,  created_at: '2024-04-20T00:00:00Z' },
  { id: 'u5', full_name: 'Yousef Hooked',    email: 'yousef@example.com', rank: 'The Hooked',   xp: 1200,  created_at: '2024-05-01T00:00:00Z' },
  { id: 'u6', full_name: 'Layla Curious',    email: 'layla@example.com',  rank: 'The Curious',  xp: 340,   created_at: '2024-05-10T00:00:00Z' },
];

export default function UserManager() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [rankFilter, setRankFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    db.profiles().select('*').order('xp', { ascending: false }).limit(100)
      .then(({ data }) => {
        setUsers(data && data.length > 0 ? data : DEMO_USERS);
        setLoading(false);
      });
  }, []);

  const updateRank = async (userId, newRank) => {
    setUpdating(userId);
    const { error } = await db.profiles().update({ rank: newRank }).eq('id', userId);
    if (error) {
      toast.error('Failed to update rank.');
    } else {
      setUsers(u => u.map(x => x.id === userId ? { ...x, rank: newRank } : x));
      toast.success(`Rank updated to ${newRank}.`);
    }
    setUpdating(null);
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || (u.full_name ?? '').toLowerCase().includes(search.toLowerCase())
      || (u.email ?? '').toLowerCase().includes(search.toLowerCase());
    const matchRank = rankFilter === 'all' || u.rank === rankFilter;
    return matchSearch && matchRank;
  });

  return (
    <div className="space-y-6 animate-fade-in" onClick={() => setOpenMenu(null)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} className="text-gold" />
            <h1 className="font-heading text-2xl font-black text-white tracking-wider">USER MANAGER</h1>
          </div>
          <p className="text-sm text-opiom-muted">Manage agents, assign ranks, and monitor performance.</p>
        </div>
        <div className="font-heading font-black text-sm text-opiom-muted">
          <span className="text-gold">{filtered.length}</span> agents
        </div>
      </div>

      {/* Rank distribution pills */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(RANK_STYLES).map(([rank, cfg]) => {
          const count = users.filter(u => u.rank === rank).length;
          return (
            <div key={rank} className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-heading font-black"
              style={{ borderColor: `${cfg.color}25`, background: `${cfg.color}08`, color: cfg.color }}>
              {cfg.emoji} {rank.split(' ').pop().toUpperCase()} · {count}
            </div>
          );
        })}
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-opiom-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..."
            className="w-full bg-opiom-surface border border-opiom-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-opiom-muted/40 focus:outline-none focus:border-gold/50 transition-colors" />
        </div>
        <select value={rankFilter} onChange={e => setRankFilter(e.target.value)}
          className="bg-opiom-surface border border-opiom-border rounded-xl px-3 py-2.5 text-xs text-opiom-muted focus:outline-none focus:border-gold/50 cursor-pointer">
          <option value="all">All Ranks</option>
          {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-opiom-border overflow-hidden" style={{ background: '#060D18' }}>
        <div className="px-5 py-4 border-b border-opiom-border flex items-center justify-between">
          <div className="text-[11px] text-opiom-muted font-heading tracking-widest uppercase">Agent Roster · {filtered.length}</div>
          <div className="flex items-center gap-1">
            <Shield size={11} className="text-gold/40" />
            <span className="text-[10px] text-opiom-muted/60">Admin View</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="text-opiom-muted/20 mx-auto mb-3" />
            <p className="text-opiom-muted text-sm">No agents match your search.</p>
          </div>
        ) : (
          <div className="divide-y divide-opiom-border/50">
            {/* Column headers */}
            <div className="grid grid-cols-[2rem_1fr_1fr_8rem_5rem_2.5rem] gap-4 px-5 py-2.5 text-[9px] text-opiom-muted/50 font-heading tracking-widest uppercase">
              <div>#</div>
              <div>Agent</div>
              <div>Email</div>
              <div>Rank</div>
              <div className="text-right">XP</div>
              <div />
            </div>

            {filtered.map((u, i) => {
              const rs = RANK_STYLES[u.rank] ?? RANK_STYLES['The Curious'];
              return (
                <div key={u.id}
                  className="grid grid-cols-[2rem_1fr_1fr_8rem_5rem_2.5rem] gap-4 px-5 py-3.5 items-center hover:bg-white/2 transition-colors"
                  style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="text-[11px] text-opiom-muted/40 font-heading">{i + 1}</div>

                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-heading font-black text-sm flex-shrink-0"
                      style={{ background: `${rs.color}12`, border: `1px solid ${rs.color}25`, color: rs.color }}>
                      {u.full_name?.[0] ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{u.full_name ?? 'Unknown'}</div>
                      <div className="text-[9px] text-opiom-muted/50">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-opiom-muted truncate">{u.email ?? '—'}</div>

                  <div>
                    <select
                      value={u.rank ?? 'The Curious'}
                      onChange={e => updateRank(u.id, e.target.value)}
                      disabled={updating === u.id}
                      className="text-[10px] font-heading font-black px-2 py-1.5 rounded-lg border cursor-pointer focus:outline-none transition-all disabled:opacity-50"
                      style={{ color: rs.color, background: `${rs.color}10`, borderColor: `${rs.color}30` }}
                      onClick={e => e.stopPropagation()}>
                      {RANKS.map(r => <option key={r} value={r} style={{ background: '#0B1220', color: '#fff' }}>{r}</option>)}
                    </select>
                  </div>

                  <div className="text-right font-heading font-black text-sm text-gold">
                    {(u.xp ?? 0).toLocaleString()}
                    <span className="text-[9px] text-opiom-muted font-normal ml-1">XP</span>
                  </div>

                  <div className="relative flex justify-end" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                      className="p-1.5 rounded-lg text-opiom-muted hover:text-white hover:bg-white/5 transition-all">
                      <MoreHorizontal size={13} />
                    </button>
                    {openMenu === u.id && (
                      <div className="absolute right-0 top-full mt-1 z-20 rounded-xl border border-opiom-border shadow-2xl overflow-hidden"
                        style={{ background: '#0B1220', minWidth: 160 }}>
                        {[
                          { label: 'Grant +500 XP', icon: Star,  color: '#D4A843' },
                          { label: 'Send Signal',   icon: Zap,   color: '#3B82F6' },
                          { label: 'View Profile',  icon: Shield, color: '#8899B4' },
                          { label: 'Suspend User',  icon: Ban,   color: '#EF4444' },
                        ].map(a => {
                          const Icon = a.icon;
                          return (
                            <button key={a.label}
                              onClick={() => { toast.success(`${a.label} — feature coming soon.`); setOpenMenu(null); }}
                              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs hover:bg-white/5 transition-colors text-left"
                              style={{ color: a.color }}>
                              <Icon size={12} />
                              {a.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
