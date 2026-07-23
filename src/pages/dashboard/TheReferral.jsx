import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, TrendingUp, DollarSign, Copy, CheckCircle,
  Link, BarChart2,
  Building2, BookOpen, Network, Timer,
  MessageSquare, Send,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useLang } from '@/lib/LanguageContext';
import { GlassPanel, Btn } from '@/hud';

const ACCENT = '#6366f1';
const S = { muted: '#94A3B8', border: 'var(--s4-line)' };

/* ── DOOR AFFILIATE PROGRAMS ── */
const PROGRAMS = [
  {
    id: 'edge', label: 'S4 EDGE', color: '#06B6D4', Icon: TrendingUp,
    title: 'Trader Affiliate',
    desc: 'Earn for every trader you bring to EDGE. Recurring monthly commission for the life of their subscription.',
    tiers: [
      { name: 'Per Sign-up', value: '$25', desc: 'One-time activation bonus' },
      { name: 'Monthly Recurring', value: '20%', desc: 'Of their subscription fee' },
      { name: 'Performance Bonus', value: '+5%', desc: 'When they hit 10 trades/month' },
    ],
    stats: { referrals: 18, active: 14, earned: 1240, pending: 340 },
    features: ['Custom trader landing page', 'Real-time conversion tracking', 'Automated commission payout'],
  },
  {
    id: 'forge', label: 'S4 FORGE', color: '#D4A843', Icon: Users,
    title: 'IB Network Affiliate',
    desc: 'Build your IB army. Earn on every IB you recruit and on the traders they bring in — 3-tier depth.',
    tiers: [
      { name: 'IB Activation', value: '$75', desc: 'Per IB you recruit' },
      { name: 'Network Override', value: '15%', desc: 'Of their IB commissions (Tier 1)' },
      { name: 'Depth Override', value: '5%', desc: 'Tier 2 & 3 override' },
    ],
    stats: { referrals: 7, active: 6, earned: 2840, pending: 580 },
    features: ['IB network visualization', 'Sub-IB commission tracking', 'Telegram group integration'],
  },
  {
    id: 'oracle', label: 'S4 ORACLE', color: '#10B981', Icon: BookOpen,
    title: 'Academy Affiliate',
    desc: 'Promote financial education. Earn per course enrollment and certification completion.',
    tiers: [
      { name: 'Course Enrollment', value: '$30', desc: 'Per student you refer' },
      { name: 'Premium Bundle', value: '$80', desc: 'Full academy package sale' },
      { name: 'Completion Bonus', value: '+$15', desc: 'When student completes course' },
    ],
    stats: { referrals: 24, active: 19, earned: 980, pending: 180 },
    features: ['Branded referral course preview', 'Student progress dashboard', 'Certificate co-branding'],
  },
  {
    id: 'nexus', label: 'S4 NEXUS', color: '#EF4444', Icon: Building2,
    title: 'Business Affiliate',
    desc: 'Refer businesses and consultants to NEXUS. Highest commissions in the system.',
    tiers: [
      { name: 'Business License', value: '$150', desc: 'Per business you activate' },
      { name: 'Monthly Revenue', value: '10%', desc: 'Of their NEXUS subscription' },
      { name: 'Client Override', value: '5%', desc: 'On deals they close' },
    ],
    stats: { referrals: 4, active: 4, earned: 1340, pending: 240 },
    features: ['B2B referral toolkit', 'White-label landing pages', 'Revenue milestone bonuses'],
  },
];

/* ── COMMISSION TIERS ── */
const COMMISSION_TIERS = [
  { level: 1, label: 'Tier 1 — Direct Referral', color: '#6366F1', pct: '20–25%', desc: 'Your direct recruits across all doors', example: 'You → Friend joins EDGE → You earn 20% of their plan monthly' },
  { level: 2, label: 'Tier 2 — Sub-Referral', color: '#D4A843', pct: '8–10%', desc: 'Referrals made by your Tier 1 network', example: 'Your friend refers someone → You earn 8% too' },
  { level: 3, label: 'Tier 3 — Deep Network', color: '#10B981', pct: '3–5%', desc: 'Third-level depth earnings', example: '3 levels deep → passive income from the full tree' },
];

/* ── MOCK STATS ── */
const MY_STATS = {
  totalEarned: 6400,
  pendingPayout: 1340,
  totalReferrals: 53,
  activeReferrals: 43,
  conversionRate: 81.1,
  clicksThisMonth: 1284,
  tier1Refs: 22,
  tier2Refs: 19,
  tier3Refs: 12,
  lifetimeClicks: 8420,
};

