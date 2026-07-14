import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SEO } from '@/components/SEO';

const DOOR_DOTS = [
  { color: '#6366F1' },
  { color: '#3B82F6' },
  { color: '#D4A843' },
  { color: '#10B981' },
  { color: '#8B5CF6' },
];

function ParticleOrb() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="orbGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#6366F1" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="300" cy="300" r="280" fill="url(#orbGrad)" />
        <circle cx="300" cy="300" r="200" fill="none" stroke="#6366F1" strokeOpacity="0.12" strokeWidth="1">
          <animate attributeName="r" values="200;220;200" dur="6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.12;0.05;0.12" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle cx="300" cy="300" r="140" fill="none" stroke="#6366F1" strokeOpacity="0.18" strokeWidth="1">
          <animate attributeName="r" values="140;155;140" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="300" cy="300" r="70" fill="none" stroke="#6366F1" strokeOpacity="0.25" strokeWidth="1.5">
          <animate attributeName="r" values="70;80;70" dur="3s" repeatCount="indefinite" />
        </circle>
        {Array.from({ length: 30 }, (_, i) => {
          const angle = (i * 12) * (Math.PI / 180);
          const r = 220 + (i % 3) * 40;
          const x = 300 + r * Math.cos(angle);
          const y = 300 + r * Math.sin(angle);
          return <circle key={i} cx={x} cy={y} r="1.5" fill="#6366F1" opacity={0.15 + (i % 4) * 0.08}>
            <animate attributeName="opacity" values={`${0.15 + (i % 4) * 0.08};0.03;${0.15 + (i % 4) * 0.08}`} dur={`${3 + i % 5}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />
          </circle>;
        })}
      </svg>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { toast.error('Enter your email and password'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Welcome back, Operator');
    navigate('/dashboard');
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <>
    <SEO title="Sign In" path="/auth/login" noindex />
    <div style={{ background: '#05050C', minHeight: '100vh', display: 'flex' }}>
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center overflow-hidden"
        style={{ borderRight: '1px solid #29293D' }}>
        <ParticleOrb />
        <div className="relative z-10 text-center">
          <div style={{ fontFamily: "'Orbitron', sans-serif", background: 'linear-gradient(135deg,#6366F1,#22D3EE)', borderRadius: '16px' }}
            className="w-20 h-20 flex items-center justify-center text-white font-black text-2xl mx-auto mb-6">
            S4
          </div>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", textShadow: '0 0 60px rgba(99,102,241,0.6)' }}
            className="text-5xl font-black text-white mb-3">
            SOLVEN4
          </h1>
          <p style={{ color: '#94A3B8', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.3em', fontSize: '11px' }}>
            INTELLIGENCE PLATFORM
          </p>
          <div className="flex items-center justify-center gap-3 mt-10">
            {DOOR_DOTS.map((d, i) => (
              <div key={i} className="w-3 h-3 rounded-full" style={{ background: d.color, boxShadow: `0 0 12px ${d.color}` }} />
            ))}
          </div>
          <p style={{ color: '#94A3B8', fontSize: '13px' }} className="mt-6">Five doors. One identity.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)', fontFamily: "'Orbitron', sans-serif", borderRadius: '8px' }}
              className="w-9 h-9 flex items-center justify-center text-white font-bold text-sm">S4</div>
            <span style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.15em', fontSize: '13px' }} className="text-white font-bold">SOLVEN4</span>
          </div>

          <div className="mb-8">
            <div style={{ color: '#6366F1', fontFamily: "'Orbitron', sans-serif", fontSize: '10px', letterSpacing: '0.3em' }} className="mb-2">
              OPERATOR ACCESS
            </div>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-3xl font-black text-white">
              Welcome back,
            </h2>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", color: '#6366F1' }} className="text-3xl font-black">
              Operator
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ color: '#94A3B8', fontSize: '12px', letterSpacing: '0.08em' }} className="block mb-2 font-medium">EMAIL</label>
              <div className="relative">
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="operator@solven4.com"
                  style={{ background: '#0A0C1E', border: '1px solid #29293D', borderRadius: '10px', color: '#fff', paddingLeft: '40px' }}
                  className="w-full py-3 pr-4 text-sm outline-none focus:border-indigo-500 transition-colors placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <label style={{ color: '#94A3B8', fontSize: '12px', letterSpacing: '0.08em' }} className="block mb-2 font-medium">PASSWORD</label>
              <div className="relative">
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ background: '#0A0C1E', border: '1px solid #29293D', borderRadius: '10px', color: '#fff', paddingLeft: '40px', paddingRight: '40px' }}
                  className="w-full py-3 text-sm outline-none focus:border-indigo-500 transition-colors placeholder-gray-600"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#6366F1,#22D3EE)', borderRadius: '10px', width: '100%' }}
              className="py-3.5 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:cursor-not-allowed mt-2">
              {loading ? 'Connecting...' : (<>Enter Platform <ArrowRight size={16} /></>)}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: '#29293D' }} />
            <span style={{ color: '#94A3B8', fontSize: '12px' }}>or</span>
            <div className="flex-1 h-px" style={{ background: '#29293D' }} />
          </div>

          <button onClick={handleGoogle}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #29293D', borderRadius: '10px', width: '100%' }}
            className="py-3.5 text-white font-semibold text-sm flex items-center justify-center gap-3 hover:bg-white hover:bg-opacity-8 transition-all">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ color: '#94A3B8', fontSize: '13px' }} className="text-center mt-6">
            No account?{' '}
            <Link to="/auth/register" style={{ color: '#6366F1' }} className="font-semibold hover:opacity-80 transition-opacity">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
    </>
  );
}
