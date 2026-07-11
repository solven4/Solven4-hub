import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Plus, ExternalLink, RefreshCw, Trash2, Key } from 'lucide-react';

const S = {
  card: { background: 'rgba(11,18,32,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '22px' },
};

const INTEGRATIONS = [
  {
    id: 'whatsapp', name: 'WhatsApp Business',
    desc: 'Connect your WhatsApp Business API for messaging automation across all doors',
    color: '#25D366', status: 'disconnected',
    fields: [{ key: 'phone_id', label: 'Phone Number ID' }, { key: 'token', label: 'Access Token', secret: true }, { key: 'waba_id', label: 'WhatsApp Business Account ID' }],
    icon: '📱',
  },
  {
    id: 'telegram', name: 'Telegram Bot',
    desc: 'Integrate your Telegram bot for broadcasts, signals, and DMs',
    color: '#2AABEE', status: 'disconnected',
    fields: [{ key: 'bot_token', label: 'Bot Token', secret: true }, { key: 'channel_id', label: 'Channel ID (optional)' }],
    icon: '✈️',
  },
  {
    id: 'mt5', name: 'MT4 / MT5 Broker',
    desc: 'Sync your broker account for live trade data across EDGE and FORGE',
    color: '#D4A843', status: 'disconnected',
    fields: [{ key: 'server', label: 'MT Server' }, { key: 'login', label: 'Account Login' }, { key: 'password', label: 'Investor Password', secret: true }],
    icon: '📊',
  },
  {
    id: 'twitter', name: 'X / Twitter',
    desc: 'Auto-publish signals, content, and market updates',
    color: '#1DA1F2', status: 'disconnected',
    fields: [{ key: 'api_key', label: 'API Key', secret: true }, { key: 'api_secret', label: 'API Secret', secret: true }],
    icon: '𝕏',
  },
  {
    id: 'linkedin', name: 'LinkedIn',
    desc: 'Share market insights and grow your professional network',
    color: '#0A66C2', status: 'disconnected',
    fields: [{ key: 'access_token', label: 'Access Token', secret: true }],
    icon: 'in',
  },
  {
    id: 'instagram', name: 'Instagram',
    desc: 'Share charts, signals, and educational content automatically',
    color: '#E1306C', status: 'disconnected',
    fields: [{ key: 'account_id', label: 'Business Account ID' }, { key: 'access_token', label: 'Access Token', secret: true }],
    icon: '📸',
  },
];

function IntegrationCard({ integration, idx }) {
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
      style={{ ...S.card, border: connected ? `1px solid ${integration.color}35` : '1px solid rgba(255,255,255,0.07)', background: connected ? `${integration.color}05` : 'rgba(11,18,32,0.85)' }}>

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
              : <AlertCircle size={13} color="#8899B4" />}
          </div>
          <p style={{ fontSize: '11px', color: '#8899B4', margin: 0, lineHeight: 1.5 }}>{integration.desc}</p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {connected ? (
            <>
              <button style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#8899B4', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RefreshCw size={11} /> Sync
              </button>
              <button style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trash2 size={11} /> Remove
              </button>
            </>
          ) : (
            <button onClick={() => setExpanded(v => !v)}
              style={{ padding: '7px 16px', borderRadius: '8px', border: `1px solid ${integration.color}45`, background: `${integration.color}12`, color: integration.color, fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.06em' }}>
              <Plus size={11} /> CONNECT
            </button>
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
                <label style={{ fontSize: '10px', color: '#8899B4', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.12em', display: 'block', marginBottom: '5px' }}>
                  {field.label}
                </label>
                <div style={{ position: 'relative' }}>
                  {field.secret && <Key size={12} color="#8899B4" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />}
                  <input
                    type={field.secret ? 'password' : 'text'}
                    value={form[field.key] || ''}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.secret ? '••••••••••••' : `Enter ${field.label}`}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: `9px ${field.secret ? '14px 9px 30px' : '14px'}`, color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', paddingLeft: field.secret ? '30px' : '14px' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleConnect} disabled={saving}
              style={{ padding: '9px 20px', borderRadius: '8px', border: `1px solid ${integration.color}40`, background: `${integration.color}15`, color: integration.color, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Connecting...' : 'Save & Connect'}
            </button>
            <button onClick={() => setExpanded(false)}
              style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#8899B4', fontSize: '12px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function TheIntegrations() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', marginBottom: '4px' }}>
          INTEGRATIONS
        </h1>
        <p style={{ fontSize: '13px', color: '#8899B4' }}>Connect messaging, social, and broker accounts — shared across all S4 doors</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Connected', value: '0', color: '#10B981' },
          { label: 'Available', value: INTEGRATIONS.length.toString(), color: '#6366F1' },
          { label: 'Pending', value: '0', color: '#F59E0B' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...S.card, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '11px', color: '#8899B4', marginTop: '4px' }}>{label}</div>
          </div>
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
