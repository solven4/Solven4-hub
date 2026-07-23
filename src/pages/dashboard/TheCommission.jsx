import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { DollarSign, TrendingUp, Users, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { GlassPanel, Btn } from '@/hud';

const ACCENT = '#D4A843';

const STATUS_STYLES = {
  paid:    { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  Icon: CheckCircle, label: 'Paid', labelAr: 'مدفوع' },
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', Icon: Clock,        label: 'Pending', labelAr: 'قيد الانتظار' },
  failed:  { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  Icon: AlertCircle,  label: 'Failed', labelAr: 'فشل' },
};

export default function TheCommission() {
  const { t } = useLang();
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
  const rise = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="s4hud" style={{ ['--accent']: ACCENT, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", maxWidth: '960px', margin: '0 auto' }}>

      {/* header */}
      <motion.div {...rise} transition={{ duration: 0.5 }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: '22px' }}>
        <div>
          <div className="s4-label s4-accent" style={{ letterSpacing: '0.35em', marginBottom: 6 }}>{t('IB NETWORK EARNINGS', 'أرباح شبكة الوسطاء')}</div>
          <h1 style={{ fontFamily: "'Satoshi',sans-serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 500, lineHeight: 1.02, margin: 0,
            background: 'linear-gradient(135deg,#fff 0%,#F0DCA0 60%,#D4A843 120%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 22px rgba(212,168,67,0.35))' }}>{t('COMMISSION ENGINE', 'محرك العمولات')}</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 0' }}>{t('Track earnings across your entire network', 'تتبع الأرباح عبر شبكتك بالكامل')}</p>
        </div>
        <Btn ghost style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '10px 16px' }}>
          <Download size={13} /> {t('Export CSV', 'تصدير CSV')}
        </Btn>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: t('Total Earned', 'إجمالي الأرباح'), value: `$${totalEarned.toFixed(2)}`, color: '#10B981', Icon: DollarSign },
          { label: t('Pending', 'قيد الانتظار'), value: `$${totalPending.toFixed(2)}`, color: '#F59E0B', Icon: Clock },
          { label: t('Active Traders', 'المتداولون النشطون'), value: members.length.toString(), color: '#3B82F6', Icon: Users },
          { label: t('Total Lots', 'إجمالي اللوتات'), value: totalLots.toFixed(2), color: '#D4A843', Icon: TrendingUp },
        ].map(({ label, value, color, Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassPanel className="spatial lift" brackets={false} style={{ ['--accent']: color, padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <Icon size={18} color={color} />
              </div>
              <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '22px', fontWeight: 500, color: '#fff', marginBottom: '4px' }}>{value}</div>
              <div className="s4-label" style={{ fontSize: '9px' }}>{label}</div>
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      {/* Commission log */}
      <motion.div {...rise} transition={{ delay: 0.25 }}>
        <GlassPanel className="spatial lift">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={13} color={ACCENT} />
              <span className="s4-label s4-accent">{t('COMMISSION LOG', 'سجل العمولات')}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[['all', t('all', 'الكل')], ['paid', t('paid', 'مدفوع')], ['pending', t('pending', 'قيد الانتظار')], ['failed', t('failed', 'فشل')]].map(([f, fLabel]) => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    fontFamily: "'Satoshi',sans-serif", fontSize: '8px', letterSpacing: '0.1em', fontWeight: 700,
                    padding: '5px 11px', borderRadius: '6px', cursor: 'pointer', border: 'none', textTransform: 'uppercase',
                    background: filter === f ? ACCENT : 'rgba(255,255,255,0.05)', color: filter === f ? '#000' : '#94A3B8',
                  }}>
                  {fLabel}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#94A3B8', padding: '32px', fontSize: '12px' }}>{t('Loading commissions...', 'جارٍ تحميل العمولات...')}</div>
          ) : visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px' }}>
              <DollarSign size={32} color="#94A3B8" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              <p style={{ color: '#94A3B8', fontSize: '12.5px' }}>{t('No commissions found', 'لم يتم العثور على عمولات')}</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px 100px', gap: '12px', padding: '8px 12px', borderBottom: '1px solid var(--s4-line)', marginBottom: '4px' }}>
                {[t('Trader', 'المتداول'), t('Lots', 'اللوتات'), t('Rate', 'النسبة'), t('Amount', 'المبلغ'), t('Status', 'الحالة')].map(h => (
                  <div key={h} className="s4-label" style={{ fontSize: '9px' }}>{h}</div>
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
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{c.trader_account || `${t('Trader', 'متداول')} #${i + 1}`}</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</div>
                    </div>
                    <div className="s4-num" style={{ fontSize: '12px', color: '#fff' }}>{parseFloat(c.lots || 0).toFixed(2)}</div>
                    <div className="s4-num" style={{ fontSize: '12px', color: '#94A3B8' }}>{c.rate || '0'}%</div>
                    <div className="s4-num" style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>${parseFloat(c.amount || 0).toFixed(2)}</div>
                    <div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '3px 8px', borderRadius: '6px', background: st.bg, color: st.color, fontWeight: 600 }}>
                        <Icon size={10} /> {t(st.label, st.labelAr)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </GlassPanel>
      </motion.div>
    </div>
  );
}
