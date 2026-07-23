import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowDownToLine, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { db } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useLang } from '@/lib/LanguageContext';
import { GlassPanel } from '@/hud';

const ACCENT = '#D4A843';

const CHART_STYLE = {
  contentStyle: { background: '#14161B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: 11 },
  cursor: { fill: 'rgba(212,168,67,0.04)' },
};

const STATUS = {
  pending:  { color: '#F97316', bg: 'rgba(249,115,22,0.1)',  label: 'PENDING', labelAr: 'قيد الانتظار' },
  approved: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'APPROVED', labelAr: 'موافق عليه' },
  paid:     { color: '#D4A843', bg: 'rgba(212,168,67,0.1)', label: 'PAID', labelAr: 'مدفوع' },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  label: 'REJECTED', labelAr: 'مرفوض' },
};

export default function TheScore() {
  const { t } = useLang();
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

  // Build monthly chart data from commissions
  const monthlyMap = {};
  commissions.forEach(c => {
    const m = new Date(c.created_at).toLocaleString('default', { month: 'short' });
    monthlyMap[m] = (monthlyMap[m] ?? 0) + (c.amount ?? 0);
  });
  const chartData = Object.entries(monthlyMap).slice(-6).map(([month, amount]) => ({ month, amount: +amount.toFixed(2) }));
  const rise = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="s4hud" style={{ ['--accent']: ACCENT, color: '#fff', fontFamily: "'Satoshi',sans-serif" }}>

      {/* Header */}
      <motion.div {...rise} transition={{ duration: 0.5 }} style={{ marginBottom: '22px' }}>
        <div className="s4-label s4-accent" style={{ letterSpacing: '0.35em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={13} /> CROSS-DOOR COMMISSIONS
        </div>
        <h1 style={{ fontFamily: "'Satoshi',sans-serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 500, lineHeight: 1.02, margin: 0,
          background: 'linear-gradient(135deg,#fff 0%,#F0DCA0 60%,#D4A843 120%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('THE SCORE', 'النقاط')}</h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 0' }}>{t('Cross-door commissions, approvals, and payout tracking.', 'تتبع العمولات والموافقات والمدفوعات عبر الأبواب.')}</p>
      </motion.div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: t('Total Earned', 'إجمالي الأرباح'), val: totalEarned, color: '#D4A843', icon: TrendingUp, suffix: '$', sub: t('All time', 'كل الأوقات') },
          { label: t('Pending', 'قيد الانتظار'), val: pending, color: '#F97316', icon: Clock, suffix: '$', sub: t('Awaiting approval', 'بانتظار الموافقة') },
          { label: t('Approved', 'موافق عليه'), val: approved, color: '#10B981', icon: CheckCircle, suffix: '$', sub: t('Ready to withdraw', 'جاهز للسحب') },
          { label: t('Total Paid', 'إجمالي المدفوع'), val: paid, color: '#3B82F6', icon: ArrowDownToLine, suffix: '$', sub: t('Withdrawn', 'مسحوب') },
        ].map(s => {
          const Icon = s.icon;
          return (
            <GlassPanel key={s.label} className="spatial lift" brackets={false} style={{ ['--accent']: s.color }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div className="s4-label" style={{ fontSize: '9px' }}>{s.label}</div>
                <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: `${s.color}15`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={13} style={{ color: s.color }} />
                </div>
              </div>
              <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '22px', fontWeight: 500, color: s.color, marginBottom: '3px' }}>
                {s.suffix}{loading ? '—' : s.val.toFixed(0)}
              </div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>{s.sub}</div>
            </GlassPanel>
          );
        })}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <GlassPanel className="spatial lift" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="s4-label s4-accent" style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <BarChart3 size={12} /> {t('MONTHLY COMMISSIONS', 'العمولات الشهرية')}
            </div>
            <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '13px', fontWeight: 500, color: ACCENT }}>${totalEarned.toFixed(2)} {t('total', 'إجمالي')}</div>
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
              <Tooltip {...CHART_STYLE} formatter={(v) => [`$${v}`, t('Amount', 'المبلغ')]} />
              <Area type="monotone" dataKey="amount" stroke="#D4A843" strokeWidth={2} fill="url(#goldGrad)" dot={{ fill: '#D4A843', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassPanel>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', background: 'rgba(10,12,30,0.8)', border: '1px solid var(--s4-line)', marginBottom: '16px', width: 'fit-content' }}>
        {[['commissions', t('commissions', 'العمولات')], ['payouts', t('payouts', 'المدفوعات')]].map(([tabKey, tabLabel]) => (
          <button key={tabKey} onClick={() => setTab(tabKey)}
            style={{ fontFamily: "'Satoshi',sans-serif", padding: '7px 18px', borderRadius: '8px', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: tab === tabKey ? ACCENT : 'transparent', color: tab === tabKey ? '#000' : '#94A3B8' }}>
            {tabLabel.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <GlassPanel className="spatial lift">
        <div style={{ paddingBottom: '14px', marginBottom: '4px', borderBottom: '1px solid var(--s4-line)' }}>
          <div className="s4-label" style={{ fontSize: '9px' }}>
            {tab === 'commissions' ? `${commissions.length} ${t('Commissions', 'عمولة')}` : `${payouts.length} ${t('Payouts', 'مدفوعات')}`}
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px', fontSize: '13px' }}>{t('Loading...', 'جارٍ التحميل...')}</div>
        ) : tab === 'commissions' ? (
          commissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px' }}>
              <DollarSign size={32} color="#94A3B8" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              <p style={{ color: '#94A3B8', fontSize: '12.5px' }}>{t('No commissions yet. Grow your network to start earning.', 'لا توجد عمولات بعد. وسّع شبكتك لتبدأ بالربح.')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {commissions.map(c => {
                const s = STATUS[c.status] ?? STATUS.pending;
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 4px', borderBottom: '1px solid var(--s4-line)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description ?? t('Commission', 'عمولة')}</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>{new Date(c.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div style={{ fontSize: '9px', fontFamily: "'Satoshi',sans-serif", fontWeight: 500, padding: '3px 8px', borderRadius: '6px', color: s.color, background: s.bg }}>{t(s.label, s.labelAr)}</div>
                    <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontWeight: 500, color: ACCENT }}>${(c.amount ?? 0).toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          payouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px' }}>
              <ArrowDownToLine size={32} color="#94A3B8" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              <p style={{ color: '#94A3B8', fontSize: '12.5px' }}>{t('No payouts yet. Request one from The Vault.', 'لا توجد مدفوعات بعد. اطلب واحدة من الخزنة.')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {payouts.map(p => {
                const s = STATUS[p.status] ?? STATUS.pending;
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 4px', borderBottom: '1px solid var(--s4-line)' }}>
                    <ArrowDownToLine size={14} style={{ color: s.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{p.method ?? t('Bank Transfer', 'تحويل بنكي')}</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>{new Date(p.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontSize: '9px', fontFamily: "'Satoshi',sans-serif", fontWeight: 500, padding: '3px 8px', borderRadius: '6px', color: s.color, background: s.bg }}>{t(s.label, s.labelAr)}</div>
                    <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontWeight: 500, color: ACCENT }}>${(p.amount ?? 0).toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </GlassPanel>
    </div>
  );
}
