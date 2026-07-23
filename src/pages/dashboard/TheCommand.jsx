import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  ArrowRight, TrendingUp, Users, BookOpen, Building2, Brain,
  DollarSign, Radio, Cpu, Trophy,
} from 'lucide-react';
import { GlassPanel, StatusRail, HoloHero, Btn, CountUp, Gauge, SpatialDeck, Telemetry, Horizon } from '@/hud';
import { useLang } from '@/lib/LanguageContext';

const HUB_ACCENT = '#6366f1';

const DOORS = [
  { id: 'EDGE', label: 'S4 EDGE', color: '#06B6D4', title: 'Trader Platform', Icon: TrendingUp, load: 0.674, status: 'OPTIMAL',
    kpis: [ { label: 'Active Traders', value: '1,247', delta: '+12', up: true }, { label: 'Open Positions', value: '38', delta: '+5', up: true },
            { label: 'Win Rate', value: '67.4%', delta: '+2.1%', up: true }, { label: 'Signal Accuracy', value: '91.2%', delta: '+0.8%', up: true } ],
    alerts: ['New XAUUSD signal · 94% confluence', '3 traders hit daily stop-loss'] },
  { id: 'FORGE', label: 'S4 FORGE', color: '#D4A843', title: 'IB Operator', Icon: Users, load: 0.72, status: 'ACTIVE',
    kpis: [ { label: 'IB Network', value: '284', delta: '+8', up: true }, { label: 'Active Leads', value: '47', delta: '+6', up: true },
            { label: 'Commission MTD', value: '$4,820', delta: '+$340', up: true }, { label: 'Conversion Rate', value: '23.8%', delta: '-1.2%', up: false } ],
    alerts: ['12 leads awaiting follow-up', 'New IB tier unlocked: Silver'] },
  { id: 'ORACLE', label: 'S4 ORACLE', color: '#10B981', title: 'Intelligence Academy', Icon: BookOpen, load: 0.783, status: 'ACTIVE',
    kpis: [ { label: 'Enrolled Users', value: '892', delta: '+34', up: true }, { label: 'Course Completions', value: '156', delta: '+22', up: true },
            { label: 'Avg. Score', value: '78.3%', delta: '+3.1%', up: true }, { label: 'Active Lessons', value: '8', delta: '0', up: null } ],
    alerts: ['New certification batch ready', '5 users pending review'] },
  { id: 'NEXUS', label: 'S4 NEXUS', color: '#EF4444', title: 'Business Command', Icon: Building2, load: 0.85, status: 'SCALING',
    kpis: [ { label: 'Revenue MTD', value: '$18,240', delta: '+$2,100', up: true }, { label: 'Active Clients', value: '73', delta: '+4', up: true },
            { label: 'Referral Payouts', value: '$1,340', delta: '+$240', up: true }, { label: 'Churn Rate', value: '2.1%', delta: '-0.4%', up: true } ],
    alerts: ['8 pending invoices', 'New business license approved'] },
];

const LIVE_ALERTS = [
  { id: 1, door: 'EDGE',   color: '#06B6D4', msg: 'XAUUSD Buy signal · SL 2,318 · TP 2,367', time: '2m',  priority: 'high' },
  { id: 2, door: 'FORGE',  color: '#D4A843', msg: '3 new IB referrals converted from WhatsApp', time: '7m',  priority: 'medium' },
  { id: 3, door: 'NEXUS',  color: '#EF4444', msg: 'Commission batch $1,240 approved for payout', time: '14m', priority: 'high' },
  { id: 4, door: 'ORACLE', color: '#10B981', msg: 'New cohort of 18 students enrolled today', time: '31m', priority: 'low' },
  { id: 5, door: 'EDGE',   color: '#06B6D4', msg: 'MT5 sync completed · 38 positions updated', time: '45m', priority: 'low' },
  { id: 6, door: 'FORGE',  color: '#D4A843', msg: 'CRM pipeline: 12 leads moved to Qualified', time: '1h',  priority: 'medium' },
];

