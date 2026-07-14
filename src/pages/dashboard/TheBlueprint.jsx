import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Target, CheckCircle2, Circle, ChevronRight, Plus, Sparkles, Calendar,
  TrendingUp, BookOpen, Users, Building2, Brain, Flame, Clock, RotateCcw,
  Share2, Download, Star, Zap, Trophy,
} from 'lucide-react';

const S = { bg:'#05050C', surface:'rgba(10,12,30,0.9)', border:'rgba(255,255,255,0.06)', muted:'#94A3B8' };
const DOOR_COLOR = { EDGE:'#06B6D4', FORGE:'#D4A843', ORACLE:'#10B981', NEXUS:'#EF4444' };

/* ── ACTIVE GOALS ── */
const GOALS = [
  {
    id:1, door:'EDGE', color:'#06B6D4', icon:TrendingUp,
    title:'Achieve 70% Win Rate', category:'Trading Performance',
    deadline:'2026-08-31', progress:74, milestone30:'Reach 65% for 10 consecutive trading days',
    milestone60:'Complete Risk Management Module in ORACLE', milestone90:'Hit 70% and maintain for 30 days',
    streakDays:12, totalDays:60, actions:[
      { label:'Review last 20 trades journal', done:true },
      { label:'Complete ORACLE Lesson 7: Advanced Risk', done:true },
      { label:'Practice 2R minimum setups daily', done:false },
      { label:'Weekly review call with mentor', done:false },
    ],
  },
  {
    id:2, door:'FORGE', color:'#D4A843', icon:Users,
    title:'Build IB Network to 50 Active Traders', category:'Network Growth',
    deadline:'2026-09-30', progress:56, milestone30:'Close 5 new IBs via LinkedIn',
    milestone60:'Activate 25 traders from your IB chain', milestone90:'Hit $15k/month IB revenue run rate',
    streakDays:7, totalDays:90, actions:[
      { label:'Post 3 FORGE recruitment posts this week', done:true },
      { label:'Attend Dubai FinTech Summit (July 14)', done:false },
      { label:'Follow up with 8 pending FORGE leads', done:false },
      { label:'Create WhatsApp broadcast group', done:true },
    ],
  },
  {
    id:3, door:'ORACLE', color:'#10B981', icon:BookOpen,
    title:'Complete Advanced Trading Certification', category:'Education',
    deadline:'2026-08-15', progress:62, milestone30:'Finish Technical Analysis modules 1–5',
    milestone60:'Pass mock exam with 80%+ score', milestone90:'Receive ORACLE Certified Trader badge',
    streakDays:21, totalDays:45, actions:[
      { label:'Watch Lesson 8: Wyckoff Accumulation', done:false },
      { label:'Submit Module 5 assessment by Friday', done:false },
      { label:'Review feedback from last assignment', done:true },
      { label:'Schedule study session for this weekend', done:true },
    ],
  },
  {
    id:4, door:'NEXUS', color:'#EF4444', icon:Building2,
    title:'Close First NEXUS Enterprise Deal', category:'Business Development',
    deadline:'2026-10-01', progress:28, milestone30:'Complete NEXUS onboarding and pitch deck',
    milestone60:'Present to 3 institutional prospects', milestone90:'Sign first deal and activate revenue',
    streakDays:4, totalDays:90, actions:[
      { label:'Complete NEXUS deal room profile', done:true },
      { label:'Identify 5 target enterprise accounts in MENA', done:false },
      { label:'Connect with 2 institutional contacts this week', done:false },
      { label:'Draft enterprise proposal template', done:false },
    ],
  },
];

