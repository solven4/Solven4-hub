import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Users, Link2, TrendingUp, DollarSign, GitBranch, ArrowUpRight, MessageCircle, Send, Globe } from 'lucide-react';
import { db } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useLang } from '@/lib/LanguageContext';
import { GlassPanel } from '@/hud';

const ACCENT = '#D4A843';

// SOLVEN4 FORGE (S4-II) — IB command center full feature map
const NETWORK_MODULES = [
  { group: 'INTELLIGENCE', color: '#D4A843', items: ['Network Hub (Tree view)', 'Network CRM (Trader Kanban)', 'Lead Intelligence (Kanban)', 'Leads & Clients (Table)', 'Activity Log', 'Analytics (7 tabs)'] },
  { group: 'AI TOOLS', color: '#06B6D4', items: ['Market Signals', 'Deposit Predictor', 'Churn Predictor', 'Retention Bot', 'Client Segmentation', 'Content Generator', 'Lead Generator', 'Smart Calendar'] },
  { group: 'MESSAGING', color: '#10B981', items: ['Social Hub (6 tabs)', 'WhatsApp Broadcast & DM', 'Telegram Bot & Channels', 'Live Signals', 'Unified Inbox', 'Alerts Center'] },
  { group: 'FINANCE & NETWORK', color: '#D4A843', items: ['Finance Hub', 'Commission Engine', 'Broker Rebate Config', 'Tier Upgrade Panel', 'Referral Link Generator', 'Payout Rules & Scheduler'] },
  { group: 'GAMIFICATION', color: '#6366F1', items: ['XP Leaderboard', 'Arena Challenges', 'Trade Heatmap', 'Milestone Notifier', 'Public Leaderboard', 'Referral Leaderboard'] },
  { group: 'TOOLS', color: '#EF4444', items: ['Content Studio (AI)', 'Automation Center', 'MT4/MT5 Sync', 'Brand Share Cards', 'Content Calendar', 'Social Accounts Manager'] },
];