const SYSTEM_HEALTH = [
  { label: 'MT5 Data Feed',     color: '#10B981', pct: 100 },
  { label: 'AI Engine',         color: '#10B981', pct: 100 },
  { label: 'Supabase DB',       color: '#10B981', pct: 100 },
  { label: 'Signal Pipeline',   color: '#10B981', pct: 99.8 },
  { label: 'IB Commission Eng', color: '#10B981', pct: 100 },
  { label: 'Vault Gateway',     color: '#F97316', pct: 91.2 },
];

const REVENUE_STREAMS = [
  { label: 'FORGE Commissions', value: 4820, color: '#D4A843', pct: 38 },
  { label: 'NEXUS Revenue',     value: 3240, color: '#EF4444', pct: 26 },
  { label: 'ORACLE Academy',    value: 2180, color: '#10B981', pct: 17 },
  { label: 'Referral Program',  value: 1340, color: '#6366F1', pct: 11 },
  { label: 'EDGE Signals',      value: 980,  color: '#06B6D4', pct: 8  },
];
const REVENUE_TOTAL = REVENUE_STREAMS.reduce((s, r) => s + r.value, 0);

const TELEM_ROWS = [
  { k: 'Active Traders', base: 1247 },
  { k: 'Revenue · MTD',  base: 12560, prefix: '$' },
  { k: 'IB Network',     base: 284 },
  { k: 'Vault Balance',  base: 24880, prefix: '$' },
  { k: 'Live Signals',   base: 18, suffix: ' live' },
];

const INTEGRITY = SYSTEM_HEALTH.reduce((s, r) => s + r.pct, 0) / SYSTEM_HEALTH.length / 100;

function getGreeting(t) { const h = new Date().getHours(); return h < 12 ? t('GOOD MORNING','صباح الخير') : h < 18 ? t('GOOD AFTERNOON','مساء الخير') : t('GOOD EVENING','مساء الخير'); }

