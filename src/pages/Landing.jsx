import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Zap, Brain, Users, TrendingUp, Shield, Star } from 'lucide-react';
import { SEO } from '@/components/SEO';

const DOORS = [
  { id: 'HUB',    color: '#6366F1', label: 'S4 HUB',    title: 'Intelligence & Command',   desc: 'AI briefings, wallet, broker network, cross-door analytics', features: ['SOLVEN AI Daily Brief', 'Unified Wallet & Portfolio', 'Broker B2B Network'], href: '/dashboard', external: false },
  { id: 'EDGE',   color: '#06B6D4', label: 'S4 EDGE',   title: 'Trader Platform',          desc: 'MT5 sync, signals, backtesting, trading DNA',                 features: ['MT5 Read-Only Sync', 'Live Signal Feed', 'Trading DNA Profile'], href: 'http://localhost:5176', external: true },
  { id: 'FORGE',  color: '#D4A843', label: 'S4 FORGE',  title: 'IB Operator',              desc: 'Network management, commissions, channels, operator card',     features: ['IB Network Tree', 'Commission Tracker', 'S4 Channel Command'], href: 'http://localhost:5174', external: true },
  { id: 'ORACLE', color: '#10B981', label: 'S4 ORACLE', title: 'Learning Academy',         desc: 'Courses, market analysis, daily briefings, tools',             features: ['Structured Courses', 'Market Analysis Hub', 'AI Learning Tools'], href: 'http://localhost:5178', external: true },
  { id: 'NEXUS',  color: '#EF4444', label: 'S4 NEXUS',  title: 'Business Command',         desc: 'CRM, leads, automation, social command',                       features: ['Lead CRM Pipeline', 'Social Command Center', 'Workflow Automation'], href: 'http://localhost:5177', external: true },
];

const FEATURES = [
  { Icon: Shield,     title: 'One Identity',       desc: 'Login once, access all five doors seamlessly with a single SOLVEN4 account.' },
  { Icon: TrendingUp, title: 'MT5 Intelligence',   desc: 'Read-only MT5 sync gives you full analytics without execution risk.' },
  { Icon: Brain,      title: 'AI SOLVEN Agent',    desc: 'Daily briefings, market summaries, and insights powered by Claude AI.' },
  { Icon: Users,      title: 'S4 Channels',        desc: 'Trade together in private community channels with real-time signal sharing.' },
  { Icon: Star,       title: 'Operator Cards',     desc: 'IBs get a verified operator profile card showcasing their full network.' },
  { Icon: Zap,        title: 'XP & Ranks',         desc: 'Earn experience points and climb trader ranks across every door.' },
];

