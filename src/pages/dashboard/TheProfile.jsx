import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import {
  UserCircle, Shield, CheckCircle, AlertCircle, Upload,
  Edit3, Save, X, Mail, Phone, Globe, Calendar, Award
} from 'lucide-react';

const S = {
  card: { background: 'rgba(10,12,30,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' },
  label: { fontSize: '11px', color: '#94A3B8', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' },
  input: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none' },
  btn: { padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s' },
};

const KYC_STEPS = [
  { key: 'email', label: 'Email Verified', desc: 'Confirm your email address' },
  { key: 'phone', label: 'Phone Verified', desc: 'Add and verify your phone number' },
  { key: 'id', label: 'ID Document', desc: 'Upload a government-issued ID' },
  { key: 'selfie', label: 'Selfie / Liveness', desc: 'A quick selfie to match your ID' },
];

const DOOR_STATS = [
  { door: 'EDGE', color: '#06B6D4', label: 'Trader', stat: 'Active Positions', value: '0' },
  { door: 'FORGE', color: '#D4A843', label: 'IB Network', stat: 'Total Clients', value: '0' },
  { door: 'ORACLE', color: '#10B981', label: 'Academy', stat: 'Courses Done', value: '0' },
  { door: 'NEXUS', color: '#EF4444', label: 'Business', stat: 'Pipeline Value', value: '$0' },
];

export default function TheProfile() {
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

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', marginBottom: '4px' }}>
          PROFILE & KYC
        </h1>
        <p style={{ fontSize: '13px', color: '#94A3B8' }}>Unified identity across all S4 doors</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Left: Profile Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Avatar + Name card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={S.card}>
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
                  {profile?.full_name || 'Operator'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>{user?.email}</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <span style={{ fontSize: '10px', padding: '2px 10px', borderRadius: '20px', background: 'rgba(99,102,241,0.15)', color: '#818CF8', fontWeight: 600, fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.08em' }}>
                    {profile?.plan?.toUpperCase() || 'FREE'}
                  </span>
                  <span style={{ fontSize: '10px', padding: '2px 10px', borderRadius: '20px', background: 'rgba(212,168,67,0.15)', color: '#D4A843', fontWeight: 600 }}>
                    {profile?.rank || 'Rookie'}
                  </span>
                </div>
              </div>
              <button onClick={() => setEditing(v => !v)} style={{ ...S.btn, background: editing ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)', color: editing ? '#EF4444' : '#818CF8', border: `1px solid ${editing ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.25)'}` }}>
                {editing ? <X size={14} /> : <Edit3 size={14} />}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { key: 'full_name', label: 'Full Name', icon: UserCircle, placeholder: 'Your full name' },
                { key: 'phone', label: 'Phone', icon: Phone, placeholder: '+1 234 567 8900' },
                { key: 'country', label: 'Country', icon: Globe, placeholder: 'UAE, KSA, EG...' },
                { key: 'timezone', label: 'Timezone', icon: Calendar, placeholder: 'Asia/Dubai' },
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
                <button onClick={handleSave} disabled={saving} style={{ ...S.btn, background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)', justifyContent: 'center', width: '100%' }}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right: KYC + Door Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* KYC card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color="#6366F1" />
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', letterSpacing: '0.15em', color: '#818CF8', fontWeight: 700 }}>KYC STATUS</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: kycPct === 100 ? '#10B981' : '#D4A843' }}>{kycPct}%</div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${kycPct}%`, background: 'linear-gradient(90deg,#6366F1,#818CF8)', borderRadius: '4px', transition: 'width 0.5s' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {KYC_STEPS.map(({ key, label, desc }) => {
                const done = kycStatus[key];
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                    {done
                      ? <CheckCircle size={16} color="#10B981" />
                      : <AlertCircle size={16} color="#F59E0B" />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: done ? '#10B981' : '#fff' }}>{label}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{desc}</div>
                    </div>
                    {!done && (
                      <button style={{ ...S.btn, padding: '5px 12px', fontSize: '11px', background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)' }}>
                        <Upload size={11} /> Start
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Cross-door stats */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Award size={16} color="#D4A843" />
              <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', letterSpacing: '0.15em', color: '#D4A843', fontWeight: 700 }}>DOOR ACTIVITY</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {DOOR_STATS.map(({ door, color, label, stat, value }) => (
                <div key={door} style={{ padding: '12px', borderRadius: '10px', background: `${color}08`, border: `1px solid ${color}25` }}>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '9px', color: color, fontWeight: 700, letterSpacing: '0.1em', marginBottom: '4px' }}>{door}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>{stat}</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
