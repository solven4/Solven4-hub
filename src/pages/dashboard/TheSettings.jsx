import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Settings, Bell, Globe, Moon, Sun, Shield, Key, Trash2, Save, ChevronRight } from 'lucide-react';

const S = {
  card: { background: 'rgba(10,12,30,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' },
  label: { fontSize: '11px', color: '#94A3B8', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  toggle: (on) => ({
    width: '40px', height: '22px', borderRadius: '11px',
    background: on ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)',
    border: `1px solid ${on ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.12)'}`,
    position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
  }),
  dot: (on) => ({
    width: '16px', height: '16px', borderRadius: '50%',
    background: on ? '#818CF8' : '#94A3B8',
    position: 'absolute', top: '2px', left: on ? '20px' : '2px',
    transition: 'all 0.2s', boxShadow: on ? '0 0 8px rgba(99,102,241,0.6)' : 'none',
  }),
};

const Toggle = ({ value, onChange }) => (
  <div style={S.toggle(value)} onClick={() => onChange(!value)}>
    <div style={S.dot(value)} />
  </div>
);

const SECTIONS = [
  {
    key: 'notifications',
    label: 'NOTIFICATIONS',
    icon: Bell,
    color: '#6366F1',
    items: [
      { key: 'notif_email', label: 'Email Notifications', desc: 'Receive updates via email' },
      { key: 'notif_trades', label: 'Trade Alerts (EDGE)', desc: 'Signals and P&L notifications' },
      { key: 'notif_network', label: 'Network Updates (FORGE)', desc: 'New trader registrations' },
      { key: 'notif_referral', label: 'Referral Earnings', desc: 'Commission and referral alerts' },
      { key: 'notif_platform', label: 'Platform Announcements', desc: 'SOLVEN4 news and updates' },
    ],
  },
  {
    key: 'privacy',
    label: 'PRIVACY',
    icon: Shield,
    color: '#10B981',
    items: [
      { key: 'privacy_leaderboard', label: 'Appear on Leaderboard', desc: 'Show your name on rankings' },
      { key: 'privacy_analytics', label: 'Share Analytics Data', desc: 'Help improve the platform' },
      { key: 'privacy_public_profile', label: 'Public Profile', desc: 'Allow others to view your profile' },
    ],
  },
  {
    key: 'appearance',
    label: 'APPEARANCE',
    icon: Moon,
    color: '#D4A843',
    items: [
      { key: 'app_dark', label: 'Dark Mode', desc: 'Optimised for night trading' },
      { key: 'app_compact', label: 'Compact Sidebar', desc: 'Icon-only sidebar by default' },
      { key: 'app_animations', label: 'UI Animations', desc: 'Smooth transitions and effects' },
    ],
  },
];

export default function TheSettings() {
  const { user, profile } = useAuthStore();
  const [settings, setSettings] = useState({
    notif_email: true, notif_trades: true, notif_network: false, notif_referral: true, notif_platform: true,
    privacy_leaderboard: true, privacy_analytics: false, privacy_public_profile: false,
    app_dark: true, app_compact: false, app_animations: true,
    lang: 'en',
  });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });

  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const saveSettings = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({ settings: settings }).eq('id', user.id);
    } catch {}
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', marginBottom: '4px' }}>
          SETTINGS
        </h1>
        <p style={{ fontSize: '13px', color: '#94A3B8' }}>Global preferences across all S4 doors</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Globe size={15} color="#6366F1" />
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', letterSpacing: '0.15em', color: '#818CF8', fontWeight: 700 }}>LANGUAGE & REGION</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[{ key: 'en', label: 'English' }, { key: 'ar', label: 'عربي' }].map(({ key, label }) => (
              <button key={key} onClick={() => setSettings(prev => ({ ...prev, lang: key }))}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${settings.lang === key ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  background: settings.lang === key ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                  color: settings.lang === key ? '#818CF8' : '#94A3B8', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Toggle sections */}
        {SECTIONS.map((section, si) => {
          const Icon = section.icon;
          return (
            <motion.div key={section.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (si + 1) * 0.06 }} style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Icon size={15} color={section.color} />
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', letterSpacing: '0.15em', color: section.color, fontWeight: 700 }}>{section.label}</span>
              </div>
              {section.items.map(({ key, label, desc }, ii) => (
                <div key={key} style={{ ...S.row, borderBottom: ii < section.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{desc}</div>
                  </div>
                  <Toggle value={settings[key]} onChange={() => toggle(key)} />
                </div>
              ))}
            </motion.div>
          );
        })}

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Key size={15} color="#F59E0B" />
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', letterSpacing: '0.15em', color: '#F59E0B', fontWeight: 700 }}>SECURITY</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[{ label: 'Current Password', key: 'current', type: 'password' }, { label: 'New Password', key: 'newPw', type: 'password' }, { label: 'Confirm New Password', key: 'confirm', type: 'password' }].map(({ label, key, type }) => (
              <div key={key}>
                <label style={S.label}>{label}</label>
                <input type={type} value={pwForm[key]} onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder="••••••••"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <button style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.1)', color: '#F59E0B', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={13} /> Change Password
            </button>
          </div>
        </motion.div>

        {/* Danger zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ ...S.card, border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Trash2 size={15} color="#EF4444" />
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', letterSpacing: '0.15em', color: '#EF4444', fontWeight: 700 }}>DANGER ZONE</span>
          </div>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '14px' }}>Deleting your account will remove all data across all S4 doors permanently.</p>
          <button style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            Request Account Deletion
          </button>
        </motion.div>

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={saveSettings} disabled={saving}
            style={{ padding: '12px 28px', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.15)', color: '#818CF8', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