/* ── WEEKLY PLAN ── */
const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const WEEKLY_PLAN = [
  { day:'Mon', tasks:[
    { door:'EDGE',   color:'#06B6D4', label:'Trade London session (09:00–12:00 GST)', xp:50 },
    { door:'ORACLE', color:'#10B981', label:'Complete Lesson 8: Wyckoff', xp:100 },
  ]},
  { day:'Tue', tasks:[
    { door:'FORGE',  color:'#D4A843', label:'Post LinkedIn recruitment content', xp:30 },
    { door:'EDGE',   color:'#06B6D4', label:'Trade review — journal 5 trades', xp:40 },
  ]},
  { day:'Wed', tasks:[
    { door:'EDGE',   color:'#06B6D4', label:'Trade NY session (14:00–17:00 GST)', xp:50 },
    { door:'NEXUS',  color:'#EF4444', label:'Research 5 MENA enterprise targets', xp:80 },
  ]},
  { day:'Thu', tasks:[
    { door:'ORACLE', color:'#10B981', label:'Submit Module 5 assessment', xp:150 },
    { door:'FORGE',  color:'#D4A843', label:'Follow up with 8 FORGE prospects', xp:60 },
  ]},
  { day:'Fri', tasks:[
    { door:'EDGE',   color:'#06B6D4', label:'Weekly trade review + metrics', xp:70 },
    { door:'NEXUS',  color:'#EF4444', label:'Connect with institutional contacts', xp:80 },
  ]},
  { day:'Sat', tasks:[
    { door:'ORACLE', color:'#10B981', label:'Weekend study session: 2 lessons', xp:120 },
  ]},
  { day:'Sun', tasks:[
    { door:'FORGE',  color:'#D4A843', label:'Create WhatsApp group + invite list', xp:40 },
  ]},
];

/* ── AI ADJUSTMENT SUGGESTIONS ── */
const ADJUSTMENTS = [
  { type:'recalibrate', color:'#6366F1', Icon:RotateCcw, label:'Adjust EDGE Deadline', reason:'Your 70% win-rate goal is tracking 12 days ahead. SOLVEN recommends moving the deadline forward by 3 weeks to maintain challenge tension.', action:'Apply Adjustment' },
  { type:'add',         color:'#10B981', Icon:Plus,        label:'Add Mentorship Goal', reason:'Your FORGE network is growing fast. Adding a mentorship goal now could accelerate your IB quality — SOLVEN predicts +38% higher trader retention.', action:'Add Goal' },
  { type:'focus',       color:'#D4A843', Icon:Flame,       label:'Prioritize ORACLE This Week', reason:'Your trade win-rate correlates +34% with recent ORACLE lessons. Completing Lesson 8 this week is your highest-leverage action.', action:'Set Priority' },
];

/* ── STREAK DISPLAY ── */
function StreakRing({ days, total, color, size=56 }) {
  const pct = Math.min(days / total, 1);
  const r = size * 0.42;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth="3" strokeDasharray={circ} strokeLinecap="round"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ delay:0.3, duration:0.8 }} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'13px', fontWeight:900, color, lineHeight:1 }}>{days}</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'6px', color:S.muted, marginTop:'1px' }}>DAYS</div>
      </div>
    </div>
  );
}

/* ── GOAL PROGRESS RING ── */
function ProgressRing({ pct, color, size=80 }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth="4" strokeDasharray={circ} strokeLinecap="round"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct/100) }}
          transition={{ delay:0.3, duration:0.9 }} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'15px', fontWeight:900, color, lineHeight:1 }}>{pct}%</div>
      </div>
    </div>
  );
}

