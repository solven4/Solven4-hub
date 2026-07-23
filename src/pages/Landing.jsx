import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring, animate } from 'framer-motion';
import Lenis from 'lenis';
import { ArrowRight, Play, Zap, Brain, Users, TrendingUp, Shield, Star, Globe as GlobeIcon } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useLang } from '@/lib/LanguageContext';

// Lenis momentum smooth-scroll — matches AlphaLedger's marketing site feel
// (confirmed live: alphaledger.ai loads Lenis + GSAP ScrollTrigger for its
// scroll-jacked storytelling sections). We don't pin/scrub sections the way
// their Webflow+GSAP build does, but the same buttery momentum scroll plus
// real scroll-linked reveals below gets the same felt experience in React.
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3) });
    let raf;
    function loop(time) { lenis.raf(time); raf = requestAnimationFrame(loop); }
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
}

// Count-up-on-scroll-into-view stat, matching AlphaLedger's live-ticking
// "Key Figures" band instead of a static number.
function CountUp({ value, style }) {
  const ref = useRef(null);
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState('0');
  const numeric = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const suffix = String(value).replace(/^[\d,.\s]+/, '');
  const decimals = (String(value).match(/\.(\d+)/)?.[1] || '').length;
  useEffect(() => {
    const unsub = mv.on('change', (v) => setDisplay(v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })));
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        animate(mv, numeric, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => { unsub(); obs.disconnect(); };
  }, []);
  return <div ref={ref} style={style}>{display}{suffix}</div>;
}

// ── SOLVEN4 marketing skin — AlphaLedger design DNA (light theme, pill CTAs, Satoshi) ──
const C = {
  bg: '#FFFFFF', bg2: '#F7F7F8', panel: '#FFFFFF',
  line: '#E5E5E5', ink: '#020202', dim: '#5B5B63', dimmer: '#8A8A93',
  indigo: '#6366F1', indigoLt: '#818CF8', cyan: '#22D3EE',
  serif: "'Satoshi', sans-serif", sans: "'Satoshi', system-ui, sans-serif", mono: "'Satoshi', sans-serif",
};

const DOORS = [
  { id: 'HUB',    color: '#6366F1', label: 'S4 HUB',    node: 'NODE // HUB',    title: 'Intelligence & Command', titleAr: 'الذكاء والقيادة',   desc: 'AI briefings, wallet, broker network, cross-door analytics', descAr: 'إحاطات الذكاء الاصطناعي، المحفظة، شبكة الوسطاء، تحليلات عبر الأبواب', features: ['SOLVEN AI Daily Brief', 'Unified Wallet & Portfolio', 'Broker B2B Network'], featuresAr: ['إحاطة سولفن اليومية', 'محفظة موحدة', 'شبكة وسطاء B2B'], href: '/dashboard', external: false },
  { id: 'EDGE',   color: '#06B6D4', label: 'S4 EDGE',   node: 'NODE // EDGE',   title: 'Trader Platform', titleAr: 'منصة المتداول',        desc: 'MT5 sync, signals, backtesting, trading DNA', descAr: 'مزامنة MT5، الإشارات، الاختبار الخلفي، الحمض النووي للتداول',                 features: ['MT5 Read-Only Sync', 'Live Signal Feed', 'Trading DNA Profile'], featuresAr: ['مزامنة MT5 للقراءة فقط', 'بث إشارات مباشر', 'ملف الحمض النووي للتداول'], href: 'https://solven4-edge-six.vercel.app', external: true },
  { id: 'FORGE',  color: '#D4A843', label: 'S4 FORGE',  node: 'NODE // FORGE',  title: 'IB Operator', titleAr: 'مشغل الوسيط المُعرِّف',     desc: 'Network management, commissions, channels, operator card', descAr: 'إدارة الشبكة، العمولات، القنوات، بطاقة المشغل',     features: ['IB Network Tree', 'Commission Tracker', 'S4 Channel Command'], featuresAr: ['شجرة شبكة الوسطاء', 'متتبع العمولات', 'قيادة قنوات S4'], href: 'https://solven4-forge-pi.vercel.app', external: true },
  { id: 'ORACLE', color: '#10B981', label: 'S4 ORACLE', node: 'NODE // ORACLE', title: 'Learning Academy', titleAr: 'أكاديمية التعلم',        desc: 'Courses, market analysis, daily briefings, tools', descAr: 'الدورات، تحليل السوق، الإحاطات اليومية، الأدوات',             features: ['Structured Courses', 'Market Analysis Hub', 'AI Learning Tools'], featuresAr: ['دورات منظمة', 'مركز تحليل السوق', 'أدوات تعلم بالذكاء الاصطناعي'], href: 'https://solven4-oracle-eight.vercel.app', external: true },
  { id: 'NEXUS',  color: '#EF4444', label: 'S4 NEXUS',  node: 'NODE // NEXUS',  title: 'Business Command', titleAr: 'قيادة الأعمال',        desc: 'CRM, leads, automation, social command', descAr: 'إدارة العملاء، العملاء المحتملون، الأتمتة، قيادة التواصل الاجتماعي',                       features: ['Lead CRM Pipeline', 'Social Command Center', 'Workflow Automation'], featuresAr: ['خط أنابيب العملاء المحتملين', 'مركز قيادة التواصل الاجتماعي', 'أتمتة سير العمل'], href: 'https://solven4-nexus-self.vercel.app', external: true },
];

