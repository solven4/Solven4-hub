import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Wallet, Trophy, Brain,
  LogOut, ChevronLeft, ChevronRight, ArrowRight, User, Network,
  Radio, Activity, Map, Users, DollarSign, Settings, Globe,
  CreditCard, Zap, Star, Eye, Cpu, Shield,
  ChevronDown, UserCircle, Bell, ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { useEmbed } from '@/context/EmbedContext';

const NAV_GROUPS = [
  {
    key: 'core',
    label: 'CORE',
    items: [
      { label: 'Command',        Icon: LayoutDashboard, to: '/dashboard/command' },
      { label: 'Profile & KYC', Icon: UserCircle,       to: '/dashboard/profile' },
      { label: 'Subscription',  Icon: CreditCard,       to: '/dashboard/subscription' },
      { label: 'Settings',      Icon: Settings,         to: '/dashboard/settings' },
    ],
  },
  {
    key: 'intelligence',
    label: 'INTELLIGENCE',
    items: [
      { label: 'The Vault',   Icon: Wallet,   to: '/dashboard/vault' },
      { label: 'The Pulse',   Icon: Radio,    to: '/dashboard/pulse' },
      { label: 'The Matrix',  Icon: Activity, to: '/dashboard/matrix' },
      { label: 'The Score',   Icon: Star,     to: '/dashboard/score' },
      { label: 'The Brain',   Icon: Brain,    to: '/dashboard/brain' },
      { label: 'The Signals', Icon: Cpu,      to: '/dashboard/signals' },
      { label: 'Blueprint',   Icon: Map,      to: '/dashboard/blueprint' },
      { label: 'The Web',     Icon: Globe,    to: '/dashboard/web' },
    ],
  },
  {
    key: 'network',
    label: 'NETWORK',
    items: [
      { label: 'Network Hub',       Icon: Users,    to: '/dashboard/network' },
      { label: 'Referral Center',   Icon: Network,  to: '/dashboard/referral' },
      { label: 'Commission Engine', Icon: DollarSign, to: '/dashboard/commission' },
      { label: 'Leaderboard',       Icon: Trophy,   to: '/dashboard/leaderboard' },
      { label: 'Arena',             Icon: Shield,   to: '/dashboard/arena' },
    ],
  },
  {
    key: 'connect',
    label: 'CONNECT',
    items: [
      { label: 'Integrations', Icon: Globe, to: '/dashboard/integrations' },
      { label: 'Automation',   Icon: Zap,   to: '/dashboard/automation' },
      { label: 'Broker B2B',   Icon: Eye,   to: '/dashboard/broker' },
    ],
  },
];

const SOLVEN_AI = { label: 'SOLVEN AI', Icon: Brain, to: '/dashboard/agent', accent: '#6366F1' };

const DOOR_LINKS = [
  { key: 'EDGE',   label: 'S4 EDGE',   color: '#06B6D4', url: 'https://solven4-edge-six.vercel.app' },
  { key: 'FORGE',  label: 'S4 FORGE',  color: '#D4A843', url: 'https://solven4-forge-pi.vercel.app' },
  { key: 'ORACLE', label: 'S4 ORACLE', color: '#10B981', url: 'https://solven4-oracle-eight.vercel.app' },
  { key: 'NEXUS',  label: 'S4 NEXUS',  color: '#EF4444', url: 'https://solven4-nexus-self.vercel.app' },
];

const S = {
  bg: 'rgba(11,18,32,0.95)',
  border: 'rgba(255,255,255,0.06)',
  text: '#8899B4',
  textHover: '#fff',
  accent: '#6366F1',
  groupLabel: { fontFamily: "'Orbitron',sans-serif", fontSize: '9px', letterSpacing: '0.25em', color: '#8899B4' },
};

const ADMIN_NAV = [
  { label: 'Operator Hub',   Icon: LayoutDashboard, to: '/admin/hub' },
  { label: 'User Manager',   Icon: Users,           to: '/admin/users' },
  { label: 'Analytics',      Icon: Activity,        to: '/admin/analytics' },
  { label: 'Security SOC',   Icon: Shield,          to: '/admin/security' },
];

