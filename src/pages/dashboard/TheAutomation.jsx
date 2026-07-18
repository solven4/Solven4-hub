import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Zap, Plus, Play, Pause, Trash2, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronRight, MessageCircle, Send, Bell, DollarSign } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

const S = {
  card: { background: 'rgba(10,12,30,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '22px' },
};

const TRIGGERS = [
  { key: 'new_trader', label: 'New Trader Joins', labelAr: 'انضمام متداول جديد', door: 'FORGE', color: '#D4A843', Icon: Zap },
  { key: 'commission_earned', label: 'Commission Earned', labelAr: 'كسب عمولة', door: 'HUB', color: '#10B981', Icon: DollarSign },
  { key: 'signal_fire', label: 'Signal Alert', labelAr: 'تنبيه إشارة', door: 'EDGE', color: '#06B6D4', Icon: Bell },
  { key: 'referral_click', label: 'Referral Click', labelAr: 'نقرة إحالة', door: 'HUB', color: '#6366F1', Icon: Zap },
  { key: 'new_lead', label: 'New Lead (NEXUS)', labelAr: 'عميل محتمل جديد (NEXUS)', door: 'NEXUS', color: '#EF4444', Icon: Zap },
];

const ACTIONS = [
  { key: 'send_whatsapp', label: 'Send WhatsApp', labelAr: 'إرسال واتساب', Icon: MessageCircle, color: '#25D366' },
  { key: 'send_telegram', label: 'Send Telegram', labelAr: 'إرسال تيليجرام', Icon: Send, color: '#2AABEE' },
  { key: 'send_notification', label: 'Push Notification', labelAr: 'إشعار فوري', Icon: Bell, color: '#6366F1' },
  { key: 'update_crm', label: 'Update CRM Tag', labelAr: 'تحديث وسم CRM', Icon: Zap, color: '#8B5CF6' },
];

const DOOR_COLORS = { HUB: '#6366F1', EDGE: '#06B6D4', FORGE: '#D4A843', ORACLE: '#10B981', NEXUS: '#EF4444' };

const SAMPLE_RULES = [
  { id: 1, name: 'Welcome New Trader', trigger: 'new_trader', action: 'send_whatsapp', active: true, runs: 142, door: 'FORGE' },
  { id: 2, name: 'Commission Alert', trigger: 'commission_earned', action: 'send_notification', active: true, runs: 89, door: 'HUB' },
  { id: 3, name: 'Signal Broadcast', trigger: 'signal_fire', action: 'send_telegram', active: false, runs: 26, door: 'EDGE' },
];

function RuleCard({ rule, idx }) {
  const { t } = useLang();
  const [active, setActive] = useState(rule.active);
  const trigger = TRIGGERS.find(tr => tr.key === rule.trigger);
  const action = ACTIONS.find(a => a.key === rule.action);
  const doorColor = DOOR_COLORS[rule.door] || '#94A3B8';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
      style={{ ...S.card, padding: '16px 20px', border: active ? `1px solid ${doorColor}25` : '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Status dot */}
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: active ? '#10B981' : '#94A3B8', boxShadow: active ? '0 0 8px #10B981' : 'none', flexShrink: 0 }} />

        {/* Rule info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{rule.name}</span>
            <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '4px', background: `${doorColor}18`, color: doorColor, fontFamily: "'Orbitron',sans-serif", fontWeight: 700, letterSpacing: '0.06em' }}>{rule.door}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94A3B8' }}>
            {trigger && <span style={{ color: trigger.color }}>⚡ {t(trigger.label, trigger.labelAr)}</span>}
            <span>→</span>
            {action && <span style={{ color: action.color }}>📤 {t(action.label, action.labelAr)}</span>}
          </div>
        </div>

        {/* Stats */}
        <div style={{ textAlign: 'right', fontSize: '11px', color: '#94A3B8', marginRight: '8px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{rule.runs}</div>
          <div>{t('runs', 'تشغيل')}</div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setActive(v => !v)}
            style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${active ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`, background: active ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)', color: active ? '#F59E0B' : '#10B981', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {active ? <><Pause size={10} /> {t('Pause','إيقاف مؤقت')}</> : <><Play size={10} /> {t('Resume','استئناف')}</>}
          </button>
          <button style={{ padding: '7px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#EF4444', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function TheAutomation() {
  const { t } = useLang();
  const { user } = useAuthStore();
  const [showBuilder, setShowBuilder] = useState(false);
  const [builder, setBuilder] = useState({ name: '', trigger: '', action: '', message: '' });
  const [rules, setRules] = useState(SAMPLE_RULES);

  const handleCreate = () => {
    if (!builder.name || !builder.trigger || !builder.action) return;
    setRules(prev => [...prev, { id: Date.now(), ...builder, active: true, runs: 0, door: TRIGGERS.find(t => t.key === builder.trigger)?.door || 'HUB' }]);
    setBuilder({ name: '', trigger: '', action: '', message: '' });
    setShowBuilder(false);
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', marginBottom: '4px' }}>
            {t('AUTOMATION CENTER', 'مركز الأتمتة')}
          </h1>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>{t('Cross-door automation rules — triggered by any door, acting on any channel', 'قواعد أتمتة عبر الأبواب — تُفعّل من أي باب وتعمل على أي قناة')}</p>
        </div>
        <button onClick={() => setShowBuilder(v => !v)}
          style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.15)', color: '#818CF8', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.06em' }}>
          <Plus size={13} /> {t('NEW RULE', 'قاعدة جديدة')}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: t('Active Rules', 'القواعد النشطة'), value: rules.filter(r => r.active).length.toString(), color: '#10B981' },
          { label: t('Total Runs', 'إجمالي التشغيلات'), value: rules.reduce((s, r) => s + r.runs, 0).toString(), color: '#6366F1' },
          { label: t('Channels', 'القنوات'), value: '3', color: '#D4A843' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: `${color}08`, border: `1px solid ${color}25`, borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Rule Builder */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ ...S.card, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Zap size={15} color="#818CF8" />
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', letterSpacing: '0.15em', color: '#818CF8', fontWeight: 700 }}>{t('BUILD AUTOMATION RULE', 'إنشاء قاعدة أتمتة')}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8', fontFamily: "'Orbitron',sans-serif", display: 'block', marginBottom: '6px' }}>{t('RULE NAME', 'اسم القاعدة')}</label>
                  <input value={builder.name} onChange={e => setBuilder(p => ({ ...p, name: e.target.value }))}
                    placeholder={t('e.g. Welcome New Trader', 'مثال: ترحيب بمتداول جديد')}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8', fontFamily: "'Orbitron',sans-serif", display: 'block', marginBottom: '6px' }}>{t('WHEN THIS HAPPENS (TRIGGER)', 'عند حدوث هذا (المحفز)')}</label>
                  <select value={builder.trigger} onChange={e => setBuilder(p => ({ ...p, trigger: e.target.value }))}
                    style={{ width: '100%', background: '#0A0C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}>
                    <option value="">{t('Select trigger...', 'اختر المحفز...')}</option>
                    {TRIGGERS.map(tr => <option key={tr.key} value={tr.key}>{t(tr.label, tr.labelAr)} ({tr.door})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8', fontFamily: "'Orbitron',sans-serif", display: 'block', marginBottom: '6px' }}>{t('DO THIS (ACTION)', 'افعل هذا (الإجراء)')}</label>
                  <select value={builder.action} onChange={e => setBuilder(p => ({ ...p, action: e.target.value }))}
                    style={{ width: '100%', background: '#0A0C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}>
                    <option value="">{t('Select action...', 'اختر الإجراء...')}</option>
                    {ACTIONS.map(a => <option key={a.key} value={a.key}>{t(a.label, a.labelAr)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8', fontFamily: "'Orbitron',sans-serif", display: 'block', marginBottom: '6px' }}>{t('MESSAGE (optional)', 'الرسالة (اختياري)')}</label>
                  <input value={builder.message} onChange={e => setBuilder(p => ({ ...p, message: e.target.value }))}
                    placeholder={t('Hello {{name}}, welcome!', 'مرحباً {{name}}، أهلاً بك!')}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleCreate}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.15)', color: '#818CF8', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  <Play size={11} style={{ display: 'inline', marginRight: '5px' }} />{t('Create Rule', 'إنشاء القاعدة')}
                </button>
                <button onClick={() => setShowBuilder(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94A3B8', fontSize: '12px', cursor: 'pointer' }}>
                  {t('Cancel', 'إلغاء')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rules.length === 0 ? (
          <div style={{ ...S.card, textAlign: 'center', padding: '40px' }}>
            <Zap size={40} color="#94A3B8" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            <p style={{ color: '#94A3B8', fontSize: '13px' }}>{t('No automation rules yet. Create your first rule.', 'لا توجد قواعد أتمتة بعد. أنشئ قاعدتك الأولى.')}</p>
          </div>
        ) : (
          rules.map((rule, i) => <RuleCard key={rule.id} rule={rule} idx={i} />)
        )}
      </div>
    </div>
  );
}
