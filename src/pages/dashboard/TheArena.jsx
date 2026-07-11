import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Crown, Share2, Search, Star, Target, Gift,
  Flame, Shield, Award, ChevronRight, Lock, CheckCircle2, Timer,
  TrendingUp, Users, BookOpen, Building2, Swords, Medal, X,
  CheckCircle, ArrowRight, Calendar, DollarSign, BarChart2, Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

/* ── RANK SYSTEM ── */
const RANKS = [
  { name:'The Curious',  color:'#8899B4', emoji:'👁️',  bg:'rgba(136,153,180,0.08)', minXP:0,     maxXP:500,   perks:['Basic signal access','Community forum'] },
  { name:'The Hooked',   color:'#06B6D4', emoji:'🎣',  bg:'rgba(59,130,246,0.08)',  minXP:500,   maxXP:2000,  perks:['Priority signals','Weekly brief'] },
  { name:'The Obsessed', color:'#10B981', emoji:'🔥',  bg:'rgba(16,185,129,0.08)',  minXP:2000,  maxXP:5000,  perks:['SOLVEN AI full access','Monthly reward'] },
  { name:'The Addict',   color:'#F97316', emoji:'💊',  bg:'rgba(249,115,22,0.08)',  minXP:5000,  maxXP:12000, perks:['1-on-1 coaching session','Custom signals'] },
  { name:'The Dealer',   color:'#D4A843', emoji:'💰',  bg:'rgba(212,168,67,0.08)',  minXP:12000, maxXP:30000, perks:['Revenue share bonus','Elite IB status'] },
  { name:'The Legend',   color:'#A855F7', emoji:'👑',  bg:'rgba(168,85,247,0.08)',  minXP:30000, maxXP:null,  perks:['Annual prize pool','S4 Legend NFT badge','SOLVEN Board access'] },
];

/* ── MOCK LEADERBOARD ── */
const MOCK_BOARD = [
  { id:'l1', full_name:'Ahmad Al-Legend',   rank:'The Legend',   xp:48200, country:'SA', door_score:{ edge:12400, forge:18600, oracle:8200, nexus:9000 } },
  { id:'l2', full_name:'Omar Al-Dealer',    rank:'The Dealer',   xp:24100, country:'AE', door_score:{ edge:6200, forge:9800, oracle:3600, nexus:4500 } },
  { id:'l3', full_name:'Khalid Obsessed',   rank:'The Obsessed', xp:11600, country:'EG', door_score:{ edge:3400, forge:4200, oracle:2000, nexus:2000 } },
  { id:'l4', full_name:'Sara Al-Addict',    rank:'The Addict',   xp:7800,  country:'KW', door_score:{ edge:2400, forge:2600, oracle:1400, nexus:1400 } },
  { id:'l5', full_name:'Yousef Al-Hooked',  rank:'The Hooked',   xp:3200,  country:'QA', door_score:{ edge:900,  forge:1100, oracle:600,  nexus:600  } },
  { id:'l6', full_name:'Layla Curious',     rank:'The Curious',  xp:740,   country:'BH', door_score:{ edge:200,  forge:280,  oracle:140,  nexus:120  } },
  { id:'l7', full_name:'Tariq The Hooked',  rank:'The Hooked',   xp:1840,  country:'JO', door_score:{ edge:500,  forge:700,  oracle:320,  nexus:320  } },
  { id:'l8', full_name:'Nadia Curious',     rank:'The Curious',  xp:420,   country:'OM', door_score:{ edge:120,  forge:160,  oracle:80,   nexus:60   } },
];

/* ── ACHIEVEMENTS  — note: Icon key (capital I) ── */
const ACHIEVEMENTS = [
  { id:'a1', name:'First Signal',      desc:'Follow your first trading signal',                  Icon:Zap,       color:'#06B6D4', xp:50,   earned:true,  earnedDate:'Jan 15' },
  { id:'a2', name:'Trade Streak',      desc:'Complete 7 days of active trading',                 Icon:Flame,     color:'#F97316', xp:200,  earned:true,  earnedDate:'Feb 2' },
  { id:'a3', name:'IB Recruit',        desc:'Refer your first IB to the network',                Icon:Users,     color:'#D4A843', xp:300,  earned:true,  earnedDate:'Feb 20' },
  { id:'a4', name:'Academy Graduate',  desc:'Complete your first ORACLE course',                 Icon:Award,     color:'#10B981', xp:250,  earned:false, hint:'Complete Lesson 5 to unlock' },
  { id:'a5', name:'Vault Master',      desc:'Accumulate $10,000 in your vault',                  Icon:Shield,    color:'#10B981', xp:500,  earned:false, hint:'$7,840 to go' },
  { id:'a6', name:'Dealer Status',     desc:'Reach The Dealer rank',                             Icon:Crown,     color:'#D4A843', xp:1000, earned:false, hint:'8,600 XP to go' },
  { id:'a7', name:'NEXUS Builder',     desc:'Close 10 business deals in NEXUS',                  Icon:Building2, color:'#EF4444', xp:400,  earned:false, hint:'2 deals closed · 8 remaining' },
  { id:'a8', name:'Market Oracle',     desc:'Hit 80%+ signal accuracy for 30 days',              Icon:TrendingUp,color:'#6366F1', xp:750,  earned:false, hint:'Current: 74% accuracy' },
  { id:'a9', name:'Network Effect',    desc:'Reach 50 active traders in your FORGE network',     Icon:Users,     color:'#D4A843', xp:600,  earned:false, hint:'23 traders active · 27 to go' },
  { id:'a10',name:'SOLVEN Scholar',    desc:'Complete 20 ORACLE lessons',                        Icon:BookOpen,  color:'#10B981', xp:350,  earned:false, hint:'8 lessons completed' },
  { id:'a11',name:'Consistent Edge',   desc:'Execute 100 trades with positive R:R',              Icon:Target,    color:'#06B6D4', xp:500,  earned:false, hint:'67 trades completed' },
  { id:'a12',name:'Season Champion',   desc:'Finish in top 10 at end of any season',             Icon:Trophy,    color:'#A855F7', xp:2000, earned:false, hint:'Current position: #12' },
];

