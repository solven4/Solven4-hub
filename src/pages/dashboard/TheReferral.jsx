import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Users, TrendingUp, DollarSign, Copy, CheckCircle,
  ChevronRight, ArrowRight, Zap, Link, Gift, BarChart2,
  Award, Building2, BookOpen, Network, Star, Timer,
  ExternalLink, Download, MessageSquare, Send, Globe,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const S = { bg:'#03080F', surface:'rgba(11,18,32,0.9)', border:'rgba(255,255,255,0.06)', muted:'#8899B4', accent:'#6366F1' };

/* ── DOOR AFFILIATE PROGRAMS ── */
const PROGRAMS = [
  {
    id:'edge', label:'S4 EDGE', color:'#06B6D4', Icon:TrendingUp,
    title:'Trader Affiliate',
    desc:'Earn for every trader you bring to EDGE. Recurring monthly commission for the life of their subscription.',
    tiers:[
      { name:'Per Sign-up',  value:'$25',  desc:'One-time activation bonus' },
      { name:'Monthly Recurring', value:'20%', desc:'Of their subscription fee' },
      { name:'Performance Bonus', value:'+5%', desc:'When they hit 10 trades/month' },
    ],
    stats:{ referrals:18, active:14, earned:1240, pending:340 },
    features:['Custom trader landing page','Real-time conversion tracking','Automated commission payout'],
  },
  {
    id:'forge', label:'S4 FORGE', color:'#D4A843', Icon:Users,
    title:'IB Network Affiliate',
    desc:'Build your IB army. Earn on every IB you recruit and on the traders they bring in — 3-tier depth.',
    tiers:[
      { name:'IB Activation',   value:'$75',  desc:'Per IB you recruit' },
      { name:'Network Override', value:'15%',  desc:'Of their IB commissions (Tier 1)' },
      { name:'Depth Override',   value:'5%',   desc:'Tier 2 & 3 override' },
    ],
    stats:{ referrals:7, active:6, earned:2840, pending:580 },
    features:['IB network visualization','Sub-IB commission tracking','Telegram group integration'],
  },
  {
    id:'oracle', label:'S4 ORACLE', color:'#10B981', Icon:BookOpen,
    title:'Academy Affiliate',
    desc:'Promote financial education. Earn per course enrollment and certification completion.',
    tiers:[
      { name:'Course Enrollment', value:'$30',  desc:'Per student you refer' },
      { name:'Premium Bundle',    value:'$80',  desc:'Full academy package sale' },
      { name:'Completion Bonus',  value:'+$15', desc:'When student completes course' },
    ],
    stats:{ referrals:24, active:19, earned:980, pending:180 },
    features:['Branded referral course preview','Student progress dashboard','Certificate co-branding'],
  },
  {
    id:'nexus', label:'S4 NEXUS', color:'#EF4444', Icon:Building2,
    title:'Business Affiliate',
    desc:'Refer businesses and consultants to NEXUS. Highest commissions in the system.',
    tiers:[
      { name:'Business License', value:'$150', desc:'Per business you activate' },
      { name:'Monthly Revenue',  value:'10%',  desc:'Of their NEXUS subscription' },
      { name:'Client Override',  value:'5%',   desc:'On deals they close' },
    ],
    stats:{ referrals:4, active:4, earned:1340, pending:240 },
    features:['B2B referral toolkit','White-label landing pages','Revenue milestone bonuses'],
  },
];

/* ── COMMISSION TIERS ── */
const COMMISSION_TIERS = [
  { level:1, label:'Tier 1 — Direct Referral', color:'#6366F1', pct:'20–25%', desc:'Your direct recruits across all doors', example:'You → Friend joins EDGE → You earn 20% of their plan monthly' },
  { level:2, label:'Tier 2 — Sub-Referral',    color:'#D4A843', pct:'8–10%',  desc:'Referrals made by your Tier 1 network', example:'Your friend refers someone → You earn 8% too' },
  { level:3, label:'Tier 3 — Deep Network',    color:'#10B981', pct:'3–5%',   desc:'Third-level depth earnings', example:'3 levels deep → passive income from the full tree' },
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
  { name:'Omar K.', door:'FORGE', color:'#D4A843', tier:1, status:'active', earned:840, joined:'Jun 12' },
  { name:'Sara M.', door:'EDGE',  color:'#06B6D4', tier:1, status:'active', earned:420, joined:'Jun 18' },
  { name:'Ahmed T.', door:'ORACLE',color:'#10B981',tier:1, status:'active', earned:210, joined:'Jul 1' },
  { name:'Layla R.', door:'NEXUS', color:'#EF4444', tier:1, status:'active', earned:580, joined:'Jul 4' },
  { name:'Khaled B.', door:'EDGE', color:'#06B6D4', tier:2, status:'active', earned:180, joined:'Jun 22' },
  { name:'Nadia S.', door:'FORGE', color:'#D4A843', tier:2, status:'pending',earned:0,   joined:'Jul 6' },
];