function DoorTile({ door, onClick, t }) {
  const statusColor = { OPTIMAL:'#10B981', ACTIVE:'#3B82F6', SCALING:'#D4A843' }[door.status] || '#10B981';
  return (
    <motion.button
      initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} whileHover={{ y:-4 }} onClick={onClick}
      className="s4-glass spatial lift" style={{ ['--accent']: door.color, padding:'16px', cursor:'pointer', textAlign:'left', overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)' }}>
      <span className="s4-bracket tl" /><span className="s4-bracket br" />
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,transparent,${door.color},transparent)` }} />
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
        <div style={{ width:'52px', height:'52px', flexShrink:0, position:'relative' }}>
          <Gauge value={door.load} size={52} mini />
          <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center' }}>
            <door.Icon size={15} color={door.color} />
          </div>
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'9px', color:door.color, letterSpacing:'0.15em', fontWeight:700 }}>{door.label}</div>
          <div style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>{door.title}</div>
          <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'10px', letterSpacing:'0.14em', color:statusColor, textTransform:'uppercase', marginTop:'2px' }}>{door.status}</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
        {door.kpis.slice(0,4).map(k => (
          <div key={k.label} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'7px', padding:'7px' }}>
            <div style={{ color:'#94A3B8', fontSize:'8.5px', marginBottom:'2px' }}>{k.label}</div>
            <div className="s4-num" style={{ color:'#fff', fontSize:'13px', fontWeight:800, fontFamily:"'Satoshi',sans-serif" }}>{k.value}</div>
            {k.up !== null && <div style={{ color: k.up ? '#10B981' : '#EF4444', fontSize:'8.5px' }}>{k.up ? '▲' : '▼'} {k.delta}</div>}
          </div>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'4px', color:door.color, fontSize:'11px', fontWeight:700 }}>
        {t('Enter Door', 'دخول الباب')} <ArrowRight size={11} />
      </div>
    </motion.button>
  );
}

export default function TheCommand() {
  const { t } = useLang();
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [alertTab, setAlertTab] = useState('all');
  const [briefExpanded, setBriefExpanded] = useState(false);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Operator';
  const timeStr = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  const filteredAlerts = alertTab === 'all' ? LIVE_ALERTS : LIVE_ALERTS.filter(a => a.door.toLowerCase() === alertTab);
  const rise = { initial:{ opacity:0, y:16 }, animate:{ opacity:1, y:0 } };

  return (
    <div className="s4hud" style={{ color:'#fff', fontFamily:"'Space Grotesk',sans-serif" }}>
      <StatusRail door="HUB · COMMAND" />

      {/* greeting + brief */}
      <motion.div {...rise} transition={{ duration:0.5 }} style={{ marginTop:14, display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
        <div>
          <div className="s4-label s4-accent" style={{ letterSpacing:'0.35em', marginBottom:6 }}>{getGreeting(t)}, {t('OPERATOR','مشغل')}</div>
          <h1 style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'clamp(24px,3vw,36px)', fontWeight:900, lineHeight:1.02, margin:0,
            background:'linear-gradient(135deg,#fff 0%,#A5B4FC 60%,#6366F1 120%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            filter:'drop-shadow(0 4px 22px rgba(99,102,241,0.35))' }}>{displayName.toUpperCase()}</h1>
        </div>
        <div style={{ textAlign:'right' }}>
          <div className="s4-num" style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'26px', fontWeight:900, color:'#818CF8', letterSpacing:'0.05em', textShadow:'0 0 26px rgba(99,102,241,0.5)' }}>{timeStr}</div>
          <div style={{ color:'#94A3B8', fontSize:'11px' }}>{dateStr}</div>
        </div>
      </motion.div>

      {/* ── INSTRUMENT DECK (parallax) ── */}
      <SpatialDeck intensity={5} style={{ marginTop:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.35fr 1fr', gap:14, alignItems:'stretch' }}>

          {/* SYSTEM VITALS */}
          <GlassPanel className="spatial lift" label={t('System Vitals','مؤشرات النظام')} tag={t('LIVE','مباشر')} style={{ ['--accent']:HUB_ACCENT }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
              {SYSTEM_HEALTH.map(s => (
                <div key={s.label} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width:'40px', height:'40px', flexShrink:0, ['--accent']: s.color }}>
                    <Gauge value={s.pct/100} size={40} mini />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:'#CBD5E1', fontSize:'11px' }}>{s.label}</div>
                    <div className="s4-num" style={{ color:s.color, fontSize:'11px', fontWeight:700, fontFamily:"'Satoshi',sans-serif", letterSpacing:'0.06em' }}>{s.pct}%</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* COMMAND INTEGRITY — hero */}
          <HoloHero resolvedAccent={HUB_ACCENT} className="s4-glass spatial lift" brackets
            style={{ padding:'18px', borderRadius:14, overflow:'hidden', display:'flex', flexDirection:'column' }}
            coreStyle={{ opacity:0.42 }}>
            <span className="s4-bracket tl" /><span className="s4-bracket tr" /><span className="s4-bracket bl" /><span className="s4-bracket br" />
            <div className="s4-label" style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span>{t('Command Integrity','سلامة القيادة')}</span><span className="s4-accent">HUB</span>
            </div>
            <div style={{ position:'relative', width:'100%', maxWidth:300, aspectRatio:'1', margin:'0 auto', flex:1, display:'grid', placeItems:'center' }}>
              <div style={{ position:'absolute', inset:0 }}><Gauge value={INTEGRITY} size={280} /></div>
              <svg className="s4-radar" viewBox="0 0 280 280" style={{ position:'absolute', inset:0 }}>
                <defs><linearGradient id="s4rg" x1="0" x2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity="0.5"/><stop offset="1" stopColor="var(--accent)" stopOpacity="0"/></linearGradient></defs>
                <line x1="140" y1="140" x2="140" y2="24" stroke="url(#s4rg)" strokeWidth="2" />
              </svg>
              <div className="s4-readcenter">
                <div className="s4-num" style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:800, fontSize:'34px', color:'#fff', textShadow:'0 0 24px rgba(99,102,241,0.6)' }}>
                  <CountUp to={98.5} suffix="" />
                </div>
                <div className="s4-label" style={{ marginTop:4 }}>{t('System Integrity','سلامة النظام')}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <Btn onClick={() => navigate('/dashboard/agent')} style={{ flex:1, padding:'9px', fontSize:'11px', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <Brain size={12} /> {t('Solven AI','سولفن AI')}
              </Btn>
              <Btn ghost onClick={() => navigate('/dashboard/arena')} style={{ flex:1, padding:'9px', fontSize:'11px', display:'flex', alignItems:'center', justifyContent:'center', gap:6, ['--accent']:'#D4A843' }}>
                <Trophy size={12} /> {t('Arena','الساحة')}
              </Btn>
            </div>
          </HoloHero>

          {/* TELEMETRY + HORIZON */}
          <GlassPanel className="spatial lift" label={t('Telemetry','القياس عن بُعد')} tag={t('STREAM','بث')} style={{ ['--accent']:HUB_ACCENT, display:'flex', flexDirection:'column' }}>
            <Telemetry rows={TELEM_ROWS} />
            <div className="s4-label" style={{ marginTop:14, marginBottom:8 }}><span>{t('Arena Rank','رتبة الساحة')}</span></div>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
              <span style={{ fontFamily:"'Satoshi',sans-serif", fontWeight:800, color:'#D4A843', fontSize:'18px' }}>GOLD 7</span>
              <span className="s4-num" style={{ color:'#94A3B8', fontSize:'11px' }}>4,250 XP</span>
            </div>
            <div className="s4-label" style={{ marginTop:14, marginBottom:8 }}><span>{t('Attitude','الاتجاه')}</span><span className="s4-accent">±</span></div>
            <Horizon height={46} />
          </GlassPanel>
        </div>
      </SpatialDeck>

      {/* SOLVEN MORNING BRIEF */}
      <motion.div {...rise} transition={{ delay:0.25 }}
        style={{ marginTop:14, background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'12px', padding:'12px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <div className="s4-dot" style={{ ['--accent']:'#10B981' }} /><Brain size={13} color="#818CF8" />
            <span className="s4-label s4-accent">{t('SOLVEN MORNING BRIEF','إحاطة سولفن الصباحية')}</span>
          </div>
          <div style={{ flex:1, minWidth:200, color:'#CBD5E1', fontSize:'12px' }}>
            {briefExpanded
              ? t('EDGE win rate up 2.1% — consolidate EURUSD signals for today. FORGE has 12 hot leads, follow up before 2PM. ORACLE cohort #7 starts today, 18 students enrolled. NEXUS revenue on track, 3 invoices outstanding.',
                  'معدل ربح EDGE ارتفع 2.1% — راجع إشارات EURUSD اليوم. لدى FORGE 12 عميلاً محتملاً ساخناً، تابعهم قبل الساعة 2 ظهراً. تبدأ دفعة ORACLE رقم 7 اليوم بـ18 طالباً. إيرادات NEXUS على المسار الصحيح، 3 فواتير معلقة.')
              : t('Markets mixed · XAUUSD testing resistance · FORGE 12 hot leads · NEXUS $18K MTD · ORACLE cohort live',
                  'الأسواق متباينة · XAUUSD يختبر المقاومة · FORGE 12 عميلاً ساخناً · NEXUS 18 ألف$ · دفعة ORACLE مباشرة')}
          </div>
          <button onClick={() => setBriefExpanded(v => !v)} style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'6px', padding:'5px 11px', cursor:'pointer', color:'#818CF8', fontSize:'10px', fontWeight:700, whiteSpace:'nowrap' }}>{briefExpanded ? t('Less','أقل') : t('Full Brief','الإحاطة الكاملة')}</button>
          <button onClick={() => navigate('/dashboard/agent')} style={{ display:'flex', alignItems:'center', gap:'4px', background:'rgba(99,102,241,0.2)', border:'1px solid rgba(99,102,241,0.4)', borderRadius:'6px', padding:'5px 11px', cursor:'pointer', color:'#A5B4FC', fontSize:'10px', fontWeight:700, whiteSpace:'nowrap' }}>{t('Ask SOLVEN','اسأل سولفن')} <ArrowRight size={11} /></button>
        </div>
      </motion.div>

      {/* DOOR REGISTER */}
      <div style={{ marginTop:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
          <span className="s4-label">{t('S4 ECOSYSTEM DOORS','أبواب نظام S4')}</span>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,rgba(99,102,241,0.35),transparent)' }} />
          <span style={{ color:'#94A3B8', fontSize:'10px' }}>{t('Select an instrument to enter','اختر باباً للدخول')}</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
          {DOORS.map(d => <DoorTile key={d.id} door={d} t={t} onClick={() => navigate(`/dashboard/door/${d.id.toLowerCase()}`)} />)}
        </div>
      </div>

      {/* REVENUE + ALERTS */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:'14px', marginTop:'16px' }}>
        <motion.div {...rise} transition={{ delay:0.4 }}>
          <GlassPanel className="spatial lift" brackets={false} style={{ ['--accent']:'#10B981' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'7px' }}><DollarSign size={13} color="#10B981" /><span className="s4-label" style={{ color:'#10B981' }}>{t('REVENUE STREAMS','مصادر الإيرادات')}</span></div>
              <span className="s4-num" style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'13px', fontWeight:900, color:'#10B981' }}>$<CountUp to={REVENUE_TOTAL} /></span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'9px' }}>
              {REVENUE_STREAMS.map(r => (
                <div key={r.label}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ color:'#CBD5E1', fontSize:'11px' }}>{r.label}</span>
                    <span className="s4-num" style={{ color:r.color, fontSize:'11px', fontWeight:700 }}>${r.value.toLocaleString()}</span>
                  </div>
                  <div style={{ height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                    <motion.div initial={{ width:0 }} animate={{ width:`${r.pct}%` }} transition={{ delay:0.6, duration:0.8 }} style={{ height:'100%', borderRadius:'2px', background:r.color, boxShadow:`0 0 10px ${r.color}80` }} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/dashboard/vault')} style={{ marginTop:'14px', display:'flex', alignItems:'center', gap:'4px', color:'#10B981', fontSize:'11px', fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:0 }}>{t('Open Vault','فتح الخزنة')} <ArrowRight size={11} /></button>
          </GlassPanel>
        </motion.div>

        <motion.div {...rise} transition={{ delay:0.45 }}>
          <GlassPanel className="spatial lift" brackets={false}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'7px' }}><Radio size={13} color="#818CF8" /><span className="s4-label s4-accent">{t('LIVE INTELLIGENCE FEED','بث الذكاء المباشر')}</span></div>
              <div style={{ background:'#6366F1', borderRadius:'999px', fontSize:'9px', fontWeight:700, padding:'2px 7px', color:'#fff' }}>{LIVE_ALERTS.length}</div>
            </div>
            <div style={{ display:'flex', gap:'6px', marginBottom:'12px', flexWrap:'wrap' }}>
              {['all','edge','forge','oracle','nexus'].map(t => (
                <button key={t} onClick={() => setAlertTab(t)} style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'8px', letterSpacing:'0.1em', fontWeight:700, padding:'4px 9px', borderRadius:'6px', cursor:'pointer', border:'none',
                  background: alertTab===t ? '#6366F1' : 'rgba(255,255,255,0.05)', color: alertTab===t ? '#fff' : '#94A3B8' }}>{t.toUpperCase()}</button>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <AnimatePresence>
                {filteredAlerts.map(a => (
                  <motion.div key={a.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                    style={{ display:'flex', alignItems:'flex-start', gap:'9px', padding:'8px', borderRadius:'8px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:a.color, boxShadow:`0 0 6px ${a.color}`, marginTop:'4px', flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'2px' }}>
                        <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'8px', color:a.color, fontWeight:700 }}>{a.door}</span>
                        <div style={{ width:'1px', height:'10px', background:'rgba(255,255,255,0.1)' }} />
                        <span style={{ color:'#94A3B8', fontSize:'9px' }}>{a.time} {t('ago','منذ')}</span>
                        {a.priority==='high' && <span style={{ background:'rgba(239,68,68,0.15)', color:'#EF4444', fontSize:'8px', fontWeight:700, padding:'1px 5px', borderRadius:'4px' }}>{t('HIGH','عالي')}</span>}
                      </div>
                      <p style={{ color:'#CBD5E1', fontSize:'11px', lineHeight:1.4 }}>{a.msg}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}