export default function TheWeb() {
  const { t } = useLang();
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [links, setLinks] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      db.networkMembers().select('*').eq('referrer_id', user.id).order('created_at', { ascending: false }).limit(20),
      db.referralLinks().select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(5),
      db.commissions().select('amount, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    ]).then(([m, l, c]) => {
      setMembers(m.data ?? []);
      setLinks(l.data ?? []);
      setCommissions(c.data ?? []);
      setLoading(false);
    });
  }, [user]);

  const totalCommissions = commissions.reduce((s, c) => s + (c.amount ?? 0), 0);
  const rise = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="s4hud" style={{ ['--accent']: ACCENT, color: '#fff', fontFamily: "'Space Grotesk',sans-serif" }}>

      {/* Header */}
      <motion.div {...rise} transition={{ duration: 0.5 }} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: '22px' }}>
        <div>
          <div className="s4-label s4-accent" style={{ letterSpacing: '0.35em', marginBottom: 6 }}>{t('S4 FORGE · IB EMPIRE', 'S4 FORGE · إمبراطورية الوسطاء')}</div>
          <h1 style={{ fontFamily: "'Satoshi',sans-serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 500, lineHeight: 1.02, margin: 0,
            background: 'linear-gradient(135deg,#fff 0%,#F0DCA0 60%,#D4A843 120%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 22px rgba(212,168,67,0.35))' }}>{t('THE WEB', 'الشبكة')}</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 0' }}>
            {t('S4 FORGE (S4-II) — IB empire, referrals, commissions & network intelligence.', 'S4 FORGE — إمبراطورية الوسطاء، الإحالات، العمولات وذكاء الشبكة.')}
          </p>
        </div>
        <a href="https://solven4-forge-pi.vercel.app" target="_blank" rel="noopener noreferrer" className="s4-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '10px 18px', textDecoration: 'none' }}>
          {t('ENTER S4 FORGE', 'ادخل S4 FORGE')} <ArrowUpRight size={13} />
        </a>
      </motion.div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: t('Network Members', 'أعضاء الشبكة'), val: members.length, icon: Users, color: '#10B981' },
          { label: t('Referral Links', 'روابط الإحالة'), val: links.length, icon: Link2, color: '#06B6D4' },
          { label: t('Commissions', 'العمولات'), val: `$${totalCommissions.toFixed(0)}`, icon: DollarSign, color: '#D4A843' },
          { label: t('Network Depth', 'عمق الشبكة'), val: t('3 Levels', '3 مستويات'), icon: GitBranch, color: '#6366F1' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <GlassPanel key={s.label} className="spatial lift" brackets={false} style={{ ['--accent']: s.color }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div className="s4-label" style={{ fontSize: '9px' }}>{s.label}</div>
                <Icon size={14} style={{ color: s.color }} />
              </div>
              <div className="s4-num" style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '20px', fontWeight: 500, color: s.color }}>{loading ? '—' : s.val}</div>
            </GlassPanel>
          );
        })}
      </div>

      {/* Live data panels */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
          {/* Network Members */}
          <GlassPanel className="spatial lift" brackets={false} style={{ ['--accent']: '#10B981' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="s4-label s4-accent">{t('Network Members', 'أعضاء الشبكة')}</span>
              <Users size={13} color="#10B981" />
            </div>
            {members.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: '11px' }}>{t('No members yet. Share your link to grow The Web.', 'لا يوجد أعضاء بعد. شارك رابطك لتنمية شبكتك.')}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {members.slice(0, 6).map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: '1px solid var(--s4-line)' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#10B981', flexShrink: 0 }}>
                      {m.member_name?.[0] ?? 'A'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.member_name ?? t('Agent', 'وكيل')}</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>{new Date(m.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontSize: '9px', background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '2px 6px', borderRadius: '999px', fontWeight: 700 }}>Lv.{m.level ?? 1}</div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>

          {/* Referral Links */}
          <GlassPanel className="spatial lift" brackets={false} style={{ ['--accent']: '#06B6D4' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="s4-label s4-accent">{t('Referral Links', 'روابط الإحالة')}</span>
              <Link2 size={13} color="#06B6D4" />
            </div>
            {links.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: '11px' }}>{t('No links yet. Create them in S4 FORGE.', 'لا توجد روابط بعد. أنشئها في S4 FORGE.')}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {links.map(l => (
                  <div key={l.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--s4-line)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '3px' }}>{l.name ?? t('Referral Link', 'رابط إحالة')}</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>{l.slug}</div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: '#94A3B8' }}>
                      <span><span style={{ color: '#D4A843', fontWeight: 700 }}>{l.click_count ?? 0}</span> {t('clicks', 'نقرة')}</span>
                      <span><span style={{ color: '#10B981', fontWeight: 700 }}>{l.conversion_count ?? 0}</span> {t('converted', 'تحويل')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>

          {/* Recent Commissions */}
          <GlassPanel className="spatial lift" brackets={false} style={{ ['--accent']: '#D4A843' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="s4-label s4-accent">{t('Recent Commissions', 'أحدث العمولات')}</span>
              <DollarSign size={13} color="#D4A843" />
            </div>
            {commissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: '11px' }}>{t('No commissions yet.', 'لا توجد عمولات بعد.')}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {commissions.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: '1px solid var(--s4-line)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{c.description ?? t('Commission', 'عمولة')}</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>{new Date(c.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="s4-num" style={{ fontSize: '12px', fontWeight: 700, color: '#D4A843' }}>${(c.amount ?? 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      )}

      {/* NETWORK Door Feature Map */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Network size={15} color={ACCENT} />
          <span className="s4-label s4-accent">{t('S4 FORGE — Full Module Map', 'S4 FORGE — خريطة الوحدات الكاملة')}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {NETWORK_MODULES.map(mod => (
            <div key={mod.group} className="s4-glass" style={{ ['--accent']: mod.color, padding: '16px', borderColor: `${mod.color}30` }}>
              <div style={{ fontFamily: "'Satoshi',sans-serif", fontSize: '9px', fontWeight: 500, letterSpacing: '0.1em', color: mod.color, marginBottom: '10px' }}>{mod.group}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {mod.items.map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94A3B8' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: mod.color, flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messaging channels quick-access */}
      <GlassPanel className="spatial lift" label={t('Messaging Channels (in S4 FORGE)', 'قنوات المراسلة (في S4 FORGE)')}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
          {[
            { label: 'WhatsApp', sub: t('Broadcast & DM', 'بث ورسائل خاصة'), icon: MessageCircle, color: '#25D366' },
            { label: 'Telegram', sub: t('Bot & Channels', 'بوت وقنوات'), icon: Send, color: '#2AABEE' },
            { label: t('Social Hub', 'مركز التواصل'), sub: t('6 Platforms', '6 منصات'), icon: Globe, color: '#06B6D4' },
            { label: t('Live Signals', 'إشارات مباشرة'), sub: t('Trading Alerts', 'تنبيهات التداول'), icon: TrendingUp, color: '#D4A843' },
          ].map(ch => {
            const Icon = ch.icon;
            return (
              <div key={ch.label} style={{ border: `1px solid ${ch.color}30`, background: `${ch.color}0C`, borderRadius: '12px', padding: '12px' }}>
                <Icon size={16} style={{ color: ch.color, marginBottom: '8px' }} />
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{ch.label}</div>
                <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>{ch.sub}</div>
              </div>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}
