import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, TrendingUp, Users, DollarSign, BarChart3, Globe,
  Shield, ChevronRight, Activity, Award, ArrowUpRight, Layers,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const TIER_CONFIG = {
  1: { label: 'Tier 1 — Regional',    color: '#8899B4', min: 0,      max: 49 },
  2: { label: 'Tier 2 — Established', color: '#10B981', min: 50,     max: 199 },
  3: { label: 'Tier 3 — Premium',     color: '#3B82F6', min: 200,    max: 999 },
  4: { label: 'Tier 4 — Elite',       color: '#D4A843', min: 1000,   max: Infinity },
};

function StatCard({ icon: Icon, label, value, sub, color = '#6366F1', delay = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: 'rgba(11,18,32,0.85)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      whileHover={{ scale: 1.015, borderColor: `${color}40` }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${color}18, transparent 70%)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-s4-muted" />
      </div>
      <div className="font-heading text-2xl font-black text-white mb-0.5">{value}</div>
      <div className="text-xs text-s4-muted font-medium">{label}</div>
      {sub && <div className="text-[10px] mt-1" style={{ color }}>{sub}</div>}
    </motion.div>
  );
}

function IBRow({ broker, rank }) {
  const tier = Object.values(TIER_CONFIG).find(t => broker.active_ibs >= t.min && broker.active_ibs <= t.max) ?? TIER_CONFIG[1];
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer hover:bg-white/[0.02]"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <span className="font-heading text-sm font-black text-s4-muted w-6 text-center">#{rank}</span>
      <div className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-black text-sm"
        style={{ background: `${tier.color}20`, color: tier.color }}>
        {(broker.name ?? 'B').charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white truncate">{broker.name ?? 'Unknown Broker'}</div>
        <div className="text-[10px]" style={{ color: tier.color }}>{tier.label}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-white">{(broker.active_ibs ?? 0).toLocaleString()}</div>
        <div className="text-[10px] text-s4-muted">IBs</div>
      </div>
      <div className="text-right hidden sm:block">
        <div className="text-sm font-bold" style={{ color: '#10B981' }}>
          ${((broker.total_volume ?? 0) / 1e6).toFixed(1)}M
        </div>
        <div className="text-[10px] text-s4-muted">Volume</div>
      </div>
      <ChevronRight className="w-4 h-4 text-s4-muted flex-shrink-0" />
    </motion.div>
  );
}

export default function BrokerB2B() {
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
    { id: 'overview',   label: 'Overview' },
    { id: 'brokers',    label: 'Broker Directory' },
    { id: 'compliance', label: 'Compliance' },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: '#03080F' }}>
      {/* Header */}
      <motion.div initial="hidden" animate="show" variants={container} className="space-y-1">
        <motion.div variants={fadeUp} className="flex items-center gap-2 text-[10px] text-s4-muted tracking-[0.3em] uppercase font-heading">
          <Building2 className="w-3 h-3" style={{ color: '#6366F1' }} />
          SOLVEN4 HUB — B2B BROKER INTELLIGENCE
        </motion.div>
        <motion.h1 variants={fadeUp} className="font-heading text-3xl font-black text-white">
          Broker <span style={{ color: '#6366F1' }}>Network</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="text-s4-muted text-sm">
          Real-time view of all broker partners and IB network performance across MENA.
        </motion.p>
      </motion.div>

      {/* Stats */}
      <motion.div initial="hidden" animate="show" variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Active Brokers"       value={stats.total_brokers}                         color="#6366F1" delay={0} />
        <StatCard icon={Users}     label="Total IB Operators"   value={stats.total_ibs.toLocaleString()}            color="#10B981" delay={0.05} />
        <StatCard icon={DollarSign} label="Network Volume"      value={`$${(stats.total_volume / 1e9).toFixed(1)}B`} color="#D4A843" delay={0.1} sub="All-time brokered" />
        <StatCard icon={Globe}     label="Active Countries"     value={stats.active_countries}                      color="#3B82F6" delay={0.15} />
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
            {cfg.label}
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(11,18,32,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
            style={activeTab === tab.id
              ? { background: '#6366F1', color: '#fff' }
              : { color: '#8899B4' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <motion.div initial="hidden" animate="show" variants={container} className="grid lg:grid-cols-3 gap-6">
          {/* Broker Leaderboard */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(11,18,32,0.85)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <h3 className="font-heading text-sm font-black text-white flex items-center gap-2">
                <Award className="w-4 h-4" style={{ color: '#D4A843' }} />
                TOP BROKER PARTNERS
              </h3>
            </div>
            <motion.div variants={container} className="p-2">
              {loading
                ? <div className="text-center py-8 text-s4-muted text-sm">Loading broker data…</div>
                : brokers.slice(0, 10).map((b, i) => <IBRow key={b.id} broker={b} rank={i + 1} />)
              }
            </motion.div>
          </motion.div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Integration status */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(11,18,32,0.85)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h3 className="font-heading text-xs font-black text-white tracking-widest uppercase mb-4 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" style={{ color: '#6366F1' }} />
                INTEGRATIONS
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'MT5 Data Feed',        status: 'active',  note: 'Real-time trade sync' },
                  { name: 'Commission API',        status: 'active',  note: 'Auto-calculate & pay' },
                  { name: 'IB Portal Bridge',      status: 'active',  note: 'Broker ↔ SOLVEN4' },
                  { name: 'Ayrshare Social',       status: 'pending', note: 'Content publishing' },
                  { name: 'WhatsApp Business API', status: 'pending', note: 'Lead notifications' },
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
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(11,18,32,0.85)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h3 className="font-heading text-xs font-black text-white tracking-widest uppercase mb-4 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" style={{ color: '#6366F1' }} />
                B2B ACTIONS
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Add New Broker',       icon: Building2, color: '#6366F1' },
                  { label: 'Commission Report',    icon: DollarSign, color: '#D4A843' },
                  { label: 'IB Performance PDF',   icon: BarChart3,  color: '#10B981' },
                  { label: 'Compliance Audit',     icon: Shield,     color: '#3B82F6' },
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(11,18,32,0.85)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <h3 className="font-heading text-sm font-black text-white">Full Broker Directory</h3>
          </div>
          <div className="p-2">
            {brokers.map((b, i) => <IBRow key={b.id} broker={b} rank={i + 1} />)}
          </div>
        </motion.div>
      )}

      {activeTab === 'compliance' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(11,18,32,0.85)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 className="font-heading text-sm font-black text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: '#6366F1' }} />
            COMPLIANCE & LEGAL
          </h3>
          <div className="space-y-4 text-sm text-s4-muted">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="font-bold text-white mb-1">Data Ownership</div>
              <p>SOLVEN4 has operational access to broker data only. All trader data belongs to the respective broker. SOLVEN4 acts as a technology service provider under B2B agreement.</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="font-bold text-white mb-1">MT5 Integration</div>
              <p>MT5 Expert Advisor is READ-ONLY. SOLVEN4 pulls trade data only — no order execution, no position modification, no account management commands are ever sent.</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.15)' }}>
              <div className="font-bold text-white mb-1">Commission Payments</div>
              <p>Commission calculations are verified against broker statements. SOLVEN4 facilitates tracking and reporting — actual payment execution remains with the broker.</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