/* ── MARKETING KIT ── */
const KIT_ITEMS = [
  { type:'text', label:'LinkedIn Post', icon:MessageSquare, color:'#0077B5', content:'🚀 I\'ve been using SOLVEN4 — the AI-powered trading OS for MENA — and it\'s genuinely transformed how I trade and manage my IB network. Join with my link and get priority access: [YOUR_LINK] #Trading #MENA #SOLVEN4' },
  { type:'text', label:'WhatsApp Message', icon:MessageSquare, color:'#25D366', content:'Hey! I\'m using SOLVEN4 — it has 4 powerful platforms (EDGE for trading, FORGE for IBs, ORACLE for education, NEXUS for business). Register here: [YOUR_LINK]' },
  { type:'text', label:'Telegram Post', icon:Send, color:'#26A5E4', content:'🔥 SOLVEN4 — The AI-powered operating system for the trading economy. Use my referral link for exclusive access: [YOUR_LINK]' },
  { type:'link', label:'Tracking Link', icon:Link, color:'#6366F1', content:'https://solven4.com/ref/[USER_ID]' },
];

const PAGE_TABS = ['overview','programs','network','kit'];

function StatCard({ label, value, sub, color, Icon }) {
  return (
    <div style={{ background:S.surface, border:`1px solid ${color}18`, borderRadius:'14px', padding:'16px', backdropFilter:'blur(20px)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
        <span style={{ color:S.muted, fontSize:'10px' }}>{label}</span>
        <Icon size={12} style={{ color }} />
      </div>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'20px', fontWeight:900, color:'#fff', marginBottom:'3px' }}>{value}</div>
      {sub && <div style={{ color, fontSize:'10px' }}>{sub}</div>}
    </div>
  );
}

