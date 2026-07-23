import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import {
  UserCircle, Shield, CheckCircle, AlertCircle, Upload,
  Edit3, Save, X, Mail, Phone, Globe, Calendar, Award
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { GlassPanel, Btn } from '@/hud';

const ACCENT = '#6366f1';

const S = {
  label: { fontSize: '10px', color: '#94A3B8', fontFamily: "'Satoshi',sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' },
  input: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  btn: { padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s' },
};

const KYC_STEPS = [
  { key: 'email', label: 'Email Verified', labelAr: 'تم التحقق من البريد', desc: 'Confirm your email address', descAr: 'أكّد عنوان بريدك الإلكتروني' },
  { key: 'phone', label: 'Phone Verified', labelAr: 'تم التحقق من الهاتف', desc: 'Add and verify your phone number', descAr: 'أضف وتحقق من رقم هاتفك' },
  { key: 'id', label: 'ID Document', labelAr: 'وثيقة الهوية', desc: 'Upload a government-issued ID', descAr: 'ارفع هوية صادرة عن جهة حكومية' },
  { key: 'selfie', label: 'Selfie / Liveness', labelAr: 'صورة شخصية / تحقق حي', desc: 'A quick selfie to match your ID', descAr: 'صورة شخصية سريعة لمطابقة هويتك' },
];

const DOOR_STATS = [
  { door: 'EDGE', color: '#06B6D4', label: 'Trader', labelAr: 'متداول', stat: 'Active Positions', statAr: 'مراكز نشطة', value: '0' },
  { door: 'FORGE', color: '#D4A843', label: 'IB Network', labelAr: 'شبكة الوسطاء', stat: 'Total Clients', statAr: 'إجمالي العملاء', value: '0' },
  { door: 'ORACLE', color: '#10B981', label: 'Academy', labelAr: 'الأكاديمية', stat: 'Courses Done', statAr: 'الدورات المكتملة', value: '0' },
  { door: 'NEXUS', color: '#EF4444', label: 'Business', labelAr: 'الأعمال', stat: 'Pipeline Value', statAr: 'قيمة خط الأنابيب', value: '$0' },
];

export default function TheProfile() {
  const { t } = useLang();
  const { user, profile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', country: '', timezone: '' });
  const [kycStatus, setKycStatus] = useState({ email: true, phone: false, id: false, selfie: false });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        timezone: profile.timezone || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update(form).eq('id', user.id);
    } catch {}
    setSaving(false);
    setEditing(false);
  };

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const kycCount = Object.values(kycStatus).filter(Boolean).length;
  const kycPct = Math.round((kycCount / KYC_STEPS.length) * 100);

  const rise = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="s4hud" style={{ ['--accent']: ACCENT, color: '#fff', fontFamily: "'Satoshi',sans-serif", maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div {...rise} transition={{ duration: 0.5 }} style={{ marginBottom: '22px' }}>
        <div className="s4-label s4-accent" style={{ letterSpacing: '0.35em', marginBottom: 6 }}>{t('UNIFIED IDENTITY', 'هوية موحدة')}</div>
        <h1 style={{ fontFamily: "'Satoshi',sans-serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 500, lineHeight: 1.02, margin: 0,
          background: 'linear-gradient(135deg,#fff 0%,#A5B4FC 60%,#6366F1 120%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('PROFILE & KYC', 'الملف الشخصي والتحقق')}</h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 0' }}>{t('Unified identity across all S4 doors', 'هوية موحدة عبر جميع أبواب S4')}</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Left: Profile Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Avatar + Name card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <GlassPanel className="spatial lift">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366F1,#818CF8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {profile?.full_name?.[0]?.toUpperCase() || <UserCircle size={28} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '3px' }}>
                  {profile?.full_name || t('Operator', 'مشغل')}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>{user?.email}</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <span style={{ fontSize: '10px', padding: '2px 10px', borderRadius: '20px', background: 'rgba(99,102,241,0.15)', color: '#818CF8', fontWeight: 600, fontFamily: "'Satoshi',sans-serif", letterSpacing: '0.08em' }}>
                    {profile?.plan?.toUpperCase() || t('FREE','مجاني')}
                  </span>
                  <span style={{ fontSize: '10px', padding: '2px 10px', borderRadius: '20px', background: 'rgba(212,168,67,0.15)', color: '#D4A843', fontWeight: 600 }}>
                    {profile?.rank || t('Rookie','مبتدئ')}
                  </span>
                </div>
              </div>
              <button onClick={() => setEditing(v => !v)} style={{ ...S.btn, background: editing ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)', color: editing ? '#EF4444' : '#818CF8', border: `1px solid ${editing ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.25)'}` }}>
                {editing ? <X size={14} /> : <Edit3 size={14} />}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { key: 'full_name', label: t('Full Name','الاسم الكامل'), icon: UserCircle, placeholder: t('Your full name','اسمك الكامل') },
                { key: 'phone', label: t('Phone','الهاتف'), icon: Phone, placeholder: '+1 234 567 8900' },
                { key: 'country', label: t('Country','الدولة'), icon: Globe, placeholder: 'UAE, KSA, EG...' },
                { key: 'timezone', label: t('Timezone','المنطقة الزمنية'), icon: Calendar, placeholder: 'Asia/Dubai' },
              ].map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key}>
                  <label style={S.label}>{label}</label>
                  {editing ? (
                    <input
                      value={form[key]}
                      onChange={e => f(key, e.target.value)}
                      placeholder={placeholder}
                      style={S.input}
                    />
                  ) : (
                    <div style={{ ...S.input, color: form[key] ? '#fff' : '#94A3B8', cursor: 'default' }}>
                      {form[key] || placeholder}
                    </div>
                  )}
                </div>
              ))}

              {editing && (
                <Btn onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                  <Save size={14} /> {saving ? t('Saving...', 'جارٍ الحفظ...') : t('Save Changes', 'حفظ التغييرات')}
                </Btn>
              )}
            </div>
          </GlassPanel>
          </motion.div>
        </div>

        {/* Right: KYC + Door Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* KYC card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassPanel className="spatial lift">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color={ACCENT} />
                <span className="s4-label s4-accent">{t('KYC STATUS', 'حالة التحقق')}</span>
              </div>
              <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '18px', fontWeight: 500, color: kycPct === 100 ? '#10B981' : '#D4A843' }}>{kycPct}%</div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${kycPct}%`, background: 'linear-gradient(90deg,#6366F1,#818CF8)', borderRadius: '4px', transition: 'width 0.5s' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {KYC_STEPS.map(({ key, label, labelAr, desc, descAr }) => {
                const done = kycStatus[key];
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                    {done
                      ? <CheckCircle size={16} color="#10B981" />
                      : <AlertCircle size={16} color="#F59E0B" />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: done ? '#10B981' : '#fff' }}>{t(label, labelAr)}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{t(desc, descAr)}</div>
                    </div>
                    {!done && (
                      <Btn ghost style={{ padding: '5px 12px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Upload size={11} /> {t('Start', 'ابدأ')}
                      </Btn>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassPanel>
          </motion.div>

          {/* Cross-door stats */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassPanel className="spatial lift" style={{ ['--accent']: '#D4A843' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Award size={16} color="#D4A843" />
              <span className="s4-label s4-accent">{t('DOOR ACTIVITY', 'نشاط الأبواب')}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {DOOR_STATS.map(({ door, color, label, stat, statAr, value }) => (
                <div key={door} style={{ padding: '12px', borderRadius: '10px', background: `${color}08`, border: `1px solid ${color}25` }}>
                  <div style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '9px', color: color, fontWeight: 700, letterSpacing: '0.1em', marginBottom: '4px' }}>{door}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>{t(stat, statAr)}</div>
                  <div className="s4-num" style={{ fontSize: '18px', fontWeight: 500, color: '#fff' }}>{value}</div>
                </div>
              ))}
            </div>
          </GlassPanel>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
