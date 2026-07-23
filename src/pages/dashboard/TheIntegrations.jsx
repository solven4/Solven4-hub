import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Plus, RefreshCw, Trash2, Key } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { GlassPanel, Btn } from '@/hud';

const ACCENT = '#6366f1';

const INTEGRATIONS = [
  {
    id: 'whatsapp', name: 'WhatsApp Business',
    desc: 'Connect your WhatsApp Business API for messaging automation across all doors',
    descAr: 'اربط واجهة WhatsApp Business API لأتمتة الرسائل عبر جميع الأبواب',
    color: '#25D366', status: 'disconnected',
    fields: [{ key: 'phone_id', label: 'Phone Number ID', labelAr: 'معرف رقم الهاتف' }, { key: 'token', label: 'Access Token', labelAr: 'رمز الوصول', secret: true }, { key: 'waba_id', label: 'WhatsApp Business Account ID', labelAr: 'معرف حساب واتساب الأعمال' }],
    icon: '📱',
  },
  {
    id: 'telegram', name: 'Telegram Bot',
    desc: 'Integrate your Telegram bot for broadcasts, signals, and DMs',
    descAr: 'اربط بوت تيليجرام الخاص بك للبث والإشارات والرسائل الخاصة',
    color: '#2AABEE', status: 'disconnected',
    fields: [{ key: 'bot_token', label: 'Bot Token', labelAr: 'رمز البوت', secret: true }, { key: 'channel_id', label: 'Channel ID (optional)', labelAr: 'معرف القناة (اختياري)' }],
    icon: '✈️',
  },
  {
    id: 'mt5', name: 'MT4 / MT5 Broker',
    desc: 'Sync your broker account for live trade data across EDGE and FORGE',
    descAr: 'زامن حساب الوسيط الخاص بك لبيانات التداول المباشرة عبر EDGE و FORGE',
    color: '#D4A843', status: 'disconnected',
    fields: [{ key: 'server', label: 'MT Server', labelAr: 'خادم MT' }, { key: 'login', label: 'Account Login', labelAr: 'دخول الحساب' }, { key: 'password', label: 'Investor Password', labelAr: 'كلمة مرور المستثمر', secret: true }],
    icon: '📊',
  },
  {
    id: 'twitter', name: 'X / Twitter',
    desc: 'Auto-publish signals, content, and market updates',
    descAr: 'نشر تلقائي للإشارات والمحتوى وتحديثات السوق',
    color: '#1DA1F2', status: 'disconnected',
    fields: [{ key: 'api_key', label: 'API Key', labelAr: 'مفتاح API', secret: true }, { key: 'api_secret', label: 'API Secret', labelAr: 'سر API', secret: true }],
    icon: '𝕏',
  },
  {
    id: 'linkedin', name: 'LinkedIn',
    desc: 'Share market insights and grow your professional network',
    descAr: 'شارك رؤى السوق ووسّع شبكتك المهنية',
    color: '#0A66C2', status: 'disconnected',
    fields: [{ key: 'access_token', label: 'Access Token', labelAr: 'رمز الوصول', secret: true }],
    icon: 'in',
  },
  {
    id: 'instagram', name: 'Instagram',
    desc: 'Share charts, signals, and educational content automatically',
    descAr: 'شارك الرسوم البيانية والإشارات والمحتوى التعليمي تلقائياً',
    color: '#E1306C', status: 'disconnected',
    fields: [{ key: 'account_id', label: 'Business Account ID', labelAr: 'معرف حساب الأعمال' }, { key: 'access_token', label: 'Access Token', labelAr: 'رمز الوصول', secret: true }],
    icon: '📸',
  },
];

