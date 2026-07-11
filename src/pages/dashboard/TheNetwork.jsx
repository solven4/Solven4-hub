import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Users, Star, MessageCircle, TrendingUp, Trophy, Search,
  UserPlus, Shield, Eye, Zap, Globe, BarChart2, ChevronRight,
  BookOpen, Building2, DollarSign, Award, CheckCircle2, Lock, X, Send,
} from 'lucide-react';
import { toast } from 'sonner';

const S = { bg:'#03080F', surface:'rgba(11,18,32,0.9)', border:'rgba(255,255,255,0.06)', muted:'#8899B4' };
const DOOR_COLOR = { EDGE:'#06B6D4', FORGE:'#D4A843', ORACLE:'#10B981', NEXUS:'#EF4444' };

/* ── COMMUNITY MEMBERS ── */
const MEMBERS = [
  { id:1, name:'Ahmad Al-Rashid', role:'Elite Trader', country:'UAE', rank:'The Legend', rankColor:'#D4A843',
    xp:48200, winRate:78, doorsActive:['EDGE','ORACLE','NEXUS'], verified:true, mentor:true,
    bio:'15yr trading veteran. Gold + EURUSD specialist. ORACLE cohort 1 graduate.', connections:342, posts:87 },
  { id:2, name:'Layla Hassan',     role:'Senior IB',    country:'Egypt', rank:'The Dealer', rankColor:'#8B5CF6',
    xp:32100, winRate:65, doorsActive:['FORGE','ORACLE'], verified:true, mentor:true,
    bio:'Top FORGE producer in MENA. Built a network of 120+ active traders.', connections:289, posts:64 },
  { id:3, name:'Omar Al-Farsi',    role:'Crypto Analyst', country:'Qatar', rank:'The Addict', rankColor:'#EF4444',
    xp:18700, winRate:62, doorsActive:['NEXUS','EDGE'], verified:true, mentor:false,
    bio:'NEXUS institutional track. BTC cycle analyst, DeFi protocols.', connections:156, posts:41 },
  { id:4, name:'Sara Khalil',      role:'Academy Top Student', country:'Saudi Arabia', rank:'The Obsessed', rankColor:'#3B82F6',
    xp:11300, winRate:58, doorsActive:['ORACLE','EDGE'], verified:false, mentor:false,
    bio:'Full-time ORACLE student. Consistent trader in training phase.', connections:98, posts:22 },
  { id:5, name:'Kareem Nasser',    role:'IB Director',  country:'Kuwait', rank:'The Dealer', rankColor:'#8B5CF6',
    xp:28900, winRate:61, doorsActive:['FORGE','NEXUS','ORACLE'], verified:true, mentor:true,
    bio:'FORGE + NEXUS operator. Growing institutional arm in Gulf region.', connections:198, posts:53 },
  { id:6, name:'Nour Al-Din',      role:'Risk Specialist', country:'Jordan', rank:'The Hooked', rankColor:'#10B981',
    xp:6800, winRate:55, doorsActive:['EDGE','ORACLE'], verified:false, mentor:false,
    bio:'Risk management focus. Building consistent daily habits.', connections:67, posts:15 },
];

/* ── MENTORSHIP REQUESTS ── */
const MENTORS = MEMBERS.filter(m => m.mentor);

/* ── SQUAD CHALLENGES ── */
const SQUADS = [
  { name:'Desert Eagles', members:8, maxMembers:10, goal:'Collectively hit 500 trades this month', progress:68, color:'#D4A843', doors:['EDGE','ORACLE'], reward:'+5000 XP each' },
  { name:'Gulf IBs', members:5, maxMembers:8, goal:'Recruit 20 new active traders this week', progress:45, color:'#EF4444', doors:['FORGE'], reward:'+3000 XP each + Badge' },
  { name:'MENA Analysts', members:12, maxMembers:15, goal:'Each member complete 3 ORACLE lessons', progress:82, color:'#10B981', doors:['ORACLE'], reward:'+2000 XP + Certificate' },
];

/* ── DEAL ROOM ── */
const DEALS = [
  { type:'partnership', author:'Kareem Nasser', doorColor:'#EF4444', door:'NEXUS', title:'Seeking institutional co-promotion partner for GCC expansion', budget:'Open to discussion', deadline:'Jul 31', responses:4 },
  { type:'mentorship',  author:'Ahmad Al-Rashid', doorColor:'#D4A843', door:'FORGE', title:'Offering 1:1 IB mentorship — 3 spots available for Q3 2026', budget:'Premium plan holders only', deadline:'Aug 15', responses:11 },
  { type:'collab',      author:'Layla Hassan', doorColor:'#10B981', door:'ORACLE', title:'Looking for study partners: ORACLE Advanced cohort 9', budget:'Free', deadline:'Jul 20', responses:7 },
  { type:'signal',      author:'Omar Al-Farsi', doorColor:'#06B6D4', door:'NEXUS', title:'BTC cycle analysis — weekly deep-dive for serious analysts', budget:'Community access', deadline:'Ongoing', responses:23 },
];

