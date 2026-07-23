import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Trophy, Medal, Crown, Star } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { GlassPanel } from '@/hud';

const ACCENT = '#6366f1';

const DOORS = [
  { key: 'network', label: 'FORGE', sublabel: 'IB Network', color: '#D4A843', metric: 'clients', table: 'network_members', col: 'total_lots' },
  { key: 'edge', label: 'EDGE', sublabel: 'Traders', color: '#06B6D4', metric: 'lots', table: 'network_members', col: 'total_lots' },
  { key: 'oracle', label: 'ORACLE', sublabel: 'Academy', color: '#10B981', metric: 'courses', table: 'network_members', col: 'xp_points' },
  { key: 'hub', label: 'HUB', sublabel: 'Overall', color: '#6366F1', metric: 'xp', table: 'profiles', col: 'xp_points' },
];

const MEDALS = [
  { rank: 1, Icon: Crown, color: '#D4A843' },
  { rank: 2, Icon: Medal, color: '#C0C0C0' },
  { rank: 3, Icon: Medal, color: '#CD7F32' },
];

export default function TheLeaderboard() {
  const { t } = useLang();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('hub');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const door = DOORS.find(d => d.key === activeTab);
    supabase.from(door.table).select('id, full_name, avatar_url, xp_points, plan, rank').order(door.col, { ascending: false }).limit(50)
      .then(({ data }) => setEntries(data || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const activeDoor = DOORS.find(d => d.key === activeTab);
  const myRank = entries.findIndex(e => e.id === user?.id) + 1;
  const rise = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="s4hud" style={{ ['--accent']: ACCENT, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", maxWidth: '900px', margin: '0 auto' }}>

      <motion.div {...rise} transition={{ duration: 0.5 }} style={{ marginBottom: '22px' }}>
        <div className="s4-label s4-accent" style={{ letterSpacing: '0.35em', marginBottom: 6 }}>{t('CROSS-DOOR RANKINGS', 'الترتيب عبر الأبواب')}</div>
        <h1 style={{ fontFamily: "'Satoshi',sans-serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 500, lineHeight: 1.02, margin: 0,
          background: 'linear-gradient(135deg,#fff 0%,#A5B4FC 60%,#6366F1 120%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 4px 22px rgba(99,102,241,0.35))' }}>{t('LEADERBOARD', 'لوحة الصدارة')}</h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 0' }}>{t('Cross-door rankings — unified across SOLVEN4', 'ترتيب موحد عبر جميع أبواب SOLVEN4')}</p>
      </motion.div>

      {/* Door tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
        {DOORS.map(d => (
          <button key={d.key} onClick={() => setActiveTab(d.key)}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: activeTab === d.key ? `${d.color}20` : 'transparent',
              outline: activeTab === d.key ? `1px solid ${d.color}40` : 'none',
              transition: 'all 0.15s',
            }}>
            <div style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: activeTab === d.key ? d.color : '#94A3B8' }}>{d.label}</div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>{d.sublabel}</div>
          </button>
        ))}
      </div>

      {/* My rank card */}
      {myRank > 0 && (
        <GlassPanel className="spatial lift" brackets={false} style={{ ['--accent']: activeDoor.color, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="s4-num" style={{ fontSize: '28px', fontWeight: 500, color: activeDoor.color, fontFamily: "'Satoshi',sans-serif", minWidth: '48px', textAlign: 'center' }}>
            #{myRank}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{t('Your Ranking', 'ترتيبك')}</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{activeDoor.label} · {activeDoor.sublabel}</div>
          </div>
          <Star size={18} color={activeDoor.color} />
        </GlassPanel>
      )}

      {/* Leaderboard table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlassPanel className="spatial lift" style={{ ['--accent']: activeDoor.color }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px', fontSize: '13px' }}>{t('Loading rankings...', 'جارٍ تحميل الترتيب...')}</div>
          ) : entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px' }}>
              <Trophy size={32} color="#94A3B8" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              <p style={{ color: '#94A3B8', fontSize: '12.5px' }}>{t('No rankings yet. Be the first!', 'لا يوجد ترتيب بعد. كن الأول!')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 100px 100px', gap: '12px', padding: '8px 12px', borderBottom: '1px solid var(--s4-line)', marginBottom: '4px' }}>
                {['#', t('Operator', 'المشغل'), t('Rank', 'الرتبة'), activeDoor.metric.toUpperCase()].map(h => (
                  <div key={h} className="s4-label" style={{ fontSize: '9px' }}>{h}</div>
                ))}
              </div>
              {entries.map((entry, i) => {
                const medal = MEDALS.find(m => m.rank === i + 1);
                const isMe = entry.id === user?.id;
                return (
                  <motion.div key={entry.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    style={{
                      display: 'grid', gridTemplateColumns: '48px 1fr 100px 100px', gap: '12px',
                      padding: '10px 12px', borderRadius: '10px', alignItems: 'center',
                      background: isMe ? `${activeDoor.color}10` : i < 3 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      border: isMe ? `1px solid ${activeDoor.color}30` : '1px solid transparent',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => !isMe && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => !isMe && (e.currentTarget.style.background = 'transparent')}>

                    {/* Rank */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {medal
                        ? <medal.Icon size={18} color={medal.color} />
                        : <span className="s4-num" style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8' }}>{i + 1}</span>}
                    </div>

                    {/* Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: `${activeDoor.color}25`, border: `1px solid ${activeDoor.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 700, color: activeDoor.color,
                      }}>
                        {entry.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: isMe ? activeDoor.color : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entry.full_name || t('Anonymous', 'مجهول')} {isMe && `(${t('you', 'أنت')})`}
                        </div>
                      </div>
                    </div>

                    {/* Rank badge */}
                    <div>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#94A3B8', fontWeight: 600, textTransform: 'capitalize' }}>
                        {entry.rank || 'rookie'}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="s4-num" style={{ fontSize: '14px', fontWeight: 700, color: i < 3 ? activeDoor.color : '#fff' }}>
                      {(entry.xp_points || 0).toLocaleString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassPanel>
      </motion.div>
    </div>
  );
}
