import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Clock, Globe, TrendingUp, TrendingDown, Zap, AlertTriangle,
  BarChart2, Activity, Users, BookOpen, Building2, Brain, ChevronRight,
  Flame, Wind, Minus, ArrowUpRight, ArrowDownRight, Eye, Newspaper,
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

const ACCENT = '#10B981';
const S = { bg:'#1A1B1E', surface:'rgba(10,12,30,0.9)', border:'rgba(255,255,255,0.06)', muted:'#94A3B8' };

/* ── TRADING SESSIONS ── */
const SESSIONS = [
  { name:'SYDNEY',  tz:'Australia/Sydney',  open:22, close:7,  color:'#10B981', region:'APAC' },
  { name:'TOKYO',   tz:'Asia/Tokyo',        open:0,  close:9,  color:'#3B82F6', region:'APAC' },
  { name:'LONDON',  tz:'Europe/London',     open:8,  close:17, color:'#8B5CF6', region:'EU' },
  { name:'NEW YORK',tz:'America/New_York',  open:13, close:22, color:'#EF4444', region:'US' },
  { name:'DUBAI',   tz:'Asia/Dubai',        open:6,  close:15, color:'#D4A843', region:'MENA' },
];

function isSessionActive(open, close) {
  const now = new Date();
  const h = now.getUTCHours();
  return open < close ? (h >= open && h < close) : (h >= open || h < close);
}

/* ── MARKET DATA ── */
const MARKETS = [
  { symbol:'XAU/USD', name:'Gold',       price:2387.45, change:+0.42, dir:1,  color:'#D4A843', door:'EDGE' },
  { symbol:'EUR/USD', name:'Euro/Dollar',price:1.0847,  change:-0.18, dir:-1, color:'#06B6D4', door:'EDGE' },
  { symbol:'GBP/USD', name:'Cable',      price:1.2734,  change:+0.31, dir:1,  color:'#06B6D4', door:'EDGE' },
  { symbol:'USD/JPY', name:'Dollar/Yen', price:157.82,  change:+0.55, dir:1,  color:'#F97316', door:'EDGE' },
  { symbol:'BTC/USD', name:'Bitcoin',    price:67840,   change:-1.24, dir:-1, color:'#D4A843', door:'NEXUS' },
  { symbol:'US500',   name:'S&P 500',    price:5487.20, change:+0.67, dir:1,  color:'#10B981', door:'NEXUS' },
  { symbol:'OIL',     name:'Crude Oil',  price:81.34,   change:-0.89, dir:-1, color:'#EF4444', door:'NEXUS' },
  { symbol:'USD/AED', name:'Dollar/AED', price:3.6725,  change:0,     dir:0,  color:'#D4A843', door:'FORGE' },
];

/* ── ECONOMIC CALENDAR ── */
const CALENDAR = [
  { time:'09:00', currency:'EUR', event:'ECB Interest Rate Decision',     impact:'high',   forecast:'4.25%', prev:'4.25%', doors:['EDGE','FORGE'],  actual:null },
  { time:'13:30', currency:'USD', event:'US CPI Month-over-Month',        impact:'high',   forecast:'0.3%',  prev:'0.4%',  doors:['EDGE','NEXUS'],  actual:null },
  { time:'15:00', currency:'USD', event:'US ISM Manufacturing PMI',       impact:'medium', forecast:'48.5',  prev:'48.7',  doors:['EDGE'],           actual:null },
  { time:'16:00', currency:'GBP', event:'BOE Governor Bailey Speech',     impact:'medium', forecast:'—',     prev:'—',     doors:['EDGE','FORGE'],  actual:'Hawkish tone' },
  { time:'17:30', currency:'USD', event:'US Crude Oil Inventories',       impact:'medium', forecast:'-1.2M', prev:'+3.4M', doors:['NEXUS'],          actual:null },
  { time:'22:30', currency:'JPY', event:'BOJ Monetary Policy Statement',  impact:'high',   forecast:'—',     prev:'—',     doors:['EDGE'],           actual:null },
];