/* ── COMMUNITY FEED ── */
const FEED = [
  { author:'Ahmad Al-Rashid', avatar:'AR', color:'#D4A843', time:'12m', door:'EDGE', post:'Just closed a 3.2R trade on XAU/USD using the Wyckoff accumulation pattern from ORACLE Lesson 7. The education truly changes how you see price action.', likes:47, comments:12 },
  { author:'Layla Hassan',     avatar:'LH', color:'#8B5CF6', time:'1h',  door:'FORGE', post:'Milestone: My FORGE network crossed 100 active traders today! 🏆 Started with 3 in January. Consistency + the right system = everything.', likes:89, comments:31 },
  { author:'Omar Al-Farsi',    avatar:'OF', color:'#EF4444', time:'3h',  door:'NEXUS', post:'BTC dominance at 54.2% — historically signals altcoin rotation incoming. Sharing my full cycle analysis in the Deal Room for community members.', likes:34, comments:9 },
  { author:'Sara Khalil',      avatar:'SK', color:'#3B82F6', time:'5h',  door:'ORACLE', post:'Just passed the ORACLE Module 5 assessment with 87%! The Risk Management section completely changed my position sizing approach. Grateful.', likes:62, comments:18 },
];

/* ── CANVAS NETWORK GRAPH ── */
function NetworkGraph({ members, activeId, onSelect }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2;

    const nodes = [
      { id:0, label:'YOU', x:cx, y:cy, r:18, color:'#6366F1', fixed:true },
      ...members.map((m, i) => {
        const angle = (i / members.length) * Math.PI * 2 - Math.PI / 2;
        const dist = 120 + (i % 2) * 40;
        return { id:m.id, label:m.name.split(' ')[0], x:cx + dist * Math.cos(angle), y:cy + dist * Math.sin(angle), r:12, color:m.rankColor, m };
      }),
    ];

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // edges
      nodes.slice(1).forEach(n => {
        const sel = activeId === n.id;
        ctx.beginPath();
        ctx.moveTo(nodes[0].x, nodes[0].y);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = sel ? `${n.color}60` : 'rgba(255,255,255,0.05)';
        ctx.lineWidth = sel ? 2 : 1;
        ctx.stroke();

        // travel dot
        if (sel) {
          const progress = (Math.sin(t * 0.03) + 1) / 2;
          const tx = nodes[0].x + (n.x - nodes[0].x) * progress;
          const ty = nodes[0].y + (n.y - nodes[0].y) * progress;
          ctx.beginPath();
          ctx.arc(tx, ty, 3, 0, Math.PI*2);
          ctx.fillStyle = n.color;
          ctx.fill();
        }
      });

      // nodes
      nodes.forEach((n, idx) => {
        const sel = (n.id !== 0) && activeId === n.id;
        const pulse = Math.sin(t * 0.05 + idx) * (sel ? 3 : 1);

        // glow
        if (sel) {
          const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r*2.5);
          grd.addColorStop(0, `${n.color}30`);
          grd.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r*2.5, 0, Math.PI*2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // outer ring pulse
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + pulse + 3, 0, Math.PI*2);
        ctx.strokeStyle = `${n.color}20`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
        ctx.fillStyle = n.id === 0 ? '#6366F1' : (sel ? n.color : `${n.color}60`);
        ctx.fill();
        ctx.strokeStyle = n.color;
        ctx.lineWidth = sel ? 2 : 1;
        ctx.stroke();

        // label
        ctx.font = `bold ${n.id===0?9:8}px Orbitron, monospace`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + n.r + 12);
      });

      t++;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [members, activeId]);

  const handleClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const my = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);
    const cx2 = canvasRef.current.width/2, cy2 = canvasRef.current.height/2;
    members.forEach((m, i) => {
      const angle = (i / members.length) * Math.PI * 2 - Math.PI / 2;
      const dist = 120 + (i % 2) * 40;
      const nx = cx2 + dist * Math.cos(angle), ny = cy2 + dist * Math.sin(angle);
      if (Math.hypot(mx-nx, my-ny) < 18) onSelect(m.id === activeId ? null : m.id);
    });
  }, [members, activeId, onSelect]);

  return (
    <canvas ref={canvasRef} width={340} height={320} onClick={handleClick}
      style={{ cursor:'pointer', borderRadius:'12px', width:'340px', height:'320px' }} />
  );
}

const RANK_LABEL_COLOR = { 'The Legend':'#D4A843', 'The Dealer':'#8B5CF6', 'The Addict':'#EF4444', 'The Obsessed':'#3B82F6', 'The Hooked':'#10B981', 'The Curious':'#8899B4' };

