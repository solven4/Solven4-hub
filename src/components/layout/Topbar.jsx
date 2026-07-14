import { useState, useEffect } from 'react';
import { Bell, Search, Zap, X, TrendingUp, Network, BookOpen, Building2, ExternalLink } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { DOORS } from '@/lib/doors';

const RANK_STYLES = {
  'The Curious':  { color: '#94A3B8', label: 'CURIOUS' },
  'The Hooked':   { color: '#3B82F6', label: 'HOOKED' },
  'The Obsessed': { color: '#10B981', label: 'OBSESSED' },
  'The Addict':   { color: '#F97316', label: 'ADDICT' },
  'The Dealer':   { color: '#D4A843', label: 'DEALER' },
  'The Legend':   { color: '#A855F7', label: 'LEGEND' },
};

const PAGE_TITLES = {
  '/dashboard/command': { title: 'THE COMMAND', sub: 'Master Intelligence Dashboard' },
  '/dashboard/arena':   { title: 'THE ARENA',   sub: 'Global Rank Leaderboard' },
  '/dashboard/web':     { title: 'THE WEB',     sub: 'IB Network Overview' },
  '/dashboard/score':   { title: 'THE SCORE',   sub: 'Cross-Door Commissions' },
  '/dashboard/brain':   { title: 'THE BRAIN',   sub: 'AI Persona Orchestrator' },
  '/dashboard/signals': { title: 'THE SIGNALS', sub: 'Cross-Door Notifications' },
  '/dashboard/vault':   { title: 'THE VAULT',   sub: 'Wallet & Withdrawals' },
  '/admin/hub':         { title: 'OPERATOR HUB',     sub: 'Master Control Center' },
  '/admin/users':       { title: 'USER MANAGER',     sub: 'All Platform Agents' },
  '/admin/analytics':   { title: 'GLOBAL ANALYTICS', sub: 'Platform-Wide Intelligence' },
};

export default function Topbar({ isAdmin }) {
  const { profile } = useAuthStore();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const rank = profile?.rank ?? 'The Curious';
  const rankStyle = RANK_STYLES[rank] ?? RANK_STYLES['The Curious'];
  const pageInfo = PAGE_TITLES[location.pathname] ?? { title: 'SOLVEN4 INTELLIGENCE', sub: 'Master Platform' };
  const xp = profile?.xp ?? 0;
  const nextXP = Math.ceil((xp + 1) / 500) * 500;
  const xpPct = Math.min(100, ((xp % 500) / 500) * 100);

  useEffect(() => {
    const el = document.querySelector('main');
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 10);
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className={`h-14 flex items-center px-5 gap-4 flex-shrink-0 transition-all duration-300 sticky top-0 z-20 ${scrolled ? 'shadow-lg shadow-black/20' : ''}`}
        style={{ background: scrolled ? 'rgba(5,5,12,0.95)' : 'rgba(10,12,30,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #29293D' }}>

        {/* Page identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-heading text-sm font-black text-white tracking-wider truncate">{pageInfo.title}</div>
            {isAdmin && (
              <span className="text-[9px] bg-command/20 text-command border border-command/30 px-1.5 py-0.5 rounded font-heading font-black tracking-wider">ADMIN</span>
            )}
          </div>
          <div className="text-[10px] text-opiom-muted hidden sm:block truncate">{pageInfo.sub}</div>
        </div>

        {/* XP Progress bar (mobile hidden) */}
        <div className="hidden md:flex items-center gap-2 bg-opiom-bg/60 border border-opiom-border rounded-lg px-3 py-1.5">
          <Zap size={11} style={{ color: rankStyle.color }} />
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-heading font-black tracking-wider" style={{ color: rankStyle.color }}>{rankStyle.label}</span>
              <span className="text-[10px] text-opiom-muted font-bold">{xp} XP</span>
            </div>
            <div className="w-24 h-1 bg-opiom-border rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${xpPct}%`, background: rankStyle.color }} />
            </div>
          </div>
        </div>

        {/* Door quick-access */}
        <div className="hidden lg:flex items-center gap-1">
          {DOORS.map(door => (
            <a key={door.id} href={door.href} target="_blank" rel="noopener noreferrer"
              title={door.fullName}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background: `${door.color}15`, border: `1px solid ${door.color}25` }}
              onMouseEnter={e => { e.currentTarget.style.background = `${door.color}30`; e.currentTarget.style.borderColor = `${door.color}50`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${door.color}15`; e.currentTarget.style.borderColor = `${door.color}25`; }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: door.color }} />
            </a>
          ))}
        </div>

        {/* Search */}
        <button onClick={() => setSearchOpen(true)}
          className="p-2 rounded-lg text-opiom-muted hover:text-white hover:bg-opiom-border/40 transition-all">
          <Search size={15} />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-opiom-muted hover:text-white hover:bg-opiom-border/40 transition-all">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-heading font-black text-sm cursor-pointer transition-transform hover:scale-105 flex-shrink-0"
          style={{ background: `${rankStyle.color}20`, color: rankStyle.color, border: `1px solid ${rankStyle.color}30` }}>
          {profile?.full_name?.[0]?.toUpperCase() ?? 'O'}
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={() => setSearchOpen(false)}
          style={{ background: 'rgba(5,5,12,0.88)', backdropFilter: 'blur(20px)' }}>
          <div className="w-full max-w-xl bg-opiom-surface border border-opiom-border rounded-2xl overflow-hidden shadow-2xl animate-appear-in"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-opiom-border">
              <Search size={16} className="text-opiom-muted flex-shrink-0" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search Intelligence…"
                className="flex-1 bg-transparent text-sm text-white placeholder-opiom-muted focus:outline-none" />
              <button onClick={() => setSearchOpen(false)} className="text-opiom-muted hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="p-3 space-y-1">
              {[
                { label: 'THE COMMAND — Dashboard', to: '/dashboard/command' },
                { label: 'THE ARENA — Leaderboard', to: '/dashboard/arena' },
                { label: 'THE VAULT — Payouts', to: '/dashboard/vault' },
                { label: 'THE BRAIN — AI Agents', to: '/dashboard/brain' },
              ].filter(i => !query || i.label.toLowerCase().includes(query.toLowerCase())).map(item => (
                <button key={item.to} onClick={() => { setSearchOpen(false); window.location.href = item.to; }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-opiom-muted hover:text-white hover:bg-opiom-border/30 transition-all text-left">
                  <Zap size={12} className="text-gold/50 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-opiom-border flex items-center gap-2 text-[10px] text-opiom-muted">
              <kbd className="px-1.5 py-0.5 bg-opiom-border rounded text-[9px] font-mono">ESC</kbd> to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}
