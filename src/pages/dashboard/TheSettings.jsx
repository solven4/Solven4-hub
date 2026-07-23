import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Bell, Globe, Moon, Shield, Key, Trash2, Save } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { GlassPanel, Btn } from '@/hud';

const ACCENT = '#6366f1';

const S = {
  label: { fontSize: '10px', color: '#94A3B8', fontFamily: "'Satoshi',sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' },
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
    label: 'NOTIFICATIONS', labelAr: 'الإشعارات',
    icon: Bell,
    color: '#6366F1',
    items: [
      { key: 'notif_email', label: 'Email Notifications', labelAr: 'إشعارات البريد الإلكتروني', desc: 'Receive updates via email', descAr: 'استلم التحديثات عبر البريد الإلكتروني' },
      { key: 'notif_trades', label: 'Trade Alerts (EDGE)', labelAr: 'تنبيهات التداول (EDGE)', desc: 'Signals and P&L notifications', descAr: 'إشعارات الإشارات والأرباح والخسائر' },
      { key: 'notif_network', label: 'Network Updates (FORGE)', labelAr: 'تحديثات الشبكة (FORGE)', desc: 'New trader registrations', descAr: 'تسجيلات المتداولين الجدد' },
      { key: 'notif_referral', label: 'Referral Earnings', labelAr: 'أرباح الإحالة', desc: 'Commission and referral alerts', descAr: 'تنبيهات العمولات والإحالات' },
      { key: 'notif_platform', label: 'Platform Announcements', labelAr: 'إعلانات المنصة', desc: 'SOLVEN4 news and updates', descAr: 'أخبار وتحديثات SOLVEN4' },
    ],
  },
  {
    key: 'privacy',
    label: 'PRIVACY', labelAr: 'الخصوصية',
    icon: Shield,
    color: '#10B981',
    items: [
      { key: 'privacy_leaderboard', label: 'Appear on Leaderboard', labelAr: 'الظهور في لوحة الصدارة', desc: 'Show your name on rankings', descAr: 'إظهار اسمك في الترتيب' },
      { key: 'privacy_analytics', label: 'Share Analytics Data', labelAr: 'مشاركة بيانات التحليلات', desc: 'Help improve the platform', descAr: 'ساعد في تحسين المنصة' },
      { key: 'privacy_public_profile', label: 'Public Profile', labelAr: 'الملف الشخصي العام', desc: 'Allow others to view your profile', descAr: 'السماح للآخرين بمشاهدة ملفك الشخصي' },
    ],
  },
  {
    key: 'appearance',
    label: 'APPEARANCE', labelAr: 'المظهر',
    icon: Moon,
    color: '#D4A843',
    items: [
      { key: 'app_dark', label: 'Dark Mode', labelAr: 'الوضع الداكن', desc: 'Optimised for night trading', descAr: 'مُحسّن للتداول الليلي' },
      { key: 'app_compact', label: 'Compact Sidebar', labelAr: 'شريط جانبي مضغوط', desc: 'Icon-only sidebar by default', descAr: 'شريط جانبي بأيقونات فقط افتراضياً' },
      { key: 'app_animations', label: 'UI Animations', labelAr: 'حركات الواجهة', desc: 'Smooth transitions and effects', descAr: 'انتقالات وتأثيرات سلسة' },
    ],
  },
];

export default function TheSettings() {
  const { t } = useLang();
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

  const rise = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="s4hud" style={{ ['--accent']: ACCENT, color: '#fff', fontFamily: "'Satoshi',sans-serif", maxWidth: '780px', margin: '0 auto' }}>
      <motion.div {...rise} transition={{ duration: 0.5 }} style={{ marginBottom: '22px' }}>
        <div className="s4-label s4-accent" style={{ letterSpacing: '0.35em', marginBottom: 6 }}>{t('GLOBAL PREFERENCES', 'التفضيلات العامة')}</div>
        <h1 style={{ fontFamily: "'Satoshi',sans-serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 500, lineHeight: 1.02, margin: 0,
          background: 'linear-gradient(135deg,#fff 0%,#A5B4FC 60%,#6366F1 120%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('SETTINGS', 'الإعدادات')}</h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 0' }}>{t('Global preferences across all S4 doors', 'التفضيلات العامة عبر جميع أبواب S4')}</p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <GlassPanel className="spatial lift">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Globe size={15} color={ACCENT} />
              <span className="s4-label s4-accent">{t('LANGUAGE & REGION', 'اللغة والمنطقة')}</span>
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
          </GlassPanel>
        </motion.div>

        {/* Toggle sections */}
        {SECTIONS.map((section, si) => {
          const Icon = section.icon;
          return (
            <motion.div key={section.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (si + 1) * 0.06 }}>
              <GlassPanel className="spatial lift" style={{ ['--accent']: section.color }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Icon size={15} color={section.color} />
                  <span className="s4-label s4-accent">{t(section.label, section.labelAr)}</span>
                </div>
                {section.items.map(({ key, label, labelAr, desc, descAr }, ii) => (
                  <div key={key} style={{ ...S.row, borderBottom: ii < section.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{t(label, labelAr)}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{t(desc, descAr)}</div>
                    </div>
                    <Toggle value={settings[key]} onChange={() => toggle(key)} />
                  </div>
                ))}
              </GlassPanel>
            </motion.div>
          );
        })}

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <GlassPanel className="spatial lift" style={{ ['--accent']: '#F59E0B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Key size={15} color="#F59E0B" />
              <span className="s4-label s4-accent">{t('SECURITY', 'الأمان')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[{ label: t('Current Password', 'كلمة المرور الحالية'), key: 'current', type: 'password' }, { label: t('New Password', 'كلمة المرور الجديدة'), key: 'newPw', type: 'password' }, { label: t('Confirm New Password', 'تأكيد كلمة المرور الجديدة'), key: 'confirm', type: 'password' }].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={S.label}>{label}</label>
                  <input type={type} value={pwForm[key]} onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder="••••••••"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <Btn ghost style={{ padding: '10px 20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', ['--accent']: '#F59E0B', width: 'fit-content' }}>
                <Key size={13} /> {t('Change Password', 'تغيير كلمة المرور')}
              </Btn>
            </div>
          </GlassPanel>
        </motion.div>

        {/* Danger zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassPanel className="spatial lift" style={{ ['--accent']: '#EF4444', borderColor: 'rgba(239,68,68,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Trash2 size={15} color="#EF4444" />
              <span className="s4-label s4-accent">{t('DANGER ZONE', 'منطقة الخطر')}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '14px' }}>{t('Deleting your account will remove all data across all S4 doors permanently.', 'حذف حسابك سيزيل جميع بياناتك عبر جميع أبواب S4 بشكل نهائي.')}</p>
            <Btn ghost style={{ padding: '10px 20px', fontSize: '12px', ['--accent']: '#EF4444' }}>
              {t('Request Account Deletion', 'طلب حذف الحساب')}
            </Btn>
          </GlassPanel>
        </motion.div>

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Btn onClick={saveSettings} disabled={saving} style={{ padding: '12px 28px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={14} /> {saving ? t('Saving...', 'جارٍ الحفظ...') : t('Save All Settings', 'حفظ جميع الإعدادات')}
          </Btn>
        </div>
      </div>
    </div>
  );
}