/* ── MOCK REFERRAL TREE ── */
const REFERRAL_TREE = [
  { name: 'Omar K.', door: 'FORGE', color: '#D4A843', tier: 1, status: 'active', earned: 840, joined: 'Jun 12' },
  { name: 'Sara M.', door: 'EDGE', color: '#06B6D4', tier: 1, status: 'active', earned: 420, joined: 'Jun 18' },
  { name: 'Ahmed T.', door: 'ORACLE', color: '#10B981', tier: 1, status: 'active', earned: 210, joined: 'Jul 1' },
  { name: 'Layla R.', door: 'NEXUS', color: '#EF4444', tier: 1, status: 'active', earned: 580, joined: 'Jul 4' },
  { name: 'Khaled B.', door: 'EDGE', color: '#06B6D4', tier: 2, status: 'active', earned: 180, joined: 'Jun 22' },
  { name: 'Nadia S.', door: 'FORGE', color: '#D4A843', tier: 2, status: 'pending', earned: 0, joined: 'Jul 6' },
];

/* ── MARKETING KIT ── */
const KIT_ITEMS = [
  { type: 'text', label: 'LinkedIn Post', icon: MessageSquare, color: '#0077B5', content: '🚀 I\'ve been using SOLVEN4 — the AI-powered trading OS for MENA — and it\'s genuinely transformed how I trade and manage my IB network. Join with my link and get priority access: [YOUR_LINK] #Trading #MENA #SOLVEN4' },
  { type: 'text', label: 'WhatsApp Message', icon: MessageSquare, color: '#25D366', content: 'Hey! I\'m using SOLVEN4 — it has 4 powerful platforms (EDGE for trading, FORGE for IBs, ORACLE for education, NEXUS for business). Register here: [YOUR_LINK]' },
  { type: 'text', label: 'Telegram Post', icon: Send, color: '#26A5E4', content: '🔥 SOLVEN4 — The AI-powered operating system for the trading economy. Use my referral link for exclusive access: [YOUR_LINK]' },
  { type: 'link', label: 'Tracking Link', icon: Link, color: '#6366F1', content: 'https://solven4.com/ref/[USER_ID]' },
];

function StatCard({ label, value, sub, color, Icon }) {
  return (
    <GlassPanel className="spatial lift" brackets={false} style={{ ['--accent']: color, padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span className="s4-label" style={{ fontSize: '9px' }}>{label}</span>
        <Icon size={12} style={{ color }} />
      </div>
      <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '20px', fontWeight: 500, color: '#fff', marginBottom: '3px' }}>{value}</div>
      {sub && <div style={{ color, fontSize: '10px' }}>{sub}</div>}
    </GlassPanel>
  );
}