/* ── ACTIVE CHALLENGES ── */
const CHALLENGES = [
  {
    id:'c1', name:'EDGE Weekly Challenge', door:'EDGE', color:'#06B6D4', Icon:TrendingUp, type:'weekly',
    desc:'Execute 5 winning trades this week using SOLVEN4 signals. Each trade must have a minimum 1.5R reward-to-risk ratio.',
    reward:'500 XP + $50 Signal Credit', progress:3, total:5, deadline:'3 days',
    participants:234, joined:true,
    rules:['Minimum 1.5R per trade','Use S4 EDGE signals only','No revenge trades after SL hit','Max 2 trades per day'],
    milestones:[
      { at:2, label:'2 Wins', reward:'+100 XP bonus' },
      { at:4, label:'4 Wins', reward:'+200 XP bonus' },
      { at:5, label:'Complete!', reward:'500 XP + $50' },
    ],
    leaderboard:[
      { name:'Ahmad R.', progress:5, rank:1 },
      { name:'Sara K.', progress:4, rank:2 },
      { name:'Omar F.', progress:3, rank:3 },
    ],
  },
  {
    id:'c2', name:'FORGE Network Sprint', door:'FORGE', color:'#D4A843', Icon:Users, type:'weekly',
    desc:'Recruit 3 new verified traders to your IB network this week. Each recruit must complete profile setup and make a first deposit.',
    reward:'800 XP + Commission Bonus', progress:1, total:3, deadline:'6 days',
    participants:178, joined:true,
    rules:['Traders must complete KYC','First deposit required to count','Use your personal FORGE referral link','Max 1 recruit from same household'],
    milestones:[
      { at:1, label:'1st Recruit', reward:'+150 XP' },
      { at:2, label:'2nd Recruit', reward:'+250 XP' },
      { at:3, label:'Complete!', reward:'800 XP + Commission Boost' },
    ],
    leaderboard:[
      { name:'Layla H.', progress:3, rank:1 },
      { name:'Kareem N.', progress:2, rank:2 },
      { name:'You', progress:1, rank:3 },
    ],
  },
  {
    id:'c3', name:'ORACLE Master Test', door:'ORACLE', color:'#10B981', Icon:BookOpen, type:'monthly',
    desc:'Score 90% or higher on the Risk Management Certification exam. Only one attempt counts — prepare thoroughly before attempting.',
    reward:'600 XP + Academy Badge', progress:0, total:1, deadline:'8 days',
    participants:412, joined:false,
    rules:['One attempt per challenge period','Score must be 90% or higher','Complete all 5 module lessons first','2-hour time limit on exam'],
    milestones:[
      { at:1, label:'Pass at 90%+', reward:'600 XP + ORACLE Badge' },
    ],
    leaderboard:[
      { name:'Nour A.', progress:1, rank:1 },
      { name:'Sara K.', progress:0, rank:2 },
    ],
  },
  {
    id:'c4', name:'NEXUS Revenue Run', door:'NEXUS', color:'#EF4444', Icon:Building2, type:'monthly',
    desc:'Generate $2,000 in verified NEXUS business revenue this month through licensed deals, client referrals, or enterprise contracts.',
    reward:'1200 XP + Revenue Bonus', progress:1340, total:2000, deadline:'12 days',
    participants:89, joined:true, isMoney:true,
    rules:['Revenue must be verified by NEXUS ops team','Includes: licenses, referrals, enterprise deals','No self-referrals','Disputes resolved within 48h'],
    milestones:[
      { at:500,  label:'$500 Generated', reward:'+200 XP' },
      { at:1000, label:'$1,000 Generated', reward:'+400 XP' },
      { at:2000, label:'Complete!', reward:'1200 XP + Revenue Bonus' },
    ],
    leaderboard:[
      { name:'Kareem N.', progress:2000, rank:1 },
      { name:'Ahmad R.', progress:1800, rank:2 },
      { name:'You', progress:1340, rank:3 },
    ],
  },
  /* BONUS: extra innovative challenges */
  {
    id:'c5', name:'Cross-Door Mastery', door:'ALL', color:'#6366F1', Icon:Sparkles, type:'special',
    desc:'The ultimate SOLVEN4 challenge: complete one task in all 4 doors in a single week. Win 3 signals + 2 ORACLE lessons + 1 FORGE recruitment = claim the cross-door bonus.',
    reward:'2,000 XP + Cross-Door Badge + $100 Vault Credit', progress:2, total:4, deadline:'5 days',
    participants:56, joined:false,
    rules:['Must complete in calendar week (Mon–Sun)','Each door task must be verified','All 4 doors must be active subscriptions'],
    milestones:[
      { at:2, label:'2 Doors', reward:'+300 XP' },
      { at:4, label:'All 4 Doors!', reward:'2000 XP + Badge + $100' },
    ],
    leaderboard:[
      { name:'Ahmad R.', progress:4, rank:1 },
    ],
  },
  {
    id:'c6', name:'The MENA Blitz', door:'FORGE', color:'#D4A843', Icon:Medal, type:'special',
    desc:'Refer 5 traders specifically from GCC countries (UAE, KSA, Kuwait, Qatar, Bahrain, Oman). MENA-specific challenge with regional bonus payout.',
    reward:'1,500 XP + 25% Commission Boost for 60 days', progress:2, total:5, deadline:'18 days',
    participants:143, joined:false,
    rules:['Traders must be GCC residents (verified by ID)','Must complete first trade within 30 days of joining','Commission boost applied to your FORGE account immediately upon completion'],
    milestones:[
      { at:2, label:'2 GCC Traders', reward:'+200 XP' },
      { at:5, label:'Complete!', reward:'1500 XP + 60-day boost' },
    ],
    leaderboard:[
      { name:'Layla H.', progress:5, rank:1 },
      { name:'Omar F.', progress:3, rank:2 },
      { name:'You', progress:2, rank:3 },
    ],
  },
];

/* ── PRIZE POOLS ── */
const PRIZES = [
  { id:'p1', name:'Monthly Champion',   prize:'$2,000 Cash',          color:'#D4A843', Icon:Crown,     end:'Jul 31',  participants:284, rank:7,   type:'cash',
    desc:'Top-ranked operator by XP at month end wins $2,000 USD deposited directly to their SOLVEN4 Vault.',
    eligibility:'Minimum 500 XP required · All ranks eligible',
    joined:false,
    steps:['Accumulate maximum XP across all 4 doors','Complete challenges for bonus XP multipliers','Maintain top-10 position through month end'],
  },
  { id:'p2', name:'EDGE Trader Cup',    prize:'$500 + 5,000 XP',     color:'#06B6D4', Icon:TrendingUp,end:'Aug 15',  participants:147, rank:23, type:'mixed',
    desc:'The highest win-rate trader on EDGE signals over a 30-day period wins $500 cash + 5,000 XP.',
    eligibility:'Active EDGE subscription required · Min 20 trades',
    joined:true,
    steps:['Execute at least 20 trades using S4 EDGE signals','Maintain highest win-rate among participants','Keep your daily trade journal updated in EDGE'],
  },
  { id:'p3', name:'FORGE IB League',    prize:'Commission 2× Boost',  color:'#D4A843', Icon:Users,     end:'Aug 31',  participants:98,  rank:4,  type:'multiplier',
    desc:'Top 3 FORGE IBs by active trader count earn a 2× commission multiplier for 90 days.',
    eligibility:'FORGE Operator plan required · Min 10 active traders',
    joined:true,
    steps:['Grow your verified active trader count in FORGE','Quality over quantity — inactive traders are excluded','Daily leaderboard updates at midnight GST'],
  },
  { id:'p4', name:'S4 Legend Season',   prize:'Legend NFT + $5,000',  color:'#A855F7', Icon:Medal,     end:'Sep 30',  participants:1247,rank:12, type:'special',
    desc:'The greatest prize in SOLVEN4. Top 3 Legends share a $15,000 pool. #1 wins $5,000 + exclusive NFT + SOLVEN Board advisory seat.',
    eligibility:'Must reach The Legend rank · Season pass required',
    joined:false,
    steps:['Reach "The Legend" rank (30,000+ XP)','Maintain top position through Sep 30','Win doors, challenges and prizes for season multipliers'],
  },
];

