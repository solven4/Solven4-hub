import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  ArrowRight, TrendingUp, Users, BookOpen, Building2, Brain,
  Bell, Wallet, Trophy, Activity, Zap, Shield, Target, Globe,
  AlertTriangle, CheckCircle, Clock, ChevronRight, BarChart2,
  DollarSign, Network, Cpu, Radio, Eye, Lock, RefreshCw,
} from 'lucide-react';

const DOORS = [
  {
    id: 'EDGE', label: 'S4 EDGE', color: '#06B6D4',
    title: 'Trader Platform', Icon: TrendingUp,
    kpis: [
      { label: 'Active Traders', value: '1,247', delta: '+12', up: true },
      { label: 'Open Positions', value: '38', delta: '+5', up: true },
      { label: 'Win Rate', value: '67.4%', delta: '+2.1%', up: true },
      { label: 'Signal Accuracy', value: '91.2%', delta: '+0.8%', up: true },
    ],
    alerts: ['New XAUUSD signal · 94% confluence', '3 traders hit daily stop-loss'],
    status: 'OPTIMAL',
  },
  {
    id: 'FORGE', label: 'S4 FORGE', color: '#D4A843',
    title: 'IB Operator', Icon: Users,
    kpis: [
      { label: 'IB Network', value: '284', delta: '+8', up: true },
      { label: 'Active Leads', value: '47', delta: '+6', up: true },
      { label: 'Commission MTD', value: '$4,820', delta: '+$340', up: true },
      { label: 'Conversion Rate', value: '23.8%', delta: '-1.2%', up: false },
    ],
    alerts: ['12 leads awaiting follow-up', 'New IB tier unlocked: Silver'],
    status: 'ACTIVE',
  },
  {
    id: 'ORACLE', label: 'S4 ORACLE', color: '#10B981',
    title: 'Intelligence Academy', Icon: BookOpen,
    kpis: [
      { label: 'Enrolled Users', value: '892', delta: '+34', up: true },
      { label: 'Course Completions', value: '156', delta: '+22', up: true },
      { label: 'Avg. Score', value: '78.3%', delta: '+3.1%', up: true },
      { label: 'Active Lessons', value: '8', delta: '0', up: null },
    ],
    alerts: ['New certification batch ready', '5 users pending review'],
    status: 'ACTIVE',
  },
  {
    id: 'NEXUS', label: 'S4 NEXUS', color: '#EF4444',
    title: 'Business Command', Icon: Building2,
    kpis: [
      { label: 'Revenue MTD', value: '$18,240', delta: '+$2,100', up: true },
      { label: 'Active Clients', value: '73', delta: '+4', up: true },
      { label: 'Referral Payouts', value: '$1,340', delta: '+$240', up: true },
      { label: 'Churn Rate', value: '2.1%', delta: '-0.4%', up: true },
    ],
    alerts: ['8 pending invoices', 'New business license approved'],
    status: 'SCALING',
  },
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
  { label: 'MT5 Data Feed',    status: 'online',  color: '#10B981', pct: 100 },
  { label: 'AI Engine',        status: 'online',  color: '#10B981', pct: 100 },
  { label: 'Supabase DB',      status: 'online',  color: '#10B981', pct: 100 },
  { label: 'Signal Pipeline',  status: 'online',  color: '#10B981', pct: 99.8 },
  { label: 'IB Commission Eng',status: 'online',  color: '#10B981', pct: 100 },
  { label: 'Vault Gateway',    status: 'degraded',color: '#F97316', pct: 91.2 },
];