const FEATURES = [
  { Icon: Shield,     title: 'ONE IDENTITY',     titleAr: 'هوية واحدة',          desc: 'Login once, access all five doors seamlessly with a single SOLVEN4 account.', descAr: 'سجّل دخولك مرة واحدة وادخل إلى الأبواب الخمسة بحساب SOLVEN4 واحد.' },
  { Icon: TrendingUp, title: 'MT5 INTELLIGENCE', titleAr: 'ذكاء MT5',            desc: 'Read-only MT5 sync gives you full analytics without execution risk.', descAr: 'مزامنة MT5 للقراءة فقط تمنحك تحليلات كاملة دون مخاطر التنفيذ.' },
  { Icon: Brain,      title: 'AI SOLVEN AGENT',  titleAr: 'وكيل سولفن الذكي',    desc: 'Daily briefings, market summaries, and insights powered by Claude AI.', descAr: 'إحاطات يومية وملخصات للسوق ورؤى مدعومة بذكاء Claude الاصطناعي.' },
  { Icon: Users,      title: 'S4 CHANNELS',      titleAr: 'قنوات S4',            desc: 'Trade together in private community channels with real-time signal sharing.', descAr: 'تداول مع مجتمعك في قنوات خاصة مع مشاركة إشارات فورية.' },
  { Icon: Star,       title: 'OPERATOR CARDS',   titleAr: 'بطاقات المشغل',       desc: 'IBs get a verified operator profile card showcasing their full network.', descAr: 'يحصل الوسطاء المُعرِّفون على بطاقة مشغل موثقة تعرض شبكتهم الكاملة.' },
  { Icon: Zap,        title: 'XP & RANKS',       titleAr: 'نقاط الخبرة والرتب',  desc: 'Earn experience points and climb trader ranks across every door.', descAr: 'اكسب نقاط خبرة وارتقِ في رتب المتداولين عبر كل الأبواب.' },
];

const STATS = [
  { k: 'DOORS', v: '5', s: 'Active' }, { k: 'OPERATORS', v: '12,480', s: 'Live' },
  { k: 'MT5 SYNCED', v: '3,214', s: 'Streaming' }, { k: 'UPTIME', v: '99.98%', s: 'Nominal' },
];

const TICKER = [
  ['XAUUSD', '2,358.12', 0.44], ['EURUSD', '1.0842', -0.12], ['BTCUSD', '68,412.5', 2.14], ['USDJPY', '156.24', -0.31],
  ['USOIL', '82.10', 0.08], ['NAS100', '20,124.8', 0.62], ['ETHUSD', '3,411.2', -0.82], ['DXY', '104.22', -0.18],
];

const BRIEF = [
  'GOLD holds structural bid above 2340; DXY compresses.',
  'MENA session +0.42% risk-on',
  'US CPI 16:30 GST',
  'BTC reclaims 68.4k',
  'OPEC+ headlines pre-London',
];

