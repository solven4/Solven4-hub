import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, TrendingUp, Users, DollarSign, BarChart3, Globe,
  Shield, ChevronRight, Activity, Award, ArrowUpRight, Layers,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useLang } from '@/lib/LanguageContext';
import { GlassPanel } from '@/hud';

const ACCENT = '#6366f1';

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const TIER_CONFIG = {
  1: { label: 'Tier 1 — Regional', labelAr: 'المستوى 1 — إقليمي',    color: '#94A3B8', min: 0,      max: 49 },
  2: { label: 'Tier 2 — Established', labelAr: 'المستوى 2 — راسخ', color: '#10B981', min: 50,     max: 199 },
  3: { label: 'Tier 3 — Premium', labelAr: 'المستوى 3 — متميز',     color: '#3B82F6', min: 200,    max: 999 },
  4: { label: 'Tier 4 — Elite', labelAr: 'المستوى 4 — النخبة',       color: '#D4A843', min: 1000,   max: Infinity },
};

function StatCard({ icon: Icon, label, value, sub, color = '#6366F1', delay = 0 }) {
  return (
    <motion.div variants={fadeUp} transition={{ delay }} whileHover={{ scale: 1.015 }}>
      <GlassPanel className="spatial lift" brackets={false} style={{ ['--accent']: color }}>
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-s4-muted" />
        </div>
        <div className="s4-num font-heading text-2xl font-medium text-white mb-0.5">{value}</div>
        <div className="s4-label" style={{ fontSize: '9px' }}>{label}</div>
        {sub && <div className="text-[10px] mt-1" style={{ color }}>{sub}</div>}
      </GlassPanel>
    </motion.div>
  );
}

function IBRow({ broker, rank }) {
  const { t } = useLang();
  const tier = Object.values(TIER_CONFIG).find(tc => broker.active_ibs >= tc.min && broker.active_ibs <= tc.max) ?? TIER_CONFIG[1];
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer hover:bg-white/[0.02]"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <span className="font-heading text-sm font-medium text-s4-muted w-6 text-center">#{rank}</span>
      <div className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-medium text-sm"
        style={{ background: `${tier.color}20`, color: tier.color }}>
        {(broker.name ?? 'B').charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white truncate">{broker.name ?? t('Unknown Broker','وسيط غير معروف')}</div>
        <div className="text-[10px]" style={{ color: tier.color }}>{t(tier.label, tier.labelAr)}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-white">{(broker.active_ibs ?? 0).toLocaleString()}</div>
        <div className="text-[10px] text-s4-muted">{t('IBs','وسطاء')}</div>
      </div>
      <div className="text-right hidden sm:block">
        <div className="text-sm font-bold" style={{ color: '#10B981' }}>
          ${((broker.total_volume ?? 0) / 1e6).toFixed(1)}M
        </div>
        <div className="text-[10px] text-s4-muted">{t('Volume','الحجم')}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-s4-muted flex-shrink-0" />
    </motion.div>
  );
}

