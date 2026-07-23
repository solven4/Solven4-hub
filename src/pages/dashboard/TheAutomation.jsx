import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Zap, Plus, Play, Pause, Trash2, MessageCircle, Send, Bell, DollarSign } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { GlassPanel, Btn } from '@/hud';

const ACCENT = '#6366f1';

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
      className="s4-glass spatial lift" style={{ ['--accent']: doorColor, padding: '16px 20px', borderColor: active ? `${doorColor}35` : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Status dot */}
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: active ? '#10B981' : '#94A3B8', boxShadow: active ? '0 0 8px #10B981' : 'none', flexShrink: 0 }} />

        {/* Rule info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{rule.name}</span>
            <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '4px', background: `${doorColor}18`, color: doorColor, fontFamily: "'Satoshi',sans-serif", fontWeight: 700, letterSpacing: '0.06em' }}>{rule.door}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94A3B8' }}>
            {trigger && <span style={{ color: trigger.color }}>⚡ {t(trigger.label, trigger.labelAr)}</span>}
            <span>→</span>
            {action && <span style={{ color: action.color }}>📤 {t(action.label, action.labelAr)}</span>}
          </div>
        </div>

        {/* Stats */}
        <div style={{ textAlign: 'right', fontSize: '11px', color: '#94A3B8', marginRight: '8px' }}>
          <div style={{ fontSize: '16px', fontWeight: 500, color: '#fff' }}>{rule.runs}</div>
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

  const rise = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="s4hud" style={{ ['--accent']: ACCENT, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", maxWidth: '860px', margin: '0 auto' }}>
      <motion.div {...rise} transition={{ duration: 0.5 }} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: '22px' }}>
        <div>
          <div className="s4-label s4-accent" style={{ letterSpacing: '0.35em', marginBottom: 6 }}>{t('CROSS-DOOR RULES', 'قواعد عبر الأبواب')}</div>
          <h1 style={{ fontFamily: "'Satoshi',sans-serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 500, lineHeight: 1.02, margin: 0,
            background: 'linear-gradient(135deg,#fff 0%,#A5B4FC 60%,#6366F1 120%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 22px rgba(99,102,241,0.35))' }}>{t('AUTOMATION CENTER', 'مركز الأتمتة')}</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 0' }}>{t('Cross-door automation rules — triggered by any door, acting on any channel', 'قواعد أتمتة عبر الأبواب — تُفعّل من أي باب وتعمل على أي قناة')}</p>
        </div>
        <Btn onClick={() => setShowBuilder(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', padding: '10px 18px' }}>
          <Plus size={13} /> {t('NEW RULE', 'قاعدة جديدة')}
        </Btn>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: t('Active Rules', 'القواعد النشطة'), value: rules.filter(r => r.active).length.toString(), color: '#10B981' },
          { label: t('Total Runs', 'إجمالي التشغيلات'), value: rules.reduce((s, r) => s + r.runs, 0).toString(), color: '#6366F1' },
          { label: t('Channels', 'القنوات'), value: '3', color: '#D4A843' },
        ].map(({ label, value, color }) => (
          <GlassPanel key={label} className="spatial lift" brackets={false} style={{ ['--accent']: color, textAlign: 'center' }}>
            <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '24px', fontWeight: 500, color }}>{value}</div>
            <div className="s4-label" style={{ fontSize: '9px', marginTop: '4px' }}>{label}</div>
          </GlassPanel>
        ))}
      </div>

      {/* Rule Builder */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: '20px' }}>
            <GlassPanel className="spatial lift" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Zap size={15} color="#818CF8" />
                <span className="s4-label s4-accent">{t('BUILD AUTOMATION RULE', 'إنشاء قاعدة أتمتة')}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8', fontFamily: "'Satoshi',sans-serif", display: 'block', marginBottom: '6px' }}>{t('RULE NAME', 'اسم القاعدة')}</label>
                  <input value={builder.name} onChange={e => setBuilder(p => ({ ...p, name: e.target.value }))}
                    placeholder={t('e.g. Welcome New Trader', 'مثال: ترحيب بمتداول جديد')}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8', fontFamily: "'Satoshi',sans-serif", display: 'block', marginBottom: '6px' }}>{t('WHEN THIS HAPPENS (TRIGGER)', 'عند حدوث هذا (المحفز)')}</label>
                  <select value={builder.trigger} onChange={e => setBuilder(p => ({ ...p, trigger: e.target.value }))}
                    style={{ width: '100%', background: '#14161B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}>
                    <option value="">{t('Select trigger...', 'اختر المحفز...')}</option>
                    {TRIGGERS.map(tr => <option key={tr.key} value={tr.key}>{t(tr.label, tr.labelAr)} ({tr.door})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8', fontFamily: "'Satoshi',sans-serif", display: 'block', marginBottom: '6px' }}>{t('DO THIS (ACTION)', 'افعل هذا (الإجراء)')}</label>
                  <select value={builder.action} onChange={e => setBuilder(p => ({ ...p, action: e.target.value }))}
                    style={{ width: '100%', background: '#14161B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}>
                    <option value="">{t('Select action...', 'اختر الإجراء...')}</option>
                    {ACTIONS.map(a => <option key={a.key} value={a.key}>{t(a.label, a.labelAr)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8', fontFamily: "'Satoshi',sans-serif", display: 'block', marginBottom: '6px' }}>{t('MESSAGE (optional)', 'الرسالة (اختياري)')}</label>
                  <input value={builder.message} onChange={e => setBuilder(p => ({ ...p, message: e.target.value }))}
                    placeholder={t('Hello {{name}}, welcome!', 'مرحباً {{name}}، أهلاً بك!')}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Btn onClick={handleCreate} style={{ padding: '9px 20px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Play size={11} />{t('Create Rule', 'إنشاء القاعدة')}
                </Btn>
                <Btn ghost onClick={() => setShowBuilder(false)} style={{ padding: '9px 16px', fontSize: '11px' }}>
                  {t('Cancel', 'إلغاء')}
                </Btn>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rules.length === 0 ? (
          <GlassPanel className="spatial lift" style={{ textAlign: 'center', padding: '44px' }}>
            <Zap size={32} color="#94A3B8" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
            <p style={{ color: '#94A3B8', fontSize: '12.5px' }}>{t('No automation rules yet. Create your first rule.', 'لا توجد قواعد أتمتة بعد. أنشئ قاعدتك الأولى.')}</p>
          </GlassPanel>
        ) : (
          rules.map((rule, i) => <RuleCard key={rule.id} rule={rule} idx={i} />)
        )}
      </div>
    </div>
  );
}