export default function TheReferral() {
  const { user, profile } = useAuthStore();
  const [tab, setTab] = useState('overview');
  const [copied, setCopied] = useState('');
  const [activeProg, setActiveProg] = useState('edge');

  const refCode = user?.id?.slice(0,8)?.toUpperCase() ?? 'S4X00000';
  const refLink = `https://solven4.com/ref/${refCode}`;

  function copyToClipboard(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(''), 2000);
  }

  const prog = PROGRAMS.find(p => p.id === activeProg) ?? PROGRAMS[0];

  return (
    <div style={{ color:'#fff', fontFamily:"'Inter',sans-serif" }}>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        style={{ position:'relative', overflow:'hidden', borderRadius:'20px', padding:'24px 28px', marginBottom:'16px',
          background:'linear-gradient(135deg,rgba(99,102,241,0.15) 0%,rgba(11,18,32,0.95) 60%,rgba(16,185,129,0.1) 100%)',
          border:'1px solid rgba(99,102,241,0.2)', backdropFilter:'blur(20px)' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.2,
          backgroundImage:'linear-gradient(rgba(99,102,241,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.07) 1px,transparent 1px)',
          backgroundSize:'24px 24px', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'24px', flexWrap:'wrap' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
              <Network size={18} color="#6366F1" />
              <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'22px', fontWeight:900 }}>REFERRAL & AFFILIATE</h1>
              <div style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'6px', padding:'2px 8px', fontSize:'9px', fontWeight:700, color:'#10B981', fontFamily:"'Orbitron',sans-serif" }}>
                PROGRAM ACTIVE
              </div>
            </div>
            <p style={{ color:S.muted, fontSize:'12px' }}>Multi-tier affiliate program across all 4 SOLVEN4 doors — earn while you grow.</p>
          </div>
          <div>
            <div style={{ fontSize:'10px', color:S.muted, marginBottom:'6px', fontWeight:700, letterSpacing:'0.1em' }}>YOUR REFERRAL LINK</div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ padding:'10px 14px', borderRadius:'10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', fontFamily:'monospace', fontSize:'12px', color:'#A5B4FC', minWidth:'240px' }}>
                {refLink}
              </div>
              <motion.button whileHover={{ scale:1.05 }} onClick={() => copyToClipboard(refLink,'link')}
                style={{ padding:'10px 14px', borderRadius:'10px', cursor:'pointer', border:'none', fontWeight:700, fontSize:'12px', color:'#fff', display:'flex', alignItems:'center', gap:'6px',
                  background: copied==='link'?'#10B981':'#6366F1', boxShadow: copied==='link'?'0 0 16px rgba(16,185,129,0.4)':'0 0 16px rgba(99,102,241,0.4)', transition:'all 0.2s' }}>
                {copied==='link' ? <CheckCircle size={14}/> : <Copy size={14}/>}
                {copied==='link' ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>
            <div style={{ display:'flex', gap:'6px', marginTop:'8px' }}>
              <span style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'6px', padding:'3px 8px', fontSize:'9px', color:'#6366F1', fontFamily:"'Orbitron',sans-serif", fontWeight:700 }}>
                CODE: {refCode}
              </span>
              <span style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'6px', padding:'3px 8px', fontSize:'9px', color:'#10B981' }}>
                {MY_STATS.totalReferrals} total referrals
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── TABS ── */}
      <div style={{ display:'flex', gap:'4px', padding:'4px', borderRadius:'12px', background:'rgba(11,18,32,0.8)', border:`1px solid ${S.border}`, marginBottom:'16px', width:'fit-content' }}>
        {PAGE_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:'7px 18px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer', border:'none', textTransform:'capitalize', transition:'all 0.15s',
              background: tab===t?'#6366F1':'transparent', color: tab===t?'#fff':S.muted }}>
            {t === 'kit' ? 'Marketing Kit' : t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <motion.div key="ov" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>

          {/* KPI row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'10px', marginBottom:'16px' }}>
            <StatCard label="Total Earned"       value={`$${MY_STATS.totalEarned.toLocaleString()}`} sub="All time"       color="#10B981" Icon={DollarSign} />
            <StatCard label="Pending Payout"     value={`$${MY_STATS.pendingPayout.toLocaleString()}`} sub="Processing"  color="#F97316" Icon={Timer} />
            <StatCard label="Total Referrals"    value={MY_STATS.totalReferrals}  sub={`${MY_STATS.activeReferrals} active`}   color="#6366F1" Icon={Users} />
            <StatCard label="Conversion Rate"    value={`${MY_STATS.conversionRate}%`} sub="Clicks → Sign-ups" color="#D4A843" Icon={TrendingUp} />
            <StatCard label="Clicks This Month"  value={MY_STATS.clicksThisMonth.toLocaleString()} sub="Link traffic"  color="#8B5CF6" Icon={BarChart2} />
            <StatCard label="Network Depth"      value="3 Tiers"               sub={`${MY_STATS.tier1Refs}·${MY_STATS.tier2Refs}·${MY_STATS.tier3Refs}`} color="#3B82F6" Icon={Network} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            {/* Commission Tier System */}
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'22px', backdropFilter:'blur(20px)' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#6366F1', fontWeight:700, marginBottom:'16px' }}>3-TIER COMMISSION SYSTEM</div>
              {COMMISSION_TIERS.map(t => (
                <div key={t.level} style={{ marginBottom:'16px', paddingBottom:'16px', borderBottom:`1px solid ${S.border}` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:"'Orbitron',sans-serif", fontSize:'11px', fontWeight:900,
                      background:`${t.color}15`, border:`2px solid ${t.color}40`, color:t.color }}>
                      {t.level}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ color:'#fff', fontSize:'12px', fontWeight:700 }}>{t.label}</span>
                        <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'13px', fontWeight:900, color:t.color }}>{t.pct}</span>
                      </div>
                      <div style={{ color:S.muted, fontSize:'10px', marginTop:'2px' }}>{t.desc}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:'10px', color:'#8899B4', background:'rgba(255,255,255,0.02)', borderRadius:'6px', padding:'6px 8px', borderLeft:`2px solid ${t.color}40` }}>
                    {t.example}
                  </div>
                </div>
              ))}
            </div>

            {/* Door earnings breakdown */}
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'22px', backdropFilter:'blur(20px)' }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#D4A843', fontWeight:700, marginBottom:'14px' }}>EARNINGS BY DOOR</div>
                {PROGRAMS.map(p => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                    <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:`${p.color}15`, border:`1px solid ${p.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <p.Icon size={13} style={{ color:p.color }} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                        <span style={{ color:'#CBD5E1', fontSize:'11px' }}>{p.label}</span>
                        <span style={{ color:p.color, fontSize:'12px', fontWeight:800, fontFamily:"'Orbitron',sans-serif" }}>${p.stats.earned.toLocaleString()}</span>
                      </div>
                      <div style={{ height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                        <motion.div initial={{ width:0 }} animate={{ width:`${(p.stats.earned/6400)*100}%` }}
                          transition={{ delay:0.3, duration:0.8 }}
                          style={{ height:'100%', background:p.color, borderRadius:'2px' }} />
                      </div>
                    </div>
                    <div style={{ fontSize:'9px', color:S.muted, textAlign:'right', flexShrink:0 }}>
                      {p.stats.referrals} refs<br/><span style={{ color:'#F97316' }}>+${p.stats.pending} pend.</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background:S.surface, border:'1px solid rgba(16,185,129,0.15)', borderRadius:'18px', padding:'18px', backdropFilter:'blur(20px)' }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#10B981', fontWeight:700, marginBottom:'12px' }}>PAYOUT STATUS</div>
                {[
                  { label:'Available for Withdrawal', value:`$${(MY_STATS.totalEarned-4000).toLocaleString()}`, color:'#10B981' },
                  { label:'Clearing (7-day hold)',    value:`$${MY_STATS.pendingPayout.toLocaleString()}`,      color:'#F97316' },
                  { label:'Next Auto-payout',        value:'Aug 1, 2026',                                       color:'#6366F1' },
                  { label:'Minimum Payout',          value:'$100',                                               color:S.muted },
                ].map(s => (
                  <div key={s.label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${S.border}` }}>
                    <span style={{ color:S.muted, fontSize:'11px' }}>{s.label}</span>
                    <span style={{ color:s.color, fontSize:'12px', fontWeight:700 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── PROGRAMS ── */}
      {tab === 'programs' && (
        <motion.div key="prg" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:'16px' }}>

          {/* Door selector */}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {PROGRAMS.map(p => (
              <button key={p.id} onClick={() => setActiveProg(p.id)}
                style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', borderRadius:'12px', cursor:'pointer', border:`1px solid ${activeProg===p.id?p.color+'40':'rgba(255,255,255,0.06)'}`, transition:'all 0.15s', width:'100%',
                  background: activeProg===p.id?`${p.color}12`:'rgba(11,18,32,0.7)' }}>
                <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:`${p.color}15`, border:`1px solid ${p.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <p.Icon size={14} style={{ color:p.color }} />
                </div>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:p.color, fontWeight:700 }}>{p.label}</div>
                  <div style={{ color:'#CBD5E1', fontSize:'11px' }}>{p.title}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Program detail */}
          <motion.div key={prog.id} initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}
            style={{ background:S.surface, border:`1px solid ${prog.color}20`, borderRadius:'18px', padding:'24px', backdropFilter:'blur(20px)' }}>
            <div style={{ position:'relative', overflow:'hidden', borderRadius:'14px', padding:'20px', marginBottom:'20px',
              background:`linear-gradient(135deg,${prog.color}15,rgba(11,18,32,0.9))`, border:`1px solid ${prog.color}25` }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`${prog.color}20`, border:`1px solid ${prog.color}40`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <prog.Icon size={20} style={{ color:prog.color }} />
                </div>
                <div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', color:prog.color, fontWeight:700 }}>{prog.label} AFFILIATE PROGRAM</div>
                  <div style={{ color:'#fff', fontSize:'16px', fontWeight:800 }}>{prog.title}</div>
                </div>
              </div>
              <p style={{ color:'#CBD5E1', fontSize:'12px', lineHeight:1.7 }}>{prog.desc}</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'20px' }}>
              {prog.tiers.map(t => (
                <div key={t.name} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${prog.color}15`, borderRadius:'12px', padding:'14px' }}>
                  <div style={{ fontSize:'9px', color:S.muted, marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.08em' }}>{t.name}</div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'22px', fontWeight:900, color:prog.color, marginBottom:'4px' }}>{t.value}</div>
                  <div style={{ fontSize:'10px', color:'#CBD5E1' }}>{t.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'20px' }}>
              <div style={{ background:'rgba(255,255,255,0.02)', borderRadius:'12px', padding:'14px' }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', color:S.muted, marginBottom:'10px', letterSpacing:'0.1em' }}>YOUR PERFORMANCE</div>
                {[
                  { label:'Referrals', value:prog.stats.referrals },
                  { label:'Active',    value:prog.stats.active },
                  { label:'Earned',    value:`$${prog.stats.earned.toLocaleString()}` },
                  { label:'Pending',   value:`$${prog.stats.pending}` },
                ].map(s => (
                  <div key={s.label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${S.border}` }}>
                    <span style={{ color:S.muted, fontSize:'11px' }}>{s.label}</span>
                    <span style={{ color:'#fff', fontSize:'12px', fontWeight:700 }}>{s.value}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', color:S.muted, marginBottom:'10px', letterSpacing:'0.1em' }}>PROGRAM FEATURES</div>
                {prog.features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'8px' }}>
                    <CheckCircle size={11} style={{ color:prog.color, flexShrink:0 }} />
                    <span style={{ color:'#CBD5E1', fontSize:'11px' }}>{f}</span>
                  </div>
                ))}
                <div style={{ marginTop:'12px' }}>
                  <div style={{ fontSize:'10px', color:S.muted, marginBottom:'5px' }}>Your {prog.label} referral link:</div>
                  <div style={{ display:'flex', gap:'6px' }}>
                    <div style={{ flex:1, padding:'7px 10px', borderRadius:'8px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, fontFamily:'monospace', fontSize:'10px', color:'#A5B4FC', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {refLink}?door={prog.id}
                    </div>
                    <button onClick={()=>copyToClipboard(`${refLink}?door=${prog.id}`, prog.id)}
                      style={{ padding:'7px 10px', borderRadius:'8px', cursor:'pointer', border:`1px solid ${prog.color}30`, background:`${prog.color}12`, color:prog.color, display:'flex', alignItems:'center' }}>
                      {copied===prog.id ? <CheckCircle size={13}/> : <Copy size={13}/>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── NETWORK ── */}
      {tab === 'network' && (
        <motion.div key="net" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'16px' }}>
            <div style={{ background:S.surface, border:'1px solid rgba(99,102,241,0.2)', borderRadius:'14px', padding:'16px', textAlign:'center', backdropFilter:'blur(20px)' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'28px', fontWeight:900, color:'#6366F1', marginBottom:'4px' }}>{MY_STATS.tier1Refs}</div>
              <div style={{ color:S.muted, fontSize:'10px' }}>Tier 1 (Direct)</div>
            </div>
            <div style={{ background:S.surface, border:'1px solid rgba(212,168,67,0.2)', borderRadius:'14px', padding:'16px', textAlign:'center', backdropFilter:'blur(20px)' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'28px', fontWeight:900, color:'#D4A843', marginBottom:'4px' }}>{MY_STATS.tier2Refs}</div>
              <div style={{ color:S.muted, fontSize:'10px' }}>Tier 2 (Sub-refs)</div>
            </div>
            <div style={{ background:S.surface, border:'1px solid rgba(16,185,129,0.2)', borderRadius:'14px', padding:'16px', textAlign:'center', backdropFilter:'blur(20px)' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'28px', fontWeight:900, color:'#10B981', marginBottom:'4px' }}>{MY_STATS.tier3Refs}</div>
              <div style={{ color:S.muted, fontSize:'10px' }}>Tier 3 (Deep)</div>
            </div>
          </div>

          <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', overflow:'hidden', backdropFilter:'blur(20px)' }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.15em', color:'#6366F1', fontWeight:700 }}>REFERRAL NETWORK</span>
              <span style={{ color:S.muted, fontSize:'11px' }}>{REFERRAL_TREE.length} connections shown</span>
            </div>
            <div style={{ padding:'8px' }}>
              {REFERRAL_TREE.map((r, i) => (
                <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
                  style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', borderRadius:'10px', marginBottom:'4px', background:'rgba(255,255,255,0.01)' }}>
                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:r.color, boxShadow:`0 0 6px ${r.color}`, flexShrink:0 }} />
                  <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:`${r.color}15`, border:`1px solid ${r.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontWeight:800, fontSize:'12px', color:r.color }}>
                    {r.name[0]}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>{r.name}</div>
                    <div style={{ display:'flex', gap:'8px', marginTop:'2px' }}>
                      <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:r.color, fontWeight:700 }}>{r.door}</span>
                      <span style={{ color:S.muted, fontSize:'10px' }}>Joined {r.joined}</span>
                    </div>
                  </div>
                  <div style={{ background:`rgba(99,102,241,0.1)`, border:'1px solid rgba(99,102,241,0.2)', borderRadius:'6px', padding:'3px 8px', fontSize:'9px', fontFamily:"'Orbitron',sans-serif", fontWeight:700, color:'#6366F1' }}>
                    TIER {r.tier}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <div style={{ width:'6px', height:'6px', borderRadius:'50%', background: r.status==='active'?'#10B981':'#F97316' }} />
                    <span style={{ fontSize:'10px', color: r.status==='active'?'#10B981':'#F97316' }}>{r.status}</span>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0, fontFamily:"'Orbitron',sans-serif", fontSize:'13px', fontWeight:900, color:'#10B981' }}>
                    ${r.earned}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── MARKETING KIT ── */}
      {tab === 'kit' && (
        <motion.div key="kit" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px', marginBottom:'16px' }}>
            {KIT_ITEMS.map(k => (
              <div key={k.label} style={{ background:S.surface, border:`1px solid ${k.color}20`, borderRadius:'16px', padding:'20px', backdropFilter:'blur(20px)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:`${k.color}15`, border:`1px solid ${k.color}25`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <k.icon size={14} style={{ color:k.color }} />
                    </div>
                    <span style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>{k.label}</span>
                  </div>
                  <button onClick={() => copyToClipboard(k.content.replace('[YOUR_LINK]', refLink).replace('[USER_ID]', refCode), k.label)}
                    style={{ display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'6px', cursor:'pointer', border:`1px solid ${k.color}30`, background:`${k.color}10`, color:k.color, fontSize:'10px', fontWeight:700 }}>
                    {copied===k.label ? <CheckCircle size={11}/> : <Copy size={11}/>}
                    {copied===k.label ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div style={{ padding:'12px', borderRadius:'10px', background:'rgba(255,255,255,0.02)', border:`1px solid ${S.border}`, fontSize:'11px', color:'#CBD5E1', lineHeight:1.7, fontFamily: k.type==='link'?'monospace':'inherit', color: k.type==='link'?k.color:'#CBD5E1' }}>
                  {k.content.replace('[YOUR_LINK]', refLink).replace('[USER_ID]', refCode)}
                </div>
              </div>
            ))}
          </div>

          {/* Door-specific links */}
          <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'22px', backdropFilter:'blur(20px)' }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#6366F1', fontWeight:700, marginBottom:'14px' }}>DOOR-SPECIFIC REFERRAL LINKS</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'10px' }}>
              {PROGRAMS.map(p => (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'10px', background:'rgba(255,255,255,0.02)', border:`1px solid ${p.color}15` }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'7px', background:`${p.color}15`, border:`1px solid ${p.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <p.Icon size={12} style={{ color:p.color }} />
                  </div>
                  <div style={{ flex:1, fontFamily:'monospace', fontSize:'10px', color:'#A5B4FC', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {refLink}?door={p.id}
                  </div>
                  <button onClick={()=>copyToClipboard(`${refLink}?door=${p.id}`, `door-${p.id}`)}
                    style={{ padding:'5px', borderRadius:'6px', cursor:'pointer', border:`1px solid ${p.color}20`, background:`${p.color}08`, color:p.color, display:'flex', alignItems:'center' }}>
                    {copied===`door-${p.id}` ? <CheckCircle size={12}/> : <Copy size={12}/>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      </AnimatePresence>
    </div>
  );
}