export default function BrokerB2B() {
  const { t } = useLang();
  const { user } = useAuthStore();
  const [brokers, setBrokers]   = useState([]);
  const [stats, setStats]       = useState({ total_brokers: 0, total_ibs: 0, total_volume: 0, active_countries: 0 });
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function load() {
      try {
        const { data: brokerData } = await supabase
          .from('brokers')
          .select('*')
          .eq('is_active', true)
          .order('active_ibs', { ascending: false });

        const list = brokerData ?? [];
        setBrokers(list);

        const totalIBs    = list.reduce((s, b) => s + (b.active_ibs ?? 0), 0);
        const totalVolume = list.reduce((s, b) => s + (b.total_volume ?? 0), 0);
        const countries   = new Set(list.map(b => b.country).filter(Boolean)).size;

        setStats({
          total_brokers:    list.length,
          total_ibs:        totalIBs,
          total_volume:     totalVolume,
          active_countries: countries,
        });
      } catch (err) {
        console.error('BrokerB2B load error:', err);
        // Demo data if tables not yet seeded
        setBrokers([
          { id: '1', name: 'IC Markets MENA',    active_ibs: 847, total_volume: 4200000000, country: 'UAE',   is_active: true },
          { id: '2', name: 'Pepperstone Arab',   active_ibs: 612, total_volume: 3100000000, country: 'Saudi', is_active: true },
          { id: '3', name: 'FP Markets Gulf',    active_ibs: 389, total_volume: 1800000000, country: 'Egypt', is_active: true },
          { id: '4', name: 'FXGT MENA',          active_ibs: 201, total_volume: 980000000,  country: 'Jordan',is_active: true },
          { id: '5', name: 'Exness Arabia',      active_ibs: 156, total_volume: 720000000,  country: 'UAE',   is_active: true },
        ]);
        setStats({ total_brokers: 5, total_ibs: 2205, total_volume: 10800000000, active_countries: 5 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const TABS = [
    { id: 'overview',   label: t('Overview','نظرة عامة') },
    { id: 'brokers',    label: t('Broker Directory','دليل الوسطاء') },
    { id: 'compliance', label: t('Compliance','الامتثال') },
  ];

  return (
    <div className="s4hud min-h-screen p-6 space-y-6" style={{ ['--accent']: ACCENT, background: '#1A1B1E' }}>
      {/* Header */}
      <motion.div initial="hidden" animate="show" variants={container} className="space-y-1">
        <motion.div variants={fadeUp} className="s4-label s4-accent flex items-center gap-2" style={{ letterSpacing: '0.3em' }}>
          <Building2 className="w-3 h-3" />
          {t('SOLVEN4 HUB — B2B BROKER INTELLIGENCE', 'SOLVEN4 HUB — ذكاء الوسطاء B2B')}
        </motion.div>
        <motion.h1 variants={fadeUp} style={{ fontFamily: "'Satoshi',sans-serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 500, margin: 0,
          background: 'linear-gradient(135deg,#fff 0%,#A5B4FC 60%,#6366F1 120%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t('Broker', 'شبكة')} {t('Network', 'الوسطاء')}
        </motion.h1>
        <motion.p variants={fadeUp} className="text-s4-muted text-sm">
          {t('Real-time view of all broker partners and IB network performance across MENA.', 'نظرة مباشرة على جميع شركاء الوسطاء وأداء شبكة الوسطاء المُعرِّفين عبر المنطقة.')}
        </motion.p>
      </motion.div>

      {/* Stats */}
      <motion.div initial="hidden" animate="show" variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label={t('Active Brokers','الوسطاء النشطون')}       value={stats.total_brokers}                         color="#6366F1" delay={0} />
        <StatCard icon={Users}     label={t('Total IB Operators','إجمالي مشغلي الوسطاء')}   value={stats.total_ibs.toLocaleString()}            color="#10B981" delay={0.05} />
        <StatCard icon={DollarSign} label={t('Network Volume','حجم الشبكة')}      value={`$${(stats.total_volume / 1e9).toFixed(1)}B`} color="#D4A843" delay={0.1} sub={t('All-time brokered','إجمالي التداول عبر الوسطاء')} />
        <StatCard icon={Globe}     label={t('Active Countries','الدول النشطة')}     value={stats.active_countries}                      color="#3B82F6" delay={0.15} />
      </motion.div>

      {/* Tier legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-3"
      >
        {Object.entries(TIER_CONFIG).map(([tier, cfg]) => (
          <div key={tier} className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg"
            style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
            {t(cfg.label, cfg.labelAr)}
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(10,12,30,0.8)', border: '1px solid var(--s4-line)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
            style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase',
              ...(activeTab === tab.id ? { background: ACCENT, color: '#fff' } : { color: '#94A3B8' }) }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <motion.div initial="hidden" animate="show" variants={container} className="grid lg:grid-cols-3 gap-6">
          {/* Broker Leaderboard */}
          <motion.div variants={fadeUp} className="s4-glass lg:col-span-2 overflow-hidden">
            <div className="p-5 border-b" style={{ borderColor: 'var(--s4-line)' }}>
              <h3 className="s4-label s4-accent flex items-center gap-2" style={{ fontSize: '11px' }}>
                <Award className="w-4 h-4" style={{ color: '#D4A843' }} />
                {t('TOP BROKER PARTNERS', 'أهم شركاء الوسطاء')}
              </h3>
            </div>
            <motion.div variants={container} className="p-2">
              {loading
                ? <div className="text-center py-8 text-s4-muted text-sm">{t('Loading broker data…', 'جارٍ تحميل بيانات الوسطاء…')}</div>
                : brokers.slice(0, 10).map((b, i) => <IBRow key={b.id} broker={b} rank={i + 1} />)
              }
            </motion.div>
          </motion.div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Integration status */}
            <motion.div variants={fadeUp} className="s4-glass p-5">
              <h3 className="s4-label s4-accent mb-4 flex items-center gap-2" style={{ fontSize: '10px' }}>
                <Activity className="w-3.5 h-3.5" />
                {t('INTEGRATIONS', 'التكاملات')}
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'MT5 Data Feed',        status: 'active',  note: t('Real-time trade sync','مزامنة تداول لحظية') },
                  { name: 'Commission API',        status: 'active',  note: t('Auto-calculate & pay','حساب ودفع تلقائي') },
                  { name: 'IB Portal Bridge',      status: 'active',  note: 'Broker ↔ SOLVEN4' },
                  { name: 'Ayrshare Social',       status: 'pending', note: t('Content publishing','نشر المحتوى') },
                  { name: 'WhatsApp Business API', status: 'pending', note: t('Lead notifications','إشعارات العملاء المحتملين') },
                ].map(item => (
                  <div key={item.name} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">{item.name}</div>
                      <div className="text-[10px] text-s4-muted">{item.note}</div>
                    </div>
                    {item.status === 'active'
                      ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#10B981' }} />
                      : <AlertCircle className="w-4 h-4 flex-shrink-0 text-s4-muted" />
                    }
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div variants={fadeUp} className="s4-glass p-5">
              <h3 className="s4-label s4-accent mb-4 flex items-center gap-2" style={{ fontSize: '10px' }}>
                <Layers className="w-3.5 h-3.5" />
                {t('B2B ACTIONS', 'إجراءات B2B')}
              </h3>
              <div className="space-y-2">
                {[
                  { label: t('Add New Broker','إضافة وسيط جديد'),       icon: Building2, color: '#6366F1' },
                  { label: t('Commission Report','تقرير العمولات'),    icon: DollarSign, color: '#D4A843' },
                  { label: t('IB Performance PDF','تقرير أداء الوسطاء PDF'),   icon: BarChart3,  color: '#10B981' },
                  { label: t('Compliance Audit','تدقيق الامتثال'),     icon: Shield,     color: '#3B82F6' },
                ].map(action => (
                  <button
                    key={action.label}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/[0.03]"
                    style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${action.color}18` }}>
                      <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                    </div>
                    <span className="text-xs font-bold text-white">{action.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-s4-muted ml-auto" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {activeTab === 'brokers' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="s4-glass overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: 'var(--s4-line)' }}>
            <h3 className="s4-label s4-accent" style={{ fontSize: '11px' }}>{t('Full Broker Directory', 'دليل الوسطاء الكامل')}</h3>
          </div>
          <div className="p-2">
            {brokers.map((b, i) => <IBRow key={b.id} broker={b} rank={i + 1} />)}
          </div>
        </motion.div>
      )}

      {activeTab === 'compliance' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="s4-glass p-6">
          <h3 className="s4-label s4-accent mb-4 flex items-center gap-2" style={{ fontSize: '11px' }}>
            <Shield className="w-4 h-4" />
            {t('COMPLIANCE & LEGAL', 'الامتثال والقانون')}
          </h3>
          <div className="space-y-4 text-sm text-s4-muted">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="font-bold text-white mb-1">{t('Data Ownership', 'ملكية البيانات')}</div>
              <p>{t('SOLVEN4 has operational access to broker data only. All trader data belongs to the respective broker. SOLVEN4 acts as a technology service provider under B2B agreement.', 'يمتلك SOLVEN4 وصولاً تشغيلياً فقط إلى بيانات الوسيط. جميع بيانات المتداولين تعود ملكيتها للوسيط المعني. يعمل SOLVEN4 كمزود خدمة تقنية بموجب اتفاقية B2B.')}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="font-bold text-white mb-1">{t('MT5 Integration', 'تكامل MT5')}</div>
              <p>{t('MT5 Expert Advisor is READ-ONLY. SOLVEN4 pulls trade data only — no order execution, no position modification, no account management commands are ever sent.', 'مستشار الخبراء MT5 للقراءة فقط. يسحب SOLVEN4 بيانات التداول فقط — لا تنفيذ أوامر، لا تعديل مراكز، ولا تُرسل أي أوامر إدارة حساب على الإطلاق.')}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.15)' }}>
              <div className="font-bold text-white mb-1">{t('Commission Payments', 'مدفوعات العمولات')}</div>
              <p>{t('Commission calculations are verified against broker statements. SOLVEN4 facilitates tracking and reporting — actual payment execution remains with the broker.', 'يتم التحقق من حسابات العمولات مقابل كشوفات الوسيط. يسهّل SOLVEN4 التتبع والتقارير — يبقى تنفيذ الدفع الفعلي مسؤولية الوسيط.')}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