/* ── SENTIMENT ── */
const SENTIMENT = [
  { asset:'Gold',    bull:72, bear:28, color:'#D4A843' },
  { asset:'EUR/USD', bull:41, bear:59, color:'#3B82F6' },
  { asset:'GBP/USD', bull:58, bear:42, color:'#8B5CF6' },
  { asset:'BTC',     bull:64, bear:36, color:'#F97316' },
];

/* ── DOOR MARKET IMPACT ── */
const DOOR_ALERTS = [
  { door:'EDGE',   color:'#06B6D4', Icon:TrendingUp,  msg:'Gold breaking $2,390 resistance — 3 buy signals queued', time:'Live' },
  { door:'FORGE',  color:'#D4A843', Icon:Users,        msg:'MENA session opening — peak IB recruitment window now', time:'2m' },
  { door:'ORACLE', color:'#10B981', Icon:BookOpen,     msg:'ECB rate decision in 4h — Risk Module lesson relevant',  time:'4h' },
  { door:'NEXUS',  color:'#EF4444', Icon:Building2,    msg:'BTC volatility spike — NEXUS crypto desk alert active',  time:'7m' },
];

/* ── NEWS FEED ── */
const NEWS = [
  { headline:'Fed officials signal one rate cut possible in 2026 amid sticky inflation', source:'Reuters',   time:'12m', impact:'high',   doors:['EDGE','NEXUS'], sentiment:'bearish' },
  { headline:'Saudi Arabia extends OPEC+ voluntary cuts through Q3 2026',              source:'Bloomberg',  time:'34m', impact:'medium', doors:['NEXUS'],         sentiment:'bullish' },
  { headline:'ECB holds rates steady; Lagarde warns of prolonged restrictive policy',   source:'FT',        time:'1h',  impact:'high',   doors:['EDGE','FORGE'],  sentiment:'bearish' },
  { headline:'Dubai DIFC reports record number of new financial firm registrations',    source:'Zawya',     time:'2h',  impact:'medium', doors:['FORGE','NEXUS'], sentiment:'bullish' },
  { headline:'Gold surges as Middle East tensions remain elevated',                      source:'Kitco',    time:'3h',  impact:'high',   doors:['EDGE'],           sentiment:'bullish' },
  { headline:'Bank of Japan hints at accelerated rate normalization timeline',           source:'Nikkei',   time:'4h',  impact:'medium', doors:['EDGE'],           sentiment:'neutral' },
];

/* ── VOLATILITY INDEX ── */
const VOLATILITY = [
  { door:'EDGE',   color:'#06B6D4', vix:34, label:'Trading Volatility',  sub:'High · Active signals' },
  { door:'FORGE',  color:'#D4A843', vix:18, label:'IB Market Temp',      sub:'Moderate · Good for recruit' },
  { door:'ORACLE', color:'#10B981', vix:12, label:'Learning Index',      sub:'Stable · Focus session' },
  { door:'NEXUS',  color:'#EF4444', vix:28, label:'Business Climate',    sub:'Elevated · Opportunity' },
];

function SessionRing({ session }) {
  const { t } = useLang();
  const active = isSessionActive(session.open, session.close);
  const now = new Date();
  const pct = (now.getUTCHours() * 60 + now.getUTCMinutes()) / (24 * 60) * 100;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
      <div style={{ position:'relative', width:'56px', height:'56px' }}>
        <svg width="56" height="56" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle cx="28" cy="28" r="24" fill="none" stroke={session.color}
            strokeWidth="3" strokeDasharray={`${2*Math.PI*24}`}
            strokeDashoffset={`${2*Math.PI*24 * (1 - (active ? 0.7 : 0.15))}`}
            strokeLinecap="round" opacity={active ? 1 : 0.3} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {active
            ? <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:session.color, boxShadow:`0 0 8px ${session.color}`, animation:'s4p-pulse 2s infinite' }} />
            : <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'rgba(255,255,255,0.15)' }} />
          }
        </div>
      </div>
      <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'7px', letterSpacing:'0.1em', fontWeight:700, color: active ? session.color : S.muted, textAlign:'center' }}>
        {session.name}
      </div>
      <div style={{ fontSize:'9px', color: active ? '#10B981' : S.muted, fontWeight:700 }}>
        {active ? t('LIVE','مباشر') : t('CLOSED','مغلق')}
      </div>
    </div>
  );
}

