import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/lib/LanguageContext';

const DOORS = [
  { id: 'HUB',    label: 'S4 HUB',    color: '#6366F1', desc: 'Intelligence & Command', descAr: 'الذكاء والقيادة' },
  { id: 'EDGE',   label: 'S4 EDGE',   color: '#06B6D4', desc: 'Trader Platform', descAr: 'منصة المتداول' },
  { id: 'FORGE',  label: 'S4 FORGE',  color: '#D4A843', desc: 'IB Operator', descAr: 'مشغل الوسيط' },
  { id: 'ORACLE', label: 'S4 ORACLE', color: '#10B981', desc: 'Learning Academy', descAr: 'أكاديمية التعلم' },
  { id: 'NEXUS',  label: 'S4 NEXUS',  color: '#EF4444', desc: 'Business Command', descAr: 'قيادة الأعمال' },
];

function ParticleOrb() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="orbGradR" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#6366F1" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="300" cy="300" r="260" fill="url(#orbGradR)" />
        <circle cx="300" cy="300" r="190" fill="none" stroke="#8B5CF6" strokeOpacity="0.12" strokeWidth="1">
          <animate attributeName="r" values="190;210;190" dur="7s" repeatCount="indefinite" />
        </circle>
        <circle cx="300" cy="300" r="120" fill="none" stroke="#6366F1" strokeOpacity="0.18" strokeWidth="1">
          <animate attributeName="r" values="120;135;120" dur="4.5s" repeatCount="indefinite" />
        </circle>
        {Array.from({ length: 5 }, (_, i) => {
          const angle = (i * 72) * (Math.PI / 180);
          const colors = ['#6366F1','#3B82F6','#D4A843','#10B981','#8B5CF6'];
          const x = 300 + 200 * Math.cos(angle);
          const y = 300 + 200 * Math.sin(angle);
          return <circle key={i} cx={x} cy={y} r="4" fill={colors[i]} opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur={`${3 + i}s`} repeatCount="indefinite" />
          </circle>;
        })}
      </svg>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { t, isAr, setLang } = useLang();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [primaryDoor, setPrimaryDoor] = useState('HUB');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fullName || !email || !password) { toast.error(t('Fill all required fields', 'املأ جميع الحقول المطلوبة')); return; }
    if (password !== confirmPassword) { toast.error(t('Passwords do not match', 'كلمتا المرور غير متطابقتين')); return; }
    if (password.length < 6) { toast.error(t('Password must be at least 6 characters', 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل')); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, primary_door: primaryDoor } },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t('Account created! Welcome to SOLVEN4.', 'تم إنشاء الحساب! أهلاً بك في SOLVEN4.'));
    navigate('/dashboard');
  }

  const selectedDoor = DOORS.find(d => d.id === primaryDoor);

  return (
    <div style={{ background: '#05050C', minHeight: '100vh', display: 'flex' }}>
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center overflow-hidden"
        style={{ borderRight: '1px solid #29293D' }}>
        <ParticleOrb />
        <div className="relative z-10 text-center px-8">
          <div style={{ fontFamily: "'Orbitron', sans-serif", background: 'linear-gradient(135deg,#6366F1,#22D3EE)', borderRadius: '16px' }}
            className="w-20 h-20 flex items-center justify-center text-white font-black text-2xl mx-auto mb-6">
            S4
          </div>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", textShadow: '0 0 60px rgba(99,102,241,0.6)' }}
            className="text-5xl font-black text-white mb-3">SOLVEN4</h1>
          <p style={{ color: '#94A3B8', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.3em', fontSize: '11px' }} className="mb-10">
            {t('CHOOSE YOUR DOOR', 'اختر بابك')}
          </p>
          <div className="space-y-3 max-w-xs mx-auto">
            {DOORS.map(door => (
              <div key={door.id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
                style={{ background: primaryDoor === door.id ? `${door.color}15` : 'transparent', border: `1px solid ${primaryDoor === door.id ? door.color + '40' : 'transparent'}` }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: door.color, boxShadow: `0 0 8px ${door.color}` }} />
                <span style={{ fontFamily: "'Orbitron', sans-serif", color: primaryDoor === door.id ? door.color : '#94A3B8', fontSize: '11px', letterSpacing: '0.1em' }} className="font-bold">
                  {door.label}
                </span>
                <span style={{ color: '#94A3B8', fontSize: '11px' }} className="ml-auto">{t(door.desc, door.descAr)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)', fontFamily: "'Orbitron', sans-serif", borderRadius: '8px' }}
              className="w-9 h-9 flex items-center justify-center text-white font-bold text-sm">S4</div>
            <span style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.15em', fontSize: '13px' }} className="text-white font-bold">SOLVEN4</span>
          </div>

          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <div style={{ color: '#6366F1', fontFamily: "'Orbitron', sans-serif", fontSize: '10px', letterSpacing: '0.3em' }} className="mb-2">
                {t('CREATE ACCOUNT', 'إنشاء حساب')}
              </div>
              <h2 style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-2xl font-black text-white">
                {t('Join SOLVEN4', 'انضم إلى SOLVEN4')}
              </h2>
            </div>
            <button type="button" onClick={() => setLang(isAr ? 'en' : 'ar')} aria-label={t('Switch language', 'تغيير اللغة')}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #29293D', borderRadius: '8px', color: '#94A3B8', padding: '7px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
              {isAr ? 'EN' : 'ع'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label style={{ color: '#94A3B8', fontSize: '11px', letterSpacing: '0.08em' }} className="block mb-1.5 font-medium">{t('FULL NAME', 'الاسم الكامل')}</label>
              <div className="relative">
                <User size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t('Your full name', 'اسمك الكامل')}
                  style={{ background: '#0A0C1E', border: '1px solid #29293D', borderRadius: '10px', color: '#fff', paddingLeft: '38px' }}
                  className="w-full py-3 pr-4 text-sm outline-none focus:border-indigo-500 transition-colors placeholder-gray-600" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ color: '#94A3B8', fontSize: '11px', letterSpacing: '0.08em' }} className="block mb-1.5 font-medium">{t('EMAIL', 'البريد الإلكتروني')}</label>
              <div className="relative">
                <Mail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="operator@solven4.com"
                  style={{ background: '#0A0C1E', border: '1px solid #29293D', borderRadius: '10px', color: '#fff', paddingLeft: '38px' }}
                  className="w-full py-3 pr-4 text-sm outline-none focus:border-indigo-500 transition-colors placeholder-gray-600" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ color: '#94A3B8', fontSize: '11px', letterSpacing: '0.08em' }} className="block mb-1.5 font-medium">{t('PASSWORD', 'كلمة المرور')}</label>
              <div className="relative">
                <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t('Min 6 characters', '6 أحرف على الأقل')}
                  style={{ background: '#0A0C1E', border: '1px solid #29293D', borderRadius: '10px', color: '#fff', paddingLeft: '38px', paddingRight: '38px' }}
                  className="w-full py-3 text-sm outline-none focus:border-indigo-500 transition-colors placeholder-gray-600" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ color: '#94A3B8', fontSize: '11px', letterSpacing: '0.08em' }} className="block mb-1.5 font-medium">{t('CONFIRM PASSWORD', 'تأكيد كلمة المرور')}</label>
              <div className="relative">
                <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={t('Repeat password', 'أعد كتابة كلمة المرور')}
                  style={{ background: '#0A0C1E', border: '1px solid #29293D', borderRadius: '10px', color: '#fff', paddingLeft: '38px' }}
                  className="w-full py-3 pr-4 text-sm outline-none focus:border-indigo-500 transition-colors placeholder-gray-600" />
              </div>
            </div>

            {/* Door selector */}
            <div>
              <label style={{ color: '#94A3B8', fontSize: '11px', letterSpacing: '0.08em' }} className="block mb-2 font-medium">{t('PRIMARY DOOR', 'الباب الأساسي')}</label>
              <div className="grid grid-cols-5 gap-2">
                {DOORS.map(door => (
                  <button key={door.id} type="button" onClick={() => setPrimaryDoor(door.id)}
                    style={{
                      background: primaryDoor === door.id ? `${door.color}20` : '#0A0C1E',
                      border: `1px solid ${primaryDoor === door.id ? door.color + '60' : '#29293D'}`,
                      borderRadius: '8px', padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer',
                    }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: door.color, boxShadow: primaryDoor === door.id ? `0 0 8px ${door.color}` : 'none' }} />
                    <span style={{ fontFamily: "'Orbitron', sans-serif", color: primaryDoor === door.id ? door.color : '#94A3B8', fontSize: '7px', letterSpacing: '0.05em' }} className="font-bold text-center leading-tight">
                      {door.id}
                    </span>
                  </button>
                ))}
              </div>
              {selectedDoor && (
                <p style={{ color: selectedDoor.color, fontSize: '11px' }} className="mt-1.5">{t(selectedDoor.desc, selectedDoor.descAr)}</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              style={{ background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#6366F1,#22D3EE)', borderRadius: '10px', width: '100%' }}
              className="py-3.5 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:cursor-not-allowed mt-2">
              {loading ? t('Creating Account...', 'جارٍ إنشاء الحساب...') : (<>{t('Join SOLVEN4', 'انضم إلى SOLVEN4')} <ArrowRight size={16} style={isAr ? { transform: 'scaleX(-1)' } : undefined} /></>)}
            </button>
          </form>

          <p style={{ color: '#94A3B8', fontSize: '13px' }} className="text-center mt-5">
            {t('Already an operator?', 'لديك حساب بالفعل؟')}{' '}
            <Link to="/auth/login" style={{ color: '#6366F1' }} className="font-semibold hover:opacity-80 transition-opacity">
              {t('Sign in', 'تسجيل الدخول')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