function Eyebrow({ children, color = C.indigo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 22 }}>
      <div style={{ height: 1, width: 46, background: `linear-gradient(90deg, transparent, ${color})` }} />
      <span style={{ fontFamily: C.mono, color, fontSize: 11, letterSpacing: '0.3em' }}>{children}</span>
      <div style={{ height: 1, width: 46, background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
}

function Ticker() {
  const items = [...TICKER, ...TICKER, ...TICKER];
  return (
    <div style={{ overflow: 'hidden', borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: '11px 0', maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}>
      <div style={{ display: 'inline-flex', gap: 0, whiteSpace: 'nowrap', animation: 'e-ticker 40s linear infinite' }}>
        {items.map(([sym, px, chg], i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 22px', fontFamily: C.mono, fontSize: 12.5 }}>
            <span style={{ color: C.ink }}>{sym}</span>
            <span style={{ color: C.dim }}>{px}</span>
            <span style={{ color: chg >= 0 ? '#34D399' : '#F43F5E' }}>{chg >= 0 ? '▲' : '▼'} {Math.abs(chg)}%</span>
            <span style={{ color: C.line, marginLeft: 14 }}>|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Waveform() {
  const pts = Array.from({ length: 48 }, (_, i) => {
    const y = 30 + Math.sin(i * 0.5) * 14 + Math.sin(i * 1.7) * 6 + (i % 9 === 4 ? Math.sin(i) * 12 : 0);
    return `${(i / 47) * 300},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 300 60" preserveAspectRatio="none" style={{ width: '100%', height: 56, display: 'block' }}>
      <defs><linearGradient id="wv" x1="0" x2="1"><stop offset="0" stopColor={C.indigoLt} /><stop offset="0.5" stopColor={C.indigo} /><stop offset="1" stopColor={C.cyan} /></linearGradient></defs>
      <polyline points={pts} fill="none" stroke="url(#wv)" strokeWidth="1.6" style={{ filter: `drop-shadow(0 0 5px ${C.indigo})` }} />
    </svg>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export default function Landing() {
  const navigate = useNavigate();
  const { t, lang, setLang, isAr } = useLang();
  const [clock, setClock] = useState('00:00:00');
  useEffect(() => { const t = () => setClock(new Date().toISOString().slice(11, 19)); t(); const id = setInterval(t, 1000); return () => clearInterval(id); }, []);
  useLenis();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  // AlphaLedger's primary CTA is a flat solid-black pill, no neon glow.
  const btnPrimary = { background: C.ink, color: '#fff', border: 'none', fontFamily: C.mono, letterSpacing: '0.02em' };
  const label = (color = C.dim) => ({ fontFamily: C.mono, fontSize: 11, letterSpacing: '0.2em', color });

  return (
    <>
      <SEO title="AI Financial Intelligence Platform — 5-Door Ecosystem"
        description="SOLVEN4 is a SaaS platform for trading education, IB relationship management, and professional analytics. Join as a Founding Member for lifetime access."
        path="/" />

      <style>{`
        @keyframes e-ticker { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
        @keyframes e-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes e-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        .e-cursor { animation: e-blink 1.1s step-end infinite; }
        .e-dot { animation: e-pulse 2s infinite; }
        .e-card { transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease; }
        .e-card:hover { transform: translateY(-4px); }
        .e-link:hover { opacity: .8; }
      `}</style>

      <div style={{ background: C.bg, color: C.ink, fontFamily: C.sans, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
        {/* ambient dual-accent glow */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: `radial-gradient(at 20% 8%, rgba(99,102,241,0.14), transparent 55%), radial-gradient(at 82% 92%, rgba(34,211,238,0.10), transparent 55%)` }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* ── NAV ── */}
          <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.cyan})`, fontFamily: C.serif, borderRadius: 7, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>S4</div>
              <div>
                <div style={{ fontFamily: C.serif, letterSpacing: '0.18em', fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1 }}>SOLVEN4</div>
                <div style={{ ...label(C.indigoLt), fontSize: 8.5, marginTop: 2 }}>INTELLIGENCE.HUB</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              {[[t('DOORS','الأبواب'),'doors'], [t('INTEL','الذكاء'),'intel'], [t('MATRIX','المصفوفة'),'matrix']].map(([x, key]) => <span key={key} style={{ ...label(), fontSize: 10.5, cursor: 'pointer' }} className="e-link">{x}</span>)}
              <span style={{ ...label(C.indigoLt), fontSize: 10.5 }}>{clock} UTC</span>
              <button onClick={() => setLang(isAr ? 'en' : 'ar')} aria-label={t('Switch language', 'تغيير اللغة')}
                style={{ background: 'transparent', border: `1px solid ${C.line}`, color: C.dim, borderRadius: 9999, padding: '8px 10px', fontSize: 11, fontFamily: C.mono, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <GlobeIcon size={13} /> {isAr ? 'EN' : 'ع'}
              </button>
              <button onClick={() => navigate('/auth/login')} style={{ ...btnPrimary, borderRadius: 9999, padding: '8px 16px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                {t('ENTER PLATFORM', 'ادخل المنصة')} <ArrowRight size={13} style={isAr ? { transform: 'scaleX(-1)' } : undefined} />
              </button>
            </div>
          </nav>

          {/* ── HERO ── */}
          <section ref={heroRef} style={{ padding: '70px 24px 30px', maxWidth: 1160, margin: '0 auto' }}>
            <motion.div variants={stagger} initial="hidden" animate="show" style={{ textAlign: 'center', y: heroY, opacity: heroOpacity }}>
              <motion.div variants={fadeUp}><Eyebrow>{t('SOLVEN4 INTELLIGENCE PLATFORM', 'منصة SOLVEN4 الذكية')}</Eyebrow></motion.div>
              {isAr ? (
                <motion.h1 variants={fadeUp} style={{ fontFamily: C.serif, fontWeight: 500, fontSize: 'clamp(34px, 6.5vw, 72px)', lineHeight: 1.15, margin: '0 0 26px', color: C.ink }}>
                  <span style={{ color: C.ink }}>طبقة الذكاء </span>
                  <span style={{ background: `linear-gradient(180deg, ${C.indigoLt}, ${C.indigo} 45%, ${C.cyan})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>للتداول</span>
                </motion.h1>
              ) : (
                <>
                  <motion.h1 variants={fadeUp} style={{ fontFamily: C.serif, fontWeight: 500, fontSize: 'clamp(38px, 7vw, 82px)', lineHeight: 1.04, margin: '0 0 6px', color: C.ink }}>
                    THE INTELLIGENCE
                  </motion.h1>
                  <motion.h1 variants={fadeUp} style={{ fontFamily: C.serif, fontWeight: 500, fontSize: 'clamp(38px, 7vw, 82px)', lineHeight: 1.04, margin: '0 0 26px' }}>
                    <span style={{ color: C.ink }}>LAYER OF </span>
                    <span style={{ background: `linear-gradient(180deg, ${C.indigoLt}, ${C.indigo} 45%, ${C.cyan})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TRADING</span>
                    <span className="e-cursor" style={{ color: C.cyan }}>_</span>
                  </motion.h1>
                </>
              )}
              <motion.p variants={fadeUp} style={{ color: C.dim, fontSize: 18, maxWidth: 620, margin: '0 auto 14px' }}>
                {t('One platform. Five doors. The complete AI-powered trading ecosystem for the MENA region.',
                   'منصة واحدة. خمسة أبواب. نظام تداول متكامل مدعوم بالذكاء الاصطناعي لمنطقة الشرق الأوسط وشمال أفريقيا.')}
              </motion.p>
              <motion.div variants={fadeUp} style={{ ...label(C.dimmer), fontSize: 11, marginBottom: 30 }}>{t('// AUTH · SUBSCRIPTION · ANALYTICS · CROSS-DOOR CONTROL', '// الدخول · الاشتراك · التحليلات · التحكم عبر الأبواب')}</motion.div>
              <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 44 }}>
                <button onClick={() => navigate('/auth/login')} style={{ ...btnPrimary, borderRadius: 9999, padding: '15px 30px', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {t('ENTER SOLVEN4', 'ادخل SOLVEN4')} <ArrowRight size={18} style={isAr ? { transform: 'scaleX(-1)' } : undefined} />
                </button>
                <button style={{ background: 'transparent', border: `1px solid ${C.line}`, color: C.ink, borderRadius: 9999, padding: '15px 30px', fontSize: 14, fontFamily: C.mono, letterSpacing: '0.08em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Play size={16} /> {t('WATCH DEMO', 'شاهد العرض')}
                </button>
              </motion.div>

              {/* stats */}
              <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: C.line, border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden', marginBottom: 30 }}>
                {STATS.map(s => (
                  <div key={s.k} style={{ background: C.bg, padding: '18px 12px' }}>
                    <div style={label()}>{s.k}</div>
                    <CountUp value={s.v} style={{ fontFamily: C.serif, fontWeight: 500, fontSize: 26, color: C.ink, margin: '6px 0 3px', fontVariantNumeric: 'tabular-nums' }} />
                    <div style={{ ...label(C.indigoLt), fontSize: 9.5 }}>// {s.s}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ticker */}
            <Ticker />

            {/* AI waveform brief panel */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              style={{ marginTop: 24, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}
              className="e-brief-grid">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={label(C.indigoLt)}>{t('SOLVEN AI // WAVEFORM', 'سولفن AI // موجة البيانات')}</span>
                  <span style={{ ...label('#34D399'), fontSize: 9.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span className="e-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 6px #34D399' }} /> {t('LIVE', 'مباشر')}</span>
                </div>
                <Waveform />
                <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
                  <span style={label()}>{t('SIGNAL / NOISE', 'الإشارة / الضجيج')} <b style={{ color: C.cyan }}>4.82</b></span>
                  <span style={label()}>{t('CONFIDENCE', 'الثقة')} <b style={{ color: C.indigoLt }}>82%</b></span>
                </div>
              </div>
              <div>
                <div style={{ ...label(C.indigoLt), marginBottom: 10 }}>{t('// DAILY BRIEF', '// الإحاطة اليومية')}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {BRIEF.map((b, i) => (
                    <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', color: i === 0 ? C.ink : C.dim, fontSize: 13 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.indigo, marginTop: 7, flexShrink: 0, boxShadow: `0 0 6px ${C.indigo}` }} />{b}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </section>

          {/* ── ARCHITECTURE: FIVE DOORS ── */}
          <section style={{ padding: '80px 24px', maxWidth: 1160, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 44 }}>
              <Eyebrow>{t('ARCHITECTURE', 'البنية')}</Eyebrow>
              <h2 style={{ fontFamily: C.serif, fontWeight: 500, fontSize: 'clamp(26px, 4vw, 46px)', color: C.ink, margin: 0 }}>{t('THE FIVE DOORS OF SOLVEN4', 'أبواب SOLVEN4 الخمسة')}</h2>
              <p style={{ color: C.dim, fontSize: 15, marginTop: 12 }}>{t('A unified intelligence layer built from the ground up for serious MENA traders.', 'طبقة ذكاء موحدة مبنية من الصفر للمتداولين الجادين في منطقة الشرق الأوسط وشمال أفريقيا.')}</p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
              {DOORS.map((door, i) => (
                <motion.div key={door.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                  <div className="e-card" style={{ background: C.panel, border: `1px solid ${door.color}33`, borderRadius: 16, padding: 22, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ ...label(door.color), fontSize: 9.5, marginBottom: 12 }}>{door.node}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${door.color}18`, border: `1px solid ${door.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="e-dot" style={{ width: 11, height: 11, borderRadius: '50%', background: door.color, boxShadow: `0 0 10px ${door.color}` }} />
                      </div>
                      <div>
                        <div style={{ fontFamily: C.serif, color: door.color, fontSize: 12, letterSpacing: '0.14em', fontWeight: 700 }}>{door.label}</div>
                        <div style={{ color: C.ink, fontWeight: 600, fontSize: 14 }}>{t(door.title, door.titleAr)}</div>
                      </div>
                    </div>
                    <p style={{ color: C.dim, fontSize: 13.5, margin: '0 0 16px', flex: 1 }}>{t(door.desc, door.descAr)}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {door.features.map((f, fi) => (
                        <li key={f} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: C.dim, borderBottom: `1px solid ${C.line}`, paddingBottom: 8 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: door.color }} />{t(f, door.featuresAr[fi])}</span>
                          <span style={{ ...label(door.color), fontSize: 8.5 }}>v4.0</span>
                        </li>
                      ))}
                    </ul>
                    <div style={{ ...label('#34D399'), fontSize: 9, marginBottom: 12 }}>{t('STATUS · ONLINE · SECURE', 'الحالة · متصل · آمن')}</div>
                    <a href={door.href} target={door.external ? '_blank' : '_self'} rel="noreferrer" className="e-link"
                      style={{ background: `${door.color}18`, border: `1px solid ${door.color}40`, color: door.color, borderRadius: 10, padding: '11px', textAlign: 'center', fontFamily: C.mono, fontSize: 12, letterSpacing: '0.06em', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {t('ENTER', 'ادخل')} {door.label} <ArrowRight size={13} style={isAr ? { transform: 'scaleX(-1)' } : undefined} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── INTELLIGENCE MATRIX ── */}
          <section style={{ padding: '70px 24px', background: C.bg2, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 40 }}>
                <Eyebrow color={C.cyan}>{t('WHAT MAKES SOLVEN4 DIFFERENT', 'ما الذي يميز SOLVEN4')}</Eyebrow>
                <h2 style={{ fontFamily: C.serif, fontWeight: 500, fontSize: 'clamp(24px, 3.6vw, 40px)', color: C.ink, margin: 0 }}>{t('THE INTELLIGENCE MATRIX', 'مصفوفة الذكاء')}</h2>
              </motion.div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {FEATURES.map(({ Icon, title, titleAr, desc, descAr }, i) => (
                  <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}
                    className="e-card" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.indigo}22, ${C.cyan}18)`, border: `1px solid ${C.indigo}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                      <Icon size={19} color={C.indigoLt} />
                    </div>
                    <h3 style={{ fontFamily: C.serif, color: C.ink, fontSize: 13.5, fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 8px' }}>{t(title, titleAr)}</h3>
                    <p style={{ color: C.dim, fontSize: 13.5, margin: 0 }}>{t(desc, descAr)}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section style={{ padding: '90px 24px', textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Eyebrow>{t('READY TO ENTER?', 'مستعد للدخول؟')}</Eyebrow>
              <h2 style={{ fontFamily: C.serif, fontWeight: 500, fontSize: 'clamp(30px, 5vw, 58px)', color: C.ink, margin: '0 0 8px' }}>{t('JOIN THE NEXT GENERATION', 'انضم للجيل القادم')}</h2>
              <p style={{ color: C.dim, fontSize: 16, marginBottom: 30 }}>{t('Of MENA traders operating on the intelligence layer.', 'من متداولي الشرق الأوسط وشمال أفريقيا العاملين على طبقة الذكاء.')}</p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/auth/register')} style={{ ...btnPrimary, borderRadius: 9999, padding: '16px 34px', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {t('CREATE YOUR ACCOUNT', 'أنشئ حسابك')} <ArrowRight size={18} style={isAr ? { transform: 'scaleX(-1)' } : undefined} />
                </button>
                <button onClick={() => navigate('/auth/login')} style={{ background: 'transparent', border: `1px solid ${C.line}`, color: C.ink, borderRadius: 9999, padding: '16px 34px', fontSize: 15, fontFamily: C.mono, letterSpacing: '0.08em', cursor: 'pointer' }}>
                  {t('SIGN IN', 'تسجيل الدخول')}
                </button>
              </div>
            </motion.div>
          </section>

          {/* ── FOOTER ── */}
          <footer style={{ borderTop: `1px solid ${C.line}`, padding: '26px 24px', maxWidth: 1160, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <span style={label()}>{t('© 2026 SOLVEN4 // INTELLIGENCE.HUB // ALL SYSTEMS NOMINAL', '© 2026 SOLVEN4 // INTELLIGENCE.HUB // كل الأنظمة تعمل بشكل طبيعي')}</span>
            <div style={{ display: 'flex', gap: 20 }}>
              {[[t('PRIVACY','الخصوصية'),'privacy'], [t('TERMS','الشروط'),'terms'], [t('SECURITY','الأمان'),'security']].map(([x, key]) => <a key={key} href="/legal" style={{ ...label(), fontSize: 10, textDecoration: 'none' }} className="e-link">{x}</a>)}
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