function ParticleField() {
  const particles = Array.from({ length: 55 }, (_, i) => {
    const seed = (i * 137.508) % 1;
    return {
      id: i,
      x: ((i * 37 + 11) % 100),
      y: ((i * 53 + 7) % 100),
      size: (i % 3) + 1,
      delay: (i * 0.3) % 8,
      duration: 8 + (i % 8),
      opacity: 0.1 + (seed * 0.4),
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="heroGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="50%" cy="45%" rx="700" ry="500" fill="url(#heroGlow)" />
        {particles.map(p => (
          <circle key={p.id} cx={`${p.x}%`} cy={`${p.y}%`} r={p.size} fill="#6366F1" opacity={p.opacity}>
            <animate attributeName="opacity" values={`${p.opacity};${p.opacity * 0.15};${p.opacity}`} dur={`${p.duration}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
            <animate attributeName="cy" values={`${p.y}%;${p.y - 2.5}%;${p.y}%`} dur={`${p.duration}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  );
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } } };

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
    <SEO
      title="AI Financial Intelligence Platform — 5-Door Ecosystem"
      description="SOLVEN4 is a SaaS platform for trading education, IB relationship management, and professional analytics. Join as a Founding Member for lifetime access."
      path="/"
    />
    <div style={{ background: '#03080F', color: '#fff', fontFamily: "'Inter', sans-serif" }} className="min-h-screen">

      {/* NAVBAR */}
      <nav style={{ background: 'rgba(3,8,15,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16">
        <div className="flex items-center gap-3">
          <div style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', fontFamily: "'Orbitron', sans-serif", borderRadius: '8px' }}
            className="w-9 h-9 flex items-center justify-center text-white font-bold text-sm">
            S4
          </div>
          <span style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.15em', fontSize: '13px' }} className="text-white font-bold">
            SOLVEN4
          </span>
        </div>
        <button onClick={() => navigate('/auth/login')}
          style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', borderRadius: '10px' }}
          className="px-5 py-2 text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
          Enter Platform <ArrowRight size={14} />
        </button>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-4 text-center overflow-hidden">
        <ParticleField />
        <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-10 max-w-5xl mx-auto w-full">
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mb-8">
            <div className="h-px w-12 bg-indigo-500 opacity-60" />
            <span style={{ color: '#6366F1', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.3em', fontSize: '10px' }} className="font-semibold">
              SOLVEN4 INTELLIGENCE PLATFORM
            </span>
            <div className="h-px w-12 bg-indigo-500 opacity-60" />
          </motion.div>

          <motion.h1 variants={fadeUp}
            style={{ fontFamily: "'Orbitron', sans-serif", textShadow: '0 0 60px rgba(99,102,241,0.45)', lineHeight: 1.1 }}
            className="text-5xl md:text-8xl font-black mb-2 text-white">
            THE INTELLIGENCE
          </motion.h1>
          <motion.h1 variants={fadeUp}
            style={{ fontFamily: "'Orbitron', sans-serif", lineHeight: 1.1 }}
            className="text-5xl md:text-8xl font-black mb-8">
            <span className="text-white" style={{ textShadow: '0 0 60px rgba(99,102,241,0.4)' }}>LAYER OF </span>
            <span style={{ color: '#6366F1', textShadow: '0 0 80px rgba(99,102,241,0.9)' }}>TRADING</span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{ color: '#8899B4' }} className="text-lg md:text-xl max-w-2xl mx-auto mb-10">
            One platform. Five doors. The complete AI-powered trading ecosystem for the MENA region.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button onClick={() => navigate('/auth/login')}
              style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', boxShadow: '0 0 40px rgba(99,102,241,0.4)', borderRadius: '12px' }}
              className="px-8 py-4 text-white font-bold text-lg flex items-center gap-3 hover:opacity-90 transition-all hover:scale-105">
              Enter SOLVEN4 <ArrowRight size={20} />
            </button>
            <button style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '12px' }}
              className="px-8 py-4 font-semibold text-lg flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-all">
              <Play size={20} /> Watch Demo
            </button>
          </motion.div>

          {/* Door badges row */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center">
            {DOORS.map((door, i) => (
              <div key={door.id} className="flex items-center">
                <div className="flex items-center gap-2 px-4 py-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: door.color, boxShadow: `0 0 8px ${door.color}` }} />
                  <span style={{ fontFamily: "'Orbitron', sans-serif", color: door.color, fontSize: '10px', letterSpacing: '0.12em' }} className="font-bold">
                    {door.label}
                  </span>
                </div>
                {i < DOORS.length - 1 && <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)' }} />}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px' }} className="w-6 h-10 flex justify-center pt-2">
            <div style={{ background: '#6366F1', borderRadius: '999px' }} className="w-1 h-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* FIVE DOORS SECTION */}
      <section className="py-28 px-4 md:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-16" style={{ background: 'rgba(99,102,241,0.4)' }} />
            <span style={{ color: '#6366F1', fontFamily: "'Orbitron', sans-serif", fontSize: '10px', letterSpacing: '0.3em' }}>ARCHITECTURE</span>
            <div className="h-px w-16" style={{ background: 'rgba(99,102,241,0.4)' }} />
          </div>
          <h2 style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-3xl md:text-5xl font-black text-white">
            THE FIVE DOORS OF SOLVEN4
          </h2>
        </motion.div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {DOORS.map((door, i) => (
            <motion.div key={door.id}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}>
              <div style={{
                background: 'rgba(11,18,32,0.85)', backdropFilter: 'blur(24px)',
                border: `1px solid ${door.color}28`, boxShadow: `0 0 40px ${door.color}12`, borderRadius: '16px',
              }} className="p-6 h-full flex flex-col hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${door.color}18`, border: `1px solid ${door.color}35` }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: door.color, boxShadow: `0 0 10px ${door.color}` }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", color: door.color, fontSize: '11px', letterSpacing: '0.15em' }} className="font-bold">
                      {door.label}
                    </div>
                    <div className="text-white font-semibold text-sm">{door.title}</div>
                  </div>
                </div>
                <p style={{ color: '#8899B4' }} className="text-sm mb-5 flex-1">{door.desc}</p>
                <ul className="space-y-2 mb-6">
                  {door.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#8899B4' }}>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: door.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={door.href} target={door.external ? '_blank' : '_self'} rel="noreferrer"
                  style={{ background: `${door.color}18`, border: `1px solid ${door.color}35`, color: door.color, borderRadius: '10px' }}
                  className="w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-80 transition-all">
                  Enter {door.label} <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-4 md:px-8" style={{ background: 'rgba(11,18,32,0.4)' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-16">
          <h2 style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-3xl md:text-4xl font-black text-white mb-4">
            WHAT MAKES SOLVEN4 DIFFERENT
          </h2>
          <p style={{ color: '#8899B4' }} className="text-lg max-w-xl mx-auto">
            A unified intelligence layer built from the ground up for serious MENA traders.
          </p>
        </motion.div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ background: 'rgba(11,18,32,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}
              className="p-6 hover:border-indigo-500 hover:border-opacity-40 transition-all duration-300">
              <div style={{ background: 'rgba(99,102,241,0.15)', borderRadius: '10px' }} className="w-10 h-10 flex items-center justify-center mb-4">
                <Icon size={20} color="#6366F1" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p style={{ color: '#8899B4' }} className="text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-28 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 style={{ fontFamily: "'Orbitron', sans-serif", textShadow: '0 0 40px rgba(99,102,241,0.4)' }}
            className="text-4xl md:text-6xl font-black text-white mb-6">
            READY TO ENTER?
          </h2>
          <p style={{ color: '#8899B4' }} className="text-lg mb-10">Join the next generation of MENA traders.</p>
          <button onClick={() => navigate('/auth/register')}
            style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', boxShadow: '0 0 60px rgba(99,102,241,0.5)', borderRadius: '14px' }}
            className="px-10 py-5 text-white font-bold text-xl flex items-center gap-3 mx-auto hover:opacity-90 transition-all hover:scale-105">
            Create Your Account <ArrowRight size={22} />
          </button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#03080F' }} className="py-10 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', fontFamily: "'Orbitron', sans-serif", borderRadius: '7px' }}
              className="w-8 h-8 flex items-center justify-center text-white font-bold text-xs">
              S4
            </div>
            <span style={{ color: '#8899B4', fontSize: '13px' }}>© 2026 SOLVEN4. Built for MENA traders.</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {DOORS.map(door => (
              <a key={door.id} href={door.href} target={door.external ? '_blank' : '_self'} rel="noreferrer"
                style={{ color: door.color, fontSize: '11px', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}
                className="hover:opacity-70 transition-opacity font-semibold">
                {door.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