export default function TheBlueprint() {
  const [activeTab, setActiveTab] = useState('goals');
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [checkedActions, setCheckedActions] = useState({});

  const toggleAction = (goalId, idx) => {
    setCheckedActions(prev => ({
      ...prev,
      [`${goalId}-${idx}`]: !prev[`${goalId}-${idx}`],
    }));
  };

  const totalXP = WEEKLY_PLAN.flatMap(d => d.tasks).reduce((s,t) => s+t.xp, 0);

  return (
    <div style={{ color:'#fff', fontFamily:"'Space Grotesk',sans-serif" }}>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        style={{ position:'relative', overflow:'hidden', borderRadius:'20px', padding:'20px 24px', marginBottom:'16px',
          background:'linear-gradient(135deg,rgba(212,168,67,0.1) 0%,rgba(10,12,30,0.95) 55%,rgba(139,92,246,0.08) 100%)',
          border:'1px solid rgba(212,168,67,0.2)', backdropFilter:'blur(20px)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px' }}>
              <Map size={16} color="#D4A843" />
              <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'20px', fontWeight:900 }}>THE BLUEPRINT</h1>
              <div style={{ background:'rgba(212,168,67,0.12)', border:'1px solid rgba(212,168,67,0.3)', borderRadius:'6px', padding:'2px 8px', fontSize:'8px', color:'#D4A843', fontFamily:"'Orbitron',sans-serif", fontWeight:700 }}>
                AI ROADMAP OS
              </div>
            </div>
            <p style={{ color:S.muted, fontSize:'12px' }}>Your personal AI-generated 90-day roadmap across all 4 doors</p>
          </div>
          {/* Stats */}
          <div style={{ display:'flex', gap:'12px' }}>
            {[
              { label:'Active Goals', value:'4', color:'#D4A843' },
              { label:'Week XP Available', value:totalXP, color:'#6366F1' },
              { label:'Avg Progress', value:`${Math.round(GOALS.reduce((s,g)=>s+g.progress,0)/GOALS.length)}%`, color:'#10B981' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center', background:'rgba(255,255,255,0.03)', border:`1px solid rgba(255,255,255,0.06)`, borderRadius:'12px', padding:'12px 16px', minWidth:'110px' }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'18px', fontWeight:900, color:s.color }}>{s.value}</div>
                <div style={{ color:S.muted, fontSize:'9px', marginTop:'3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 14px', borderRadius:'10px', background:'rgba(212,168,67,0.12)', border:'1px solid rgba(212,168,67,0.25)', cursor:'pointer', color:'#D4A843', fontSize:'11px', fontWeight:700 }}>
              <Share2 size={12} /> Share Blueprint
            </button>
            <button style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 14px', borderRadius:'10px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', color:'#CBD5E1', fontSize:'11px', fontWeight:700 }}>
              <Download size={12} /> Export PDF
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── TABS ── */}
      <div style={{ display:'flex', gap:'4px', padding:'4px', borderRadius:'12px', background:'rgba(10,12,30,0.8)', border:`1px solid ${S.border}`, marginBottom:'16px', width:'fit-content' }}>
        {[
          { id:'goals',   label:'My Goals' },
          { id:'weekly',  label:'This Week' },
          { id:'ai',      label:'AI Adjustments' },
          { id:'milestones',label:'Milestones' },
        ].map(t => (
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            style={{ padding:'7px 18px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer', border:'none', whiteSpace:'nowrap', transition:'all 0.15s',
              background: activeTab===t.id?'#D4A843':'transparent', color: activeTab===t.id?'#000':S.muted }}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

      {/* ── GOALS TAB ── */}
      {activeTab === 'goals' && (
        <motion.div key="goals" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {GOALS.map((g, i) => {
            const expanded = expandedGoal === g.id;
            return (
              <motion.div key={g.id} layout initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
                style={{ background:S.surface, border:`1px solid ${g.color}20`, borderRadius:'18px', overflow:'hidden', backdropFilter:'blur(20px)' }}>
                {/* Header row */}
                <div style={{ padding:'18px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'16px' }}
                  onClick={()=>setExpandedGoal(expanded ? null : g.id)}>
                  <ProgressRing pct={g.progress} color={g.color} size={70} />
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                      <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:g.color, fontWeight:700 }}>{g.door}</span>
                      <span style={{ color:S.muted, fontSize:'10px' }}>{g.category}</span>
                    </div>
                    <div style={{ color:'#fff', fontSize:'15px', fontWeight:700, marginBottom:'8px' }}>{g.title}</div>
                    <div style={{ height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.06)', overflow:'hidden', maxWidth:'400px' }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${g.progress}%` }} transition={{ delay:i*0.08+0.3, duration:0.7 }}
                        style={{ height:'100%', background:`linear-gradient(90deg,${g.color}70,${g.color})`, borderRadius:'2px' }} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
                    <StreakRing days={g.streakDays} total={g.totalDays} color={g.color} />
                    <div style={{ textAlign:'right' }}>
                      <div style={{ color:S.muted, fontSize:'10px', marginBottom:'2px' }}>Deadline</div>
                      <div style={{ color:'#CBD5E1', fontSize:'11px', fontWeight:700 }}>{g.deadline}</div>
                    </div>
                    <motion.div animate={{ rotate: expanded ? 90 : 0 }}>
                      <ChevronRight size={18} style={{ color:S.muted }} />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                      style={{ overflow:'hidden', borderTop:`1px solid ${g.color}15` }}>
                      <div style={{ padding:'18px 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                        {/* Milestones */}
                        <div>
                          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:g.color, letterSpacing:'0.12em', fontWeight:700, marginBottom:'10px' }}>30 · 60 · 90 DAY MILESTONES</div>
                          {[
                            { label:'30 days', val:g.milestone30, done:g.progress >= 33 },
                            { label:'60 days', val:g.milestone60, done:g.progress >= 66 },
                            { label:'90 days', val:g.milestone90, done:g.progress >= 99 },
                          ].map(m => (
                            <div key={m.label} style={{ display:'flex', gap:'10px', marginBottom:'10px' }}>
                              {m.done
                                ? <CheckCircle2 size={14} style={{ color:'#10B981', flexShrink:0, marginTop:'2px' }} />
                                : <Circle size={14} style={{ color:S.muted, flexShrink:0, marginTop:'2px' }} />
                              }
                              <div>
                                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:m.done?'#10B981':S.muted, fontWeight:700, marginBottom:'2px' }}>{m.label}</div>
                                <p style={{ color: m.done?'#CBD5E1':'rgba(136,153,180,0.6)', fontSize:'11px', lineHeight:1.5 }}>{m.val}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* This week's actions */}
                        <div>
                          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:'#D4A843', letterSpacing:'0.12em', fontWeight:700, marginBottom:'10px' }}>THIS WEEK'S ACTIONS</div>
                          {g.actions.map((a, ai) => {
                            const ck = checkedActions[`${g.id}-${ai}`] ?? a.done;
                            return (
                              <div key={ai} style={{ display:'flex', gap:'8px', marginBottom:'8px', cursor:'pointer' }}
                                onClick={()=>toggleAction(g.id, ai)}>
                                {ck
                                  ? <CheckCircle2 size={14} style={{ color:'#10B981', flexShrink:0, marginTop:'2px' }} />
                                  : <Circle size={14} style={{ color:S.muted, flexShrink:0, marginTop:'2px' }} />
                                }
                                <span style={{ color: ck?S.muted:'#CBD5E1', fontSize:'11px', lineHeight:1.5, textDecoration: ck?'line-through':'none' }}>{a.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Add goal button */}
          <button style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'16px', borderRadius:'18px', border:'1px dashed rgba(255,255,255,0.12)', background:'transparent', cursor:'pointer', color:S.muted, fontSize:'13px', transition:'all 0.15s', width:'100%' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(212,168,67,0.35)'; e.currentTarget.style.color='#D4A843'; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.color=S.muted; }}>
            <Plus size={16} /> Add New Goal
          </button>
        </motion.div>
      )}

      {/* ── WEEKLY PLAN TAB ── */}
      {activeTab === 'weekly' && (
        <motion.div key="weekly" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.18)', borderRadius:'14px', padding:'14px 18px', marginBottom:'14px', display:'flex', alignItems:'center', gap:'10px' }}>
            <Sparkles size={14} color="#6366F1" />
            <div style={{ flex:1 }}>
              <span style={{ color:'#6366F1', fontWeight:700, fontSize:'12px' }}>SOLVEN AI Weekly Brief: </span>
              <span style={{ color:'#CBD5E1', fontSize:'12px' }}>This is a high-leverage week. Completing ORACLE Lesson 8 before Thursday's exam will directly lift your trade win-rate. Prioritize EDGE morning sessions — London open is your peak performance window.</span>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'16px', fontWeight:900, color:'#6366F1' }}>{totalXP} XP</div>
              <div style={{ color:S.muted, fontSize:'9px' }}>Available this week</div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'8px' }}>
            {WEEKLY_PLAN.map((day, i) => (
              <motion.div key={day.day} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
                style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'14px', overflow:'hidden', backdropFilter:'blur(20px)' }}>
                <div style={{ padding:'10px 10px 6px', borderBottom:`1px solid ${S.border}`, textAlign:'center' }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', fontWeight:900, color: i===0?'#D4A843':'#CBD5E1' }}>{day.day}</div>
                </div>
                <div style={{ padding:'8px' }}>
                  {day.tasks.length === 0
                    ? <div style={{ color:'rgba(255,255,255,0.15)', fontSize:'9px', textAlign:'center', padding:'8px 0' }}>Rest</div>
                    : day.tasks.map((t, ti) => (
                      <div key={ti} style={{ marginBottom:'6px', padding:'6px 8px', borderRadius:'8px', background:`${t.color}08`, border:`1px solid ${t.color}18` }}>
                        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'6px', color:t.color, fontWeight:700, marginBottom:'3px' }}>{t.door}</div>
                        <div style={{ color:'#CBD5E1', fontSize:'9px', lineHeight:1.4 }}>{t.label}</div>
                        <div style={{ color:'#6366F1', fontSize:'8px', fontWeight:700, marginTop:'3px' }}>+{t.xp} XP</div>
                      </div>
                    ))
                  }
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── AI ADJUSTMENTS ── */}
      {activeTab === 'ai' && (
        <motion.div key="ai" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.18)', borderRadius:'14px', padding:'14px 18px', display:'flex', alignItems:'center', gap:'10px' }}>
            <Brain size={14} color="#6366F1" />
            <span style={{ color:'#CBD5E1', fontSize:'12px' }}>SOLVEN AI continuously analyzes your cross-door progress and generates smart adjustments to keep your blueprint optimal and achievable.</span>
          </div>
          {ADJUSTMENTS.map((a, i) => (
            <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.1 }}
              style={{ background:S.surface, border:`1px solid ${a.color}20`, borderRadius:'18px', padding:'20px', backdropFilter:'blur(20px)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'14px' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`${a.color}15`, border:`1px solid ${a.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <a.Icon size={18} style={{ color:a.color }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ color:'#fff', fontSize:'14px', fontWeight:700, marginBottom:'6px' }}>{a.label}</div>
                  <p style={{ color:'#CBD5E1', fontSize:'12px', lineHeight:1.6, marginBottom:'12px' }}>{a.reason}</p>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button style={{ padding:'8px 16px', borderRadius:'8px', background:`${a.color}15`, border:`1px solid ${a.color}30`, cursor:'pointer', color:a.color, fontSize:'11px', fontWeight:700 }}>
                      {a.action}
                    </button>
                    <button style={{ padding:'8px 16px', borderRadius:'8px', background:'transparent', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', color:S.muted, fontSize:'11px' }}>
                      Dismiss
                    </button>
                  </div>
                </div>
                <div style={{ background:`${a.color}12`, border:`1px solid ${a.color}20`, borderRadius:'8px', padding:'4px 10px', flexShrink:0 }}>
                  <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:a.color, fontWeight:700, textTransform:'uppercase' }}>{a.type}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── MILESTONES TAB ── */}
      {activeTab === 'milestones' && (
        <motion.div key="milestones" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px' }}>
            {GOALS.map((g, i) => (
              <div key={g.id} style={{ background:S.surface, border:`1px solid ${g.color}18`, borderRadius:'18px', padding:'20px', backdropFilter:'blur(20px)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:`${g.color}15`, border:`1px solid ${g.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <g.icon size={16} style={{ color:g.color }} />
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:g.color, fontWeight:700 }}>{g.door}</div>
                    <div style={{ color:'#fff', fontSize:'12px', fontWeight:700 }}>{g.title}</div>
                  </div>
                  <div style={{ marginLeft:'auto' }}>
                    <ProgressRing pct={g.progress} color={g.color} size={52} />
                  </div>
                </div>

                <div style={{ position:'relative', paddingLeft:'16px' }}>
                  {/* Vertical line */}
                  <div style={{ position:'absolute', left:'6px', top:'8px', bottom:'8px', width:'2px', background:`${g.color}20`, borderRadius:'1px' }} />

                  {[
                    { label:'30 days', val:g.milestone30, done:g.progress >= 33 },
                    { label:'60 days', val:g.milestone60, done:g.progress >= 66 },
                    { label:'90 days', val:g.milestone90, done:g.progress >= 99 },
                  ].map((m, mi) => (
                    <div key={mi} style={{ position:'relative', marginBottom:'14px', paddingLeft:'14px' }}>
                      {/* Node */}
                      <div style={{ position:'absolute', left:'-10px', top:'2px', width:'12px', height:'12px', borderRadius:'50%', background: m.done?g.color:`rgba(255,255,255,0.06)`, border:`2px solid ${m.done?g.color:'rgba(255,255,255,0.1)'}`, boxShadow: m.done?`0 0 8px ${g.color}60`:undefined }} />
                      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'7px', color: m.done?g.color:S.muted, fontWeight:700, marginBottom:'2px' }}>{m.label} {m.done && '✓'}</div>
                      <p style={{ color: m.done?'#CBD5E1':'rgba(136,153,180,0.5)', fontSize:'10px', lineHeight:1.5 }}>{m.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      </AnimatePresence>
    </div>
  );
}