const REVENUE_STREAMS = [
  { label: 'FORGE Commissions', value: 4820, color: '#D4A843', pct: 38 },
  { label: 'NEXUS Revenue',     value: 3240, color: '#EF4444', pct: 26 },
  { label: 'ORACLE Academy',    value: 2180, color: '#10B981', pct: 17 },
  { label: 'Referral Program',  value: 1340, color: '#6366F1', pct: 11 },
  { label: 'EDGE Signals',      value: 980,  color: '#06B6D4', pct: 8  },
];
const REVENUE_TOTAL = REVENUE_STREAMS.reduce((s, r) => s + r.value, 0);

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'GOOD MORNING';
  if (h < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

function ParticleField() {
  const ref = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: 1 + Math.random(), opacity: 0.1 + Math.random() * 0.3,
      color: ['#6366F1','#06B6D4','#D4A843','#EF4444'][Math.floor(Math.random()*4)],
    }));
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x = (p.x + p.vx + W) % W; p.y = (p.y + p.vy + H) % H;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2,'0');
        ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i+1, i+5).forEach(b => {
        const d = Math.hypot(a.x-b.x, a.y-b.y);
        if (d < 100) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(99,102,241,${0.05*(1-d/100)})`; ctx.lineWidth=0.5; ctx.stroke(); }
      }));
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    const ro = new ResizeObserver(() => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; });
    ro.observe(canvas);
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }} />;
}

function DoorStatusCard({ door, onClick }) {
  const [hov, setHov] = useState(false);
  const statusColor = { OPTIMAL:'#10B981', ACTIVE:'#3B82F6', SCALING:'#D4A843', DEGRADED:'#EF4444' }[door.status] || '#10B981';
  return (
    <motion.div
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      whileHover={{ scale:1.02, y:-3 }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      onClick={onClick}
      style={{
        background: hov ? `${door.color}10` : 'rgba(11,18,32,0.9)',
        border: `1px solid ${hov ? door.color+'40' : door.color+'18'}`,
        borderRadius:'16px', padding:'18px', cursor:'pointer',
        boxShadow: hov ? `0 0 40px ${door.color}20` : 'none',
        transition:'all 0.2s', position:'relative', overflow:'hidden',
      }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px',
        background: hov ? `linear-gradient(90deg,transparent,${door.color},transparent)` : 'transparent', transition:'all 0.3s' }} />

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:`${door.color}15`, border:`1px solid ${door.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <door.Icon size={18} color={door.color} />
          </div>
          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', color:door.color, letterSpacing:'0.15em', fontWeight:700 }}>{door.label}</div>
            <div style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>{door.title}</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'5px', background:`${statusColor}12`, border:`1px solid ${statusColor}30`, borderRadius:'999px', padding:'3px 8px' }}>
          <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:statusColor, boxShadow:`0 0 6px ${statusColor}`, animation:'s4-pulse 2s infinite' }} />
          <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:statusColor, letterSpacing:'0.1em', fontWeight:700 }}>{door.status}</span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px' }}>
        {door.kpis.map(k => (
          <div key={k.label} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'8px' }}>
            <div style={{ color:'#8899B4', fontSize:'9px', marginBottom:'3px' }}>{k.label}</div>
            <div style={{ color:'#fff', fontSize:'14px', fontWeight:800, fontFamily:"'Orbitron',sans-serif" }}>{k.value}</div>
            {k.up !== null && (
              <div style={{ color: k.up ? '#10B981' : '#EF4444', fontSize:'9px', marginTop:'1px' }}>
                {k.up ? '↑' : '↓'} {k.delta}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
        {door.alerts.map((a, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'10px', color:'#CBD5E1' }}>
            <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:door.color, flexShrink:0 }} />
            {a}
          </div>
        ))}
      </div>

      <motion.div whileHover={{ x:3 }}
        style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'4px',
          color:door.color, fontSize:'11px', fontWeight:700, marginTop:'12px' }}>
        Enter Door <ArrowRight size={11} />
      </motion.div>
    </motion.div>
  );
}