function SparkLine({ positive }) {
  const pts = Array.from({length:12}, (_,i) =>
    20 + Math.sin(i*0.8 + (positive?0:Math.PI)) * 8 + Math.random()*4
  );
  const max = Math.max(...pts), min = Math.min(...pts);
  const norm = pts.map(p => ((p-min)/(max-min||1))*28+4);
  const path = norm.map((y,i) => `${i===0?'M':'L'}${i*6},${32-y}`).join(' ');
  return (
    <svg width="66" height="32" style={{ overflow:'visible' }}>
      <path d={path} fill="none" stroke={positive?'#10B981':'#EF4444'} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={(norm.length-1)*6} cy={32-norm[norm.length-1]} r="2.5" fill={positive?'#10B981':'#EF4444'} />
    </svg>
  );
}

const IMPACT_COLOR = { high:'#EF4444', medium:'#F97316', low:'#10B981' };
const SENTIMENT_COLOR = { bullish:'#10B981', bearish:'#EF4444', neutral:'#94A3B8' };
const DOOR_COLOR = { EDGE:'#06B6D4', FORGE:'#D4A843', ORACLE:'#10B981', NEXUS:'#EF4444' };

export default function ThePulse() {
  const { t } = useLang();
  const [now, setNow] = useState(new Date());
  const [activeSection, setActiveSection] = useState('market');
  const [briefExpanded, setBriefExpanded] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const utcTime = now.toUTCString().slice(17,25);
  const dubaiTime = now.toLocaleTimeString('en-US', { timeZone:'Asia/Dubai', hour:'2-digit', minute:'2-digit', second:'2-digit' });

  return (
    <div className="s4hud" style={{ ['--accent']:ACCENT, color:'#fff', fontFamily:"'Satoshi',sans-serif" }}>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="s4-glass spatial lift"
        style={{ position:'relative', overflow:'hidden', padding:'20px 24px', marginBottom:'16px',
          background:'linear-gradient(135deg,rgba(16,185,129,0.12) 0%,rgba(10,12,30,0.95) 55%,rgba(59,130,246,0.08) 100%)' }}>
        <span className="s4-bracket tl" /><span className="s4-bracket br" />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'20px' }}>
          <div>
            <div className="s4-label s4-accent" style={{ letterSpacing:'0.3em', marginBottom:8, display:'flex', alignItems:'center', gap:'8px' }}>
              <Radio size={13} /> {t('LIVE MARKET INTELLIGENCE', 'ذكاء السوق المباشر')}
              <span style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'6px', padding:'2px 8px', fontSize:'8px', fontWeight:700, color:'#EF4444', fontFamily:"'Satoshi',sans-serif", letterSpacing:'normal', animation:'s4p-pulse 2s infinite' }}>
                ● {t('LIVE','مباشر')}
              </span>
            </div>
            <h1 style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'clamp(20px,3vw,26px)', fontWeight:500, margin:'0 0 6px',
              background:'linear-gradient(135deg,#fff 0%,#6EE7B7 60%,#10B981 120%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{t('THE PULSE', 'النبض')}</h1>
            <p style={{ color:S.muted, fontSize:'12px', margin:0 }}>{t('Real-time market intelligence across all 4 SOLVEN4 doors', 'ذكاء السوق المباشر عبر أبواب SOLVEN4 الأربعة')}</p>
          </div>

          {/* Session rings */}
          <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
            {SESSIONS.map(s => <SessionRing key={s.name} session={s} />)}
          </div>

          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'22px', fontWeight:500, color:'#10B981' }}>{dubaiTime}</div>
            <div style={{ color:S.muted, fontSize:'10px', marginTop:'2px' }}>{t('DUBAI','دبي')} · GST+4</div>
            <div style={{ color:S.muted, fontSize:'9px', marginTop:'1px' }}>UTC {utcTime}</div>
          </div>
        </div>

        {/* SOLVEN Intelligence Brief */}
        <div style={{ marginTop:'14px', background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.18)', borderRadius:'10px', padding:'10px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <Brain size={12} color="#10B981" />
            <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'8px', color:'#10B981', letterSpacing:'0.15em', fontWeight:700 }}>{t('SOLVEN MARKET BRIEF','إحاطة سولفن للسوق')} · {now.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</span>
            <div style={{ flex:1, color:'#CBD5E1', fontSize:'11px' }}>
              {briefExpanded
                ? t('Gold testing $2,390 resistance with strong momentum — 3 buy signals ready. EURUSD ranging ahead of ECB; avoid until decision. MENA session opening — optimal FORGE recruitment window. Dubai DIFC activity elevated; NEXUS opportunity. ORACLE cohort 7 assessment due today.',
                     'الذهب يختبر مقاومة 2,390$ بزخم قوي — 3 إشارات شراء جاهزة. اليورو/دولار متذبذب قبل قرار البنك المركزي الأوروبي؛ تجنب حتى صدور القرار. جلسة الشرق الأوسط تفتح — نافذة توظيف مثالية لـFORGE. نشاط DIFC دبي مرتفع؛ فرصة NEXUS. تقييم دفعة ORACLE رقم 7 مستحق اليوم.')
                : t('Gold at $2,387 testing resistance · ECB decision in 4h · MENA session open · FORGE recruitment window active · BTC elevated',
                     'الذهب عند 2,387$ يختبر المقاومة · قرار البنك المركزي الأوروبي خلال 4 ساعات · جلسة الشرق الأوسط مفتوحة · نافذة توظيف FORGE نشطة · البيتكوين مرتفع')
              }
            </div>
            <button onClick={()=>setBriefExpanded(v=>!v)}
              style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'6px', padding:'4px 10px', cursor:'pointer', color:'#10B981', fontSize:'9px', fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>
              {briefExpanded ? t('Collapse','طي') : t('Full Brief','الإحاطة الكاملة')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── SECTION TABS ── */}
      <div style={{ display:'flex', gap:'4px', padding:'4px', borderRadius:'12px', background:'rgba(10,12,30,0.8)', border:`1px solid ${S.border}`, marginBottom:'16px', width:'fit-content' }}>
        {[['market',t('Market','السوق')], ['calendar',t('Econ Calendar','التقويم الاقتصادي')], ['sentiment',t('Sentiment','المشاعر')], ['news',t('News','الأخبار')]].map(([key, label]) => (
          <button key={key} onClick={()=>setActiveSection(key)}
            style={{ fontFamily:"'Satoshi',sans-serif", padding:'7px 18px', borderRadius:'8px', fontSize:'10px', letterSpacing:'0.05em', fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.15s',
              background: activeSection===key?ACCENT:'transparent', color: activeSection===key?'#000':S.muted }}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

      {/* ── MARKET TAB ── */}
      {activeSection === 'market' && (
        <motion.div key="mkt" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          {/* Door volatility meters */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' }}>
            {VOLATILITY.map(v => (
              <div key={v.door} className="s4-glass spatial lift" style={{ ['--accent']:v.color, padding:'14px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                  <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'8px', color:v.color, fontWeight:700 }}>{v.door}</span>
                  <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'18px', fontWeight:500, color:'#fff' }}>{v.vix}</span>
                </div>
                <div style={{ fontSize:'11px', color:'#CBD5E1', fontWeight:700, marginBottom:'2px' }}>{v.label}</div>
                <div style={{ fontSize:'9px', color:S.muted, marginBottom:'8px' }}>{v.sub}</div>
                <div style={{ height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${v.vix}%` }} transition={{ delay:0.3, duration:0.8 }}
                    style={{ height:'100%', background:`linear-gradient(90deg,${v.color}60,${v.color})`, borderRadius:'2px' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'14px' }}>
            {/* Markets grid */}
            <div className="s4-glass spatial lift" style={{ overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', gap:'8px' }}>
                <Activity size={12} color="#10B981" />
                <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'9px', letterSpacing:'0.15em', color:'#10B981', fontWeight:700 }}>{t('LIVE MARKETS','الأسواق المباشرة')}</span>
                <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'5px', fontSize:'9px', color:'#10B981' }}>
                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#10B981', animation:'s4p-pulse 1.5s infinite' }} />
                  {t('STREAMING','بث مباشر')}
                </div>
              </div>
              <div>
                {MARKETS.map((m, i) => (
                  <motion.div key={m.symbol} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                    style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 18px', borderBottom:'1px solid rgba(255,255,255,0.03)',
                      transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:`${m.color}12`, border:`1px solid ${m.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'7px', color:m.color, fontWeight:500, textAlign:'center', lineHeight:1.2 }}>
                        {m.symbol.split('/')[0]}
                      </span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>{m.symbol}</div>
                      <div style={{ color:S.muted, fontSize:'10px' }}>{m.name}</div>
                    </div>
                    <div style={{ flexShrink:0 }}>
                      <SparkLine positive={m.dir >= 0} />
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'13px', fontWeight:500, color:'#fff' }}>
                        {typeof m.price === 'number' && m.price > 1000
                          ? m.price.toLocaleString('en-US',{minimumFractionDigits:2})
                          : m.price.toFixed(4)}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'3px', justifyContent:'flex-end', marginTop:'2px' }}>
                        {m.dir > 0 ? <ArrowUpRight size={10} style={{ color:'#10B981' }} /> : m.dir < 0 ? <ArrowDownRight size={10} style={{ color:'#EF4444' }} /> : <Minus size={10} style={{ color:S.muted }} />}
                        <span style={{ fontSize:'10px', fontWeight:700, color: m.dir>0?'#10B981':m.dir<0?'#EF4444':S.muted }}>
                          {m.dir>0?'+':''}{m.change}%
                        </span>
                      </div>
                    </div>
                    <div style={{ background:`${DOOR_COLOR[m.door]}12`, border:`1px solid ${DOOR_COLOR[m.door]}25`, borderRadius:'5px', padding:'2px 6px' }}>
                      <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'7px', color:DOOR_COLOR[m.door], fontWeight:700 }}>{m.door}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Door alerts + sentiment preview */}
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div className="s4-glass spatial lift" style={{ padding:'18px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                  <Zap size={12} color="#D4A843" />
                  <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'9px', letterSpacing:'0.15em', color:'#D4A843', fontWeight:700 }}>{t('DOOR IMPACT ALERTS','تنبيهات تأثير الأبواب')}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {DOOR_ALERTS.map(a => (
                    <div key={a.door} style={{ display:'flex', gap:'10px', padding:'10px', borderRadius:'10px', background:`${a.color}06`, border:`1px solid ${a.color}15` }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:`${a.color}15`, border:`1px solid ${a.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <a.Icon size={13} style={{ color:a.color }} />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'3px' }}>
                          <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'7px', color:a.color, fontWeight:700 }}>{a.door}</span>
                          <span style={{ color:S.muted, fontSize:'9px' }}>{a.time}</span>
                        </div>
                        <p style={{ color:'#CBD5E1', fontSize:'10px', lineHeight:1.5 }}>{a.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="s4-glass spatial lift" style={{ padding:'18px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                  <Eye size={12} color="#6366F1" />
                  <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'9px', letterSpacing:'0.15em', color:'#6366F1', fontWeight:700 }}>{t('MARKET SENTIMENT','مشاعر السوق')}</span>
                </div>
                {SENTIMENT.map(s => (
                  <div key={s.asset} style={{ marginBottom:'10px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                      <span style={{ color:'#CBD5E1', fontSize:'11px', fontWeight:700 }}>{s.asset}</span>
                      <div style={{ display:'flex', gap:'6px', fontSize:'9px' }}>
                        <span style={{ color:'#10B981' }}>↑{s.bull}%</span>
                        <span style={{ color:'#EF4444' }}>↓{s.bear}%</span>
                      </div>
                    </div>
                    <div style={{ height:'5px', borderRadius:'3px', overflow:'hidden', display:'flex' }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${s.bull}%` }} transition={{ delay:0.4, duration:0.7 }}
                        style={{ height:'100%', background:'#10B981', borderRadius:'3px 0 0 3px' }} />
                      <motion.div initial={{ width:0 }} animate={{ width:`${s.bear}%` }} transition={{ delay:0.4, duration:0.7 }}
                        style={{ height:'100%', background:'#EF4444', borderRadius:'0 3px 3px 0' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── CALENDAR TAB ── */}
      {activeSection === 'calendar' && (
        <motion.div key="cal" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div className="s4-glass spatial lift" style={{ overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', gap:'10px' }}>
              <Clock size={12} color="#6366F1" />
              <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'9px', letterSpacing:'0.15em', color:'#6366F1', fontWeight:700 }}>{t('ECONOMIC CALENDAR — TODAY','التقويم الاقتصادي — اليوم')}</span>
              <div style={{ marginLeft:'auto', display:'flex', gap:'10px', fontSize:'10px' }}>
                <span style={{ color:'#EF4444' }}>● {t('High Impact','تأثير عالٍ')}</span>
                <span style={{ color:'#F97316' }}>● {t('Medium','متوسط')}</span>
                <span style={{ color:'#10B981' }}>● {t('Low','منخفض')}</span>
              </div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${S.border}` }}>
                    {[t('Time (Dubai)','الوقت (دبي)'),t('Currency','العملة'),t('Event','الحدث'),t('Impact','التأثير'),t('Forecast','التوقع'),t('Previous','السابق'),t('Actual','الفعلي'),t('Doors','الأبواب')].map(h => (
                      <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'9px', color:S.muted, fontWeight:700, fontFamily:"'Satoshi',sans-serif", letterSpacing:'0.1em', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CALENDAR.map((e, i) => (
                    <motion.tr key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
                      style={{ borderBottom:'1px solid rgba(255,255,255,0.03)', transition:'background 0.15s' }}
                      onMouseEnter={ev=>ev.currentTarget.style.background='rgba(255,255,255,0.02)'}
                      onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'12px 16px', fontFamily:"'Satoshi',sans-serif", fontSize:'11px', color:'#CBD5E1', whiteSpace:'nowrap' }}>{e.time}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'10px', fontWeight:500, color:'#fff', background:'rgba(255,255,255,0.08)', padding:'2px 7px', borderRadius:'5px' }}>{e.currency}</span>
                      </td>
                      <td style={{ padding:'12px 16px', color:'#fff', fontSize:'12px', fontWeight:600, maxWidth:'280px' }}>{e.event}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:IMPACT_COLOR[e.impact] }} />
                          <span style={{ fontSize:'10px', color:IMPACT_COLOR[e.impact], fontWeight:700, textTransform:'capitalize' }}>{e.impact}</span>
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px', color:'#CBD5E1', fontSize:'11px', fontFamily:'monospace' }}>{e.forecast}</td>
                      <td style={{ padding:'12px 16px', color:S.muted, fontSize:'11px', fontFamily:'monospace' }}>{e.prev}</td>
                      <td style={{ padding:'12px 16px' }}>
                        {e.actual
                          ? <span style={{ color:'#10B981', fontFamily:'monospace', fontSize:'11px', fontWeight:700 }}>{e.actual}</span>
                          : <span style={{ color:'rgba(255,255,255,0.15)', fontSize:'11px' }}>{t('Pending','معلق')}</span>
                        }
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:'4px' }}>
                          {e.doors.map(d => (
                            <span key={d} style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'7px', color:DOOR_COLOR[d], background:`${DOOR_COLOR[d]}12`, border:`1px solid ${DOOR_COLOR[d]}25`, borderRadius:'4px', padding:'2px 5px', fontWeight:700 }}>{d}</span>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── SENTIMENT TAB ── */}
      {activeSection === 'sentiment' && (
        <motion.div key="sent" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px' }}>
            {SENTIMENT.map(s => (
              <div key={s.asset} className="s4-glass spatial lift" style={{ ['--accent']:s.color, padding:'22px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                  <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'14px', fontWeight:500, color:'#fff' }}>{s.asset}</div>
                  <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'22px', fontWeight:500, color: s.bull>50?'#10B981':'#EF4444' }}>
                    {s.bull>50?t('BULLISH','صاعد'):t('BEARISH','هابط')}
                  </div>
                </div>
                <div style={{ height:'12px', borderRadius:'6px', overflow:'hidden', display:'flex', marginBottom:'10px' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${s.bull}%` }} transition={{ delay:0.3, duration:0.9 }}
                    style={{ background:'linear-gradient(90deg,#059669,#10B981)', borderRadius:'6px 0 0 6px' }} />
                  <motion.div initial={{ width:0 }} animate={{ width:`${s.bear}%` }} transition={{ delay:0.3, duration:0.9 }}
                    style={{ background:'linear-gradient(90deg,#EF4444,#DC2626)', borderRadius:'0 6px 6px 0' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ color:'#10B981', fontFamily:"'Satoshi',sans-serif", fontSize:'20px', fontWeight:500 }}>{s.bull}%</div>
                    <div style={{ color:S.muted, fontSize:'10px' }}>{t('Bullish','صاعد')}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ color:'#EF4444', fontFamily:"'Satoshi',sans-serif", fontSize:'20px', fontWeight:500 }}>{s.bear}%</div>
                    <div style={{ color:S.muted, fontSize:'10px' }}>{t('Bearish','هابط')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── NEWS TAB ── */}
      {activeSection === 'news' && (
        <motion.div key="news" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {NEWS.map((n, i) => (
              <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                className="s4-glass" style={{ padding:'16px 18px', display:'flex', alignItems:'flex-start', gap:'14px', cursor:'pointer' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=''; }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:IMPACT_COLOR[n.impact], boxShadow:`0 0 6px ${IMPACT_COLOR[n.impact]}`, marginTop:'5px', flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <p style={{ color:'#fff', fontSize:'13px', fontWeight:600, lineHeight:1.6, marginBottom:'8px' }}>{n.headline}</p>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ color:S.muted, fontSize:'10px', fontWeight:700 }}>{n.source}</span>
                    <span style={{ color:S.muted, fontSize:'9px' }}>·</span>
                    <span style={{ color:S.muted, fontSize:'10px' }}>{n.time} {t('ago','منذ')}</span>
                    <span style={{ color:S.muted, fontSize:'9px' }}>·</span>
                    <span style={{ fontSize:'10px', fontWeight:700, color:SENTIMENT_COLOR[n.sentiment] }}>{n.sentiment.toUpperCase()}</span>
                    <div style={{ display:'flex', gap:'4px', marginLeft:'auto' }}>
                      {n.doors.map(d => (
                        <span key={d} style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'7px', color:DOOR_COLOR[d], background:`${DOOR_COLOR[d]}12`, border:`1px solid ${DOOR_COLOR[d]}25`, borderRadius:'4px', padding:'2px 5px', fontWeight:700 }}>{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      </AnimatePresence>

      <style>{`
        @keyframes s4p-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