export default function Sidebar({ isAdmin = false }) {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState({ core: true, intelligence: false, network: false, connect: false });
  const { user, profile } = useAuthStore();
  const { openDoor } = useEmbed();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Operator';
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  const toggleGroup = (key) => {
    if (collapsed) return;
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  const W = collapsed ? 64 : 248;

  const NavItem = ({ label, Icon, to, accent }) => {
    const active = isActive(to);
    return (
      <NavLink to={to} style={({ isActive: ia }) => ({
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: collapsed ? '10px 0' : '8px 10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: '8px', marginBottom: '2px', textDecoration: 'none',
        background: ia ? (accent ? `${accent}20` : 'rgba(99,102,241,0.12)') : 'transparent',
        border: ia ? `1px solid ${accent ? accent + '35' : 'rgba(99,102,241,0.22)'}` : '1px solid transparent',
        color: ia ? (accent || '#818CF8') : S.text,
        boxShadow: ia && accent ? `0 0 16px ${accent}18` : 'none',
        transition: 'all 0.15s',
      })}>
        <Icon size={16} style={{ flexShrink: 0 }} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}
              style={{ fontSize: '12.5px', fontWeight: 500, whiteSpace: 'nowrap', flex: 1 }}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {!collapsed && accent && (
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981', flexShrink: 0 }} />
        )}
      </NavLink>
    );
  };

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{
        width: W, minWidth: W, maxWidth: W,
        background: S.bg,
        backdropFilter: 'blur(24px)',
        borderRight: `1px solid ${S.border}`,
        display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0,
        overflow: 'hidden', flexShrink: 0,
      }}>

      {/* TOP — LOGO */}
      <div style={{ padding: collapsed ? '18px 0' : '18px 16px', borderBottom: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(135deg,#6366F1,#818CF8)',
            borderRadius: '8px', width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontFamily: "'Orbitron', sans-serif", fontSize: '11px', fontWeight: 900, color: '#fff',
          }}>
            S4
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', letterSpacing: '0.15em', color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                  SOLVEN4
                </div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', letterSpacing: '0.2em', color: '#6366F1', fontWeight: 600 }}>
                  HUB · INTELLIGENCE
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={() => setCollapsed(v => !v)}
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: S.text, padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* SOLVEN AI — Featured */}
      <div style={{ padding: '10px 8px 4px' }}>
        <NavItem {...SOLVEN_AI} />
      </div>

      {/* NAV GROUPS */}
      <nav style={{ flex: 1, padding: '4px 8px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Admin nav */}
        {isAdmin && (
          <div style={{ marginBottom: '8px' }}>
            {!collapsed && (
              <div style={{ ...S.groupLabel, padding: '0 10px', marginBottom: '6px', display: 'block' }}>ADMIN</div>
            )}
            {ADMIN_NAV.map(item => <NavItem key={item.to} {...item} />)}
          </div>
        )}
        {!isAdmin && NAV_GROUPS.map(({ key, label, items }) => (
          <div key={key} style={{ marginBottom: '4px' }}>
            {/* Group header */}
            <button
              onClick={() => toggleGroup(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: collapsed ? '8px 0' : '6px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                width: '100%', background: 'transparent', border: 'none',
                cursor: 'pointer', borderRadius: '6px', marginBottom: '2px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <span style={S.groupLabel}>{label}</span>
                    <div style={{ flex: 1, height: '1px', background: S.border, marginLeft: '4px' }} />
                    <ChevronDown size={10} style={{ color: S.text, transform: openGroups[key] ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
                  </motion.div>
                )}
                {collapsed && (
                  <div style={{ width: '20px', height: '1px', background: S.border }} />
                )}
              </AnimatePresence>
            </button>

            {/* Group items */}
            <AnimatePresence initial={false}>
              {(!collapsed || true) && (collapsed || openGroups[key]) && (
                <motion.div
                  key={key + '-items'}
                  initial={collapsed ? {} : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={collapsed ? {} : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}>
                  {items.map(item => (
                    <NavItem key={item.to} {...item} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* S4 DOORS — only in user mode */}
        {!isAdmin && <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${S.border}` }}>
          {!collapsed && (
            <div style={{ ...S.groupLabel, padding: '0 10px', marginBottom: '8px', display: 'block' }}>
              S4 DOORS
            </div>
          )}
          {DOOR_LINKS.map(({ key, label, color, port }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              {/* Embed button — opens door inside HUB via DoorFrame route */}
              <button
                onClick={() => navigate(`/dashboard/door/${key.toLowerCase()}`)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                  padding: collapsed ? '10px 0' : '8px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '8px',
                  background: 'transparent', border: '1px solid transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${color}12`; e.currentTarget.style.borderColor = `${color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                title={`Open ${label} embedded in HUB`}>
                <div style={{ width: '17px', height: '17px', borderRadius: '4px', background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}
                      style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', letterSpacing: '0.1em', color, fontWeight: 700, flex: 1, textAlign: 'left' }}>
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              {/* Open in new tab button */}
              {!collapsed && (
                <button
                  onClick={() => window.open(url, '_blank')}
                  style={{
                    width: '26px', height: '26px', borderRadius: '6px', flexShrink: 0,
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.07)',
                    cursor: 'pointer', color: '#8899B4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.color = color; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#8899B4'; }}
                  title="Open in new tab">
                  <ExternalLink size={10} />
                </button>
              )}
            </div>
          ))}
        </div>}
      </nav>

      {/* BOTTOM — USER */}
      <div style={{ padding: '10px 8px', borderTop: `1px solid ${S.border}` }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: collapsed ? '7px 0' : '7px 10px', justifyContent: collapsed ? 'center' : 'flex-start',
          marginBottom: '3px',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#6366F1,#818CF8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {initials || <User size={13} />}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '9px', color: '#D4A843', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}>
                  {profile?.plan?.toUpperCase() || 'OPERATOR'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: collapsed ? '7px 0' : '7px 10px', justifyContent: collapsed ? 'center' : 'flex-start',
            width: '100%', borderRadius: '8px',
            background: 'transparent', border: '1px solid transparent',
            cursor: 'pointer', color: S.text, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = S.text; }}>
          <LogOut size={15} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}
                style={{ fontSize: '12.5px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
