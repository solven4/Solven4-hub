import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Brain, TrendingUp, TrendingDown, Target, Zap, Clock, BarChart2,
  ArrowUpRight, AlertTriangle, Lightbulb, ChevronRight, Flame, Eye, Shield,
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

const S = { bg:'#05050C', surface:'rgba(10,12,30,0.9)', border:'rgba(255,255,255,0.06)', muted:'#94A3B8' };
const DOOR_COLOR = { EDGE:'#06B6D4', FORGE:'#D4A843', ORACLE:'#10B981', NEXUS:'#EF4444' };

/* ── DNA PROFILE ── */
const DNA_AXES = [
  { label:'Discipline',  key:'discipline',  value:82, desc:'Rule adherence, SL respect' },
  { label:'Precision',   key:'precision',   value:74, desc:'Entry timing accuracy' },
  { label:'Resilience',  key:'resilience',  value:61, desc:'Recovery from drawdown' },
  { label:'Patience',    key:'patience',    value:55, desc:'Wait for A+ setups' },
  { label:'Risk IQ',     key:'risk',        value:88, desc:'Position sizing mastery' },
  { label:'Consistency', key:'consistency', value:69, desc:'Daily performance variance' },
];

/* ── SESSION HEATMAP (7 days × 24 hours) ── */
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HEATMAP = DAYS.map(d =>
  Array.from({length:24}, (_, h) => {
    const score = (h >= 8 && h <= 11) || (h >= 13 && h <= 16)
      ? Math.floor(60 + Math.random()*35)
      : h >= 6 && h <= 18
        ? Math.floor(20 + Math.random()*40)
        : Math.floor(Math.random()*20);
    return { h, score };
  })
);

/* ── CROSS-DOOR CORRELATIONS ── */
const CORRELATIONS = [
  { trigger:'ORACLE lesson completed', effect:'Trade win-rate next 48h', delta:'+34%', color:'#10B981', Icon:Brain, doorA:'ORACLE', doorB:'EDGE' },
  { trigger:'FORGE client acquired',   effect:'Motivation & daily PnL',  delta:'+22%', color:'#D4A843', Icon:Zap,   doorA:'FORGE', doorB:'EDGE' },
  { trigger:'NEXUS deal closed',       effect:'Trading session length',  delta:'+18%', color:'#EF4444', Icon:TrendingUp, doorA:'NEXUS', doorB:'EDGE' },
  { trigger:'3+ ORACLE lessons/week',  effect:'Risk management score',   delta:'+41%', color:'#10B981', Icon:Shield, doorA:'ORACLE', doorB:'EDGE' },
];

/* ── BEHAVIORAL PATTERNS ── */
const PATTERNS = [
  { type:'strength', Icon:Flame, color:'#10B981', label:'Gold Trader', desc:'Your win-rate on XAU/USD is 71% — significantly above your average. You have an edge here.', score:71 },
  { type:'strength', Icon:Clock, color:'#3B82F6', label:'London Session',desc:'Best PnL generated between 09:00–12:00 GST. You operate 23% better in London open.', score:23 },
  { type:'warning',  Icon:AlertTriangle, color:'#F97316', label:'Friday Fade', desc:'Your Friday afternoon win-rate drops to 38%. Consider reducing position size or stopping early.', score:-38 },
  { type:'warning',  Icon:TrendingDown, color:'#EF4444', label:'Revenge Risk', desc:'You over-trade after 2 consecutive losses — detected in 6/10 recent drawdown sequences.', score:-6 },
  { type:'insight',  Icon:Lightbulb, color:'#D4A843', label:'News Effect', desc:'Your trades placed 30min after major news events show +12% better performance vs in-event trades.', score:12 },
  { type:'insight',  Icon:Eye, color:'#6366F1', label:'Setup Quality', desc:'You ignore 40% of your A+ setups waiting for "more confirmation" — costing ~$340/month in missed trades.', score:-340 },
];