/* ── CONNECT MODAL ── */
function ConnectModal({ member, onClose }) {
  const [step, setStep] = useState('profile'); // profile | message | sent
  const [msg, setMsg] = useState('');
  const [mentorshipReq, setMentorshipReq] = useState(false);

  function send() {
    setStep('sent');
    toast.success(`Connection request sent to ${member.name}!`);
  }

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(3,8,15,0.85)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <motion.div initial={{ scale:0.93, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.93, y:20 }}
        onClick={e=>e.stopPropagation()}
        style={{ background:'rgba(6,13,24,0.98)', border:`1px solid ${member.rankColor}30`, borderRadius:'24px', padding:'28px', maxWidth:'500px', width:'100%', backdropFilter:'blur(24px)' }}>

        {step === 'sent' ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'rgba(16,185,129,0.1)', border:'2px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <CheckCircle2 size={28} style={{ color:'#10B981' }} />
            </div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'14px', fontWeight:900, color:'#fff', marginBottom:'8px' }}>REQUEST SENT!</div>
            <p style={{ color:S.muted, fontSize:'12px', marginBottom:'20px', lineHeight:1.6 }}>
              Your connection request has been sent to <strong style={{ color:'#fff' }}>{member.name}</strong>.
              You'll receive a notification when they accept.
            </p>
            <div style={{ background:`${member.rankColor}08`, border:`1px solid ${member.rankColor}20`, borderRadius:'12px', padding:'14px', marginBottom:'20px', display:'flex', gap:'12px', alignItems:'center' }}>
              <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:`${member.rankColor}20`, border:`2px solid ${member.rankColor}40`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Orbitron',sans-serif", fontSize:'12px', fontWeight:900, color:member.rankColor, flexShrink:0 }}>
                {member.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
              </div>
              <div style={{ textAlign:'left' }}>
                <div style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>{member.name}</div>
                <div style={{ color:S.muted, fontSize:'10px' }}>{member.role} · {member.country}</div>
                {mentorshipReq && <div style={{ color:'#10B981', fontSize:'9px', fontWeight:700, marginTop:'2px' }}>+ Mentorship request sent</div>}
              </div>
            </div>
            <button onClick={onClose} style={{ width:'100%', padding:'12px', borderRadius:'10px', background:member.rankColor, border:'none', cursor:'pointer', color:'#000', fontSize:'13px', fontWeight:900 }}>
              Back to Network
            </button>
          </div>
        ) : step === 'message' ? (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', color:member.rankColor, fontWeight:700, letterSpacing:'0.12em' }}>ADD A MESSAGE</div>
              <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'8px', padding:'6px', cursor:'pointer', color:S.muted }}><X size={14} /></button>
            </div>
            <p style={{ color:'#CBD5E1', fontSize:'12px', lineHeight:1.6, marginBottom:'14px' }}>
              Introduce yourself to <strong style={{ color:'#fff' }}>{member.name}</strong>. A personal message increases your acceptance rate by 3×.
            </p>
            <textarea value={msg} onChange={e=>setMsg(e.target.value)} maxLength={300}
              placeholder={`Hi ${member.name.split(' ')[0]}, I came across your profile and would love to connect. I'm also active in the ${member.doorsActive[0]} door and think we could learn from each other...`}
              style={{ width:'100%', minHeight:'100px', padding:'12px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, color:'#fff', fontSize:'12px', lineHeight:1.6, resize:'vertical', outline:'none', boxSizing:'border-box', fontFamily:"'Inter',sans-serif" }} />
            <div style={{ textAlign:'right', color:S.muted, fontSize:'10px', marginBottom:'14px' }}>{msg.length}/300</div>
            {member.mentor && (
              <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'14px', padding:'10px 12px', borderRadius:'8px', background:'rgba(16,185,129,0.04)', border:'1px solid rgba(16,185,129,0.15)', cursor:'pointer' }}
                onClick={()=>setMentorshipReq(v=>!v)}>
                <div style={{ width:'16px', height:'16px', borderRadius:'4px', border:`1.5px solid ${mentorshipReq?'#10B981':'rgba(255,255,255,0.2)'}`, background:mentorshipReq?'rgba(16,185,129,0.15)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {mentorshipReq && <CheckCircle2 size={10} style={{ color:'#10B981' }} />}
                </div>
                <span style={{ color:'#CBD5E1', fontSize:'11px' }}>Also send a <strong style={{ color:'#10B981' }}>mentorship request</strong> — {member.name.split(' ')[0]} is a verified mentor</span>
              </div>
            )}
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={()=>setStep('profile')} style={{ padding:'11px 18px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, cursor:'pointer', color:S.muted, fontSize:'12px', fontWeight:700 }}>Back</button>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={send}
                style={{ flex:1, padding:'11px', borderRadius:'10px', background:`linear-gradient(135deg,${member.rankColor}cc,${member.rankColor})`, border:'none', cursor:'pointer', color:'#000', fontSize:'13px', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                <Send size={14} /> Send Request
              </motion.button>
            </div>
          </div>
        ) : (
          /* profile overview */
          <div>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'18px' }}>
              <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:`linear-gradient(135deg,${member.rankColor}40,${member.rankColor}20)`, border:`2px solid ${member.rankColor}60`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Orbitron',sans-serif", fontSize:'15px', fontWeight:900, color:member.rankColor, flexShrink:0 }}>
                  {member.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                </div>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <span style={{ color:'#fff', fontSize:'16px', fontWeight:800 }}>{member.name}</span>
                    {member.verified && <CheckCircle2 size={14} style={{ color:'#10B981' }} />}
                  </div>
                  <div style={{ color:S.muted, fontSize:'11px', marginBottom:'4px' }}>{member.role} · {member.country}</div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:member.rankColor, fontWeight:700, background:`${member.rankColor}12`, border:`1px solid ${member.rankColor}25`, borderRadius:'4px', padding:'2px 7px', display:'inline-block' }}>{member.rank}</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'8px', padding:'7px', cursor:'pointer', color:S.muted }}><X size={14} /></button>
            </div>

            <p style={{ color:'#CBD5E1', fontSize:'12px', lineHeight:1.7, marginBottom:'16px' }}>{member.bio}</p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'8px', marginBottom:'16px' }}>
              {[
                { label:'Win Rate', val:`${member.winRate}%`, color:'#10B981' },
                { label:'Total XP',  val:`${(member.xp/1000).toFixed(1)}k`, color:'#6366F1' },
                { label:'Network',   val:member.connections, color:'#D4A843' },
                { label:'Posts',     val:member.posts,       color:'#8B5CF6' },
              ].map(s=>(
                <div key={s.label} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid rgba(255,255,255,0.06)`, borderRadius:'10px', padding:'10px 8px', textAlign:'center' }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'14px', fontWeight:900, color:s.color }}>{s.val}</div>
                  <div style={{ color:S.muted, fontSize:'8px', marginTop:'2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:'5px', marginBottom:'16px' }}>
              {member.doorsActive.map(d=>(
                <span key={d} style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:DOOR_COLOR[d], background:`${DOOR_COLOR[d]}12`, border:`1px solid ${DOOR_COLOR[d]}25`, borderRadius:'5px', padding:'3px 8px', fontWeight:700 }}>{d}</span>
              ))}
              {member.mentor && <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:'#10B981', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'5px', padding:'3px 8px', fontWeight:700 }}>MENTOR</span>}
            </div>

            <div style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${S.border}`, borderRadius:'10px', padding:'10px 14px', marginBottom:'16px', display:'flex', gap:'16px' }}>
              <div style={{ fontSize:'11px', color:S.muted }}>
                Connecting with <strong style={{ color:'#fff' }}>{member.name.split(' ')[0]}</strong> gives you access to their network updates, the ability to message directly, and collaboration on squads and deals.
              </div>
            </div>

            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={onClose} style={{ padding:'11px 18px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, cursor:'pointer', color:S.muted, fontSize:'12px', fontWeight:700 }}>Cancel</button>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={()=>setStep('message')}
                style={{ flex:1, padding:'11px', borderRadius:'10px', background:`linear-gradient(135deg,${member.rankColor}cc,${member.rankColor})`, border:'none', cursor:'pointer', color:'#000', fontSize:'13px', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                <UserPlus size={14} /> Connect with {member.name.split(' ')[0]}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function TheNetwork() {
  const [activeTab, setActiveTab] = useState('community');
  const [selectedMember, setSelectedMember] = useState(null);
  const [search, setSearch] = useState('');
  const [likedPosts, setLikedPosts] = useState({});
  const [connectTarget, setConnectTarget] = useState(null);
  const [connections, setConnections] = useState(new Set());

  const filtered = MEMBERS.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.country.toLowerCase().includes(search.toLowerCase())
  );
  const selected = selectedMember ? MEMBERS.find(m => m.id === selectedMember) : null;

  return (
    <div style={{ color:'#fff', fontFamily:"'Inter',sans-serif" }}>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        style={{ position:'relative', overflow:'hidden', borderRadius:'20px', padding:'20px 24px', marginBottom:'16px',
          background:'linear-gradient(135deg,rgba(99,102,241,0.1) 0%,rgba(11,18,32,0.95) 55%,rgba(239,68,68,0.06) 100%)',
          border:'1px solid rgba(99,102,241,0.2)', backdropFilter:'blur(20px)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px' }}>
              <Network size={16} color="#6366F1" />
              <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'20px', fontWeight:900 }}>THE NETWORK</h1>
              <div style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'6px', padding:'2px 8px', fontSize:'8px', color:'#6366F1', fontFamily:"'Orbitron',sans-serif", fontWeight:700 }}>
                COMMUNITY INTELLIGENCE
              </div>
            </div>
            <p style={{ color:S.muted, fontSize:'12px' }}>Connect, learn, and grow with top SOLVEN4 operators across MENA</p>
          </div>
          <div style={{ display:'flex', gap:'12px' }}>
            {[
              { label:'Total Operators', value:'2,847', color:'#6366F1' },
              { label:'Active Today',    value:'341',   color:'#10B981' },
              { label:'Your Connections',value:'23',    color:'#D4A843' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center', background:'rgba(255,255,255,0.03)', border:`1px solid rgba(255,255,255,0.06)`, borderRadius:'12px', padding:'12px 16px', minWidth:'110px' }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'18px', fontWeight:900, color:s.color }}>{s.value}</div>
                <div style={{ color:S.muted, fontSize:'9px', marginTop:'3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── TABS ── */}
      <div style={{ display:'flex', gap:'4px', padding:'4px', borderRadius:'12px', background:'rgba(11,18,32,0.8)', border:`1px solid ${S.border}`, marginBottom:'16px', width:'fit-content' }}>
        {[
          { id:'community', label:'Community' },
          { id:'graph',     label:'Network Graph' },
          { id:'mentors',   label:'Find a Mentor' },
          { id:'squads',    label:'Squads' },
          { id:'dealroom',  label:'Deal Room' },
          { id:'feed',      label:'Live Feed' },
        ].map(t => (
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            style={{ padding:'7px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer', border:'none', whiteSpace:'nowrap', transition:'all 0.15s',
              background: activeTab===t.id?'#6366F1':'transparent', color: activeTab===t.id?'#fff':S.muted }}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

      {/* ── COMMUNITY ── */}
      {activeTab === 'community' && (
        <motion.div key="community" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          {/* Search */}
          <div style={{ position:'relative', marginBottom:'14px', maxWidth:'360px' }}>
            <Search size={13} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:S.muted }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search operators by name or country..."
              style={{ width:'100%', padding:'10px 12px 10px 34px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, color:'#fff', fontSize:'12px', outline:'none', boxSizing:'border-box' }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
            {filtered.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.07 }}
                style={{ background:S.surface, border:`1px solid ${m.rankColor}18`, borderRadius:'18px', padding:'18px', backdropFilter:'blur(20px)', cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=`${m.rankColor}35`; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=`${m.rankColor}18`; e.currentTarget.style.transform='translateY(0)'; }}>

                {/* Avatar + name */}
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:`linear-gradient(135deg,${m.rankColor}40,${m.rankColor}20)`, border:`2px solid ${m.rankColor}50`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Orbitron',sans-serif", fontSize:'12px', fontWeight:900, color:m.rankColor, flexShrink:0 }}>
                    {m.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                      <span style={{ color:'#fff', fontSize:'12px', fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</span>
                      {m.verified && <CheckCircle2 size={11} style={{ color:'#10B981', flexShrink:0 }} />}
                    </div>
                    <div style={{ color:S.muted, fontSize:'10px' }}>{m.role} · {m.country}</div>
                  </div>
                </div>

                {/* Rank */}
                <div style={{ background:`${m.rankColor}10`, border:`1px solid ${m.rankColor}20`, borderRadius:'8px', padding:'4px 8px', display:'inline-block', marginBottom:'10px' }}>
                  <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:m.rankColor, fontWeight:700 }}>{m.rank}</span>
                </div>

                {/* Stats */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                  {[
                    { label:'Win Rate', val:`${m.winRate}%`, color:'#10B981' },
                    { label:'XP', val:m.xp >= 1000 ? `${(m.xp/1000).toFixed(1)}k` : m.xp, color:'#6366F1' },
                    { label:'Network', val:m.connections, color:'#D4A843' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign:'center', background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'6px 4px' }}>
                      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'11px', fontWeight:900, color:s.color }}>{s.val}</div>
                      <div style={{ color:S.muted, fontSize:'8px', marginTop:'1px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Doors active */}
                <div style={{ display:'flex', gap:'4px', marginBottom:'10px' }}>
                  {m.doorsActive.map(d => (
                    <span key={d} style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'7px', color:DOOR_COLOR[d], background:`${DOOR_COLOR[d]}12`, border:`1px solid ${DOOR_COLOR[d]}25`, borderRadius:'4px', padding:'2px 5px', fontWeight:700 }}>{d}</span>
                  ))}
                  {m.mentor && <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'7px', color:'#10B981', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'4px', padding:'2px 5px', fontWeight:700 }}>MENTOR</span>}
                </div>

                <p style={{ color:S.muted, fontSize:'10px', lineHeight:1.5, marginBottom:'12px' }}>{m.bio}</p>

                <div style={{ display:'flex', gap:'6px' }}>
                  {connections.has(m.id) ? (
                    <div style={{ flex:1, padding:'7px', borderRadius:'8px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', color:'#10B981', fontSize:'10px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                      <CheckCircle2 size={11} /> Connected
                    </div>
                  ) : (
                    <button onClick={()=>setConnectTarget(m)} style={{ flex:1, padding:'7px', borderRadius:'8px', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', cursor:'pointer', color:'#6366F1', fontSize:'10px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                      <UserPlus size={11} /> Connect
                    </button>
                  )}
                  <button style={{ padding:'7px 10px', borderRadius:'8px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, cursor:'pointer', color:S.muted, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <MessageCircle size={11} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── NETWORK GRAPH ── */}
      {activeTab === 'graph' && (
        <motion.div key="graph" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'16px', alignItems:'start' }}>
          <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'20px', padding:'20px', backdropFilter:'blur(20px)' }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.15em', color:'#6366F1', fontWeight:700, marginBottom:'14px' }}>NETWORK MAP</div>
            <NetworkGraph members={MEMBERS} activeId={selectedMember} onSelect={setSelectedMember} />
            <div style={{ marginTop:'12px', textAlign:'center', color:S.muted, fontSize:'10px' }}>Click a node to see profile</div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <AnimatePresence>
              {selected ? (
                <motion.div key={selected.id} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}
                  style={{ background:S.surface, border:`1px solid ${selected.rankColor}25`, borderRadius:'20px', padding:'22px', backdropFilter:'blur(20px)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px' }}>
                    <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:`linear-gradient(135deg,${selected.rankColor}40,${selected.rankColor}20)`, border:`2px solid ${selected.rankColor}60`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Orbitron',sans-serif", fontSize:'16px', fontWeight:900, color:selected.rankColor }}>
                      {selected.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <span style={{ color:'#fff', fontSize:'16px', fontWeight:700 }}>{selected.name}</span>
                        {selected.verified && <CheckCircle2 size={13} style={{ color:'#10B981' }} />}
                      </div>
                      <div style={{ color:S.muted, fontSize:'11px' }}>{selected.role} · {selected.country}</div>
                      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', color:selected.rankColor, fontWeight:700, marginTop:'2px' }}>{selected.rank}</div>
                    </div>
                  </div>
                  <p style={{ color:'#CBD5E1', fontSize:'12px', lineHeight:1.6, marginBottom:'14px' }}>{selected.bio}</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'14px' }}>
                    {[
                      { label:'Win Rate', val:`${selected.winRate}%`, color:'#10B981' },
                      { label:'Total XP', val:selected.xp.toLocaleString(), color:'#6366F1' },
                      { label:'Connections', val:selected.connections, color:'#D4A843' },
                      { label:'Posts', val:selected.posts, color:'#8B5CF6' },
                    ].map(s => (
                      <div key={s.label} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid rgba(255,255,255,0.06)`, borderRadius:'10px', padding:'10px 12px' }}>
                        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'15px', fontWeight:900, color:s.color }}>{s.val}</div>
                        <div style={{ color:S.muted, fontSize:'9px', marginTop:'2px' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    {connections.has(selected.id) ? (
                      <div style={{ flex:1, padding:'9px', borderRadius:'10px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', color:'#10B981', fontSize:'11px', fontWeight:700, textAlign:'center' }}>
                        ✓ Connected
                      </div>
                    ) : (
                      <button onClick={()=>setConnectTarget(selected)} style={{ flex:1, padding:'9px', borderRadius:'10px', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', cursor:'pointer', color:'#6366F1', fontSize:'11px', fontWeight:700 }}>
                        Connect
                      </button>
                    )}
                    {selected.mentor && !connections.has(selected.id) && (
                      <button onClick={()=>setConnectTarget(selected)} style={{ flex:1, padding:'9px', borderRadius:'10px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', cursor:'pointer', color:'#10B981', fontSize:'11px', fontWeight:700 }}>
                        Request Mentorship
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'20px', padding:'32px', textAlign:'center', backdropFilter:'blur(20px)' }}>
                  <Network size={36} style={{ color:S.muted, margin:'0 auto 12px' }} />
                  <div style={{ color:S.muted, fontSize:'13px' }}>Click any node in the graph to view that operator's profile</div>
                </div>
              )}
            </AnimatePresence>

            {/* Connection stats */}
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'20px', padding:'18px', backdropFilter:'blur(20px)' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.15em', color:'#D4A843', fontWeight:700, marginBottom:'12px' }}>NETWORK BREAKDOWN</div>
              {Object.entries(DOOR_COLOR).map(([door, color]) => {
                const count = MEMBERS.filter(m => m.doorsActive.includes(door)).length;
                return (
                  <div key={door} style={{ marginBottom:'8px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', marginBottom:'3px' }}>
                      <span style={{ color, fontFamily:"'Orbitron',sans-serif", fontWeight:700 }}>{door}</span>
                      <span style={{ color:'#CBD5E1' }}>{count} operators</span>
                    </div>
                    <div style={{ height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${count/MEMBERS.length*100}%`, background:`linear-gradient(90deg,${color}60,${color})`, borderRadius:'2px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── MENTORS ── */}
      {activeTab === 'mentors' && (
        <motion.div key="mentors" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.18)', borderRadius:'14px', padding:'14px 18px', marginBottom:'14px' }}>
            <span style={{ color:'#10B981', fontWeight:700, fontSize:'12px' }}>Mentorship Program: </span>
            <span style={{ color:'#CBD5E1', fontSize:'12px' }}>Connect directly with verified SOLVEN4 operators who have chosen to mentor. All mentors are verified with 12+ months of platform history and proven results.</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
            {MENTORS.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}
                style={{ background:S.surface, border:`1px solid rgba(16,185,129,0.2)`, borderRadius:'18px', padding:'20px', backdropFilter:'blur(20px)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:`linear-gradient(135deg,${m.rankColor}40,${m.rankColor}20)`, border:`2px solid ${m.rankColor}50`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Orbitron',sans-serif", fontSize:'14px', fontWeight:900, color:m.rankColor }}>
                    {m.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <div style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>{m.name}</div>
                    <div style={{ color:S.muted, fontSize:'10px' }}>{m.country}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:'4px', marginTop:'2px' }}>
                      <Shield size={9} style={{ color:'#10B981' }} />
                      <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'7px', color:'#10B981', fontWeight:700 }}>VERIFIED MENTOR</span>
                    </div>
                  </div>
                </div>
                <p style={{ color:'#CBD5E1', fontSize:'11px', lineHeight:1.5, marginBottom:'12px' }}>{m.bio}</p>
                <div style={{ display:'flex', gap:'4px', marginBottom:'12px' }}>
                  {m.doorsActive.map(d => (
                    <span key={d} style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'7px', color:DOOR_COLOR[d], background:`${DOOR_COLOR[d]}12`, border:`1px solid ${DOOR_COLOR[d]}25`, borderRadius:'4px', padding:'2px 5px', fontWeight:700 }}>{d}</span>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'12px' }}>
                  <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                    <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'14px', fontWeight:900, color:'#10B981' }}>{m.winRate}%</div>
                    <div style={{ color:S.muted, fontSize:'8px' }}>Win Rate</div>
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                    <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'14px', fontWeight:900, color:'#6366F1' }}>{(m.xp/1000).toFixed(1)}k</div>
                    <div style={{ color:S.muted, fontSize:'8px' }}>XP</div>
                  </div>
                </div>
                <button onClick={()=>setConnectTarget(m)} style={{ width:'100%', padding:'9px', borderRadius:'10px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', cursor:'pointer', color:'#10B981', fontSize:'11px', fontWeight:700 }}>
                  {connections.has(m.id) ? '✓ Connected' : 'Request Mentorship'}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── SQUADS ── */}
      {activeTab === 'squads' && (
        <motion.div key="squads" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {SQUADS.map((sq, i) => (
              <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}
                style={{ background:S.surface, border:`1px solid ${sq.color}20`, borderRadius:'18px', padding:'20px', backdropFilter:'blur(20px)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                  <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:`${sq.color}15`, border:`1px solid ${sq.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Users size={22} style={{ color:sq.color }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                      <span style={{ color:'#fff', fontSize:'15px', fontWeight:700 }}>{sq.name}</span>
                      <div style={{ display:'flex', gap:'4px' }}>
                        {sq.doors.map(d => (
                          <span key={d} style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'7px', color:DOOR_COLOR[d], background:`${DOOR_COLOR[d]}12`, border:`1px solid ${DOOR_COLOR[d]}25`, borderRadius:'4px', padding:'2px 5px', fontWeight:700 }}>{d}</span>
                        ))}
                      </div>
                    </div>
                    <p style={{ color:'#CBD5E1', fontSize:'12px', marginBottom:'8px' }}>{sq.goal}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', color:S.muted, marginBottom:'4px' }}>
                          <span>Squad Progress</span>
                          <span style={{ color:sq.color, fontWeight:700 }}>{sq.progress}%</span>
                        </div>
                        <div style={{ height:'5px', borderRadius:'3px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                          <motion.div initial={{ width:0 }} animate={{ width:`${sq.progress}%` }} transition={{ delay:i*0.1+0.3, duration:0.7 }}
                            style={{ height:'100%', background:`linear-gradient(90deg,${sq.color}80,${sq.color})`, borderRadius:'3px' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'4px', justifyContent:'flex-end', marginBottom:'4px' }}>
                      <Users size={11} style={{ color:S.muted }} />
                      <span style={{ color:'#CBD5E1', fontSize:'11px', fontWeight:700 }}>{sq.members}/{sq.maxMembers}</span>
                    </div>
                    <div style={{ background:`${sq.color}10`, border:`1px solid ${sq.color}20`, borderRadius:'8px', padding:'6px 10px', marginBottom:'8px' }}>
                      <div style={{ color:S.muted, fontSize:'8px', marginBottom:'2px' }}>Squad Reward</div>
                      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', color:sq.color, fontWeight:700 }}>{sq.reward}</div>
                    </div>
                    <button style={{ padding:'7px 14px', borderRadius:'8px', background:`${sq.color}12`, border:`1px solid ${sq.color}25`, cursor:'pointer', color:sq.color, fontSize:'10px', fontWeight:700 }}>
                      Join Squad
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            <button style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'16px', borderRadius:'18px', border:'1px dashed rgba(255,255,255,0.12)', background:'transparent', cursor:'pointer', color:S.muted, fontSize:'13px', transition:'all 0.15s', width:'100%' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(99,102,241,0.35)'; e.currentTarget.style.color='#6366F1'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.color=S.muted; }}>
              <Users size={16} /> Create New Squad
            </button>
          </div>
        </motion.div>
      )}

      {/* ── DEAL ROOM ── */}
      {activeTab === 'dealroom' && (
        <motion.div key="dealroom" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {DEALS.map((d, i) => (
              <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
                style={{ background:S.surface, border:`1px solid ${d.doorColor}18`, borderRadius:'16px', padding:'18px 20px', backdropFilter:'blur(20px)', cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=`${d.doorColor}35`; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=`${d.doorColor}18`; }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'14px' }}>
                  <div style={{ background:`${d.doorColor}12`, border:`1px solid ${d.doorColor}25`, borderRadius:'10px', padding:'6px 10px', flexShrink:0 }}>
                    <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:d.doorColor, fontWeight:700 }}>{d.type.toUpperCase()}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#fff', fontSize:'14px', fontWeight:700, marginBottom:'6px' }}>{d.title}</div>
                    <div style={{ display:'flex', gap:'14px', fontSize:'11px', color:S.muted }}>
                      <span>By <span style={{ color:'#CBD5E1', fontWeight:700 }}>{d.author}</span></span>
                      <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:d.doorColor, fontWeight:700 }}>{d.door}</span>
                      <span>Budget: <span style={{ color:'#D4A843' }}>{d.budget}</span></span>
                      <span>Deadline: {d.deadline}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ color:S.muted, fontSize:'10px' }}>{d.responses} responses</div>
                    <button style={{ marginTop:'6px', padding:'6px 12px', borderRadius:'8px', background:`${d.doorColor}12`, border:`1px solid ${d.doorColor}25`, cursor:'pointer', color:d.doorColor, fontSize:'10px', fontWeight:700 }}>
                      View Deal
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── LIVE FEED ── */}
      {activeTab === 'feed' && (
        <motion.div key="feed" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {FEED.map((f, i) => (
            <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.09 }}
              style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'16px', padding:'18px 20px', backdropFilter:'blur(20px)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:`linear-gradient(135deg,${DOOR_COLOR[f.door]}40,${DOOR_COLOR[f.door]}20)`, border:`1px solid ${DOOR_COLOR[f.door]}40`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Orbitron',sans-serif", fontSize:'11px', fontWeight:900, color:DOOR_COLOR[f.door], flexShrink:0 }}>
                  {f.avatar}
                </div>
                <div style={{ flex:1 }}>
                  <span style={{ color:'#fff', fontSize:'12px', fontWeight:700 }}>{f.author}</span>
                  <span style={{ color:S.muted, fontSize:'10px', marginLeft:'8px' }}>{f.time} ago</span>
                </div>
                <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', color:DOOR_COLOR[f.door], background:`${DOOR_COLOR[f.door]}12`, border:`1px solid ${DOOR_COLOR[f.door]}25`, borderRadius:'5px', padding:'3px 7px', fontWeight:700 }}>{f.door}</span>
              </div>
              <p style={{ color:'#CBD5E1', fontSize:'13px', lineHeight:1.6, marginBottom:'12px' }}>{f.post}</p>
              <div style={{ display:'flex', gap:'12px', fontSize:'11px' }}>
                <button onClick={()=>setLikedPosts(p=>({...p,[i]:!p[i]}))}
                  style={{ display:'flex', alignItems:'center', gap:'4px', background:'transparent', border:'none', cursor:'pointer', color:likedPosts[i]?'#EF4444':S.muted, padding:0, transition:'color 0.15s' }}>
                  ♥ {f.likes + (likedPosts[i]?1:0)}
                </button>
                <button style={{ display:'flex', alignItems:'center', gap:'4px', background:'transparent', border:'none', cursor:'pointer', color:S.muted, padding:0 }}>
                  <MessageCircle size={12} /> {f.comments}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      </AnimatePresence>

      {/* ── CONNECT MODAL ── */}
      <AnimatePresence>
        {connectTarget && (
          <ConnectModal
            member={connectTarget}
            onClose={() => {
              setConnections(prev => {
                const next = new Set(prev);
                next.add(connectTarget.id);
                return next;
              });
              setConnectTarget(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