function IntegrationCard({ integration, idx }) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const connected = integration.status === 'connected';

  const handleConnect = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setExpanded(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
      className="s4-glass spatial lift" style={{ ['--accent']: integration.color, padding: '22px', borderColor: connected ? `${integration.color}45` : undefined }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Icon */}
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${integration.color}18`, border: `1px solid ${integration.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
          {integration.icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{integration.name}</span>
            {connected
              ? <CheckCircle size={13} color="#10B981" />
              : <AlertCircle size={13} color="#94A3B8" />}
          </div>
          <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>{t(integration.desc, integration.descAr)}</p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {connected ? (
            <>
              <button style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94A3B8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RefreshCw size={11} /> {t('Sync', 'مزامنة')}
              </button>
              <button style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trash2 size={11} /> {t('Remove', 'إزالة')}
              </button>
            </>
          ) : (
            <Btn onClick={() => setExpanded(v => !v)} style={{ padding: '7px 16px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={11} /> {t('CONNECT', 'ربط')}
            </Btn>
          )}
        </div>
      </div>

      {/* Expanded credentials form */}
      {expanded && !connected && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            {integration.fields.map(field => (
              <div key={field.key}>
                <label style={{ fontSize: '10px', color: '#94A3B8', fontFamily: "'Satoshi',sans-serif", letterSpacing: '0.12em', display: 'block', marginBottom: '5px' }}>
                  {t(field.label, field.labelAr)}
                </label>
                <div style={{ position: 'relative' }}>
                  {field.secret && <Key size={12} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />}
                  <input
                    type={field.secret ? 'password' : 'text'}
                    value={form[field.key] || ''}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.secret ? '••••••••••••' : `${t('Enter', 'أدخل')} ${t(field.label, field.labelAr)}`}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: `9px ${field.secret ? '14px 9px 30px' : '14px'}`, color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', paddingLeft: field.secret ? '30px' : '14px' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleConnect} disabled={saving}
              style={{ padding: '9px 20px', borderRadius: '8px', border: `1px solid ${integration.color}40`, background: `${integration.color}15`, color: integration.color, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? t('Connecting...', 'جارٍ الاتصال...') : t('Save & Connect', 'حفظ وربط')}
            </button>
            <button onClick={() => setExpanded(false)}
              style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94A3B8', fontSize: '12px', cursor: 'pointer' }}>
              {t('Cancel', 'إلغاء')}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function TheIntegrations() {
  const { t } = useLang();
  const rise = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };
  return (
    <div className="s4hud" style={{ ['--accent']: ACCENT, color: '#fff', fontFamily: "'Satoshi',sans-serif", maxWidth: '860px', margin: '0 auto' }}>
      <motion.div {...rise} transition={{ duration: 0.5 }} style={{ marginBottom: '22px' }}>
        <div className="s4-label s4-accent" style={{ letterSpacing: '0.35em', marginBottom: 6 }}>{t('CONNECTED SERVICES', 'الخدمات المتصلة')}</div>
        <h1 style={{ fontFamily: "'Satoshi',sans-serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 500, lineHeight: 1.02, margin: 0,
          background: 'linear-gradient(135deg,#fff 0%,#A5B4FC 60%,#6366F1 120%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('INTEGRATIONS', 'التكاملات')}</h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 0' }}>{t('Connect messaging, social, and broker accounts — shared across all S4 doors', 'اربط حسابات المراسلة والتواصل والوسطاء — مشتركة عبر جميع أبواب S4')}</p>
      </motion.div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: t('Connected', 'متصل'), value: '0', color: '#10B981' },
          { label: t('Available', 'متاح'), value: INTEGRATIONS.length.toString(), color: '#6366F1' },
          { label: t('Pending', 'قيد الانتظار'), value: '0', color: '#F59E0B' },
        ].map(({ label, value, color }) => (
          <GlassPanel key={label} className="spatial lift" brackets={false} style={{ ['--accent']: color, textAlign: 'center' }}>
            <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '24px', fontWeight: 500, color }}>{value}</div>
            <div className="s4-label" style={{ fontSize: '9px', marginTop: '4px' }}>{label}</div>
          </GlassPanel>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {INTEGRATIONS.map((integration, i) => (
          <IntegrationCard key={integration.id} integration={integration} idx={i} />
        ))}
      </div>
    </div>
  );
}
