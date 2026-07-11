import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { DollarSign, TrendingUp, Users, Download, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const S = {
  card: { background: 'rgba(11,18,32,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '22px' },
  statCard: (color) => ({ background: `${color}08`, border: `1px solid ${color}25`, borderRadius: '14px', padding: '20px' }),
};

const STATUS_STYLES = {
  paid:    { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  Icon: CheckCircle, label: 'Paid' },
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', Icon: Clock,        label: 'Pending' },
  failed:  { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  Icon: AlertCircle,  label: 'Failed' },
};

export default function TheCommission() {
  const { user } = useAuthStore();
  const [commissions, setCommissions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('commissions').select('*').eq('ib_user_id', user.id).order('created_at', { ascending: false }).limit(100).then(r => r.data || []).catch(() => []),
      supabase.from('network_members').select('*').eq('ib_user_id', user.id).limit(200).then(r => r.data || []).catch(() => []),
    ]).then(([comms, mems]) => {
      setCommissions(comms);
      setMembers(mems);
    }).finally(() => setLoading(false));
  }, [user]);

  const totalEarned = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalPending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalLots = members.reduce((sum, m) => sum + (m.total_lots || 0), 0);

  const visible = filter === 'all' ? commissions : commissions.filter(c => c.status === filter);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', marginBottom: '4px' }}>
            COMMISSION ENGINE
          </h1>
          <p style={{ fontSize: '13px', color: '#8899B4' }}>Track earnings across your entire network</p>
        </div>
        <button style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid rgba(212,168,67,0.3)', background: 'rgba(212,168,67,0.1)', color: '#D4A843', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Earned', value: `$${totalEarned.toFixed(2)}`, color: '#10B981', Icon: DollarSign },
          { label: 'Pending', value: `$${totalPending.toFixed(2)}`, color: '#F59E0B', Icon: Clock },
          { label: 'Active Traders', value: members.length.toString(), color: '#3B82F6', Icon: Users },
          { label: 'Total Lots', value: totalLots.toFixed(2), color: '#D4A843', Icon: TrendingUp },
        ].map(({ label, value, color, Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} style={S.statCard(color)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '11px', color: '#8899B4' }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Commission log */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={S.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={15} color="#D4A843" />
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', letterSpacing: '0.15em', color: '#D4A843', fontWeight: 700 }}>COMMISSION LOG</span>
          </div>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'paid', 'pending', 'failed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: filter === f ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  color: filter === f ? '#818CF8' : '#8899B4', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#8899B4', padding: '32px' }}>Loading commissions...</div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <DollarSign size={36} color="#8899B4" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            <p style={{ color: '#8899B4', fontSize: '13px' }}>No commissions found</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px 100px', gap: '12px', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>
              {['Trader', 'Lots', 'Rate', 'Amount', 'Status'].map(h => (
                <div key={h} style={{ fontSize: '10px', color: '#8899B4', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.1em', fontWeight: 700 }}>{h}</div>
              ))}
            </div>
            {visible.map((c, i) => {
              const st = STATUS_STYLES[c.status || 'pending'] || STATUS_STYLES.pending;
              const Icon = st.Icon;
              return (
                <motion.div key={c.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px 100px', gap: '12px', padding: '10px 12px', borderRadius: '8px', alignItems: 'center', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{c.trader_account || `Trader #${i + 1}`}</div>
                    <div style={{ fontSize: '10px', color: '#8899B4' }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#fff' }}>{parseFloat(c.lots || 0).toFixed(2)}</div>
                  <div style={{ fontSize: '12px', color: '#8899B4' }}>{c.rate || '0'}%</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>${parseFloat(c.amount || 0).toFixed(2)}</div>
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '3px 8px', borderRadius: '6px', background: st.bg, color: st.color, fontWeight: 600 }}>
                      <Icon size={10} /> {st.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </motion.div>
    </div>
  );
}
