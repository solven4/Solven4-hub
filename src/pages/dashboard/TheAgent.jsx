import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/lib/LanguageContext';
import {
  Brain, Shield, TrendingUp, Send, Star, BarChart3,
  ArrowRight, Play, Layers, CheckCircle, DollarSign,
  Network, Command, Lock, UserCheck, Building2, Megaphone,
  ChevronRight, BookMarked, Zap, Target, AlertTriangle,
  Calendar, ChevronLeft, Plus, X, Info, Clock,
  TrendingDown, Activity, Cpu, Eye, RefreshCw, Bell,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   SOLVEN AI — AFEOS · Complete Cockpit
   Full rebuild: insights expandable, calendar synced,
   executed orders log, risk/impact scores, chief brief redesigned
══════════════════════════════════════════════════════════ */

const CSUITE_SKILLS = [
  { label:'CEO',   Icon:Command,   color:'#6366F1' },
  { label:'COO',   Icon:Layers,    color:'#3B82F6' },
  { label:'CMO',   Icon:Megaphone, color:'#D4A843' },
  { label:'CFO',   Icon:DollarSign,color:'#10B981' },
  { label:'CISO',  Icon:Lock,      color:'#F59E0B' },
  { label:'HR',    Icon:UserCheck, color:'#EC4899' },
  { label:'Coach', Icon:Star,      color:'#8B5CF6' },
  { label:'Risk',  Icon:Shield,    color:'#EF4444' },
];

const PRIORITY_COLORS = { CRITICAL:'#EF4444', HIGH:'#F59E0B', MEDIUM:'#6366F1', LOW:'#10B981' };

/* ── Today string for calendar init ── */
const TODAY = new Date();

/* ── Global calendar events (seeded from door schedules + SOLVEN planned) ── */
const SEED_EVENTS = [
  { id:'ev1', date:`${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`, time:'09:00', title:'Contact @imad — offer package', door:'NEXUS', color:'#EF4444', type:'ORDER' },
  { id:'ev2', date:`${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`, time:'09:30', title:'Broadcast XAUUSD to FORGE network', door:'FORGE', color:'#D4A843', type:'ORDER' },
  { id:'ev3', date:`${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`, time:'10:00', title:'London open — GBPUSD setup watch', door:'EDGE', color:'#06B6D4', type:'SCHEDULE' },
  { id:'ev4', date:`${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`, time:'11:00', title:'ORACLE Lesson 4: Smart Money Concepts', door:'ORACLE', color:'#10B981', type:'SCHEDULE' },
  { id:'ev5', date:`${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`, time:'13:00', title:'Follow up 3 stale NEXUS leads', door:'NEXUS', color:'#EF4444', type:'SCHEDULE' },
  { id:'ev6', date:`${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`, time:'14:00', title:'NFP release — reduce EDGE exposure 70%', door:'EDGE', color:'#06B6D4', type:'ALERT' },
  { id:'ev7', date:`${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`, time:'16:00', title:'Re-engage 3 inactive FORGE traders', door:'FORGE', color:'#D4A843', type:'ORDER' },
  { id:'ev8', date:`${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`, time:'17:00', title:'Lock in EDGE profits before close', door:'EDGE', color:'#06B6D4', type:'SCHEDULE' },
];

const DOORS = {
  EDGE: {
    id:'edge', name:'S4 EDGE', subtitle:'Trading Cockpit',
    color:'#3B82F6', glow:'rgba(59,130,246,0.2)', Icon:TrendingUp,
    tagline:'Your live trading arena — signals, positions, risk management',
    stats:[
      { label:'Open Trades', value:'4',     delta:'+2 today', up:true  },
      { label:'Win Rate',    value:'67%',   delta:'+9% avg',  up:true  },
      { label:'Open Risk',   value:'2.1%',  delta:'⚠ limit',  up:false },
      { label:"Today P&L",   value:'+$320', delta:'Live',     up:true  },
    ],
    insights:[
      {
        type:'PATTERN', priority:'HIGH', color:'#6366F1', risk:35, impact:82,
        text:"London open win rate: 74% — 3 live setups forming in watchlist",
        action:'View Setups',
        description:"Your historical data shows a strong 74% win rate during London open sessions (08:00–10:00). Right now, SOLVEN has identified 3 setups on GBPUSD, EURUSD, and XAUUSD that meet your full criteria set.",
        benefit:"Executing these setups during your highest-probability window adds an estimated +2.1R to your monthly results. Missing them means leaving your best trading hours unused.",
        consequence:"If you skip London open consistently, your win rate drops to 51% — barely above breakeven. Your edge is time-specific.",
      },
      {
        type:'RISK', priority:'CRITICAL', color:'#EF4444', risk:92, impact:95,
        text:"EURUSD exposure at 2.1% — above your 1.5% personal rule",
        action:'Adjust Risk',
        description:"You currently have 2.1% of your account exposed on EURUSD. Your own self-set rule caps single-pair exposure at 1.5%. SOLVEN has detected this breach and flagged it as CRITICAL.",
        benefit:"Reducing to 0.8% immediately protects ~$340 in potential loss. It also keeps you within your risk framework, which statistically improves your decision-making in subsequent trades.",
        consequence:"If this position moves against you by 50 pips (historically common in EURUSD), you lose 2.1% — double your intended maximum. Over 10 similar breaches, this adds ~$1,400 in excess losses.",
      },
      {
        type:'MARKET', priority:'HIGH', color:'#D4A843', risk:28, impact:78,
        text:"XAUUSD breakout confirmed above 2,380 — criteria met 91%",
        action:'Open Chart',
        description:"Gold has broken and closed above 2,380 resistance on H4. SOLVEN's Market Intelligence Engine has scored this setup at 91% confluence — your criteria for a high-conviction trade. Volume confirmation present.",
        benefit:"Historical data on similar setups: 71% win rate, average RR of 1:2.4. This is in your strongest trading instrument based on your last 90 days of data.",
        consequence:"Missing this setup doesn't cost you money, but it costs opportunity. Gold setups at this confluence score appear approximately 3x per month.",
      },
      {
        type:'COACH', priority:'MEDIUM', color:'#8B5CF6', risk:45, impact:65,
        text:"Overtrading detected: Fridays 8/10 weeks negative results",
        action:'Set Rule',
        description:"Your TradingDNA analysis shows a clear Friday pattern: you've had negative P&L on 8 of the last 10 Fridays. SOLVEN's pattern analysis attributes this to reduced liquidity and impulsive pre-weekend trading.",
        benefit:"Reducing Friday exposure by 50% would have saved you an estimated $820 over the last 10 weeks. Setting a Friday rule now applies it automatically going forward.",
        consequence:"Continuing Friday full-size trading is costing you approximately $82/week on average — $328/month in avoidable losses.",
      },
    ],
    orders:[
      { id:'e1', title:'Tighten EURUSD to 0.8% risk', priority:'CRITICAL', color:'#EF4444', risk:92, impact:95, reason:'3 consecutive losses — loss cluster + above personal limit' },
      { id:'e2', title:'Set XAUUSD alert at 2,395',   priority:'HIGH',     color:'#D4A843', risk:20, impact:78, reason:'Key resistance level — your win rate there: 78%' },
      { id:'e3', title:'Close trades before 18:00 Fri',priority:'MEDIUM',   color:'#6366F1', risk:45, impact:65, reason:'Weekend gap risk + confirmed Friday -R bias' },
    ],
    schedule:[
      { id:'s_e1', time:'10:00', text:'London open — GBPUSD & XAUUSD setups',    door:'EDGE', color:'#06B6D4' },
      { id:'s_e2', time:'14:00', text:'NFP release — reduce exposure 70% before', door:'EDGE', color:'#06B6D4' },
      { id:'s_e3', time:'17:00', text:'Review open trades & lock in profits',     door:'EDGE', color:'#06B6D4' },
    ],
    forecast:{ label:'Monthly P&L', current:'+$3,200', target:'+$4,100', pct:'+28%' },
  },
  FORGE: {
    id:'forge', name:'S4 FORGE', subtitle:'IB Network',
    color:'#D4A843', glow:'rgba(212,168,67,0.2)', Icon:Network,
    tagline:'Your IB empire — traders, signals, commissions, growth',
    stats:[
      { label:'Active Traders', value:'47',     delta:'3 inactive', up:false },
      { label:'Commissions',    value:'$1,800', delta:'+12% MoM',   up:true  },
      { label:'Signal Reach',   value:'340',    delta:'+47 views',  up:true  },
      { label:'New Leads',      value:'12',     delta:'This week',  up:true  },
    ],
    insights:[
      {
        type:'NETWORK', priority:'HIGH', color:'#D4A843', risk:62, impact:84,
        text:"3 inactive traders — 14+ days without activity, ~$420/mo at risk",
        action:'Draft Message',
        description:"Traders @ali_fx, @mona_trades, and @kareem44 haven't placed a trade in 14+ days. Based on historical IB data, traders inactive for 21+ days have a 73% churn rate. You're in the intervention window.",
        benefit:"A personalized re-engagement message typically reactivates 60–70% of dormant traders at this stage. Reactivating all 3 recovers ~$420/mo in commissions and prevents churn.",
        consequence:"If these traders churn, rebuilding that commission level takes approximately 6–8 weeks of recruiting effort — roughly $2,500 in lost commission over that period.",
      },
      {
        type:'SIGNAL', priority:'HIGH', color:'#10B981', risk:22, impact:88,
        text:"XAUUSD 92% confluence — broadcast now, 14 traders are long-biased",
        action:'Broadcast',
        description:"SOLVEN's Signal Intelligence Engine has scored this XAUUSD setup at 92% confluence. Cross-referencing your FORGE network, 14 of your 47 traders have expressed bullish Gold bias this week. Timing alignment: excellent.",
        benefit:"Broadcasting now reaches your most receptive audience. Based on your last 8 broadcasts, a high-confluence signal averages 11 open positions from your network — each generating ~$12 in commissions.",
        consequence:"Delaying by 2+ hours reduces your first-mover advantage. Liquidity at this breakout level typically dissipates within 3–4 hours.",
      },
      {
        type:'REVENUE', priority:'MEDIUM', color:'#6366F1', risk:5, impact:72,
        text:"8 traders stuck in uncommissioned tier — fix routing = +$340",
        action:'Fix Routing',
        description:"8 of your active traders are generating volume but are incorrectly assigned to an uncommissioned tier due to a routing configuration gap. This is a system-level fix, not a trading action.",
        benefit:"Correcting the routing immediately adds $340 this month with zero trading effort. Going forward, these 8 traders will contribute ~$340/mo recurring.",
        consequence:"Every month this goes unfixed costs you $340. It's been unfixed for approximately 3 weeks — meaning you've already missed ~$255.",
      },
      {
        type:'CMO', priority:'MEDIUM', color:'#EC4899', risk:38, impact:68,
        text:"6 days without a post — engagement drops 60% after 5 days",
        action:'Generate Post',
        description:"Your FORGE profile analytics show a strong correlation between posting frequency and lead generation. After 5 days of silence, your profile engagement drops 60% and inbound lead requests drop by 40%.",
        benefit:"Posting your XAUUSD performance today (67% win rate, +$320 today) will attract an estimated 8–15 new inquiries based on your historical post performance.",
        consequence:"Every additional silent day costs you approximately 2 potential new trader leads. At your current conversion rate, that's $90/day in future commission pipeline.",
      },
    ],
    orders:[
      { id:'f1', title:'Post weekly performance report',  priority:'HIGH',   color:'#D4A843', risk:38, impact:68, reason:'6 days silent — 40% drop in leads per day' },
      { id:'f2', title:'Re-engage 3 dormant traders',     priority:'HIGH',   color:'#EF4444', risk:62, impact:84, reason:'$420/mo at risk if they churn this week' },
      { id:'f3', title:'Fix routing: upgrade 8 traders',  priority:'MEDIUM', color:'#10B981', risk:5,  impact:72, reason:'$340/mo uncaptured — zero-effort fix' },
    ],
    schedule:[
      { id:'s_f1', time:'09:30', text:'Broadcast London open XAUUSD signal', door:'FORGE', color:'#D4A843' },
      { id:'s_f2', time:'12:00', text:'Post weekly performance stats',        door:'FORGE', color:'#D4A843' },
      { id:'s_f3', time:'16:00', text:'Personal messages to 3 dormant traders',door:'FORGE', color:'#D4A843' },
    ],
    forecast:{ label:'Commission Forecast', current:'$1,800', target:'$2,650', pct:'+47%' },
  },
  ORACLE: {
    id:'oracle', name:'S4 ORACLE', subtitle:'Learning Academy',
    color:'#10B981', glow:'rgba(16,185,129,0.2)', Icon:BookMarked,
    tagline:'Your education engine — lessons, briefs, XP, certifications',
    stats:[
      { label:'Progress',    value:'61%',   delta:'3/5 modules',  up:true  },
      { label:'Days Behind', value:'3',     delta:'vs schedule',  up:false },
      { label:'Quiz Avg',    value:'84%',   delta:'+6% vs avg',   up:true  },
      { label:'XP Points',   value:'1,240', delta:'Rank: Silver', up:true  },
    ],
    insights:[
      {
        type:'LEARNING', priority:'HIGH', color:'#8B5CF6', risk:55, impact:90,
        text:"3 days behind — Lesson 4 (SMC) unlocks Copy Trading: +$400/mo",
        action:'Start Lesson 4',
        description:"You're 3 days behind your ORACLE learning schedule. Lesson 4 covers Smart Money Concepts (SMC) — the most requested topic by your FORGE traders. Completing it directly unlocks the Copy Trading feature in EDGE.",
        benefit:"Copy Trading activation adds an estimated $400/mo in recurring revenue from your FORGE network. It also increases trader retention by ~40% because they can mirror your trades automatically.",
        consequence:"Every day of delay is a day your FORGE traders can't copy your trades. 14 of your traders have expressed interest. At 14 traders × $28/mo avg = $392/mo sitting locked.",
      },
      {
        type:'MILESTONE', priority:'HIGH', color:'#D4A843', risk:10, impact:75,
        text:"Modules 4 & 5 completion = 500 S4C tokens (~$150) at graduation",
        action:'View Path',
        description:"Upon completing the full ORACLE curriculum (modules 4 and 5), SOLVEN4 automatically distributes 500 S4C tokens to your vault as a graduation reward. Current S4C value: ~$0.30/token.",
        benefit:"500 tokens × $0.30 = ~$150 in S4C rewards. These can be staked for platform discounts or traded. Combined with the Copy Trading unlock, completing ORACLE is worth approximately $550 in total value.",
        consequence:"No financial penalty for delay, but every day behind schedule pushes graduation further. At current pace, graduation is 12 days away instead of 9.",
      },
      {
        type:'BRIEFING', priority:'MEDIUM', color:'#10B981', risk:40, impact:70,
        text:"Today's macro brief: DXY bearish divergence — read before trading",
        action:'Read Brief',
        description:"ORACLE's daily macro brief (8 min read) covers today's key macro driver: bearish divergence in DXY on H4 timeframe. This directly impacts 3 of your currently open EDGE trades that are USD-exposed.",
        benefit:"Traders who read ORACLE briefs before their session show 18% higher win rates on macro-correlated days. Today's DXY move could affect EURUSD and XAUUSD — both active in your EDGE dashboard.",
        consequence:"Trading without reading today's brief while holding USD-exposed positions is a measurable risk. The DXY setup could trigger a 40–60 pip counter-move on EURUSD.",
      },
      {
        type:'COACH', priority:'MEDIUM', color:'#6366F1', risk:30, impact:62,
        text:"Quiz data: strong theory, weak execution — simulator recommended",
        action:'Open Sim',
        description:"Your quiz average is 84% (strong theory), but your live trading execution scores 67% win rate vs a simulated 79% win rate on similar setups. SOLVEN identifies a theory-execution gap.",
        benefit:"Running the ORACLE trading simulator for 30 min/day for 1 week historically closes the gap by 8–12%. That gap in your live account represents approximately $180/mo in unrealized potential.",
        consequence:"Theory without execution practice leads to hesitation, late entries, and missed exits. Your current gap costs an estimated $45/week in suboptimal execution.",
      },
    ],
    orders:[
      { id:'o1', title:'Resume Lesson 4: Smart Money Concepts', priority:'HIGH',   color:'#10B981', risk:55, impact:90, reason:'Unlocks Copy Trading — $400/mo locked behind this' },
      { id:'o2', title:'Retake Lesson 3 quiz',                  priority:'MEDIUM', color:'#6366F1', risk:15, impact:55, reason:'Score 78% — need 80%+ to unlock bonus module' },
      { id:'o3', title:"Read today's macro brief",              priority:'MEDIUM', color:'#10B981', risk:40, impact:70, reason:'3 open trades are USD-exposed — DXY alert active' },
    ],
    schedule:[
      { id:'s_o1', time:'08:00', text:'Read daily macro brief — 8 min',            door:'ORACLE', color:'#10B981' },
      { id:'s_o2', time:'11:00', text:'Lesson 4 Part 1: Order Blocks & FVGs',      door:'ORACLE', color:'#10B981' },
      { id:'s_o3', time:'15:00', text:'Trading simulation practice — 30 min',      door:'ORACLE', color:'#10B981' },
    ],
    forecast:{ label:'Graduation Timeline', current:'3/5 modules', target:'Graduate in 12 days', pct:'+150 XP/day' },
  },
  NEXUS: {
    id:'nexus', name:'S4 NEXUS', subtitle:'Business Command',
    color:'#EF4444', glow:'rgba(239,68,68,0.2)', Icon:Building2,
    tagline:'Your business hub — leads, pipeline, S4C vault, growth',
    stats:[
      { label:'Pipeline',    value:'$2,100', delta:'7 leads',   up:true  },
      { label:'Conversion',  value:'18%',    delta:'Below avg', up:false },
      { label:'New Leads',   value:'5',      delta:'This week', up:true  },
      { label:'S4C Balance', value:'2,450',  delta:'Tokens',    up:true  },
    ],
    insights:[
      {
        type:'LEAD', priority:'CRITICAL', color:'#EF4444', risk:88, impact:95,
        text:"@imad: 3 consecutive days viewing your signal page — 48h window",
        action:'Contact Now',
        description:"Lead @imad has visited your FORGE signal page 3 days in a row. SOLVEN's behavioral analysis scores this at 94% buying intent. Research shows that leads who view 3+ days consecutively convert at 3× the rate of single-visit leads.",
        benefit:"Contacting @imad now with a tailored offer (based on the XAUUSD pair he keeps viewing) has an estimated 78% conversion probability. Avg new trader commission: $85/mo recurring.",
        consequence:"If you don't contact within 48h, conversion probability drops to 31%. After 72h with no response, leads at this profile typically find another IB provider. Expected lost value: $1,020 in first-year commissions.",
      },
      {
        type:'PIPELINE', priority:'HIGH', color:'#D4A843', risk:65, impact:80,
        text:"$2,100 stale pipeline — 3 deals: 4+ days with no contact",
        action:'Follow Up All',
        description:"3 deals in your NEXUS pipeline have had zero contact in 4+ days: @sara_kw ($800 est.), @faris_ib ($750 est.), @lina_v ($550 est.). The average deal in your pipeline dies after 7 days of silence.",
        benefit:"A follow-up message to all 3 today — even a simple check-in — resets the clock and historically reengages 55% of stalled leads. Expected: 1–2 deals closing this week.",
        consequence:"3 more days of silence = all 3 deals likely lost. That's $2,100 in pipeline value to rebuild from scratch — 3–4 weeks of new lead generation effort.",
      },
      {
        type:'HR', priority:'MEDIUM', color:'#EC4899', risk:20, impact:72,
        text:"3 FORGE traders match sub-IB profile — zero-cost network expansion",
        action:'View Profiles',
        description:"SOLVEN's HR Engine has analyzed your FORGE trader base and identified 3 profiles (@khaled_fx, @nora_trade, @yasser_m) who show strong social influence, consistent trading, and recruiting potential.",
        benefit:"Converting traders to sub-IBs grows your network without paid acquisition. Each active sub-IB averages +8 new traders/quarter. 3 sub-IBs = potential +24 traders = +$1,080/mo in additional commissions within 90 days.",
        consequence:"Ignoring these profiles means your network grows only through your own direct recruiting effort. The compounding effect of sub-IBs vs direct recruiting is 3× over 12 months.",
      },
      {
        type:'SECURITY', priority:'LOW', color:'#F59E0B', risk:72, impact:60,
        text:"CISO alert: 2 unrecognized device login attempts this week",
        action:'Check Security',
        description:"SOLVEN's CISO module detected 2 login attempts from IP addresses not in your approved device list. Both attempts occurred outside your typical usage hours (2:40 AM and 4:15 AM local time). Neither succeeded.",
        benefit:"Enabling 2FA immediately blocks all future unauthorized attempts. Reviewing the access log identifies the source geography and lets you report if malicious. I've already flagged both IPs for monitoring.",
        consequence:"Without 2FA, a successful unauthorized login could expose your trader network data, commission records, and NEXUS pipeline. GDPR/data obligations apply if client data is accessed.",
      },
    ],
    orders:[
      { id:'n1', title:'Contact @imad — send offer package',   priority:'CRITICAL', color:'#EF4444', risk:88, impact:95, reason:'48h window — 94% buying intent score from SOLVEN' },
      { id:'n2', title:'Follow up: 3 stale pipeline deals',    priority:'HIGH',     color:'#D4A843', risk:65, impact:80, reason:'$2,100 at risk — all 3 approach the 7-day death line' },
      { id:'n3', title:'Enable 2FA on NEXUS account',         priority:'HIGH',     color:'#F59E0B', risk:72, impact:60, reason:'2 unauthorized attempts — CISO flag active' },
      { id:'n4', title:'Stake 1,000 S4C for 20% fee discount',priority:'MEDIUM',   color:'#6366F1', risk:8,  impact:55, reason:'2,450 tokens on hand — saves ~$100/mo in fees' },
    ],
    schedule:[
      { id:'s_n1', time:'09:00', text:'Lead review — @imad outreach first',     door:'NEXUS', color:'#EF4444' },
      { id:'s_n2', time:'13:00', text:'Follow-up messages to 3 stale leads',    door:'NEXUS', color:'#EF4444' },
      { id:'s_n3', time:'17:00', text:'Update CRM pipeline stages & notes',     door:'NEXUS', color:'#EF4444' },
    ],
    forecast:{ label:'NEXUS Pipeline', current:'$890', target:'$1,340', pct:'+51%' },
  },
};

const CHIEF_RECOMMENDATIONS = [
  { rank:1, priority:'CRITICAL', door:'NEXUS', color:'#EF4444', Icon:Building2,
    title:'Contact @imad — offer package NOW', timeframe:'Within 2 hours',
    why:"94% buying intent score. Window closes in 48h. Expected revenue: $85/mo recurring.",
    impact:95, risk:88, effort:'5 min', revenue:'+$85/mo' },
  { rank:2, priority:'HIGH', door:'FORGE', color:'#D4A843', Icon:Network,
    title:'Broadcast XAUUSD signal to network', timeframe:'Before 11:00 AM',
    why:"92% confluence. 14 traders are long-biased. First-mover advantage active.",
    impact:88, risk:22, effort:'2 min', revenue:'+$132 commissions' },
  { rank:3, priority:'CRITICAL', door:'EDGE', color:'#EF4444', Icon:TrendingUp,
    title:'Reduce EURUSD exposure to 0.8%', timeframe:'Immediately',
    why:"Above personal risk limit. 3-loss cluster detected. Protecting $340 in drawdown.",
    impact:95, risk:92, effort:'1 min', revenue:'Saves $340' },
  { rank:4, priority:'HIGH', door:'ORACLE', color:'#10B981', Icon:BookMarked,
    title:'Complete ORACLE Lesson 4 (SMC)', timeframe:'Today by 13:00',
    why:"Unlocks Copy Trading for 14 waiting traders. $400/mo sits behind this lesson.",
    impact:90, risk:55, effort:'45 min', revenue:'+$400/mo' },
  { rank:5, priority:'MEDIUM', door:'FORGE', color:'#D4A843', Icon:Network,
    title:'Fix commission routing for 8 traders', timeframe:'Today',
    why:"$340/mo uncaptured. Zero trading effort — pure system fix.",
    impact:72, risk:5, effort:'10 min', revenue:'+$340/mo' },
];

const AGENT_RESPONSES = [
  "Cross-door analysis: your optimal sequence today is NEXUS (@imad contact) → FORGE (XAUUSD broadcast) → EDGE (risk adjustment) → ORACLE (Lesson 4). Execute that order and SOLVEN projects +$640 added revenue this week. Want me to draft the @imad message now?",
  "CFO view: current platform = ~$5,000/mo. All orders executed = projected $8,090/mo (+62%). Your single biggest zero-effort move: fix FORGE commission routing. $340/mo for 10 minutes of work. Should I walk you through it?",
  "CISO report: 2 unauthorized login attempts on NEXUS detected overnight. Both failed, but the gap is open. I recommend enabling 2FA before your 09:00 lead review session. I've already flagged both IPs — no data was accessed.",
  "Coach insight: your last 47 trades show a clear pattern — you enter 1.2 candles too early on average. That premature entry is costing you ~0.4R per trade. Across your monthly volume, that's approximately $180/mo in execution leakage. Want me to set a delayed-entry alert?",
  "HR intelligence: @khaled_fx in your FORGE network has referred 3 friends in the past month without a formal sub-IB structure. He's doing the work already — just not getting paid for it. Making him a sub-IB costs you nothing and creates a compounding growth engine.",
  "CEO summary: your platform score is 71/100. The 29 points are recoverable: ORACLE delay (-8 pts), NEXUS pipeline inaction (-6 pts), EDGE overexposure (-5 pts), FORGE silence (-4 pts), CISO gap (-3 pts), uncommissioned routing (-3 pts). Fix all 6 this week and your score hits 95+.",
  "Risk officer alert: your total open risk across all EDGE positions is 3.0% — exactly at your maximum threshold. Any new trade now puts you over the limit. SOLVEN recommends waiting for one position to close before entering new signals, regardless of confluence score.",
];

/* ════════════════ CANVAS AVATAR ════════════════ */
function SolvenCore({ size=110, activeColor='#6366F1' }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const cRef = useRef({ from:'#6366F1', to:activeColor, t:1 });

  useEffect(() => { cRef.current = { from:cRef.current.to, to:activeColor, t:0 }; }, [activeColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W=canvas.width=size*2, H=canvas.height=size*2;
    canvas.style.width=size+'px'; canvas.style.height=size+'px';
    const cx=W/2, cy=H/2, R=size*0.65;
    function hexRgb(h){ h=h.replace('#',''); return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
    function lerpC(a,b,t){ const [ar,ag,ab]=hexRgb(a),[br,bg,bb]=hexRgb(b); return `rgb(${~~(ar+(br-ar)*t)},${~~(ag+(bg-ag)*t)},${~~(ab+(bb-ab)*t)})`; }
    const pts = Array.from({length:90},(_,i)=>({ angle:(i/90)*Math.PI*2, r:R*(0.72+Math.random()*0.65), spd:0.005+Math.random()*0.009, sz:1+Math.random()*2.2, ph:Math.random()*Math.PI*2 }));
    function draw(t){
      ctx.clearRect(0,0,W,H);
      const c=cRef.current; if(c.t<1) c.t=Math.min(1,c.t+0.04);
      const col=lerpC(c.from,c.to,c.t);
      const [r,g,b]=hexRgb(c.to), rgb=`${r},${g},${b}`;
      const atmo=ctx.createRadialGradient(cx,cy,R*0.7,cx,cy,R*1.5);
      atmo.addColorStop(0,`rgba(${rgb},0.12)`); atmo.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(cx,cy,R*1.5,0,Math.PI*2); ctx.fillStyle=atmo; ctx.fill();
      for(let i=0;i<5;i++){ ctx.beginPath(); ctx.arc(cx,cy,R*(0.76+i*0.14)+Math.sin(t*0.4+i)*2,0,Math.PI*2); ctx.strokeStyle=`rgba(${rgb},${0.05-i*0.007})`; ctx.lineWidth=1; ctx.stroke(); }
      for(let i=0;i<3;i++){ ctx.save(); ctx.translate(cx,cy); ctx.rotate(t*(0.9+i*0.35)+(i*2.1)); ctx.beginPath(); ctx.arc(0,0,R*(0.84+i*0.05),-0.5,0.5); ctx.strokeStyle=`rgba(${rgb},${0.55-i*0.14})`; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore(); }
      pts.forEach(p=>{ p.angle+=p.spd; const x=cx+Math.cos(p.angle)*p.r, y=cy+Math.sin(p.angle)*p.r, pulse=0.35+0.65*Math.sin(t*2.5+p.ph); ctx.beginPath(); ctx.arc(x,y,p.sz,0,Math.PI*2); ctx.fillStyle=`rgba(${rgb},${pulse*0.55})`; ctx.fill(); });
      const core=ctx.createRadialGradient(cx-R*0.18,cy-R*0.18,1,cx,cy,R*0.72);
      core.addColorStop(0,'#fff'); core.addColorStop(0.18,col); core.addColorStop(0.8,'#0A0C1E'); core.addColorStop(1,'#05050C');
      ctx.beginPath(); ctx.arc(cx,cy,R*0.72,0,Math.PI*2); ctx.fillStyle=core; ctx.fill();
      ctx.save(); ctx.globalAlpha=0.06;
      for(let i=0;i<10;i++){ const a=(i/10)*Math.PI*2+t*0.1; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(a)*R*0.72,cy+Math.sin(a)*R*0.72); ctx.strokeStyle='#fff'; ctx.lineWidth=0.5; ctx.stroke(); }
      ctx.restore();
      for(let i=0;i<3;i++){ ctx.save(); ctx.translate(cx,cy); ctx.rotate(t*(1.2+i*0.6)*(i%2?-1:1)); ctx.beginPath(); ctx.arc(0,0,R*(0.3+i*0.12),0,Math.PI*(1+i*0.2)); ctx.strokeStyle=`rgba(255,255,255,${0.13-i*0.03})`; ctx.lineWidth=1.2; ctx.stroke(); ctx.restore(); }
      const eye=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.15); eye.addColorStop(0,'#fff'); eye.addColorStop(0.5,`rgba(${rgb},0.9)`); eye.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(cx,cy,R*0.15,0,Math.PI*2); ctx.fillStyle=eye; ctx.fill();
      const glow=ctx.createRadialGradient(cx,H-8,0,cx,H-8,R*0.6); glow.addColorStop(0,`rgba(${rgb},0.2)`); glow.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.ellipse(cx,H-8,R*0.5,10,0,0,Math.PI*2); ctx.fillStyle=glow; ctx.fill();
    }
    function loop(){ tRef.current+=0.016; draw(tRef.current); animRef.current=requestAnimationFrame(loop); }
    loop();
    return ()=>cancelAnimationFrame(animRef.current);
  }, [size]);
  return <canvas ref={canvasRef}/>;
}