/* ── PERFORMANCE TIMELINE ── */
const TIMELINE = [
  { month:'Feb', winRate:58, pnl:+1240, rr:1.6, trades:34 },
  { month:'Mar', winRate:62, pnl:+2180, rr:1.9, trades:41 },
  { month:'Apr', winRate:55, pnl:-340,  rr:1.3, trades:29 },
  { month:'May', winRate:67, pnl:+3420, rr:2.1, trades:38 },
  { month:'Jun', winRate:71, pnl:+4850, rr:2.4, trades:45 },
  { month:'Jul', winRate:74, pnl:+5280, rr:2.6, trades:52 },
];

/* ── PAIR ANALYSIS ── */
const PAIRS = [
  { pair:'XAU/USD', trades:87, winRate:71, avgRR:2.4, bestSession:'London', color:'#D4A843' },
  { pair:'EUR/USD', trades:64, winRate:58, avgRR:1.7, bestSession:'NY',     color:'#3B82F6' },
  { pair:'GBP/USD', trades:52, winRate:61, avgRR:1.9, bestSession:'London', color:'#8B5CF6' },
  { pair:'USD/JPY', trades:38, winRate:47, avgRR:1.2, bestSession:'Tokyo',  color:'#F97316' },
  { pair:'OIL',     trades:22, winRate:64, avgRR:2.1, bestSession:'NY',     color:'#EF4444' },
];