export default function TheReferral() {
  const { t } = useLang();
  const { user } = useAuthStore();
  const [tab, setTab] = useState('overview');
  const [copied, setCopied] = useState('');
  const [activeProg, setActiveProg] = useState('edge');
  const [realCode, setRealCode] = useState(null);
  const [realReferrals, setRealReferrals] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const res = await fetch('/api/referral/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        if (data?.code) setRealCode(data.code);
      } catch { /* fall back to derived code below */ }

      const { data: refs } = await supabase
        .from('referrals')
        .select('id, status, commission_usd, referred_user_id, converted_at')
        .eq('referrer_user_id', user.id);
      setRealReferrals(refs || []);
    })();
  }, [user?.id]);

  const refCode = realCode ?? (user?.id?.slice(0, 8)?.toUpperCase() ?? 'S4X00000');
  const refLink = `https://solven4.com/ref/${refCode}`;

  // Real stats — flat 10% commission, 14-day pending clearance (the actual
  // backend model; the per-door tiered "20-25% / Tier 1-3" copy further
  // below describes a scheme this platform doesn't pay out yet).
  const realTotalEarned = realReferrals.filter(r => r.status !== 'pending_clearance').reduce((s, r) => s + (Number(r.commission_usd) || 0), 0);
  const realPending = realReferrals.filter(r => r.status === 'pending_clearance').reduce((s, r) => s + (Number(r.commission_usd) || 0), 0);
  const realTotalReferrals = realReferrals.length;
  const realActiveReferrals = realReferrals.filter(r => !!r.referred_user_id).length;

  function copyToClipboard(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success(t('Copied to clipboard!', 'تم النسخ إلى الحافظة!'));
    setTimeout(() => setCopied(''), 2000);
  }

  const prog = PROGRAMS.find(p => p.id === activeProg) ?? PROGRAMS[0];
  const rise = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="s4hud" style={{ ['--accent']: ACCENT, color: '#fff', fontFamily: "'Space Grotesk',sans-serif" }}>

      {/* ── HEADER ── */}
      <motion.div {...rise} className="s4-glass spatial lift"
        style={{ position: 'relative', overflow: 'hidden', padding: '24px 28px', marginBottom: '16px',
          background: 'linear-gradient(135deg,rgba(99,102,241,0.15) 0%,rgba(10,12,30,0.95) 60%,rgba(16,185,129,0.1) 100%)' }}>
        <span className="s4-bracket tl" /><span className="s4-bracket br" />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.2,
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.07) 1px,transparent 1px)',
          backgroundSize: '24px 24px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <div className="s4-label s4-accent" style={{ letterSpacing: '0.35em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={13} /> {t('REFERRAL & AFFILIATE', 'الإحالة والتسويق بالعمولة')}
              <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', padding: '2px 8px', fontSize: '9px', fontWeight: 700, color: '#10B981', fontFamily: "'Satoshi',sans-serif", letterSpacing: 'normal' }}>
                {t('PROGRAM ACTIVE', 'البرنامج نشط')}
              </span>
            </div>
            <p style={{ color: S.muted, fontSize: '12px' }}>{t('Live model: flat 10% commission on your referral\'s founding purchase, credited after a 14-day clearance window. The multi-tier door programs below are on the roadmap, not yet live.', 'النموذج الفعلي: عمولة ثابتة 10% على شراء من تحيله، تُصرف بعد فترة تسوية 14 يوماً. برامج الأبواب متعددة المستويات أدناه على خارطة الطريق، وليست فعالة بعد.')}</p>
          </div>
          <div>
            <div className="s4-label" style={{ fontSize: '9px', marginBottom: '6px' }}>{t('YOUR REFERRAL LINK', 'رابط الإحالة الخاص بك')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '12px', color: '#A5B4FC', minWidth: '240px' }}>
                {refLink}
              </div>
              <Btn onClick={() => copyToClipboard(refLink, 'link')} style={{ padding: '10px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px',
                ['--accent']: copied === 'link' ? '#10B981' : ACCENT }}>
                {copied === 'link' ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied === 'link' ? t('Copied!', 'تم النسخ!') : t('Copy', 'نسخ')}
              </Btn>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <span style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '6px', padding: '3px 8px', fontSize: '9px', color: '#6366F1', fontFamily: "'Satoshi',sans-serif", fontWeight: 700 }}>
                {t('CODE', 'الرمز')}: {refCode}
              </span>
              <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '6px', padding: '3px 8px', fontSize: '9px', color: '#10B981' }}>
                {realTotalReferrals} {t('total referrals', 'إجمالي الإحالات')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── TABS ── */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', background: 'rgba(10,12,30,0.8)', border: `1px solid ${S.border}`, marginBottom: '16px', width: 'fit-content' }}>
        {[['overview', t('Overview', 'نظرة عامة')], ['programs', t('Programs', 'البرامج')], ['network', t('Network', 'الشبكة')], ['kit', t('Marketing Kit', 'حقيبة التسويق')]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ fontFamily: "'Satoshi',sans-serif", padding: '7px 18px', borderRadius: '8px', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: tab === key ? ACCENT : 'transparent', color: tab === key ? '#fff' : S.muted }}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px', marginBottom: '16px' }}>
              <StatCard label={t('Total Earned', 'إجمالي الأرباح')} value={`$${realTotalEarned.toLocaleString()}`} sub={t('All time', 'كل الأوقات')} color="#10B981" Icon={DollarSign} />
              <StatCard label={t('Pending (14-day clearance)', 'معلق (تسوية 14 يوماً)')} value={`$${realPending.toLocaleString()}`} sub={t('Processing', 'قيد المعالجة')} color="#F97316" Icon={Timer} />
              <StatCard label={t('Total Referrals', 'إجمالي الإحالات')} value={realTotalReferrals} sub={`${realActiveReferrals} ${t('converted', 'تم التحويل')}`} color="#6366F1" Icon={Users} />
              <StatCard label={t('Commission Rate', 'معدل العمولة')} value="10%" sub={t('Flat rate, all doors', 'معدل ثابت، كل الأبواب')} color="#D4A843" Icon={TrendingUp} />
              <StatCard label={t('Your Code', 'رمزك')} value={refCode} sub={t('Share your link', 'شارك رابطك')} color="#8B5CF6" Icon={BarChart2} />
              <StatCard label={t('Clearance Window', 'فترة التسوية')} value={t('14 Days', '14 يوماً')} sub={t('Refund-protection hold', 'حجز حماية الاسترداد')} color="#3B82F6" Icon={Network} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Commission Tier System */}
              <GlassPanel className="spatial lift" label={t('3-Tier Commission System (Roadmap — not yet live)', 'نظام العمولات ثلاثي المستويات (خارطة الطريق — غير فعال بعد)')}>
                {COMMISSION_TIERS.map(ct => (
                  <div key={ct.level} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: `1px solid ${S.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Satoshi',sans-serif", fontSize: '11px', fontWeight: 500,
                        background: `${ct.color}15`, border: `2px solid ${ct.color}40`, color: ct.color }}>
                        {ct.level}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>{ct.label}</span>
                          <span className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '13px', fontWeight: 500, color: ct.color }}>{ct.pct}</span>
                        </div>
                        <div style={{ color: S.muted, fontSize: '10px', marginTop: '2px' }}>{ct.desc}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', padding: '6px 8px', borderLeft: `2px solid ${ct.color}40` }}>
                      {ct.example}
                    </div>
                  </div>
                ))}
              </GlassPanel>

              {/* Door earnings breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <GlassPanel className="spatial lift" label={t('Earnings by Door', 'الأرباح حسب الباب')} style={{ ['--accent']: '#D4A843' }}>
                  {PROGRAMS.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${p.color}15`, border: `1px solid ${p.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <p.Icon size={13} style={{ color: p.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#CBD5E1', fontSize: '11px' }}>{p.label}</span>
                          <span className="s4-num" style={{ color: p.color, fontSize: '12px', fontWeight: 500, fontFamily: "'Satoshi',sans-serif" }}>${p.stats.earned.toLocaleString()}</span>
                        </div>
                        <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(p.stats.earned / 6400) * 100}%` }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            style={{ height: '100%', background: p.color, borderRadius: '2px', boxShadow: `0 0 10px ${p.color}80` }} />
                        </div>
                      </div>
                      <div style={{ fontSize: '9px', color: S.muted, textAlign: 'right', flexShrink: 0 }}>
                        {p.stats.referrals} {t('refs', 'إحالة')}<br /><span style={{ color: '#F97316' }}>+${p.stats.pending} {t('pend.', 'معلق')}</span>
                      </div>
                    </div>
                  ))}
                </GlassPanel>

                <GlassPanel className="spatial lift" label={t('Payout Status', 'حالة الدفع')} style={{ ['--accent']: '#10B981' }}>
                  {[
                    { label: t('Available for Withdrawal', 'متاح للسحب'), value: `$${(MY_STATS.totalEarned - 4000).toLocaleString()}`, color: '#10B981' },
                    { label: t('Clearing (7-day hold)', 'قيد التسوية (حجز 7 أيام)'), value: `$${MY_STATS.pendingPayout.toLocaleString()}`, color: '#F97316' },
                    { label: t('Next Auto-payout', 'الدفعة التلقائية القادمة'), value: 'Aug 1, 2026', color: '#6366F1' },
                    { label: t('Minimum Payout', 'الحد الأدنى للدفع'), value: '$100', color: S.muted },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${S.border}` }}>
                      <span style={{ color: S.muted, fontSize: '11px' }}>{s.label}</span>
                      <span className="s4-num" style={{ color: s.color, fontSize: '12px', fontWeight: 700 }}>{s.value}</span>
                    </div>
                  ))}
                </GlassPanel>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PROGRAMS ── */}
        {tab === 'programs' && (
          <motion.div key="prg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px' }}>

            {/* Door selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PROGRAMS.map(p => (
                <button key={p.id} onClick={() => setActiveProg(p.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${activeProg === p.id ? p.color + '40' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s', width: '100%',
                    background: activeProg === p.id ? `${p.color}12` : 'rgba(10,12,30,0.7)' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${p.color}15`, border: `1px solid ${p.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <p.Icon size={14} style={{ color: p.color }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '8px', color: p.color, fontWeight: 700 }}>{p.label}</div>
                    <div style={{ color: '#CBD5E1', fontSize: '11px' }}>{p.title}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Program detail */}
            <motion.div key={prog.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <GlassPanel className="spatial lift" brackets={false} style={{ ['--accent']: prog.color }}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '14px', padding: '20px', marginBottom: '20px',
                  background: `linear-gradient(135deg,${prog.color}15,rgba(10,12,30,0.9))`, border: `1px solid ${prog.color}25` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${prog.color}20`, border: `1px solid ${prog.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <prog.Icon size={20} style={{ color: prog.color }} />
                    </div>
                    <div>
                      <div className="s4-label" style={{ color: prog.color, fontSize: '9px' }}>{prog.label} {t('AFFILIATE PROGRAM', 'برنامج التسويق بالعمولة')}</div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: 500 }}>{prog.title}</div>
                    </div>
                  </div>
                  <p style={{ color: '#CBD5E1', fontSize: '12px', lineHeight: 1.7 }}>{prog.desc}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '20px' }}>
                  {prog.tiers.map(pt => (
                    <div key={pt.name} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${prog.color}15`, borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontSize: '9px', color: S.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{pt.name}</div>
                      <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '22px', fontWeight: 500, color: prog.color, marginBottom: '4px' }}>{pt.value}</div>
                      <div style={{ fontSize: '10px', color: '#CBD5E1' }}>{pt.desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '14px' }}>
                    <div className="s4-label" style={{ fontSize: '9px', marginBottom: '10px' }}>{t('YOUR PERFORMANCE', 'أداؤك')}</div>
                    {[
                      { label: t('Referrals', 'الإحالات'), value: prog.stats.referrals },
                      { label: t('Active', 'نشط'), value: prog.stats.active },
                      { label: t('Earned', 'مكتسب'), value: `$${prog.stats.earned.toLocaleString()}` },
                      { label: t('Pending', 'معلق'), value: `$${prog.stats.pending}` },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${S.border}` }}>
                        <span style={{ color: S.muted, fontSize: '11px' }}>{s.label}</span>
                        <span className="s4-num" style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="s4-label" style={{ fontSize: '9px', marginBottom: '10px' }}>{t('PROGRAM FEATURES', 'ميزات البرنامج')}</div>
                    {prog.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                        <CheckCircle size={11} style={{ color: prog.color, flexShrink: 0 }} />
                        <span style={{ color: '#CBD5E1', fontSize: '11px' }}>{f}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '10px', color: S.muted, marginBottom: '5px' }}>{t('Your', 'رابط')} {prog.label} {t('referral link:', 'الإحالة الخاص بك:')}</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${S.border}`, fontFamily: 'monospace', fontSize: '10px', color: '#A5B4FC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {refLink}?door={prog.id}
                        </div>
                        <button onClick={() => copyToClipboard(`${refLink}?door=${prog.id}`, prog.id)}
                          style={{ padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', border: `1px solid ${prog.color}30`, background: `${prog.color}12`, color: prog.color, display: 'flex', alignItems: 'center' }}>
                          {copied === prog.id ? <CheckCircle size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}

        {/* ── NETWORK ── */}
        {tab === 'network' && (
          <motion.div key="net" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
              <GlassPanel className="spatial lift" brackets={false} style={{ ['--accent']: '#6366F1', textAlign: 'center' }}>
                <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '28px', fontWeight: 500, color: '#6366F1', marginBottom: '4px' }}>{MY_STATS.tier1Refs}</div>
                <div style={{ color: S.muted, fontSize: '10px' }}>{t('Tier 1 (Direct)', 'المستوى 1 (مباشر)')}</div>
              </GlassPanel>
              <GlassPanel className="spatial lift" brackets={false} style={{ ['--accent']: '#D4A843', textAlign: 'center' }}>
                <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '28px', fontWeight: 500, color: '#D4A843', marginBottom: '4px' }}>{MY_STATS.tier2Refs}</div>
                <div style={{ color: S.muted, fontSize: '10px' }}>{t('Tier 2 (Sub-refs)', 'المستوى 2 (إحالات فرعية)')}</div>
              </GlassPanel>
              <GlassPanel className="spatial lift" brackets={false} style={{ ['--accent']: '#10B981', textAlign: 'center' }}>
                <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '28px', fontWeight: 500, color: '#10B981', marginBottom: '4px' }}>{MY_STATS.tier3Refs}</div>
                <div style={{ color: S.muted, fontSize: '10px' }}>{t('Tier 3 (Deep)', 'المستوى 3 (عميق)')}</div>
              </GlassPanel>
            </div>

            <GlassPanel className="spatial lift" brackets={false}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="s4-label s4-accent">{t('REFERRAL NETWORK', 'شبكة الإحالة')}</span>
                <span style={{ color: S.muted, fontSize: '11px' }}>{REFERRAL_TREE.length} {t('connections shown', 'اتصال معروض')}</span>
              </div>
              {REFERRAL_TREE.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '44px' }}>
                  <Network size={32} color="#94A3B8" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                  <p style={{ color: '#94A3B8', fontSize: '12.5px' }}>{t('No referrals yet', 'لا توجد إحالات بعد')}</p>
                </div>
              ) : REFERRAL_TREE.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', marginBottom: '4px', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.color, boxShadow: `0 0 6px ${r.color}`, flexShrink: 0 }} />
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${r.color}15`, border: `1px solid ${r.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 500, fontSize: '12px', color: r.color }}>
                    {r.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{r.name}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '8px', color: r.color, fontWeight: 700 }}>{r.door}</span>
                      <span style={{ color: S.muted, fontSize: '10px' }}>{t('Joined', 'انضم')} {r.joined}</span>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '6px', padding: '3px 8px', fontSize: '9px', fontFamily: "'Satoshi',sans-serif", fontWeight: 700, color: '#6366F1' }}>
                    {t('TIER', 'المستوى')} {r.tier}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.status === 'active' ? '#10B981' : '#F97316' }} />
                    <span style={{ fontSize: '10px', color: r.status === 'active' ? '#10B981' : '#F97316' }}>{r.status}</span>
                  </div>
                  <div className="s4-num" style={{ textAlign: 'right', flexShrink: 0, fontFamily: "'Satoshi',sans-serif", fontSize: '13px', fontWeight: 500, color: '#10B981' }}>
                    ${r.earned}
                  </div>
                </motion.div>
              ))}
            </GlassPanel>
          </motion.div>
        )}

        {/* ── MARKETING KIT ── */}
        {tab === 'kit' && (
          <motion.div key="kit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px', marginBottom: '16px' }}>
              {KIT_ITEMS.map(k => (
                <GlassPanel key={k.label} className="spatial lift" brackets={false} style={{ ['--accent']: k.color }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${k.color}15`, border: `1px solid ${k.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <k.icon size={14} style={{ color: k.color }} />
                      </div>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{k.label}</span>
                    </div>
                    <button onClick={() => copyToClipboard(k.content.replace('[YOUR_LINK]', refLink).replace('[USER_ID]', refCode), k.label)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', border: `1px solid ${k.color}30`, background: `${k.color}10`, color: k.color, fontSize: '10px', fontWeight: 700 }}>
                      {copied === k.label ? <CheckCircle size={11} /> : <Copy size={11} />}
                      {copied === k.label ? t('Copied!', 'تم النسخ!') : t('Copy', 'نسخ')}
                    </button>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${S.border}`, fontSize: '11px', lineHeight: 1.7, fontFamily: k.type === 'link' ? 'monospace' : 'inherit', color: k.type === 'link' ? k.color : '#CBD5E1' }}>
                    {k.content.replace('[YOUR_LINK]', refLink).replace('[USER_ID]', refCode)}
                  </div>
                </GlassPanel>
              ))}
            </div>

            {/* Door-specific links */}
            <GlassPanel className="spatial lift" label={t('Door-Specific Referral Links', 'روابط إحالة خاصة بكل باب')}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
                {PROGRAMS.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${p.color}15` }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: `${p.color}15`, border: `1px solid ${p.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <p.Icon size={12} style={{ color: p.color }} />
                    </div>
                    <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '10px', color: '#A5B4FC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {refLink}?door={p.id}
                    </div>
                    <button onClick={() => copyToClipboard(`${refLink}?door=${p.id}`, `door-${p.id}`)}
                      style={{ padding: '5px', borderRadius: '6px', cursor: 'pointer', border: `1px solid ${p.color}20`, background: `${p.color}08`, color: p.color, display: 'flex', alignItems: 'center' }}>
                      {copied === `door-${p.id}` ? <CheckCircle size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