export default function TheCommand() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [alertTab, setAlertTab] = useState('all');
  const [briefExpanded, setBriefExpanded] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Operator';
  const timeStr = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

  const filteredAlerts = alertTab === 'all' ? LIVE_ALERTS : LIVE_ALERTS.filter(a => a.door.toLowerCase() === alertTab);

  return (
    <div style={{ color:'#fff', fontFamily:"'Inter',sans-serif" }}>

      {/* ── COMMAND HEADER ── */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
        style={{
          position:'relative', overflow:'hidden', borderRadius:'20px',
          background:'rgba(11,18,32,0.8)', backdropFilter:'blur(30px)',
          border:'1px solid rgba(99,102,241,0.15)', padding:'24px 28px', marginBottom:'16px',
          boxShadow:'0 0 80px rgba(99,102,241,0.07)',
        }}>
        <ParticleField />
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'24px' }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.35em', color:'#6366F1', marginBottom:'5px' }}>
              {getGreeting()}, OPERATOR
            </div>
            <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'28px', fontWeight:900, lineHeight:1.1, marginBottom:'6px',
              background:'linear-gradient(135deg,#fff 0%,#A5B4FC 60%,#6366F1 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              {displayName.toUpperCase()}
            </h1>
            <p style={{ color:'#8899B4', fontSize:'12px' }}>
              SOLVEN4 Command Center · All 4 doors online · AI systems nominal
            </p>
          </div>

          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'26px', fontWeight:900, color:'#6366F1', letterSpacing:'0.05em', textShadow:'0 0 30px rgba(99,102,241,0.5)' }}>
              {timeStr}
            </div>
            <div style={{ color:'#8899B4', fontSize:'11px', marginTop:'3px' }}>{dateStr}</div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:'5px', marginTop:'8px' }}>
              {DOORS.map(d => (
                <div key={d.id} title={d.label}
                  style={{ width:'7px', height:'7px', borderRadius:'50%', background:d.color, boxShadow:`0 0 8px ${d.color}` }} />
              ))}
            </div>
          </div>
        </div>

        {/* SOLVEN Morning Brief */}
        <div style={{ position:'relative', zIndex:1, marginTop:'16px', background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'12px', padding:'12px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#10B981', boxShadow:'0 0 8px #10B981', animation:'s4-pulse 2s infinite' }} />
              <Brain size={13} color="#6366F1" />
              <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', color:'#6366F1', letterSpacing:'0.15em', fontWeight:700 }}>SOLVEN MORNING BRIEF</span>
            </div>
            <div style={{ flex:1, color:'#CBD5E1', fontSize:'12px' }}>
              {briefExpanded
                ? 'EDGE win rate up 2.1% — consolidate EURUSD signals for today. FORGE has 12 hot leads, follow up before 2PM. ORACLE cohort #7 starts today, 18 students enrolled. NEXUS revenue on track, 3 invoices outstanding.'
                : 'Markets mixed · XAUUSD testing resistance · FORGE 12 hot leads · NEXUS $18K MTD · ORACLE cohort live'
              }
            </div>
            <button onClick={() => setBriefExpanded(v => !v)}
              style={{ display:'flex', alignItems:'center', gap:'4px', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'6px', padding:'4px 10px', cursor:'pointer', color:'#6366F1', fontSize:'10px', fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>
              {briefExpanded ? 'Less' : 'Full Brief'} <ChevronRight size={11} />
            </button>
            <button onClick={() => navigate('/dashboard/agent')}
              style={{ display:'flex', alignItems:'center', gap:'4px', background:'rgba(99,102,241,0.2)', border:'1px solid rgba(99,102,241,0.4)', borderRadius:'6px', padding:'4px 10px', cursor:'pointer', color:'#818CF8', fontSize:'10px', fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>
              Ask SOLVEN <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── TOP KPIs ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'10px', marginBottom:'16px' }}>
        {[
          { label:'Total Traders',  value:'1,247', delta:'+12 today', color:'#3B82F6', Icon:Users },
          { label:'Revenue MTD',    value:'$12,560',delta:'+$1,840',  color:'#10B981', Icon:DollarSign },
          { label:'IB Network',     value:'284',   delta:'+8 this wk',color:'#D4A843', Icon:Network },
          { label:'Vault Balance',  value:'$24,880',delta:'+$340',    color:'#6366F1', Icon:Wallet },
          { label:'Arena Rank',     value:'Gold 7', delta:'4,250 XP', color:'#D4A843', Icon:Trophy },
          { label:'Active Signals', value:'18',    delta:'+3 live',   color:'#8B5CF6', Icon:Zap },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+i*0.05 }}
            style={{ background:'rgba(11,18,32,0.85)', border:`1px solid ${s.color}18`, borderRadius:'12px', padding:'13px', backdropFilter:'blur(20px)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
              <span style={{ color:'#8899B4', fontSize:'10px' }}>{s.label}</span>
              <s.Icon size={12} color={s.color} />
            </div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'17px', fontWeight:900, color:'#fff', marginBottom:'3px' }}>{s.value}</div>
            <div style={{ color:s.color, fontSize:'9px' }}>{s.delta}</div>
          </motion.div>
        ))}
      </div>

      {/* ── DOOR CARDS GRID ── */}
      <div style={{ marginBottom:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
          <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.25em', color:'#8899B4' }}>S4 ECOSYSTEM DOORS</span>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,rgba(99,102,241,0.3),transparent)' }} />
          <span style={{ color:'#8899B4', fontSize:'10px' }}>Click any door to enter</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
          {DOORS.map(d => (
            <DoorStatusCard key={d.id} door={d} onClick={() => navigate(`/dashboard/door/${d.id.toLowerCase()}`)} />
          ))}
        </div>
      </div>

      {/* ── BOTTOM ROW: Revenue + Alerts + System Health ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr 1fr', gap:'14px' }}>

        {/* Revenue Waterfall */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          style={{ background:'rgba(11,18,32,0.85)', border:'1px solid rgba(16,185,129,0.12)', borderRadius:'16px', padding:'18px', backdropFilter:'blur(20px)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
              <DollarSign size={13} color="#10B981" />
              <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.15em', color:'#10B981', fontWeight:700 }}>REVENUE STREAMS</span>
            </div>
            <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'13px', fontWeight:900, color:'#10B981' }}>${REVENUE_TOTAL.toLocaleString()}</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'9px' }}>
            {REVENUE_STREAMS.map(r => (
              <div key={r.label}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ color:'#CBD5E1', fontSize:'11px' }}>{r.label}</span>
                  <span style={{ color:r.color, fontSize:'11px', fontWeight:700 }}>${r.value.toLocaleString()}</span>
                </div>
                <div style={{ height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${r.pct}%` }} transition={{ delay:0.6, duration:0.8 }}
                    style={{ height:'100%', borderRadius:'2px', background:r.color }} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/dashboard/vault')}
            style={{ marginTop:'14px', display:'flex', alignItems:'center', gap:'4px', color:'#10B981', fontSize:'11px', fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:0 }}>
            Open Vault <ArrowRight size={11} />
          </button>
        </motion.div>

        {/* Live Alerts */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }}
          style={{ background:'rgba(11,18,32,0.85)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'18px', backdropFilter:'blur(20px)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
              <Radio size={13} color="#6366F1" />
              <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.15em', color:'#6366F1', fontWeight:700 }}>LIVE INTELLIGENCE FEED</span>
            </div>
            <div style={{ background:'#6366F1', borderRadius:'999px', fontSize:'9px', fontWeight:700, padding:'2px 6px', color:'#fff' }}>{LIVE_ALERTS.length}</div>
          </div>

          <div style={{ display:'flex', gap:'6px', marginBottom:'12px', flexWrap:'wrap' }}>
            {['all','edge','forge','oracle','nexus'].map(t => (
              <button key={t} onClick={() => setAlertTab(t)}
                style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', letterSpacing:'0.1em', fontWeight:700, padding:'3px 8px', borderRadius:'6px', cursor:'pointer', border:'none', transition:'all 0.15s',
                  background: alertTab===t ? '#6366F1' : 'rgba(255,255,255,0.05)',
                  color: alertTab===t ? '#fff' : '#8899B4' }}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <AnimatePresence>
              {filteredAlerts.map(a => (
                <motion.div key={a.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                  style={{ display:'flex', alignItems:'flex-start', gap:'9px', padding:'8px', borderRadius:'8px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', paddingTop:'2px', flexShrink:0 }}>
                    <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:a.color, boxShadow:`0 0 6px ${a.color}` }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'2px' }}>
                      <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:a.color, fontWeight:700 }}>{a.door}</span>
                      <div style={{ width:'1px', height:'10px', background:'rgba(255,255,255,0.1)' }} />
                      <span style={{ color:'#8899B4', fontSize:'9px' }}>{a.time} ago</span>
                      {a.priority==='high' && <span style={{ background:'rgba(239,68,68,0.15)', color:'#EF4444', fontSize:'8px', fontWeight:700, padding:'1px 5px', borderRadius:'4px' }}>HIGH</span>}
                    </div>
                    <p style={{ color:'#CBD5E1', fontSize:'11px', lineHeight:1.4 }}>{a.msg}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          style={{ background:'rgba(11,18,32,0.85)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'18px', backdropFilter:'blur(20px)', display:'flex', flexDirection:'column', gap:'10px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'4px' }}>
            <Cpu size={13} color="#6366F1" />
            <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.15em', color:'#6366F1', fontWeight:700 }}>SYSTEM HEALTH</span>
          </div>
          {SYSTEM_HEALTH.map(s => (
            <div key={s.label}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:s.color, boxShadow:`0 0 5px ${s.color}` }} />
                  <span style={{ color:'#CBD5E1', fontSize:'10px' }}>{s.label}</span>
                </div>
                <span style={{ color:s.color, fontSize:'10px', fontWeight:700 }}>{s.pct}%</span>
              </div>
              <div style={{ height:'3px', borderRadius:'2px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${s.pct}%`, background:s.color, borderRadius:'2px', transition:'width 1s ease' }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop:'auto', display:'flex', gap:'6px' }}>
            <button onClick={() => navigate('/dashboard/agent')}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:'8px', padding:'7px', cursor:'pointer', color:'#6366F1', fontSize:'10px', fontWeight:700 }}>
              <Brain size={11} /> SOLVEN AI
            </button>
            <button onClick={() => navigate('/dashboard/arena')}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', background:'rgba(212,168,67,0.12)', border:'1px solid rgba(212,168,67,0.25)', borderRadius:'8px', padding:'7px', cursor:'pointer', color:'#D4A843', fontSize:'10px', fontWeight:700 }}>
              <Trophy size={11} /> Arena
            </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes s4-pulse {
          0%,100% { opacity:1; } 50% { opacity:0.4; }
        }
      `}</style>
    </div>
  );
}