/* ════════════════ IMPACT/RISK METER ════════════════ */
function ScoreMeter({ label, value, color }) {
  return (
    <div style={{flex:1}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
        <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',color:'#94A3B8',letterSpacing:'0.1em'}}>{label}</span>
        <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'8px',color,fontWeight:700}}>{value}%</span>
      </div>
      <div style={{height:'4px',borderRadius:'2px',background:'rgba(255,255,255,0.06)',overflow:'hidden'}}>
        <motion.div initial={{width:0}} animate={{width:`${value}%`}} transition={{duration:0.8,ease:'easeOut'}}
          style={{height:'100%',borderRadius:'2px',background:`linear-gradient(90deg,${color}60,${color})`}}/>
      </div>
    </div>
  );
}

/* ════════════════ CALENDAR COMPONENT ════════════════ */
function SolvenCalendar({ events, onAddEvent }) {
  const { t } = useLang();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ time:'09:00', title:'', door:'EDGE', type:'SCHEDULE' });

  const y = viewDate.getFullYear(), m = viewDate.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m+1, 0).getDate();
  const DOOR_COLORS_MAP = { EDGE:'#06B6D4', FORGE:'#D4A843', ORACLE:'#10B981', NEXUS:'#EF4444', ALL:'#6366F1' };
  const TYPE_ICONS = { ORDER: Zap, SCHEDULE: Clock, ALERT: AlertTriangle };

  function dateStr(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

  const selStr = dateStr(selectedDate);
  const todayStr = dateStr(new Date());
  const selEvents = events.filter(e=>e.date===selStr).sort((a,b)=>a.time.localeCompare(b.time));

  function eventsOnDay(day) {
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return events.filter(e=>e.date===ds);
  }

  function addEvent() {
    if (!newEvent.title.trim()) return;
    const ds = dateStr(selectedDate);
    onAddEvent({ ...newEvent, id:`ev_${Date.now()}`, date:ds, color: DOOR_COLORS_MAP[newEvent.door] });
    setNewEvent({ time:'09:00', title:'', door:'EDGE', type:'SCHEDULE' });
    setShowAddForm(false);
  }

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',alignItems:'start'}}>

      {/* ── Mini Calendar Grid ── */}
      <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'14px',padding:'16px',border:'1px solid rgba(255,255,255,0.06)'}}>
        {/* Month nav */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
          <button onClick={()=>setViewDate(new Date(y,m-1,1))}
            style={{background:'rgba(255,255,255,0.05)',border:'none',borderRadius:'7px',width:'28px',height:'28px',cursor:'pointer',color:'#94A3B8',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <ChevronLeft size={13}/>
          </button>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'11px',fontWeight:700,color:'#fff',letterSpacing:'0.1em'}}>
            {MONTHS[m]} {y}
          </div>
          <button onClick={()=>setViewDate(new Date(y,m+1,1))}
            style={{background:'rgba(255,255,255,0.05)',border:'none',borderRadius:'7px',width:'28px',height:'28px',cursor:'pointer',color:'#94A3B8',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <ChevronRight size={13}/>
          </button>
        </div>

        {/* Day headers */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px',marginBottom:'4px'}}>
          {DAYS.map(d=>(
            <div key={d} style={{textAlign:'center',fontFamily:"'Orbitron',sans-serif",fontSize:'7px',color:'#94A3B8',padding:'3px 0',letterSpacing:'0.05em'}}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px'}}>
          {Array.from({length:firstDay}).map((_,i)=><div key={`empty-${i}`}/>)}
          {Array.from({length:daysInMonth},(_,i)=>i+1).map(day=>{
            const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const isToday = ds===todayStr;
            const isSelected = ds===selStr;
            const dayEvs = eventsOnDay(day);
            const hasCritical = dayEvs.some(e=>e.type==='ALERT'||e.type==='ORDER');
            return (
              <button key={day} onClick={()=>setSelectedDate(new Date(y,m,day))}
                style={{
                  position:'relative', aspectRatio:'1', borderRadius:'7px', border:'none', cursor:'pointer',
                  background: isSelected ? '#6366F1' : isToday ? 'rgba(99,102,241,0.18)' : 'transparent',
                  color: isSelected ? '#fff' : isToday ? '#A5B4FC' : '#CBD5E1',
                  fontSize:'11px', fontWeight: isToday||isSelected ? 700 : 400,
                  outline: isToday && !isSelected ? '1px solid rgba(99,102,241,0.4)' : 'none',
                  transition:'all 0.12s',
                  display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', padding:'2px',
                }}>
                <span>{day}</span>
                {dayEvs.length>0 && (
                  <div style={{display:'flex',gap:'1px',marginTop:'1px'}}>
                    {dayEvs.slice(0,3).map((e,i)=>(
                      <div key={i} style={{width:'4px',height:'4px',borderRadius:'50%',background: isSelected?'rgba(255,255,255,0.7)':e.color}}/>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{marginTop:'12px',display:'flex',gap:'10px',flexWrap:'wrap'}}>
          {Object.entries(DOOR_COLORS_MAP).filter(([k])=>k!=='ALL').map(([door,color])=>(
            <div key={door} style={{display:'flex',alignItems:'center',gap:'4px'}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',background:color}}/>
              <span style={{fontSize:'9px',color:'#94A3B8'}}>{door}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Day Event List ── */}
      <div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
          <div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'10px',color:'#6366F1',fontWeight:700,letterSpacing:'0.1em'}}>
              {selectedDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
            </div>
            <div style={{fontSize:'10px',color:'#94A3B8',marginTop:'1px'}}>{selEvents.length} {t('events scheduled','فعاليات مجدولة')}</div>
          </div>
          <button onClick={()=>setShowAddForm(v=>!v)}
            style={{
              display:'flex',alignItems:'center',gap:'5px',padding:'7px 13px',
              background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.3)',
              borderRadius:'8px',cursor:'pointer',color:'#A5B4FC',fontSize:'11px',fontWeight:600,
            }}>
            <Plus size={12}/> {t('Add Event','إضافة فعالية')}
          </button>
        </div>

        {/* Add event form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
              style={{background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'10px',padding:'12px',marginBottom:'10px',overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'80px 1fr',gap:'6px',marginBottom:'6px'}}>
                <input value={newEvent.time} onChange={e=>setNewEvent(p=>({...p,time:e.target.value}))} type="time"
                  style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',padding:'6px 8px',color:'#fff',fontSize:'11px',outline:'none'}}/>
                <input value={newEvent.title} onChange={e=>setNewEvent(p=>({...p,title:e.target.value}))}
                  placeholder={t('Event title...','عنوان الفعالية...')} onKeyDown={e=>e.key==='Enter'&&addEvent()}
                  style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',padding:'6px 10px',color:'#fff',fontSize:'11px',outline:'none'}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'6px'}}>
                <select value={newEvent.door} onChange={e=>setNewEvent(p=>({...p,door:e.target.value}))}
                  style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',padding:'6px 8px',color:'#fff',fontSize:'11px',outline:'none'}}>
                  {['EDGE','FORGE','ORACLE','NEXUS','ALL'].map(d=><option key={d} value={d} style={{background:'#0A0C1E'}}>{d}</option>)}
                </select>
                <select value={newEvent.type} onChange={e=>setNewEvent(p=>({...p,type:e.target.value}))}
                  style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',padding:'6px 8px',color:'#fff',fontSize:'11px',outline:'none'}}>
                  {['SCHEDULE','ORDER','ALERT'].map(t=><option key={t} value={t} style={{background:'#0A0C1E'}}>{t}</option>)}
                </select>
                <button onClick={addEvent}
                  style={{background:'#6366F1',border:'none',borderRadius:'6px',padding:'6px 12px',cursor:'pointer',color:'#fff',fontSize:'11px',fontWeight:700}}>
                  {t('Save','حفظ')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events */}
        <div style={{display:'flex',flexDirection:'column',gap:'6px',maxHeight:'260px',overflowY:'auto'}}>
          {selEvents.length===0 ? (
            <div style={{textAlign:'center',padding:'24px',color:'#94A3B8',fontSize:'12px'}}>
              <Calendar size={22} color="#94A3B8" style={{margin:'0 auto 8px',display:'block',opacity:0.5}}/>
              {t('No events scheduled. Add one above.', 'لا توجد فعاليات مجدولة. أضف واحدة أعلاه.')}
            </div>
          ) : selEvents.map(ev=>{
            const EIcon = TYPE_ICONS[ev.type] || Clock;
            return (
              <motion.div key={ev.id} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}}
                style={{
                  display:'flex',gap:'10px',alignItems:'flex-start',padding:'10px 12px',borderRadius:'9px',
                  background:`${ev.color}0C`,border:`1px solid ${ev.color}22`,
                  borderLeft:`3px solid ${ev.color}`,
                }}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'12px',fontWeight:700,color:ev.color,flexShrink:0,minWidth:'44px'}}>{ev.time}</div>
                <EIcon size={12} color={ev.color} style={{flexShrink:0,marginTop:'2px'}}/>
                <div style={{flex:1}}>
                  <div style={{color:'#CBD5E1',fontSize:'12px',lineHeight:1.4}}>{ev.title}</div>
                  <div style={{display:'flex',gap:'6px',marginTop:'3px'}}>
                    <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',color:ev.color,background:`${ev.color}15`,borderRadius:'3px',padding:'1px 5px'}}>{ev.door}</span>
                    <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',color:'#94A3B8',background:'rgba(255,255,255,0.06)',borderRadius:'3px',padding:'1px 5px'}}>{ev.type}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ════════════════ DOOR DETAIL PANEL ════════════════ */
function DoorDetail({ door, onAddCalendarEvent }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [tab, setTab] = useState('insights');
  const [done, setDone] = useState({});
  const [executedLog, setExecutedLog] = useState([]);
  const [expandedInsight, setExpandedInsight] = useState(null);

  function executeOrder(order) {
    setDone(p=>({...p,[order.id]:true}));
    setExecutedLog(p=>[{ ...order, executedAt: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) }, ...p]);
  }

  const pending = door.orders.filter(o=>!done[o.id]);

  return (
    <motion.div key={door.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      transition={{type:'spring',stiffness:260,damping:28}}
      className="s4-glass" style={{['--accent']:door.color,borderColor:`${door.color}28`,overflow:'hidden',boxShadow:`0 0 60px ${door.glow}`}}>

      {/* Header */}
      <div style={{padding:'20px 24px',background:`linear-gradient(135deg,${door.color}12 0%,transparent 60%)`,borderBottom:`1px solid ${door.color}18`,display:'flex',alignItems:'center',gap:'16px'}}>
        <div style={{width:'48px',height:'48px',borderRadius:'13px',background:`${door.color}18`,border:`2px solid ${door.color}40`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 20px ${door.color}30`,flexShrink:0}}>
          <door.Icon size={22} color={door.color}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'16px',fontWeight:900,color:'#fff',letterSpacing:'0.08em'}}>{door.name}</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'8px',color:door.color,letterSpacing:'0.18em',marginTop:'2px'}}>{door.tagline}</div>
        </div>
        <div style={{display:'flex',gap:'22px',alignItems:'center'}}>
          {door.stats.map((s,i)=>(
            <div key={i} style={{textAlign:'center'}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'15px',fontWeight:900,color:s.up?'#10B981':'#F59E0B'}}>{s.value}</div>
              <div style={{fontSize:'9px',color:'#94A3B8',marginTop:'1px'}}>{s.label}</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'8px',color:s.up?'#10B981':'#EF4444',marginTop:'1px'}}>{s.delta}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px',alignItems:'flex-end',flexShrink:0}}>
          <button onClick={()=>navigate(`/dashboard/door/${door.id}`)}
            style={{background:`linear-gradient(135deg,${door.color},${door.color}bb)`,border:'none',borderRadius:'10px',padding:'9px 18px',cursor:'pointer',color:'#000',fontSize:'12px',fontWeight:800,display:'flex',alignItems:'center',gap:'5px',boxShadow:`0 4px 20px ${door.color}35`}}>
            {t('Open','فتح')} {door.name} <ArrowRight size={12}/>
          </button>
          <div style={{textAlign:'right'}}>
            <span style={{color:'#94A3B8',fontSize:'9px'}}>{door.forecast.label}: </span>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'10px',color:'#10B981',fontWeight:700}}>{door.forecast.target} </span>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'8px',color:'#10B981',background:'rgba(16,185,129,0.12)',borderRadius:'4px',padding:'1px 5px'}}>{door.forecast.pct}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:'2px',padding:'12px 20px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        {[
          {id:'insights',label:t('AI Insights','رؤى الذكاء الاصطناعي'),count:door.insights.length},
          {id:'orders',label:t('Execution Orders','أوامر التنفيذ'),count:pending.length,alert:door.orders.some(o=>!done[o.id]&&o.priority==='CRITICAL')},
          {id:'schedule',label:t("Today's Schedule","جدول اليوم"),count:door.schedule.length},
        ].map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)}
            style={{padding:'8px 18px',borderRadius:'8px 8px 0 0',border:'none',cursor:'pointer',background:tab===tb.id?`${door.color}18`:'transparent',color:tab===tb.id?door.color:'#94A3B8',fontSize:'11px',fontWeight:tab===tb.id?700:400,fontFamily:"'Orbitron',sans-serif",letterSpacing:'0.06em',borderBottom:tab===tb.id?`2px solid ${door.color}`:'2px solid transparent',transition:'all 0.15s',display:'flex',alignItems:'center',gap:'6px'}}>
            {tb.label}
            {tb.count!=null && (
              <span style={{background:tb.alert?'#EF4444':(tab===tb.id?door.color:'rgba(255,255,255,0.1)'),color:(tb.alert||tab===tb.id)?'#fff':'#94A3B8',borderRadius:'999px',fontSize:'8px',fontWeight:700,padding:'1px 6px',minWidth:'16px',textAlign:'center',animation:tb.alert?'agent-blink 1.5s infinite':'none'}}>
                {tb.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{padding:'20px 24px'}}>
        <AnimatePresence mode="wait">

          {/* ── INSIGHTS TAB ── */}
          {tab==='insights' && (
            <motion.div key="insights" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <p style={{color:'#94A3B8',fontSize:'12px',margin:'0 0 12px'}}>
                {t('Click any insight to read the full SOLVEN analysis — what it means, why it matters, and what you gain by acting.', 'اضغط على أي رؤية لقراءة تحليل SOLVEN الكامل — ماذا تعني، ولماذا هي مهمة، وما الذي تكسبه بالتصرف بناءً عليها.')}
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {door.insights.map((ins,i)=>{
                  const isOpen = expandedInsight===i;
                  return (
                    <div key={i}>
                      <motion.div
                        onClick={()=>setExpandedInsight(isOpen?null:i)}
                        whileHover={{x:2}}
                        style={{
                          display:'flex',gap:'12px',alignItems:'flex-start',padding:'12px 14px',borderRadius:'11px',cursor:'pointer',
                          background:isOpen?`${ins.color}12`:i===0?`${ins.color}08`:'rgba(255,255,255,0.025)',
                          border:`1px solid ${isOpen?ins.color+'35':i===0?ins.color+'22':'rgba(255,255,255,0.05)'}`,
                          borderLeft:`3px solid ${ins.color}`,
                          transition:'all 0.2s',
                        }}>
                        <div style={{flexShrink:0,display:'flex',flexDirection:'column',gap:'3px',minWidth:'72px'}}>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',fontWeight:700,color:ins.color,background:`${ins.color}18`,borderRadius:'3px',padding:'2px 5px',textAlign:'center'}}>{ins.type}</div>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',color:PRIORITY_COLORS[ins.priority],background:`${PRIORITY_COLORS[ins.priority]}12`,borderRadius:'3px',padding:'2px 5px',textAlign:'center'}}>{ins.priority}</div>
                        </div>
                        <div style={{flex:1}}>
                          <p style={{color:'#CBD5E1',fontSize:'13px',lineHeight:1.55,margin:'0 0 8px',fontWeight:500}}>{ins.text}</p>
                          <div style={{display:'flex',gap:'10px'}}>
                            <ScoreMeter label={t('IMPACT','الأثر')} value={ins.impact} color={ins.color}/>
                            <ScoreMeter label={t('RISK IF IGNORED','المخاطرة عند التجاهل')} value={ins.risk} color={PRIORITY_COLORS[ins.priority]||'#F59E0B'}/>
                          </div>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:'5px',alignItems:'flex-end',flexShrink:0}}>
                          <button onClick={e=>{e.stopPropagation();}}
                            style={{background:`${ins.color}18`,border:`1px solid ${ins.color}35`,borderRadius:'7px',padding:'5px 12px',cursor:'pointer',color:ins.color,fontSize:'10px',fontWeight:700,whiteSpace:'nowrap'}}>
                            {ins.action}
                          </button>
                          <div style={{color:isOpen?ins.color:'#94A3B8',fontSize:'10px',display:'flex',alignItems:'center',gap:'3px',transition:'color 0.2s'}}>
                            <Info size={11}/> {isOpen?t('Close','إغلاق'):t('Full Analysis','التحليل الكامل')}
                          </div>
                        </div>
                      </motion.div>

                      {/* Expanded insight detail */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                            style={{overflow:'hidden',marginTop:'2px'}}>
                            <div style={{padding:'16px 18px',background:`${ins.color}08`,border:`1px solid ${ins.color}20`,borderRadius:'0 0 11px 11px',borderTop:'none',marginTop:'-2px'}}>
                              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
                                <div style={{padding:'12px',background:'rgba(255,255,255,0.04)',borderRadius:'9px',border:'1px solid rgba(255,255,255,0.06)'}}>
                                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'8px',color:'#10B981',letterSpacing:'0.12em',marginBottom:'6px',display:'flex',alignItems:'center',gap:'4px'}}>
                                    <Activity size={10}/> {t('WHAT THIS MEANS', 'ماذا يعني هذا')}
                                  </div>
                                  <p style={{color:'#CBD5E1',fontSize:'11px',lineHeight:1.6,margin:0}}>{ins.description}</p>
                                </div>
                                <div style={{padding:'12px',background:'rgba(16,185,129,0.06)',borderRadius:'9px',border:'1px solid rgba(16,185,129,0.15)'}}>
                                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'8px',color:'#10B981',letterSpacing:'0.12em',marginBottom:'6px',display:'flex',alignItems:'center',gap:'4px'}}>
                                    <CheckCircle size={10}/> {t('IF YOU ACT NOW', 'إذا تصرفت الآن')}
                                  </div>
                                  <p style={{color:'#CBD5E1',fontSize:'11px',lineHeight:1.6,margin:0}}>{ins.benefit}</p>
                                </div>
                                <div style={{padding:'12px',background:'rgba(239,68,68,0.06)',borderRadius:'9px',border:'1px solid rgba(239,68,68,0.15)'}}>
                                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'8px',color:'#EF4444',letterSpacing:'0.12em',marginBottom:'6px',display:'flex',alignItems:'center',gap:'4px'}}>
                                    <AlertTriangle size={10}/> {t('IF YOU IGNORE IT', 'إذا تجاهلت الأمر')}
                                  </div>
                                  <p style={{color:'#CBD5E1',fontSize:'11px',lineHeight:1.6,margin:0}}>{ins.consequence}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── ORDERS TAB ── */}
          {tab==='orders' && (
            <motion.div key="orders" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <p style={{color:'#94A3B8',fontSize:'12px',margin:'0 0 12px'}}>
                {t(`AI-generated execution orders for ${door.name}. Each shows impact and risk scores. Approve to execute — completed orders are logged below.`, `أوامر تنفيذ من إنشاء الذكاء الاصطناعي لـ ${door.name}. يعرض كل أمر درجات الأثر والمخاطرة. وافق للتنفيذ — يتم تسجيل الأوامر المكتملة أدناه.`)}
              </p>

              {/* Pending */}
              <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:executedLog.length?'16px':0}}>
                <AnimatePresence>
                  {pending.map(order=>(
                    <motion.div key={order.id} layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,x:-24,scale:0.96}}
                      style={{padding:'14px 16px',borderRadius:'12px',background:`${order.color}08`,border:`1px solid ${order.color}22`,borderLeft:`3px solid ${PRIORITY_COLORS[order.priority]||order.color}`}}>
                      <div style={{display:'flex',gap:'8px',alignItems:'flex-start',marginBottom:'8px'}}>
                        <div style={{flex:1}}>
                          <div style={{display:'flex',gap:'5px',alignItems:'center',marginBottom:'4px'}}>
                            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',fontWeight:700,color:PRIORITY_COLORS[order.priority],background:`${PRIORITY_COLORS[order.priority]}15`,borderRadius:'3px',padding:'2px 6px'}}>{order.priority}</span>
                          </div>
                          <div style={{color:'#fff',fontSize:'13px',fontWeight:600}}>{order.title}</div>
                        </div>
                      </div>
                      <p style={{color:'#94A3B8',fontSize:'11px',margin:'0 0 10px',lineHeight:1.55}}>{order.reason}</p>
                      <div style={{display:'flex',gap:'10px',marginBottom:'12px'}}>
                        <ScoreMeter label={t('IMPACT','الأثر')} value={order.impact} color={order.color}/>
                        <ScoreMeter label={t('RISK IF SKIPPED','المخاطرة عند التخطي')} value={order.risk} color={PRIORITY_COLORS[order.priority]||'#F59E0B'}/>
                      </div>
                      <div style={{display:'flex',gap:'6px'}}>
                        <button onClick={()=>executeOrder(order)}
                          style={{background:order.color,border:'none',borderRadius:'7px',padding:'7px 18px',cursor:'pointer',color:'#000',fontSize:'11px',fontWeight:800,display:'flex',alignItems:'center',gap:'4px',boxShadow:`0 4px 14px ${order.color}40`}}>
                          <Play size={10}/> {t('Execute','تنفيذ')}
                        </button>
                        <button onClick={()=>setDone(p=>({...p,[order.id]:true}))}
                          style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'7px',padding:'7px 12px',cursor:'pointer',color:'#94A3B8',fontSize:'11px'}}>
                          {t('Dismiss','تجاهل')}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {pending.length===0 && executedLog.length===0 && (
                  <div style={{textAlign:'center',padding:'28px',color:'#94A3B8',fontSize:'13px'}}>
                    <CheckCircle size={28} color="#10B981" style={{margin:'0 auto 10px',display:'block'}}/>
                    {t('All orders clear. SOLVEN is scanning for new opportunities.', 'جميع الأوامر منجزة. يقوم SOLVEN بالبحث عن فرص جديدة.')}
                  </div>
                )}
              </div>

              {/* ── Executed Log ── */}
              <AnimatePresence>
                {executedLog.length>0 && (
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}>
                    <div style={{padding:'12px 14px',background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'12px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'10px'}}>
                        <CheckCircle size={13} color="#10B981"/>
                        <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'9px',color:'#10B981',letterSpacing:'0.15em',fontWeight:700}}>{t('EXECUTED ORDERS LOG', 'سجل الأوامر المنفذة')}</span>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
                        {executedLog.map((o,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'7px 10px',background:'rgba(16,185,129,0.06)',borderRadius:'7px',border:'1px solid rgba(16,185,129,0.12)'}}>
                            <CheckCircle size={11} color="#10B981" style={{flexShrink:0}}/>
                            <span style={{color:'#CBD5E1',fontSize:'12px',flex:1}}>{o.title}</span>
                            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'8px',color:'#10B981'}}>{o.executedAt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── SCHEDULE TAB ── */}
          {tab==='schedule' && (
            <motion.div key="schedule" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <p style={{color:'#94A3B8',fontSize:'12px',margin:'0 0 14px'}}>
                {t(`SOLVEN-planned agenda for ${door.name}. Add items to your SOLVEN Calendar — synced across all doors.`, `أجندة مخططة من SOLVEN لـ ${door.name}. أضف العناصر إلى تقويم SOLVEN الخاص بك — متزامن عبر جميع الأبواب.`)}
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'16px'}}>
                {door.schedule.map((item,i)=>(
                  <motion.div key={item.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}
                    style={{display:'flex',gap:'14px',alignItems:'center',padding:'12px 16px',borderRadius:'10px',background:'rgba(255,255,255,0.025)',border:`1px solid rgba(255,255,255,0.06)`}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'13px',fontWeight:700,color:door.color,flexShrink:0,minWidth:'52px'}}>{item.time}</div>
                    <div style={{width:'8px',height:'8px',borderRadius:'50%',background:door.color,boxShadow:`0 0 10px ${door.color}`,flexShrink:0}}/>
                    <p style={{color:'#CBD5E1',fontSize:'13px',margin:0,flex:1}}>{item.text}</p>
                    <button
                      onClick={()=>{
                        const today = new Date();
                        const ds = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
                        onAddCalendarEvent({ id:`ev_${Date.now()}`, date:ds, time:item.time, title:item.text, door:item.door, color:item.color, type:'SCHEDULE' });
                      }}
                      style={{background:`${door.color}14`,border:`1px solid ${door.color}30`,borderRadius:'7px',padding:'5px 12px',cursor:'pointer',color:door.color,fontSize:'10px',fontWeight:700,flexShrink:0,display:'flex',alignItems:'center',gap:'4px'}}>
                      <Calendar size={10}/> + {t('Calendar','التقويم')}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Mini calendar preview after schedule list */}
              <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'14px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'10px'}}>
                  <Calendar size={12} color="#6366F1"/>
                  <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'9px',color:'#6366F1',letterSpacing:'0.15em',fontWeight:700}}>{t('SOLVEN CALENDAR PREVIEW', 'معاينة تقويم SOLVEN')}</span>
                  <span style={{color:'#94A3B8',fontSize:'10px',marginLeft:'auto'}}>{t('Click "SOLVEN Calendar" tab to open full calendar →', 'اضغط على تبويب "تقويم SOLVEN" لفتح التقويم الكامل ←')}</span>
                </div>
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                  {door.schedule.map((item,i)=>(
                    <div key={i} style={{padding:'5px 10px',borderRadius:'6px',background:`${door.color}10`,border:`1px solid ${door.color}25`,display:'flex',alignItems:'center',gap:'5px'}}>
                      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'9px',color:door.color,fontWeight:700}}>{item.time}</span>
                      <span style={{color:'#CBD5E1',fontSize:'10px'}}>{item.text.slice(0,30)}{item.text.length>30?'...':''}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Map active door to brain persona
const DOOR_PERSONA = { EDGE: 'signal', FORGE: 'strategist', ORACLE: 'oracle', NEXUS: 'operator' };

/* ════════════════════════ MAIN PAGE ════════════════════════ */
export default function TheAgent() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [activeDoor, setActiveDoor] = useState('EDGE');
  const [activeSection, setActiveSection] = useState('cockpit'); // cockpit | calendar | briefing
  const [calendarEvents, setCalendarEvents] = useState(SEED_EVENTS);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data?.user) setUserId(data.user.id); }).catch(() => {});
  }, []);
  const [messages, setMessages] = useState([{
    role:'agent',
    text:"Good morning, Operator. Full platform scan complete. EDGE: EURUSD above risk limit. FORGE: 3 inactive traders need re-engagement. ORACLE: 3 days behind schedule. NEXUS: @imad — 48h contact window. I've prepared 11 execution orders across all 4 doors. Select a door to dive in, or ask me anything.",
    time:new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}),
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [chatOpen, setChatOpen] = useState(true);
  const chatRef = useRef(null);
  const door = DOORS[activeDoor];

  useEffect(()=>{ const t=setInterval(()=>setClock(new Date()),1000); return()=>clearInterval(t); },[]);
  useEffect(()=>{ if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight; },[messages,isTyping]);

  function addCalendarEvent(ev) {
    setCalendarEvents(p=>{
      if(p.find(e=>e.id===ev.id)) return p;
      return [...p,ev];
    });
  }

  async function send() {
    if(!input.trim()) return;
    const text=input.trim(), time=clock.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
    const history = messages.map(m => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.text }));
    setMessages(p=>[...p,{role:'user',text,time}]);
    setInput(''); setIsTyping(true);
    try {
      const res = await fetch('/api/ai/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: DOOR_PERSONA[activeDoor] || 'strategist',
          messages: [...history, { role: 'user', content: text }],
          userId,
        }),
      });
      const data = await res.json();
      const reply = res.status === 429
        ? `⏳ ${data.error}`
        : (data.reply || data.content || data.result || AGENT_RESPONSES[Math.floor(Math.random()*AGENT_RESPONSES.length)]);
      setMessages(p=>[...p,{role:'agent',text:reply,time:new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}]);
    } catch {
      setMessages(p=>[...p,{role:'agent',text:AGENT_RESPONSES[Math.floor(Math.random()*AGENT_RESPONSES.length)],time:new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}]);
    } finally {
      setIsTyping(false);
    }
  }

  const totalOrders = Object.values(DOORS).reduce((n,d)=>n+d.orders.length,0);
  const todayEvents = calendarEvents.filter(e=>{
    const today=new Date(), ds=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    return e.date===ds;
  }).sort((a,b)=>a.time.localeCompare(b.time));

  const SECTION_TABS = [
    { id:'cockpit',  label:t('Command Cockpit','قمرة القيادة'), Icon:Cpu },
    { id:'calendar', label:t('SOLVEN Calendar','تقويم SOLVEN'), Icon:Calendar },
    { id:'briefing', label:t('Chief Briefing','الإحاطة التنفيذية'),  Icon:Brain },
  ];

  return (
    <div className="s4hud" style={{['--accent']:'#6366f1',color:'#fff',fontFamily:"'Space Grotesk',sans-serif",paddingBottom:'60px'}}>

      {/* ══ TOP HUD ══ */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="s4-glass spatial lift"
        style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:'16px',marginBottom:'16px',padding:'14px 24px'}}>
        <div style={{display:'flex',gap:'18px',alignItems:'center'}}>
          {Object.values(DOORS).map(d=>(
            <div key={d.id} style={{display:'flex',alignItems:'center',gap:'5px'}}>
              <div style={{width:'7px',height:'7px',borderRadius:'50%',background:d.color,boxShadow:`0 0 10px ${d.color}`,animation:'agent-pulse 2s infinite'}}/>
              <div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'8px',color:d.color,fontWeight:700}}>{d.name}</div>
                <div style={{fontSize:'8px',color:'#94A3B8'}}>{t('ACTIVE','نشط')}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'9px',letterSpacing:'0.35em',color:'#6366F1',marginBottom:'2px'}}>{t('AFEOS · AI OPERATING SYSTEM', 'AFEOS · نظام تشغيل الذكاء الاصطناعي')}</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'20px',fontWeight:900,color:'#fff',letterSpacing:'0.12em'}}>SOLVEN AI</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'8px',color:'#10B981',letterSpacing:'0.2em',marginTop:'1px'}}>{t('ALL 8 SKILLS · ALL DOORS MONITORED', 'كل المهارات الثمانية · جميع الأبواب مُراقبة')}</div>
        </div>
        <div style={{display:'flex',gap:'12px',alignItems:'center',justifyContent:'flex-end'}}>
          <div style={{textAlign:'right'}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'18px',fontWeight:900,color:'#6366F1'}}>{clock.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</div>
            <div style={{fontSize:'10px',color:'#94A3B8'}}>{clock.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</div>
          </div>
          {[{l:t('PLATFORM SCORE','درجة المنصة'),v:'71',c:'#6366F1'},{l:t('ORDERS PENDING','الأوامر المعلقة'),v:String(totalOrders),c:'#EF4444'},{l:t("TODAY'S EVENTS",'فعاليات اليوم'),v:String(todayEvents.length),c:'#D4A843'}].map(s=>(
            <div key={s.l} style={{background:`${s.c}12`,border:`1px solid ${s.c}25`,borderRadius:'10px',padding:'7px 12px',textAlign:'center'}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'18px',fontWeight:900,color:s.c}}>{s.v}</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',color:'#94A3B8',letterSpacing:'0.1em'}}>{s.l}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ══ SECTION TABS ══ */}
      <div style={{display:'flex',gap:'6px',marginBottom:'16px',background:'rgba(10,12,30,0.95)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'6px'}}>
        {SECTION_TABS.map(t=>(
          <button key={t.id} onClick={()=>setActiveSection(t.id)}
            style={{flex:1,padding:'10px 16px',borderRadius:'8px',border:'none',cursor:'pointer',background:activeSection===t.id?'rgba(99,102,241,0.2)':'transparent',color:activeSection===t.id?'#A5B4FC':'#94A3B8',fontSize:'12px',fontWeight:activeSection===t.id?700:400,fontFamily:"'Orbitron',sans-serif",letterSpacing:'0.06em',outline:activeSection===t.id?'1px solid rgba(99,102,241,0.35)':'none',transition:'all 0.15s',display:'flex',alignItems:'center',justifyContent:'center',gap:'7px'}}>
            <t.Icon size={13}/>{t.label}
          </button>
        ))}
      </div>

      {/* ══ CONTENT AREA ══ */}
      <div style={{display:'grid',gridTemplateColumns: chatOpen ? '1fr 320px' : '1fr auto',gap:'16px',alignItems:'start'}}>

        {/* ── LEFT: MAIN CONTENT ── */}
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <AnimatePresence mode="wait">

            {/* ══ COCKPIT SECTION ══ */}
            {activeSection==='cockpit' && (
              <motion.div key="cockpit" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                <div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'9px',letterSpacing:'0.35em',color:'#6366F1',marginBottom:'2px'}}>{t('YOUR COMPANY COCKPIT · SELECT A DOOR TO COMMAND', 'قمرة قيادة شركتك · اختر باباً للتحكم فيه')}</div>
                  <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:'22px',fontWeight:900,margin:'0 0 4px',background:'linear-gradient(135deg,#fff 0%,#A5B4FC 55%,#6366F1 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{t('SOLVEN COMMAND CENTER', 'مركز قيادة SOLVEN')}</h1>
                  <p style={{color:'#94A3B8',fontSize:'12px',margin:0}}>{t('Select a door to view AI insights, execute orders, and review your SOLVEN-planned schedule for that platform.', 'اختر باباً لعرض رؤى الذكاء الاصطناعي، وتنفيذ الأوامر، ومراجعة الجدول المخطط من SOLVEN لتلك المنصة.')}</p>
                </div>

                {/* 4 Door Buttons */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
                  {Object.entries(DOORS).map(([key,d])=>{
                    const active = activeDoor===key;
                    return (
                      <motion.button key={key} onClick={()=>setActiveDoor(key)}
                        whileHover={{scale:1.03,y:-2}} whileTap={{scale:0.98}}
                        style={{position:'relative',overflow:'hidden',background:active?`${d.color}18`:'rgba(10,12,30,0.95)',border:`2px solid ${active?d.color:d.color+'30'}`,borderRadius:'16px',padding:'18px 14px',cursor:'pointer',textAlign:'left',boxShadow:active?`0 0 40px ${d.glow},0 4px 24px rgba(0,0,0,0.3)`:'0 2px 12px rgba(0,0,0,0.2)',transition:'all 0.25s'}}>
                        {active && <motion.div layoutId="door-bar" style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:`linear-gradient(90deg,${d.color},${d.color}88)`}}/>}
                        {d.orders.length>0 && (
                          <div style={{position:'absolute',top:'10px',right:'10px',background:d.orders.some(o=>o.priority==='CRITICAL')?'#EF4444':'rgba(255,255,255,0.12)',borderRadius:'999px',minWidth:'18px',height:'18px',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Orbitron',sans-serif",fontSize:'9px',fontWeight:700,color:'#fff',padding:'0 4px',animation:d.orders.some(o=>o.priority==='CRITICAL')?'agent-blink 1.5s infinite':'none'}}>
                            {d.orders.length}
                          </div>
                        )}
                        <div style={{width:'38px',height:'38px',borderRadius:'10px',background:`${d.color}18`,border:`1px solid ${d.color}35`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'10px',boxShadow:active?`0 0 20px ${d.color}40`:'none'}}>
                          <d.Icon size={20} color={d.color}/>
                        </div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'11px',fontWeight:900,color:active?'#fff':'#CBD5E1',letterSpacing:'0.06em',marginBottom:'2px'}}>{d.name}</div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',color:d.color,letterSpacing:'0.15em',marginBottom:'10px'}}>{d.subtitle}</div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px'}}>
                          {d.stats.slice(0,2).map((s,i)=>(
                            <div key={i} style={{background:'rgba(255,255,255,0.04)',borderRadius:'6px',padding:'5px 7px'}}>
                              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'11px',fontWeight:700,color:s.up?'#10B981':'#F59E0B'}}>{s.value}</div>
                              <div style={{fontSize:'9px',color:'#94A3B8',marginTop:'1px'}}>{s.label}</div>
                            </div>
                          ))}
                        </div>
                        {active && (
                          <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{marginTop:'8px',fontFamily:"'Orbitron',sans-serif",fontSize:'8px',color:d.color,letterSpacing:'0.12em',display:'flex',alignItems:'center',gap:'4px'}}>
                            <div style={{width:'5px',height:'5px',borderRadius:'50%',background:d.color,boxShadow:`0 0 8px ${d.color}`}}/> {t('SELECTED','مُحدد')}
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Active Door Detail */}
                <AnimatePresence mode="wait">
                  <DoorDetail key={activeDoor} door={DOORS[activeDoor]} onAddCalendarEvent={addCalendarEvent}/>
                </AnimatePresence>
              </motion.div>
            )}

            {/* ══ CALENDAR SECTION ══ */}
            {activeSection==='calendar' && (
              <motion.div key="calendar" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                <div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'9px',letterSpacing:'0.35em',color:'#6366F1',marginBottom:'2px'}}>{t('SOLVEN AI · SYNCED SCHEDULE', 'SOLVEN AI · جدول متزامن')}</div>
                  <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:'22px',fontWeight:900,margin:'0 0 4px',background:'linear-gradient(135deg,#fff,#A5B4FC)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{t('COMMAND CALENDAR', 'تقويم القيادة')}</h2>
                  <p style={{color:'#94A3B8',fontSize:'12px',margin:0}}>{t('All 4 doors, AI orders, and SOLVEN-planned events in one synced view. Add any schedule item from any door with one click.', 'جميع الأبواب الأربعة وأوامر الذكاء الاصطناعي والفعاليات المخططة من SOLVEN في عرض متزامن واحد. أضف أي عنصر جدول من أي باب بنقرة واحدة.')}</p>
                </div>

                {/* Today's summary bar */}
                <div style={{background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'12px',padding:'12px 18px',display:'flex',gap:'16px',alignItems:'center',flexWrap:'wrap'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                    <Clock size={13} color="#6366F1"/>
                    <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'9px',color:'#6366F1',fontWeight:700,letterSpacing:'0.12em'}}>{t('TODAY','اليوم')}</span>
                  </div>
                  {todayEvents.slice(0,5).map(ev=>(
                    <div key={ev.id} style={{display:'flex',alignItems:'center',gap:'5px',padding:'4px 8px',background:`${ev.color}12`,border:`1px solid ${ev.color}25`,borderRadius:'6px'}}>
                      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'9px',color:ev.color,fontWeight:700}}>{ev.time}</span>
                      <span style={{color:'#CBD5E1',fontSize:'10px'}}>{ev.title.slice(0,28)}{ev.title.length>28?'...':''}</span>
                    </div>
                  ))}
                  {todayEvents.length===0 && <span style={{color:'#94A3B8',fontSize:'11px'}}>{t("No events today — add from any door's schedule tab", 'لا توجد فعاليات اليوم — أضف من تبويب الجدول لأي باب')}</span>}
                </div>

                <div className="s4-glass spatial lift" style={{padding:'22px'}}>
                  <SolvenCalendar events={calendarEvents} onAddEvent={addCalendarEvent}/>
                </div>
              </motion.div>
            )}

            {/* ══ BRIEFING SECTION ══ */}
            {activeSection==='briefing' && (
              <motion.div key="briefing" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                <div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'9px',letterSpacing:'0.35em',color:'#6366F1',marginBottom:'2px'}}>{t('SOLVEN AI · EXECUTIVE INTELLIGENCE', 'SOLVEN AI · ذكاء تنفيذي')}</div>
                  <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:'22px',fontWeight:900,margin:'0 0 4px',background:'linear-gradient(135deg,#fff,#A5B4FC)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{t('CHIEF BRIEFING', 'الإحاطة التنفيذية')}</h2>
                  <p style={{color:'#94A3B8',fontSize:'12px',margin:0}}>{t("SOLVEN's ranked action plan for today — ordered by revenue impact, risk, and time sensitivity across all 4 doors.", 'خطة عمل SOLVEN المرتبة لليوم — مرتبة حسب الأثر على الإيرادات، والمخاطرة، والحساسية الزمنية عبر الأبواب الأربعة.')}</p>
                </div>

                {/* ── Chief Recommendations — ranked list ── */}
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  {CHIEF_RECOMMENDATIONS.map((rec,i)=>(
                    <motion.div key={i} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}}
                      style={{
                        display:'flex',gap:'16px',alignItems:'stretch',padding:'16px 18px',
                        background:i===0?`${rec.color}0E`:'rgba(10,12,30,0.95)',
                        border:`1px solid ${i===0?rec.color+'30':'rgba(255,255,255,0.06)'}`,
                        borderLeft:`4px solid ${rec.color}`,
                        borderRadius:'14px',
                        boxShadow:i===0?`0 0 30px ${rec.color}12`:'none',
                      }}>
                      {/* Rank */}
                      <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px',minWidth:'36px'}}>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'22px',fontWeight:900,color:i===0?rec.color:'#94A3B8',lineHeight:1}}>{rec.rank}</div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',color:'#94A3B8',letterSpacing:'0.1em'}}>{t('RANK','الترتيب')}</div>
                      </div>

                      <div style={{width:'1px',background:'rgba(255,255,255,0.06)',flexShrink:0}}/>

                      {/* Content */}
                      <div style={{flex:1}}>
                        <div style={{display:'flex',gap:'6px',alignItems:'center',marginBottom:'5px',flexWrap:'wrap'}}>
                          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',fontWeight:700,color:PRIORITY_COLORS[rec.priority],background:`${PRIORITY_COLORS[rec.priority]}15`,borderRadius:'3px',padding:'2px 6px',animation:rec.priority==='CRITICAL'?'agent-blink 1.5s infinite':'none'}}>{rec.priority}</span>
                          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',color:rec.color,background:`${rec.color}15`,borderRadius:'3px',padding:'2px 6px'}}>{rec.door}</span>
                          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',color:'#94A3B8',background:'rgba(255,255,255,0.06)',borderRadius:'3px',padding:'2px 6px',display:'flex',alignItems:'center',gap:'3px'}}>
                            <Clock size={8}/> {rec.timeframe}
                          </span>
                        </div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'13px',fontWeight:800,color:'#fff',marginBottom:'5px',letterSpacing:'0.03em'}}>{rec.title}</div>
                        <p style={{color:'#CBD5E1',fontSize:'12px',lineHeight:1.6,margin:'0 0 10px'}}>{rec.why}</p>
                        <div style={{display:'flex',gap:'10px'}}>
                          <ScoreMeter label={t('IMPACT','الأثر')} value={rec.impact} color={rec.color}/>
                          <ScoreMeter label={t('RISK IF SKIPPED','المخاطرة عند التخطي')} value={rec.risk} color={PRIORITY_COLORS[rec.priority]}/>
                        </div>
                      </div>

                      {/* Right metrics */}
                      <div style={{flexShrink:0,display:'flex',flexDirection:'column',gap:'8px',alignItems:'flex-end',justifyContent:'center',minWidth:'110px'}}>
                        <div style={{background:`${rec.color}15`,border:`1px solid ${rec.color}30`,borderRadius:'8px',padding:'8px 12px',textAlign:'center'}}>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'13px',fontWeight:900,color:rec.color}}>{rec.revenue}</div>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',color:'#94A3B8',marginTop:'1px'}}>{t('EXPECTED','متوقع')}</div>
                        </div>
                        <div style={{fontSize:'10px',color:'#94A3B8',display:'flex',alignItems:'center',gap:'3px'}}>
                          <Zap size={9} color="#F59E0B"/> {t('Effort','الجهد')}: {rec.effort}
                        </div>
                        <button onClick={()=>{setActiveDoor(rec.door); setActiveSection('cockpit');}}
                          style={{background:rec.color,border:'none',borderRadius:'7px',padding:'6px 14px',cursor:'pointer',color:'#000',fontSize:'10px',fontWeight:800,display:'flex',alignItems:'center',gap:'4px'}}>
                          {t('Act Now','تصرف الآن')} <ArrowRight size={10}/>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 4-door briefing grid */}
                <div className="s4-glass spatial lift" style={{padding:'20px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
                    <Brain size={14} color="#6366F1"/>
                    <span className="s4-label s4-accent">{t('SOLVEN DAILY BRIEFING — ALL 4 DOORS', 'إحاطة SOLVEN اليومية — كل الأبواب الأربعة')}</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
                    {Object.entries(DOORS).map(([key,d])=>(
                      <button key={key} onClick={()=>{setActiveDoor(key);setActiveSection('cockpit');}}
                        style={{padding:'14px',borderRadius:'12px',background:`${d.color}08`,border:`1px solid ${d.color}20`,cursor:'pointer',textAlign:'left',transition:'all 0.15s'}}
                        onMouseEnter={e=>{e.currentTarget.style.background=`${d.color}15`;e.currentTarget.style.borderColor=`${d.color}35`;}}
                        onMouseLeave={e=>{e.currentTarget.style.background=`${d.color}08`;e.currentTarget.style.borderColor=`${d.color}20`;}}>
                        <d.Icon size={14} color={d.color} style={{display:'block',marginBottom:'7px'}}/>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'9px',color:d.color,fontWeight:700,marginBottom:'5px'}}>{d.name}</div>
                        <p style={{color:'#CBD5E1',fontSize:'10px',lineHeight:1.55,margin:'0 0 8px'}}>{d.insights[0].text.slice(0,65)}...</p>
                        <div style={{display:'flex',gap:'8px'}}>
                          <div style={{flex:1}}>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:'8px',marginBottom:'2px'}}>
                              <span style={{color:'#94A3B8'}}>{t('Impact','الأثر')}</span>
                              <span style={{color:d.color,fontWeight:700}}>{d.insights[0].impact}%</span>
                            </div>
                            <div style={{height:'3px',borderRadius:'2px',background:'rgba(255,255,255,0.06)',overflow:'hidden'}}>
                              <div style={{width:`${d.insights[0].impact}%`,height:'100%',background:d.color,borderRadius:'2px'}}/>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── RIGHT: SOLVEN CHAT (collapsible) ── */}
        <div style={{display:'flex',flexDirection:'column',gap:'0',position:'sticky',top:0}}>
          <AnimatePresence>
            {chatOpen && (
              <motion.div initial={{opacity:0,width:0}} animate={{opacity:1,width:320}} exit={{opacity:0,width:0}}
                className="s4-glass" style={{ borderColor:'rgba(99,102,241,0.2)', overflow:'hidden', width:'320px' }}>

                {/* Chat header */}
                <div style={{padding:'14px 16px',background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.05))',borderBottom:'1px solid rgba(99,102,241,0.15)',display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'linear-gradient(135deg,#6366F1,#818CF8)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 0 20px rgba(99,102,241,0.5)'}}>
                    <Brain size={18} color="#fff"/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'11px',fontWeight:700,color:'#fff',letterSpacing:'0.1em'}}>SOLVEN AI</div>
                    <div style={{fontSize:'10px',color:'#10B981',display:'flex',alignItems:'center',gap:'4px'}}>
                      <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#10B981',animation:'agent-pulse 1.5s infinite'}}/> {t('8 skills active · All doors', '8 مهارات نشطة · جميع الأبواب')}
                    </div>
                  </div>
                  <button onClick={()=>setChatOpen(false)}
                    style={{background:'rgba(255,255,255,0.06)',border:'none',borderRadius:'7px',width:'26px',height:'26px',cursor:'pointer',color:'#94A3B8',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <X size={12}/>
                  </button>
                </div>

                {/* Skills pills */}
                <div style={{padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',gap:'4px',flexWrap:'wrap'}}>
                  {CSUITE_SKILLS.map(s=>(
                    <div key={s.label} style={{display:'flex',alignItems:'center',gap:'3px',padding:'3px 7px',borderRadius:'20px',background:`${s.color}12`,border:`1px solid ${s.color}25`}}>
                      <s.Icon size={8} color={s.color}/>
                      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',color:s.color,fontWeight:700}}>{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Messages */}
                <div ref={chatRef} style={{height:'340px',overflowY:'auto',padding:'14px',display:'flex',flexDirection:'column',gap:'10px'}}>
                  {messages.map((msg,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:msg.role==='user'?'flex-end':'flex-start',gap:'7px'}}>
                      {msg.role==='agent' && (
                        <div style={{width:'26px',height:'26px',borderRadius:'50%',background:'linear-gradient(135deg,#6366F1,#818CF8)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 0 10px rgba(99,102,241,0.4)'}}>
                          <Brain size={13} color="#fff"/>
                        </div>
                      )}
                      <div style={{maxWidth:'85%'}}>
                        <div style={{padding:'9px 12px',fontSize:'12px',lineHeight:1.6,color:'#CBD5E1',borderRadius:msg.role==='user'?'10px 10px 3px 10px':'10px 10px 10px 3px',background:msg.role==='user'?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.04)',border:`1px solid ${msg.role==='user'?'rgba(99,102,241,0.32)':'rgba(255,255,255,0.07)'}`}}>
                          {msg.text}
                        </div>
                        {msg.time && <div style={{color:'#94A3B8',fontSize:'9px',marginTop:'3px',textAlign:msg.role==='user'?'right':'left'}}>{msg.time}</div>}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div style={{display:'flex',gap:'7px',alignItems:'center'}}>
                      <div style={{width:'26px',height:'26px',borderRadius:'50%',background:'linear-gradient(135deg,#6366F1,#818CF8)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <Brain size={13} color="#fff"/>
                      </div>
                      <div style={{padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',display:'flex',gap:'4px',alignItems:'center'}}>
                        {[0,1,2].map(d=><div key={d} style={{width:'5px',height:'5px',borderRadius:'50%',background:'#6366F1',animation:`agent-bounce 1.2s ${d*0.2}s infinite`}}/>)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick prompts */}
                <div style={{padding:'8px 12px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',gap:'4px',flexWrap:'wrap'}}>
                  {['Full briefing','Top priority?','Risk report','Revenue forecast','Today\'s plan'].map(q=>(
                    <button key={q} onClick={()=>setInput(q)}
                      style={{padding:'4px 8px',borderRadius:'6px',border:'1px solid rgba(99,102,241,0.25)',background:'rgba(99,102,241,0.08)',color:'#A5B4FC',fontSize:'10px',cursor:'pointer',fontWeight:600,transition:'all 0.12s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.18)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(99,102,241,0.08)'}>
                      {q}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div style={{padding:'12px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',gap:'8px'}}>
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
                    placeholder={t('Ask SOLVEN anything...','اسأل SOLVEN أي شيء...')}
                    style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'10px 13px',color:'#fff',fontSize:'12px',outline:'none'}}
                  />
                  <button onClick={send}
                    style={{background:'linear-gradient(135deg,#6366F1,#818CF8)',border:'none',borderRadius:'10px',width:'40px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,boxShadow:'0 4px 16px rgba(99,102,241,0.4)'}}>
                    <Send size={15} color="#fff"/>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat toggle when closed */}
          {!chatOpen && (
            <motion.button initial={{opacity:0}} animate={{opacity:1}}
              onClick={()=>setChatOpen(true)}
              style={{
                background:'linear-gradient(135deg,#6366F1,#818CF8)', border:'none',
                borderRadius:'12px', padding:'12px 14px', cursor:'pointer',
                display:'flex', alignItems:'center', gap:'8px',
                boxShadow:'0 4px 20px rgba(99,102,241,0.3)',
              }}>
              <Brain size={16} color="#fff"/>
              <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'10px',color:'#fff',fontWeight:700,writingMode:'vertical-rl',transform:'rotate(180deg)',letterSpacing:'0.1em'}}>{t('ASK SOLVEN','اسأل SOLVEN')}</span>
            </motion.button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes agent-pulse { 0%,100%{opacity:1}50%{opacity:0.35} }
        @keyframes agent-bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)} }
        @keyframes agent-blink { 0%,100%{opacity:1}50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