const DOOR_TABS = [
  { id:'global', label:'Global', color:'#6366F1', Icon:Trophy },
  { id:'edge',   label:'EDGE',   color:'#06B6D4', Icon:TrendingUp },
  { id:'forge',  label:'FORGE',  color:'#D4A843', Icon:Users },
  { id:'oracle', label:'ORACLE', color:'#10B981', Icon:BookOpen },
  { id:'nexus',  label:'NEXUS',  color:'#EF4444', Icon:Building2 },
];
const PAGE_TABS = ['leaderboard','challenges','achievements','prizes'];
const S = { bg:'#03080F', surface:'rgba(11,18,32,0.9)', border:'rgba(255,255,255,0.06)', muted:'#8899B4' };

function getRankForXP(xp) { return RANKS.slice().reverse().find(r=>xp>=r.minXP) ?? RANKS[0]; }
function getNextRank(xp)  { return RANKS.find(r=>r.minXP>xp); }

/* ── CHALLENGE DETAIL MODAL ── */
function ChallengeModal({ challenge, onClose, onJoin }) {
  const pct = Math.min(100, Math.round((challenge.progress / challenge.total) * 100));
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(3,8,15,0.85)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <motion.div initial={{ scale:0.93, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.93, y:20 }}
        onClick={e=>e.stopPropagation()}
        style={{ background:'rgba(6,13,24,0.98)', border:`1px solid ${challenge.color}30`, borderRadius:'24px', padding:'28px', maxWidth:'640px', width:'100%', maxHeight:'90vh', overflowY:'auto', backdropFilter:'blur(24px)' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
          <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:`${challenge.color}15`, border:`1px solid ${challenge.color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <challenge.Icon size={22} style={{ color:challenge.color }} />
            </div>
            <div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:challenge.color, fontWeight:700, letterSpacing:'0.12em', marginBottom:'3px' }}>
                {challenge.door} · {challenge.type.toUpperCase()}
              </div>
              <div style={{ color:'#fff', fontSize:'17px', fontWeight:800 }}>{challenge.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'8px', padding:'7px', cursor:'pointer', color:S.muted }}>
            <X size={16} />
          </button>
        </div>

        {/* Progress */}
        <div style={{ background:`${challenge.color}08`, border:`1px solid ${challenge.color}18`, borderRadius:'14px', padding:'16px', marginBottom:'18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
            <span style={{ color:'#CBD5E1', fontSize:'12px', fontWeight:700 }}>Your Progress</span>
            <span style={{ color:challenge.color, fontSize:'12px', fontWeight:700 }}>
              {challenge.isMoney
                ? `$${challenge.progress.toLocaleString()} / $${challenge.total.toLocaleString()}`
                : `${challenge.progress} / ${challenge.total}`}
            </span>
          </div>
          <div style={{ height:'8px', borderRadius:'4px', background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8 }}
              style={{ height:'100%', background:`linear-gradient(90deg,${challenge.color}70,${challenge.color})`, borderRadius:'4px' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'5px', fontSize:'10px', color:S.muted }}>
            <span>{pct}% complete</span>
            <span style={{ color:'#F97316', display:'flex', alignItems:'center', gap:'3px' }}><Timer size={10} /> {challenge.deadline} remaining</span>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom:'18px' }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:S.muted, letterSpacing:'0.12em', fontWeight:700, marginBottom:'8px' }}>CHALLENGE BRIEF</div>
          <p style={{ color:'#CBD5E1', fontSize:'13px', lineHeight:1.7 }}>{challenge.desc}</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'18px' }}>
          {/* Rules */}
          <div style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${S.border}`, borderRadius:'12px', padding:'14px' }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:'#EF4444', letterSpacing:'0.12em', fontWeight:700, marginBottom:'10px' }}>RULES</div>
            {challenge.rules.map((r,i) => (
              <div key={i} style={{ display:'flex', gap:'6px', marginBottom:'7px', alignItems:'flex-start' }}>
                <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:'#EF4444', marginTop:'5px', flexShrink:0 }} />
                <span style={{ color:'#CBD5E1', fontSize:'11px', lineHeight:1.5 }}>{r}</span>
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${S.border}`, borderRadius:'12px', padding:'14px' }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:'#10B981', letterSpacing:'0.12em', fontWeight:700, marginBottom:'10px' }}>MILESTONES</div>
            {challenge.milestones.map((m,i) => {
              const achieved = challenge.isMoney ? challenge.progress >= m.at : challenge.progress >= m.at;
              return (
                <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'8px', alignItems:'center' }}>
                  {achieved ? <CheckCircle2 size={13} style={{ color:'#10B981', flexShrink:0 }} /> : <div style={{ width:'13px', height:'13px', borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.12)', flexShrink:0 }} />}
                  <div>
                    <div style={{ color:achieved?'#10B981':'#CBD5E1', fontSize:'10px', fontWeight:700 }}>{m.label}</div>
                    <div style={{ color:S.muted, fontSize:'9px' }}>{m.reward}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mini leaderboard */}
        <div style={{ marginBottom:'18px' }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:'#D4A843', letterSpacing:'0.12em', fontWeight:700, marginBottom:'10px' }}>CURRENT LEADERS</div>
          {challenge.leaderboard.map((p,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'7px 10px', borderRadius:'8px', background:'rgba(255,255,255,0.02)', marginBottom:'4px', border:'1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'11px', fontWeight:900, color:['#D4A843','#94A3B8','#CD7F32'][i]??S.muted, width:'20px' }}>#{p.rank}</div>
              <span style={{ flex:1, color:p.name==='You'?challenge.color:'#CBD5E1', fontSize:'12px', fontWeight:p.name==='You'?700:400 }}>{p.name}{p.name==='You'?' (You)':''}</span>
              <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'11px', fontWeight:700, color:challenge.color }}>
                {challenge.isMoney ? `$${p.progress.toLocaleString()}` : `${p.progress}/${challenge.total}`}
              </span>
            </div>
          ))}
        </div>

        {/* Reward box */}
        <div style={{ background:`${challenge.color}10`, border:`1px solid ${challenge.color}25`, borderRadius:'12px', padding:'14px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
          <Gift size={20} style={{ color:challenge.color, flexShrink:0 }} />
          <div>
            <div style={{ color:S.muted, fontSize:'9px', marginBottom:'2px' }}>COMPLETION REWARD</div>
            <div style={{ color:challenge.color, fontSize:'14px', fontWeight:800 }}>{challenge.reward}</div>
          </div>
        </div>

        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={onClose} style={{ padding:'12px 20px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, cursor:'pointer', color:S.muted, fontSize:'12px', fontWeight:700 }}>Close</button>
          {!challenge.joined && (
            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={()=>onJoin(challenge)}
              style={{ flex:1, padding:'12px', borderRadius:'10px', background:`linear-gradient(135deg,${challenge.color}cc,${challenge.color})`, border:'none', cursor:'pointer', color:'#000', fontSize:'13px', fontWeight:900 }}>
              Join This Challenge
            </motion.button>
          )}
          {challenge.joined && (
            <div style={{ flex:1, padding:'12px', borderRadius:'10px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', color:'#10B981', fontSize:'13px', fontWeight:700, textAlign:'center' }}>
              ✓ Enrolled — Keep going!
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── JOIN COMPETITION MODAL ── */
function JoinCompetitionModal({ prize, onClose }) {
  const [step, setStep] = useState('overview'); // overview | confirm | joined
  const [agreed, setAgreed] = useState(false);

  async function handleJoin() {
    setStep('joined');
    // In production: POST /api/competitions/join { competition_id: prize.id }
  }

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(3,8,15,0.85)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <motion.div initial={{ scale:0.93, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.93, y:20 }}
        onClick={e=>e.stopPropagation()}
        style={{ background:'rgba(6,13,24,0.98)', border:`1px solid ${prize.color}30`, borderRadius:'24px', padding:'28px', maxWidth:'520px', width:'100%', backdropFilter:'blur(24px)' }}>

        {step === 'joined' ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🏆</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'16px', fontWeight:900, color:'#fff', marginBottom:'8px' }}>YOU'RE IN!</div>
            <div style={{ color:prize.color, fontSize:'14px', fontWeight:700, marginBottom:'8px' }}>{prize.name}</div>
            <p style={{ color:S.muted, fontSize:'12px', marginBottom:'20px', lineHeight:1.6 }}>
              You've successfully joined the competition. Your ranking will appear on the leaderboard within 15 minutes.
              Keep earning XP across all 4 doors to climb the ranks!
            </p>
            <div style={{ background:`${prize.color}10`, border:`1px solid ${prize.color}25`, borderRadius:'12px', padding:'14px', marginBottom:'20px' }}>
              <div style={{ color:S.muted, fontSize:'10px', marginBottom:'4px' }}>COMPETING FOR</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'18px', fontWeight:900, color:prize.color }}>{prize.prize}</div>
            </div>
            <button onClick={onClose} style={{ width:'100%', padding:'12px', borderRadius:'10px', background:`${prize.color}`, border:'none', cursor:'pointer', color:'#000', fontSize:'13px', fontWeight:900 }}>
              Start Competing
            </button>
          </div>
        ) : step === 'confirm' ? (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', color:prize.color, fontWeight:700, letterSpacing:'0.12em' }}>CONFIRM ENTRY</div>
              <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'8px', padding:'6px', cursor:'pointer', color:S.muted }}><X size={14} /></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'18px' }}>
              {[
                { label:'Competition', value:prize.name },
                { label:'Prize', value:prize.prize },
                { label:'End Date', value:prize.end },
                { label:'Current Participants', value:`${prize.participants + 1} (including you)` },
                { label:'Your Current Rank', value:`#${prize.rank}` },
                { label:'Entry Fee', value:'Free' },
              ].map(r=>(
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', borderRadius:'8px', background:'rgba(255,255,255,0.02)', border:`1px solid ${S.border}` }}>
                  <span style={{ color:S.muted, fontSize:'11px' }}>{r.label}</span>
                  <span style={{ color:'#fff', fontSize:'11px', fontWeight:700 }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'18px', padding:'10px 12px', borderRadius:'8px', background:'rgba(255,255,255,0.02)', cursor:'pointer' }}
              onClick={()=>setAgreed(v=>!v)}>
              <div style={{ width:'16px', height:'16px', borderRadius:'4px', border:`1.5px solid ${agreed?prize.color:'rgba(255,255,255,0.2)'}`, background:agreed?`${prize.color}20`:'transparent', flexShrink:0, marginTop:'1px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {agreed && <CheckCircle2 size={10} style={{ color:prize.color }} />}
              </div>
              <span style={{ color:'#CBD5E1', fontSize:'11px', lineHeight:1.5 }}>I agree to the competition rules and understand that rankings are determined by XP earned from {prize.end}.</span>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={()=>setStep('overview')} style={{ padding:'12px 18px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, cursor:'pointer', color:S.muted, fontSize:'12px', fontWeight:700 }}>Back</button>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={handleJoin} disabled={!agreed}
                style={{ flex:1, padding:'12px', borderRadius:'10px', background:agreed?`linear-gradient(135deg,${prize.color}cc,${prize.color})`:'rgba(255,255,255,0.06)', border:'none', cursor:agreed?'pointer':'not-allowed', color:agreed?'#000':'rgba(255,255,255,0.3)', fontSize:'13px', fontWeight:900 }}>
                Confirm Entry
              </motion.button>
            </div>
          </div>
        ) : (
          /* overview */
          <div>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
              <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`${prize.color}15`, border:`1px solid ${prize.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <prize.Icon size={20} style={{ color:prize.color }} />
                </div>
                <div>
                  <div style={{ color:'#fff', fontSize:'16px', fontWeight:800 }}>{prize.name}</div>
                  <div style={{ color:prize.color, fontSize:'11px', fontWeight:700 }}>Ends {prize.end} · {prize.participants} participants</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'8px', padding:'7px', cursor:'pointer', color:S.muted }}><X size={14} /></button>
            </div>

            <div style={{ background:`${prize.color}10`, border:`1px solid ${prize.color}25`, borderRadius:'12px', padding:'16px', textAlign:'center', marginBottom:'18px' }}>
              <div style={{ color:S.muted, fontSize:'9px', marginBottom:'4px', fontFamily:"'Orbitron',sans-serif", letterSpacing:'0.1em' }}>PRIZE</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'20px', fontWeight:900, color:prize.color }}>{prize.prize}</div>
            </div>

            <p style={{ color:'#CBD5E1', fontSize:'13px', lineHeight:1.7, marginBottom:'16px' }}>{prize.desc}</p>

            <div style={{ marginBottom:'16px' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:S.muted, letterSpacing:'0.12em', fontWeight:700, marginBottom:'8px' }}>HOW TO WIN</div>
              {prize.steps.map((step,i)=>(
                <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'7px', alignItems:'flex-start' }}>
                  <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:`${prize.color}15`, border:`1px solid ${prize.color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:prize.color, fontWeight:900 }}>{i+1}</span>
                  </div>
                  <span style={{ color:'#CBD5E1', fontSize:'12px', lineHeight:1.5 }}>{step}</span>
                </div>
              ))}
            </div>

            <div style={{ padding:'10px 12px', borderRadius:'8px', background:'rgba(255,255,255,0.02)', border:`1px solid ${S.border}`, marginBottom:'16px', fontSize:'11px', color:S.muted }}>
              {prize.eligibility}
            </div>

            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={onClose} style={{ padding:'12px 18px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, cursor:'pointer', color:S.muted, fontSize:'12px', fontWeight:700 }}>Cancel</button>
              {prize.joined ? (
                <div style={{ flex:1, padding:'12px', borderRadius:'10px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', color:'#10B981', fontSize:'13px', fontWeight:700, textAlign:'center' }}>
                  ✓ Already Enrolled
                </div>
              ) : (
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={()=>setStep('confirm')}
                  style={{ flex:1, padding:'12px', borderRadius:'10px', background:`linear-gradient(135deg,${prize.color}cc,${prize.color})`, border:'none', cursor:'pointer', color:'#000', fontSize:'13px', fontWeight:900 }}>
                  Join Competition →
                </motion.button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── MAIN COMPONENT ── */
export default function TheArena() {
  const { user, profile } = useAuthStore();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [doorTab, setDoorTab] = useState('global');
  const [pageTab, setPageTab] = useState('leaderboard');
  const [challengeDetail, setChallengeDetail] = useState(null);
  const [prizeDetail, setPrizeDetail] = useState(null);
  const [challenges, setChallenges] = useState(CHALLENGES);

  useEffect(() => {
    supabase.from('profiles').select('id,full_name,rank,xp,country').order('xp',{ascending:false}).limit(50)
      .then(({ data }) => { setBoard(data?.length > 1 ? data : MOCK_BOARD); setLoading(false); });
  }, [user]);

  const myXP   = profile?.xp ?? 3400;
  const myRank = getRankForXP(myXP);
  const nextRank = getNextRank(myXP);
  const xpToNext = nextRank ? nextRank.minXP - myXP : 0;
  const xpPct    = nextRank ? Math.round(((myXP - myRank.minXP) / (nextRank.minXP - myRank.minXP)) * 100) : 100;
  const myPos    = board.findIndex(p => p.id === user?.id) + 1;

  const getDoorXP = (p, door) => {
    if (door === 'global') return p.xp ?? 0;
    return p.door_score?.[door] ?? Math.round((p.xp ?? 0) * { edge:0.28, forge:0.38, oracle:0.17, nexus:0.17 }[door]);
  };

  const sortedBoard = [...board].sort((a,b) => getDoorXP(b,doorTab) - getDoorXP(a,doorTab));
  const filtered    = sortedBoard.filter(p => !search || (p.full_name??'').toLowerCase().includes(search.toLowerCase()));
  const top3        = [filtered[1], filtered[0], filtered[2]];
  const rest        = filtered.slice(3);

  function shareRank() {
    const text = `I'm ranked #${myPos||'?'} on SOLVEN4 with ${myXP.toLocaleString()} XP — ${myRank.name} ${myRank.emoji}. The obsession is real.`;
    if (navigator.share) navigator.share({ title:'My SOLVEN4 Rank', text });
    else { navigator.clipboard.writeText(text); toast.success('Rank copied!'); }
  }

  function handleJoinChallenge(challenge) {
    setChallenges(prev => prev.map(c => c.id === challenge.id ? { ...c, joined:true, participants:c.participants+1 } : c));
    setChallengeDetail(prev => prev ? { ...prev, joined:true } : null);
    toast.success(`Joined "${challenge.name}"! Good luck!`);
  }

  const MEDAL = [
    { color:'#94A3B8', glow:'rgba(148,163,184,0.25)', height:96,  emoji:'🥈' },
    { color:'#D4A843', glow:'rgba(212,168,67,0.4)',   height:128, emoji:'🥇' },
    { color:'#CD7F32', glow:'rgba(205,127,50,0.25)',  height:80,  emoji:'🥉' },
  ];

  return (
    <div style={{ color:'#fff', fontFamily:"'Inter',sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
            <Trophy size={18} color="#D4A843" />
            <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'22px', fontWeight:900 }}>THE ARENA</h1>
            <div style={{ background:'rgba(212,168,67,0.15)', border:'1px solid rgba(212,168,67,0.3)', borderRadius:'6px', padding:'2px 8px', fontSize:'9px', fontWeight:700, color:'#D4A843', fontFamily:"'Orbitron',sans-serif" }}>LIVE</div>
          </div>
          <p style={{ color:S.muted, fontSize:'12px' }}>Global XP rankings across all 4 SOLVEN4 doors</p>
        </div>
        <button onClick={shareRank}
          style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'10px', border:'1px solid rgba(212,168,67,0.3)', background:'rgba(212,168,67,0.08)', color:'#D4A843', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
          <Share2 size={12} /> Share Rank
        </button>
      </div>

      {/* ── MY RANK CARD ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        style={{ position:'relative', overflow:'hidden', borderRadius:'18px', padding:'20px 24px', marginBottom:'16px',
          background:`linear-gradient(135deg,${myRank.color}12 0%,rgba(11,18,32,0.95) 60%)`,
          border:`1px solid ${myRank.color}30` }}>
        <div style={{ position:'absolute', top:0, right:0, width:'200px', height:'100%', background:`radial-gradient(ellipse at top right,${myRank.color}15,transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap' }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'36px', fontWeight:900, color:myRank.color }}>#{myPos||'—'}</div>
          <div style={{ width:'1px', height:'48px', background:`${myRank.color}30` }} />
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ fontSize:'28px' }}>{myRank.emoji}</div>
            <div>
              <div style={{ color:'#fff', fontWeight:800, fontSize:'15px' }}>{profile?.full_name || user?.email?.split('@')[0] || 'You'}</div>
              <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'2px' }}>
                <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', fontWeight:700, color:myRank.color }}>{myRank.name.toUpperCase()}</span>
                <span style={{ color:S.muted, fontSize:'11px' }}>· {myXP.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
          <div style={{ flex:1, minWidth:'200px' }}>
            {nextRank ? (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                  <span style={{ color:S.muted, fontSize:'10px' }}>Progress to {nextRank.name}</span>
                  <span style={{ color:myRank.color, fontSize:'10px', fontWeight:700 }}>{xpToNext.toLocaleString()} XP to go</span>
                </div>
                <div style={{ height:'6px', borderRadius:'3px', background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${xpPct}%` }} transition={{ delay:0.5, duration:1 }}
                    style={{ height:'100%', borderRadius:'3px', background:`linear-gradient(90deg,${myRank.color}80,${myRank.color})` }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px' }}>
                  <span style={{ color:myRank.color, fontSize:'9px' }}>{myRank.emoji} {myRank.name}</span>
                  <span style={{ color:S.muted, fontSize:'9px' }}>{nextRank.emoji} {nextRank.name}</span>
                </div>
              </>
            ) : (
              <div style={{ color:'#A855F7', fontFamily:"'Orbitron',sans-serif", fontSize:'11px', fontWeight:700 }}>👑 MAXIMUM RANK ACHIEVED</div>
            )}
          </div>
          <div>
            <div style={{ fontSize:'10px', color:S.muted, marginBottom:'6px' }}>YOUR PERKS</div>
            {myRank.perks.map(p=>(
              <div key={p} style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'3px' }}>
                <CheckCircle2 size={10} style={{ color:myRank.color }} />
                <span style={{ color:'#CBD5E1', fontSize:'10px' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── PAGE TABS ── */}
      <div style={{ display:'flex', gap:'4px', padding:'4px', borderRadius:'12px', background:'rgba(11,18,32,0.8)', border:`1px solid ${S.border}`, marginBottom:'16px', width:'fit-content' }}>
        {PAGE_TABS.map(t=>(
          <button key={t} onClick={()=>setPageTab(t)}
            style={{ padding:'7px 18px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer', border:'none', textTransform:'capitalize', transition:'all 0.15s',
              background:pageTab===t?'#D4A843':'transparent', color:pageTab===t?'#000':S.muted }}>
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

      {/* ── LEADERBOARD ── */}
      {pageTab === 'leaderboard' && (
        <motion.div key="lb" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ display:'flex', gap:'6px', marginBottom:'16px' }}>
            {DOOR_TABS.map(d=>(
              <button key={d.id} onClick={()=>setDoorTab(d.id)}
                style={{ display:'flex', alignItems:'center', gap:'5px', padding:'6px 14px', borderRadius:'8px', cursor:'pointer', border:`1px solid ${doorTab===d.id?d.color+'50':'rgba(255,255,255,0.07)'}`, transition:'all 0.15s',
                  background:doorTab===d.id?`${d.color}15`:'transparent', color:doorTab===d.id?d.color:S.muted, fontSize:'11px', fontWeight:700 }}>
                <d.Icon size={11} /> {d.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', height:'200px', alignItems:'center' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'50%', border:'2px solid rgba(212,168,67,0.2)', borderTopColor:'#D4A843', animation:'s4-spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              <div style={{ position:'relative', borderRadius:'20px', overflow:'hidden', padding:'32px 24px', marginBottom:'16px',
                background:'linear-gradient(180deg,rgba(6,13,24,0.95) 0%,rgba(3,8,15,0.98) 100%)', border:`1px solid ${S.border}` }}>
                <div style={{ position:'absolute', inset:0, opacity:0.15,
                  backgroundImage:'linear-gradient(rgba(212,168,67,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(212,168,67,0.07) 1px,transparent 1px)',
                  backgroundSize:'32px 32px', pointerEvents:'none' }} />
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.3em', color:S.muted, textAlign:'center', marginBottom:'28px' }}>
                    TOP AGENTS — {doorTab.toUpperCase()} {doorTab!=='global'?'DOOR':'GLOBAL'}
                  </div>
                  <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:'16px' }}>
                    {top3.map((p,i)=>{
                      if (!p) return <div key={i} style={{ width:'120px' }} />;
                      const rs = RANKS.find(r=>r.name===p.rank) ?? RANKS[0];
                      const m  = MEDAL[i];
                      const pts = getDoorXP(p, doorTab);
                      return (
                        <motion.div key={p.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}
                          style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'120px' }}>
                          <div style={{ fontSize:'22px', marginBottom:'6px' }}>{m.emoji}</div>
                          <div style={{ position:'relative', width:'52px', height:'52px', marginBottom:'8px' }}>
                            <div style={{ width:'52px', height:'52px', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:900, fontFamily:"'Orbitron',sans-serif",
                              background:rs.bg, border:`2px solid ${rs.color}50`, color:rs.color, boxShadow:`0 0 20px ${rs.color}20` }}>
                              {p.full_name?.[0]??'?'}
                            </div>
                            {i===1 && <div style={{ position:'absolute', top:'-6px', right:'-6px', width:'18px', height:'18px', borderRadius:'50%', background:'#D4A843', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 10px rgba(212,168,67,0.6)' }}>
                              <Crown size={9} style={{ color:'#000' }} />
                            </div>}
                          </div>
                          <div style={{ fontSize:'11px', fontWeight:700, color:'#fff', textAlign:'center', marginBottom:'3px', maxWidth:'110px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.full_name}</div>
                          <div style={{ fontSize:'9px', color:rs.color, marginBottom:'8px' }}>{rs.emoji} {p.rank?.split(' ').pop()}</div>
                          <motion.div initial={{ height:0 }} animate={{ height:`${m.height}px` }} transition={{ delay:0.4+i*0.1, duration:0.7 }}
                            style={{ width:'96px', borderRadius:'8px 8px 0 0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                              background:`${m.color}12`, border:`1px solid ${m.color}25`, boxShadow:`0 0 20px ${m.glow}` }}>
                            <div style={{ fontFamily:"'Orbitron',sans-serif", fontWeight:900, fontSize:'14px', color:m.color }}>{pts.toLocaleString()}</div>
                            <div style={{ fontSize:'8px', color:S.muted }}>XP</div>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ position:'relative', marginBottom:'12px', maxWidth:'280px' }}>
                <Search size={12} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:S.muted }} />
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search agents..."
                  style={{ width:'100%', padding:'8px 10px 8px 28px', borderRadius:'10px', fontSize:'12px', color:'#fff', background:S.surface, border:`1px solid ${S.border}`, outline:'none', boxSizing:'border-box' }} />
              </div>

              <div style={{ borderRadius:'16px', border:`1px solid ${S.border}`, overflow:'hidden', background:'rgba(6,13,24,0.95)' }}>
                <div style={{ padding:'12px 18px', borderBottom:`1px solid ${S.border}` }}>
                  <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.2em', color:S.muted }}>FULL RANKINGS · {filtered.length} AGENTS</span>
                </div>
                {rest.map(p=>{
                  const isYou = p.id === user?.id;
                  const rs = RANKS.find(r=>r.name===p.rank) ?? RANKS[0];
                  const pts = getDoorXP(p, doorTab);
                  const pct = Math.round((pts / getDoorXP(sortedBoard[0],doorTab)) * 100);
                  const pos = sortedBoard.indexOf(p) + 1;
                  return (
                    <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 18px', borderBottom:'1px solid rgba(255,255,255,0.03)', transition:'all 0.15s',
                      background:isYou?`${myRank.color}06`:'transparent' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                      onMouseLeave={e=>e.currentTarget.style.background=isYou?`${myRank.color}06`:'transparent'}>
                      <div style={{ width:'32px', textAlign:'center', fontFamily:"'Orbitron',sans-serif", fontSize:'11px', fontWeight:900, color:S.muted }}>{pos}</div>
                      <div style={{ width:'36px', height:'36px', borderRadius:'10px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:900, background:rs.bg, border:`1px solid ${rs.color}25`, color:rs.color }}>
                        {p.full_name?.[0]??'?'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <span style={{ fontSize:'13px', fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.full_name}</span>
                          {isYou && <span style={{ background:`${myRank.color}20`, color:myRank.color, fontSize:'8px', fontWeight:900, padding:'1px 5px', borderRadius:'4px', fontFamily:"'Orbitron',sans-serif", flexShrink:0 }}>YOU</span>}
                        </div>
                        <div style={{ height:'3px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', marginTop:'5px', maxWidth:'160px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${rs.color}60,${rs.color})`, borderRadius:'2px', transition:'width 1s ease' }} />
                        </div>
                      </div>
                      <div style={{ fontSize:'9px', fontFamily:"'Orbitron',sans-serif", fontWeight:700, color:rs.color, flexShrink:0 }}>{rs.emoji} {p.rank?.split(' ').pop()?.toUpperCase()}</div>
                      <div style={{ fontFamily:"'Orbitron',sans-serif", fontWeight:900, fontSize:'13px', color:'#D4A843', width:'80px', textAlign:'right', flexShrink:0 }}>
                        {pts.toLocaleString()} <span style={{ fontSize:'9px', color:S.muted, fontWeight:400 }}>XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ── CHALLENGES ── */}
      {pageTab === 'challenges' && (
        <motion.div key="ch" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          {challenges.map(c=>(
            <motion.div key={c.id} whileHover={{ scale:1.01 }}
              style={{ background:S.surface, border:`1px solid ${c.color}20`, borderRadius:'18px', padding:'20px', backdropFilter:'blur(20px)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:`linear-gradient(90deg,transparent,${c.color},transparent)` }} />
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:`${c.color}15`, border:`1px solid ${c.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <c.Icon size={17} style={{ color:c.color }} />
                </div>
                <div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', color:c.color, fontWeight:700, letterSpacing:'0.1em' }}>{c.door} · {c.type.toUpperCase()}</div>
                  <div style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>{c.name}</div>
                </div>
                <div style={{ marginLeft:'auto', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'3px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px', color:'#F97316', fontSize:'10px' }}>
                    <Timer size={11} /> {c.deadline}
                  </div>
                  {c.joined && <span style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'4px', padding:'1px 6px', fontSize:'8px', color:'#10B981', fontWeight:700, fontFamily:"'Orbitron',sans-serif" }}>ENROLLED</span>}
                </div>
              </div>
              <p style={{ color:'#CBD5E1', fontSize:'11px', lineHeight:1.6, marginBottom:'12px' }}>{c.desc.slice(0,100)}...</p>
              <div style={{ marginBottom:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                  <span style={{ color:S.muted, fontSize:'10px' }}>Progress</span>
                  <span style={{ color:c.color, fontSize:'10px', fontWeight:700 }}>
                    {c.isMoney ? `$${c.progress.toLocaleString()} / $${c.total.toLocaleString()}` : `${c.progress} / ${c.total}`}
                  </span>
                </div>
                <div style={{ height:'6px', borderRadius:'3px', background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(100,Math.round((c.progress/c.total)*100))}%` }} transition={{ delay:0.3, duration:0.8 }}
                    style={{ height:'100%', background:`linear-gradient(90deg,${c.color}70,${c.color})`, borderRadius:'3px' }} />
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ background:`${c.color}10`, border:`1px solid ${c.color}25`, borderRadius:'8px', padding:'5px 10px' }}>
                  <div style={{ fontSize:'9px', color:S.muted, marginBottom:'1px' }}>REWARD</div>
                  <div style={{ fontSize:'10px', color:c.color, fontWeight:700 }}>{c.reward}</div>
                </div>
                <div style={{ display:'flex', gap:'6px' }}>
                  <motion.button whileHover={{ scale:1.05 }} onClick={()=>setChallengeDetail(c)}
                    style={{ padding:'7px 12px', borderRadius:'8px', background:`${c.color}12`, border:`1px solid ${c.color}30`, color:c.color, fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                    View
                  </motion.button>
                  {!c.joined && (
                    <motion.button whileHover={{ scale:1.05 }} onClick={()=>handleJoinChallenge(c)}
                      style={{ padding:'7px 12px', borderRadius:'8px', background:`${c.color}25`, border:`1px solid ${c.color}50`, color:c.color, fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                      Join
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── ACHIEVEMENTS ── */}
      {pageTab === 'achievements' && (
        <motion.div key="ach" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ display:'flex', gap:'10px', marginBottom:'14px' }}>
            <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'10px', padding:'8px 14px', display:'flex', gap:'6px', alignItems:'center' }}>
              <CheckCircle2 size={12} style={{ color:'#10B981' }} /><span style={{ color:'#10B981', fontSize:'11px', fontWeight:700 }}>{ACHIEVEMENTS.filter(a=>a.earned).length} Earned</span>
            </div>
            <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${S.border}`, borderRadius:'10px', padding:'8px 14px', display:'flex', gap:'6px', alignItems:'center' }}>
              <Lock size={12} style={{ color:S.muted }} /><span style={{ color:S.muted, fontSize:'11px', fontWeight:700 }}>{ACHIEVEMENTS.filter(a=>!a.earned).length} Locked</span>
            </div>
            <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'10px', padding:'8px 14px', display:'flex', gap:'6px', alignItems:'center' }}>
              <Zap size={12} style={{ color:'#6366F1' }} />
              <span style={{ color:'#6366F1', fontSize:'11px', fontWeight:700 }}>
                {ACHIEVEMENTS.filter(a=>a.earned).reduce((s,a)=>s+a.xp,0).toLocaleString()} XP Earned
              </span>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
            {ACHIEVEMENTS.map(a=>(
              <motion.div key={a.id} whileHover={{ scale:1.04 }}
                style={{ background:S.surface, border:`1px solid ${a.earned?a.color+'30':'rgba(255,255,255,0.04)'}`, borderRadius:'16px', padding:'18px', backdropFilter:'blur(20px)',
                  opacity:a.earned?1:0.65, position:'relative', overflow:'hidden', cursor:'pointer' }}>
                <div style={{ position:'absolute', top:'8px', right:'8px' }}>
                  {a.earned ? <CheckCircle2 size={13} style={{ color:'#10B981' }} /> : <Lock size={12} style={{ color:S.muted }} />}
                </div>
                {a.earned && <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,transparent,${a.color},transparent)` }} />}
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', marginBottom:'12px', display:'flex', alignItems:'center', justifyContent:'center',
                  background:a.earned?`${a.color}20`:'rgba(255,255,255,0.04)', border:`2px solid ${a.earned?a.color+'40':'rgba(255,255,255,0.06)'}`,
                  boxShadow:a.earned?`0 0 20px ${a.color}25`:'none' }}>
                  {/* FIX: was a.Icon (wrong) — now using a.Icon (correct since we fixed the data) */}
                  <a.Icon size={20} style={{ color:a.earned?a.color:S.muted }} />
                </div>
                <div style={{ fontWeight:700, fontSize:'12px', color:a.earned?'#fff':'#CBD5E1', marginBottom:'4px' }}>{a.name}</div>
                <div style={{ fontSize:'10px', color:S.muted, lineHeight:1.5, marginBottom:'8px' }}>{a.desc}</div>
                {a.earned ? (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'4px', color:a.color, fontSize:'10px', fontWeight:700 }}>
                      <Zap size={10} /> +{a.xp} XP
                    </div>
                    <span style={{ fontSize:'9px', color:'#10B981', fontWeight:700 }}>{a.earnedDate}</span>
                  </div>
                ) : (
                  <div style={{ fontSize:'9px', color:S.muted, background:'rgba(255,255,255,0.03)', borderRadius:'6px', padding:'4px 8px', lineHeight:1.4 }}>
                    {a.hint || 'Keep going to unlock'}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── PRIZES ── */}
      {pageTab === 'prizes' && (
        <motion.div key="pr" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            {PRIZES.map(p=>(
              <motion.div key={p.id} whileHover={{ scale:1.01 }}
                style={{ background:S.surface, border:`1px solid ${p.color}25`, borderRadius:'18px', padding:'22px', backdropFilter:'blur(20px)', position:'relative', overflow:'hidden', cursor:'pointer' }}
                onClick={()=>setPrizeDetail(p)}>
                <div style={{ position:'absolute', top:0, right:0, width:'100px', height:'100px', background:`radial-gradient(circle at top right,${p.color}18,transparent 70%)`, pointerEvents:'none' }} />
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:`${p.color}15`, border:`1px solid ${p.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <p.Icon size={18} style={{ color:p.color }} />
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'14px', color:'#fff' }}>{p.name}</div>
                      <div style={{ fontSize:'10px', color:S.muted, marginTop:'2px' }}>Ends {p.end} · {p.participants} participants</div>
                    </div>
                  </div>
                  {p.joined && <span style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'5px', padding:'2px 8px', fontSize:'8px', color:'#10B981', fontWeight:700, fontFamily:"'Orbitron',sans-serif", flexShrink:0 }}>ENROLLED</span>}
                </div>
                <div style={{ background:`${p.color}10`, border:`1px solid ${p.color}25`, borderRadius:'12px', padding:'14px', marginBottom:'14px', textAlign:'center' }}>
                  <div style={{ fontSize:'9px', color:S.muted, marginBottom:'4px', fontFamily:"'Orbitron',sans-serif", letterSpacing:'0.1em' }}>PRIZE</div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'16px', fontWeight:900, color:p.color }}>{p.prize}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <span style={{ fontSize:'10px', color:S.muted }}>Your position:</span>
                    <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'14px', fontWeight:900, color:p.color }}>#{p.rank}</span>
                  </div>
                  <motion.button whileHover={{ scale:1.05 }} onClick={e=>{ e.stopPropagation(); setPrizeDetail(p); }}
                    style={{ padding:'8px 16px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'11px', fontWeight:700, color:'#000', background:p.color, boxShadow:`0 0 16px ${p.color}40` }}>
                    {p.joined ? 'View Competition' : 'Join Competition'}
                  </motion.button>
                </div>
              </motion.div>
            ))}

            <div style={{ gridColumn:'1/-1', background:S.surface, border:'1px solid rgba(168,85,247,0.2)', borderRadius:'18px', padding:'24px', backdropFilter:'blur(20px)', display:'flex', alignItems:'center', gap:'20px' }}>
              <div style={{ fontSize:'40px' }}>🏆</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'12px', color:'#A855F7', fontWeight:900, marginBottom:'6px' }}>S4 LEGEND SEASON PRIZE POOL</div>
                <div style={{ color:'#fff', fontSize:'14px', fontWeight:700, marginBottom:'4px' }}>Top 3 Legends share $15,000 + exclusive Legend NFTs + SOLVEN Board advisory seats. Season ends Sep 30, 2026.</div>
                <div style={{ color:S.muted, fontSize:'12px' }}>1,247 participants competing · Daily XP rankings updated</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'28px', fontWeight:900, color:'#A855F7' }}>$15,000</div>
                <div style={{ color:S.muted, fontSize:'10px' }}>Total Pool</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      </AnimatePresence>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {challengeDetail && (
          <ChallengeModal
            challenge={challengeDetail}
            onClose={()=>setChallengeDetail(null)}
            onJoin={c=>{ handleJoinChallenge(c); setChallengeDetail({ ...c, joined:true }); }}
          />
        )}
        {prizeDetail && (
          <JoinCompetitionModal prize={prizeDetail} onClose={()=>setPrizeDetail(null)} />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes s4-spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
      `}</style>
    </div>
  );
}
