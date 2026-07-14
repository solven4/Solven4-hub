import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Trophy, Medal, Crown, TrendingUp, Users, Star } from 'lucide-react';

const S = {
  card: { background: 'rgba(10,12,30,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '22px' },
};

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

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', marginBottom: '4px' }}>
          LEADERBOARD
        </h1>
        <p style={{ fontSize: '13px', color: '#94A3B8' }}>Cross-door rankings — unified across SOLVEN4</p>
      </div>

      {/* Door tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
        {DOORS.map(d => (
          <button key={d.key} onClick={() => setActiveTab(d.key)}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: activeTab === d.key ? `${d.color}20` : 'transparent',
              outline: activeTab === d.key ? `1px solid ${d.color}40` : 'none',
              transition: 'all 0.15s',
            }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: activeTab === d.key ? d.color : '#94A3B8' }}>{d.label}</div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>{d.sublabel}</div>
          </button>
        ))}
      </div>

      {/* My rank card */}
      {myRank > 0 && (
        <div style={{ ...S.card, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', background: `${activeDoor.color}08`, border: `1px solid ${activeDoor.color}30` }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: activeDoor.color, fontFamily: "'Orbitron',sans-serif", minWidth: '48px', textAlign: 'center' }}>
            #{myRank}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Your Ranking</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{activeDoor.label} · {activeDoor.sublabel}</div>
          </div>
          <Star size={18} color={activeDoor.color} />
        </div>
      )}

      {/* Leaderboard table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={S.card}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px', fontSize: '13px' }}>Loading rankings...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Trophy size={40} color="#94A3B8" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            <p style={{ color: '#94A3B8', fontSize: '13px' }}>No rankings yet. Be the first!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 100px 100px', gap: '12px', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>
              {['#', 'Operator', 'Rank', activeDoor.metric.toUpperCase()].map(h => (
                <div key={h} style={{ fontSize: '10px', color: '#94A3B8', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.1em', fontWeight: 700 }}>{h}</div>
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
                      : <span style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8' }}>{i + 1}</span>}
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
                        {entry.full_name || 'Anonymous'} {isMe && '(you)'}
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
                  <div style={{ fontSize: '14px', fontWeight: 700, color: i < 3 ? activeDoor.color : '#fff' }}>
                    {(entry.xp_points || 0).toLocaleString()}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