/* ── SVG RADAR CHART ── */
function RadarChart({ data }) {
  const cx = 150, cy = 150, r = 100;
  const N = data.length;

  const toXY = (i, val) => {
    const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
    const dist = (val / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const gridLevels = [20, 40, 60, 80, 100];
  const axisPoints = data.map((_, i) => toXY(i, 100));
  const dataPoints = data.map((d, i) => toXY(i, d.value));
  const dataPath = dataPoints.map((p, i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <svg width="300" height="300" style={{ overflow:'visible' }}>
      {/* Grid circles */}
      {gridLevels.map(l => {
        const pts = Array.from({length:N}, (_, i) => toXY(i, l));
        const gpath = pts.map((p, i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ') + 'Z';
        return <path key={l} d={gpath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}

      {/* Axis lines */}
      {axisPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      ))}

      {/* Data area */}
      <path d={dataPath} fill="rgba(99,102,241,0.15)" stroke="#6366F1" strokeWidth="2" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="#6366F1" stroke="#fff" strokeWidth="1.5" />
        </g>
      ))}

      {/* Labels */}
      {axisPoints.map((p, i) => {
        const lx = cx + (r + 28) * Math.cos((Math.PI * 2 * i / N) - Math.PI / 2);
        const ly = cy + (r + 28) * Math.sin((Math.PI * 2 * i / N) - Math.PI / 2);
        return (
          <g key={i}>
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', fill:'#CBD5E1', fontWeight:700 }}>
              {data[i].label}
            </text>
            <text x={lx} y={ly+12} textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', fill:'#6366F1', fontWeight:900 }}>
              {data[i].value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const SCORE_COLOR = s => s >= 70 ? '#10B981' : s >= 50 ? '#D4A843' : '#EF4444';

export default function TheMatrix() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState('dna');
  const [hoverCell, setHoverCell] = useState(null);

  const maxPnl = Math.max(...TIMELINE.map(t => Math.abs(t.pnl)));

  return (
    <div style={{ color:'#fff', fontFamily:"'Space Grotesk',sans-serif" }}>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        style={{ position:'relative', overflow:'hidden', borderRadius:'20px', padding:'20px 24px', marginBottom:'16px',
          background:'linear-gradient(135deg,rgba(99,102,241,0.12) 0%,rgba(10,12,30,0.95) 55%,rgba(139,92,246,0.08) 100%)',
          border:'1px solid rgba(99,102,241,0.2)', backdropFilter:'blur(20px)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px' }}>
              <Activity size={16} color="#6366F1" />
              <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'20px', fontWeight:900 }}>{t('THE MATRIX', 'المصفوفة')}</h1>
              <div style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'6px', padding:'2px 8px', fontSize:'8px', color:'#6366F1', fontFamily:"'Orbitron',sans-serif", fontWeight:700 }}>
                {t('PERFORMANCE DNA', 'الحمض النووي للأداء')}
              </div>
            </div>
            <p style={{ color:S.muted, fontSize:'12px' }}>{t('Deep behavioral analysis of your cross-door trading patterns and performance genome', 'تحليل سلوكي عميق لأنماط تداولك عبر الأبواب وجينوم أدائك')}</p>
          </div>
          {/* Top 3 stats */}
          <div style={{ display:'flex', gap:'12px' }}>
            {[
              { label:t('Overall Win Rate','معدل الربح الإجمالي'), value:'67%', color:'#10B981' },
              { label:t('Best Pair','أفضل زوج'),        value:'XAU/USD', color:'#D4A843' },
              { label:t('DNA Score','نقاط الحمض النووي'),        value:'74 / 100', color:'#6366F1' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center', background:'rgba(255,255,255,0.03)', border:`1px solid rgba(255,255,255,0.06)`, borderRadius:'12px', padding:'12px 16px', minWidth:'110px' }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'16px', fontWeight:900, color:s.color }}>{s.value}</div>
                <div style={{ color:S.muted, fontSize:'9px', marginTop:'3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── TABS ── */}
      <div style={{ display:'flex', gap:'4px', padding:'4px', borderRadius:'12px', background:'rgba(10,12,30,0.8)', border:`1px solid ${S.border}`, marginBottom:'16px', width:'fit-content' }}>
        {[
          { id:'dna',     label:t('DNA Profile','ملف الحمض النووي') },
          { id:'heatmap', label:t('Session Heatmap','خريطة حرارية للجلسات') },
          { id:'pairs',   label:t('Pair Analysis','تحليل الأزواج') },
          { id:'patterns',label:t('Behavioral Patterns','الأنماط السلوكية') },
          { id:'timeline',label:t('Evolution','التطور') },
        ].map(tb => (
          <button key={tb.id} onClick={()=>setActiveTab(tb.id)}
            style={{ padding:'7px 16px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer', border:'none', whiteSpace:'nowrap', transition:'all 0.15s',
              background: activeTab===tb.id?'#6366F1':'transparent', color: activeTab===tb.id?'#fff':S.muted }}>
            {tb.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

      {/* ── DNA PROFILE ── */}
      {activeTab === 'dna' && (
        <motion.div key="dna" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'16px', alignItems:'start' }}>

          {/* Radar */}
          <div style={{ background:S.surface, border:`1px solid rgba(99,102,241,0.2)`, borderRadius:'20px', padding:'24px', backdropFilter:'blur(20px)', display:'flex', flexDirection:'column', alignItems:'center' }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.15em', color:'#6366F1', fontWeight:700, marginBottom:'16px' }}>
              {t('TRADING DNA RADAR', 'رادار الحمض النووي للتداول')}
            </div>
            <RadarChart data={DNA_AXES} />
            <div style={{ marginTop:'12px', textAlign:'center' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'28px', fontWeight:900, color:'#6366F1' }}>74</div>
              <div style={{ color:S.muted, fontSize:'10px' }}>{t('Overall DNA Score', 'إجمالي نقاط الحمض النووي')}</div>
              <div style={{ color:'#10B981', fontSize:'10px', marginTop:'3px' }}>▲ {t('+6 pts this month', '+6 نقاط هذا الشهر')}</div>
            </div>
          </div>

          {/* Axis details */}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'20px', padding:'20px', backdropFilter:'blur(20px)' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.15em', color:'#6366F1', fontWeight:700, marginBottom:'16px' }}>
                {t('DNA AXIS BREAKDOWN', 'تفصيل محاور الحمض النووي')}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {DNA_AXES.map(ax => (
                  <div key={ax.key}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'5px' }}>
                      <div>
                        <span style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>{ax.label}</span>
                        <span style={{ color:S.muted, fontSize:'10px', marginLeft:'8px' }}>{ax.desc}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'14px', fontWeight:900, color:SCORE_COLOR(ax.value) }}>{ax.value}</span>
                        <span style={{ color:S.muted, fontSize:'10px' }}>/100</span>
                      </div>
                    </div>
                    <div style={{ height:'5px', borderRadius:'3px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${ax.value}%` }} transition={{ delay:0.2, duration:0.7 }}
                        style={{ height:'100%', borderRadius:'3px', background:`linear-gradient(90deg,${SCORE_COLOR(ax.value)}80,${SCORE_COLOR(ax.value)})` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-door correlations */}
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'20px', padding:'20px', backdropFilter:'blur(20px)' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.15em', color:'#D4A843', fontWeight:700, marginBottom:'14px' }}>
                {t('CROSS-DOOR CORRELATIONS', 'الارتباطات عبر الأبواب')}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {CORRELATIONS.map((c, i) => (
                  <div key={i} style={{ background:`${c.color}08`, border:`1px solid ${c.color}20`, borderRadius:'12px', padding:'12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                      <div style={{ background:`${c.color}15`, borderRadius:'6px', padding:'4px', display:'flex' }}>
                        <c.Icon size={11} style={{ color:c.color }} />
                      </div>
                      <div style={{ display:'flex', gap:'4px' }}>
                        <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'7px', color:DOOR_COLOR[c.doorA], fontWeight:700 }}>{c.doorA}</span>
                        <ChevronRight size={8} style={{ color:S.muted }} />
                        <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'7px', color:DOOR_COLOR[c.doorB], fontWeight:700 }}>{c.doorB}</span>
                      </div>
                    </div>
                    <p style={{ color:'#CBD5E1', fontSize:'10px', lineHeight:1.5, marginBottom:'6px' }}>{c.trigger}</p>
                    <div style={{ color:S.muted, fontSize:'9px', marginBottom:'4px' }}>{c.effect}</div>
                    <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'16px', fontWeight:900, color:c.color }}>{c.delta}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── SESSION HEATMAP ── */}
      {activeTab === 'heatmap' && (
        <motion.div key="heatmap" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'20px', padding:'24px', backdropFilter:'blur(20px)' }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.15em', color:'#6366F1', fontWeight:700, marginBottom:'5px' }}>
              {t('PERFORMANCE HEATMAP — BY DAY & HOUR', 'خريطة الأداء الحرارية — حسب اليوم والساعة')}
            </div>
            <p style={{ color:S.muted, fontSize:'11px', marginBottom:'20px' }}>{t('Win-rate intensity by hour of day. Green = high performance window.', 'كثافة معدل الربح حسب ساعة اليوم. الأخضر = نافذة أداء عالٍ.')}</p>

            <div style={{ display:'flex', gap:'6px', alignItems:'flex-start', overflowX:'auto' }}>
              {/* Day labels */}
              <div style={{ display:'flex', flexDirection:'column', gap:'4px', paddingTop:'26px', flexShrink:0 }}>
                {DAYS.map(d => (
                  <div key={d} style={{ height:'22px', display:'flex', alignItems:'center', color:S.muted, fontSize:'10px', fontWeight:700, width:'30px' }}>{d}</div>
                ))}
              </div>

              {/* Grid */}
              <div style={{ flex:1, minWidth:0 }}>
                {/* Hour labels */}
                <div style={{ display:'flex', marginBottom:'4px' }}>
                  {Array.from({length:24}, (_, h) => (
                    <div key={h} style={{ width:'22px', flexShrink:0, textAlign:'center', color:S.muted, fontSize:'7px', fontFamily:'monospace' }}>
                      {h % 4 === 0 ? `${h}h` : ''}
                    </div>
                  ))}
                </div>

                {HEATMAP.map((row, di) => (
                  <div key={di} style={{ display:'flex', gap:'2px', marginBottom:'2px' }}>
                    {row.map((cell, hi) => {
                      const isHov = hoverCell?.d===di && hoverCell?.h===hi;
                      const alpha = cell.score / 100;
                      const bg = cell.score >= 70 ? `rgba(16,185,129,${alpha})`
                        : cell.score >= 40 ? `rgba(212,168,67,${alpha})`
                        : `rgba(239,68,68,${alpha * 0.7 + 0.05})`;
                      return (
                        <div key={hi}
                          onMouseEnter={() => setHoverCell({d:di,h:hi,score:cell.score})}
                          onMouseLeave={() => setHoverCell(null)}
                          style={{ width:'22px', height:'22px', borderRadius:'3px', background:bg, cursor:'pointer', flexShrink:0,
                            border: isHov ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
                            transition:'all 0.1s', position:'relative' }}>
                          {isHov && (
                            <div style={{ position:'absolute', bottom:'26px', left:'50%', transform:'translateX(-50%)', background:'rgba(5,5,12,0.95)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'6px', padding:'4px 8px', whiteSpace:'nowrap', zIndex:10, fontSize:'10px', color:'#fff', fontWeight:700 }}>
                              {DAYS[di]} {hi}:00 · {cell.score}% {t('win','ربح')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginTop:'16px', fontSize:'10px', color:S.muted }}>
              <span>{t('Less effective', 'أقل فعالية')}</span>
              {[0.1,0.3,0.5,0.7,0.9].map(a => (
                <div key={a} style={{ width:'16px', height:'16px', borderRadius:'3px', background:`rgba(16,185,129,${a})` }} />
              ))}
              <span>{t('Most effective', 'أكثر فعالية')}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── PAIR ANALYSIS ── */}
      {activeTab === 'pairs' && (
        <motion.div key="pairs" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'20px', overflow:'hidden', backdropFilter:'blur(20px)' }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', gap:'8px' }}>
              <BarChart2 size={12} color="#6366F1" />
              <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.15em', color:'#6366F1', fontWeight:700 }}>{t('INSTRUMENT PERFORMANCE BREAKDOWN', 'تفصيل أداء الأدوات')}</span>
            </div>
            {PAIRS.map((p, i) => (
              <motion.div key={p.pair} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.08 }}
                style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`${p.color}12`, border:`1px solid ${p.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'7px', color:p.color, fontWeight:900, textAlign:'center' }}>{p.pair.split('/')[0]}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
                      <span style={{ color:'#fff', fontSize:'14px', fontWeight:700 }}>{p.pair}</span>
                      <div style={{ display:'flex', gap:'16px', fontSize:'11px' }}>
                        <span style={{ color:S.muted }}>{p.trades} {t('trades','صفقة')}</span>
                        <span style={{ color:'#D4A843' }}>{t('Best','الأفضل')}: {p.bestSession}</span>
                        <span style={{ color:'#8B5CF6' }}>{t('Avg R:R','متوسط R:R')} {p.avgRR}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'9px', color:S.muted, marginBottom:'3px' }}>
                          <span>{t('Win Rate','معدل الربح')}</span>
                          <span style={{ color:SCORE_COLOR(p.winRate), fontWeight:700 }}>{p.winRate}%</span>
                        </div>
                        <div style={{ height:'6px', borderRadius:'3px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                          <motion.div initial={{ width:0 }} animate={{ width:`${p.winRate}%` }} transition={{ delay:i*0.08+0.3, duration:0.6 }}
                            style={{ height:'100%', borderRadius:'3px', background:`linear-gradient(90deg,${p.color}70,${p.color})` }} />
                        </div>
                      </div>
                      <div style={{ width:'60px', textAlign:'center', flexShrink:0 }}>
                        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'18px', fontWeight:900, color:SCORE_COLOR(p.winRate) }}>
                          {p.winRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── BEHAVIORAL PATTERNS ── */}
      {activeTab === 'patterns' && (
        <motion.div key="patterns" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {PATTERNS.map((p, i) => (
              <motion.div key={i} initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.08 }}
                style={{ background:S.surface, border:`1px solid ${p.color}20`, borderRadius:'16px', padding:'18px', backdropFilter:'blur(20px)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:`${p.color}15`, border:`1px solid ${p.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <p.Icon size={16} style={{ color:p.color }} />
                  </div>
                  <div>
                    <div style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>{p.label}</div>
                    <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:p.type==='strength'?'#10B981':p.type==='warning'?'#EF4444':'#D4A843', fontWeight:700 }}>
                      {p.type==='strength'?t('STRENGTH','قوة'):p.type==='warning'?t('WARNING','تحذير'):t('INSIGHT','ملاحظة')}
                    </div>
                  </div>
                  <div style={{ marginLeft:'auto', fontFamily:"'Orbitron',sans-serif", fontSize:'18px', fontWeight:900, color:p.color }}>
                    {p.score > 0 ? `+${p.score}` : p.score}{typeof p.score === 'number' && Math.abs(p.score) < 100 ? '%' : ''}
                  </div>
                </div>
                <p style={{ color:'#CBD5E1', fontSize:'11px', lineHeight:1.6 }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── EVOLUTION TIMELINE ── */}
      {activeTab === 'timeline' && (
        <motion.div key="timeline" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'20px', padding:'24px', backdropFilter:'blur(20px)' }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.15em', color:'#6366F1', fontWeight:700, marginBottom:'20px' }}>
              {t('6-MONTH PERFORMANCE EVOLUTION', 'تطور الأداء لـ6 أشهر')}
            </div>

            {/* PnL bars */}
            <div style={{ marginBottom:'24px' }}>
              <div style={{ color:S.muted, fontSize:'10px', marginBottom:'10px', fontWeight:700 }}>{t('Monthly PnL', 'الأرباح والخسائر الشهرية')}</div>
              <div style={{ display:'flex', gap:'8px', alignItems:'flex-end', height:'100px' }}>
                {TIMELINE.map((t, i) => {
                  const h = Math.abs(t.pnl) / maxPnl * 80;
                  const pos = t.pnl > 0;
                  return (
                    <div key={t.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', color:pos?'#10B981':'#EF4444', fontWeight:700 }}>
                        {pos?'+':'-'}${Math.abs(t.pnl).toLocaleString()}
                      </div>
                      <div style={{ width:'100%', display:'flex', justifyContent:'center' }}>
                        <motion.div initial={{ height:0 }} animate={{ height:`${h}px` }} transition={{ delay:i*0.1+0.2, duration:0.6 }}
                          style={{ width:'80%', background:pos?'linear-gradient(180deg,#10B981,#059669)':'linear-gradient(0deg,#EF4444,#DC2626)',
                            borderRadius: pos?'4px 4px 0 0':'0 0 4px 4px', minWidth:'20px' }} />
                      </div>
                      <div style={{ color:S.muted, fontSize:'9px' }}>{t.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${S.border}` }}>
                  {[t('Month','الشهر'),t('Win Rate','معدل الربح'),t('PnL','الأرباح والخسائر'),t('Avg R:R','متوسط R:R'),t('Trades','الصفقات')].map(h => (
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:S.muted, fontSize:'9px', fontFamily:"'Orbitron',sans-serif", fontWeight:700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIMELINE.map((t, i) => (
                  <motion.tr key={t.month} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.07 }}
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding:'10px 12px', fontFamily:"'Orbitron',sans-serif", fontSize:'11px', fontWeight:700, color:'#fff' }}>{t.month}</td>
                    <td style={{ padding:'10px 12px', color:SCORE_COLOR(t.winRate), fontWeight:700 }}>{t.winRate}%</td>
                    <td style={{ padding:'10px 12px', color:t.pnl>0?'#10B981':'#EF4444', fontFamily:"'Orbitron',sans-serif", fontWeight:700 }}>
                      {t.pnl>0?'+':''}{t.pnl < 0 ? '-' : ''}${Math.abs(t.pnl).toLocaleString()}
                    </td>
                    <td style={{ padding:'10px 12px', color:'#D4A843', fontWeight:700 }}>{t.rr}:1</td>
                    <td style={{ padding:'10px 12px', color:'#CBD5E1' }}>{t.trades}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      </AnimatePresence>
    </div>
  );
}
