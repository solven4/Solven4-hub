import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { CreditCard, Crown, Check, ArrowRight, Receipt, Zap, Lock, Users } from 'lucide-react';
import { SEO } from '@/components/SEO';

const S = {
  card: { background: 'rgba(10,12,30,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' },
  label: { fontSize: '11px', color: '#94A3B8', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' },
};

const TIERS = [
  {
    key: 'edge',
    label: 'EDGE',
    color: '#06B6D4',
    price: 297,
    doors: ['HUB', 'EDGE'],
    features: [
      'S4 EDGE — Trader Intelligence',
      'AI Trading Coach (Claude)',
      'MT5/MT4 Live Account Sync',
      'Performance DNA Analysis',
      'HUB — Mission Control',
    ],
  },
  {
    key: 'forge',
    label: 'FORGE',
    color: '#D4A843',
    price: 497,
    doors: ['HUB', 'EDGE', 'FORGE'],
    features: [
      'Everything in EDGE',
      'S4 FORGE — IB Network OS',
      'AI IB Hub (5 specialist tools)',
      'Lead & Commission Tracking',
      'Content Studio',
    ],
    popular: true,
  },
  {
    key: 'oracle',
    label: 'ORACLE',
    color: '#10B981',
    price: 797,
    doors: ['HUB', 'EDGE', 'FORGE', 'ORACLE'],
    features: [
      'Everything in FORGE',
      'S4 ORACLE — Intel Engine',
      'Market Intelligence Suite',
      'Advanced Signal Generator',
      'Research & Analysis Tools',
    ],
  },
  {
    key: 'nexus',
    label: 'NEXUS',
    color: '#EF4444',
    price: 1297,
    doors: ['HUB', 'EDGE', 'FORGE', 'ORACLE', 'NEXUS'],
    features: [
      'ALL 5 DOORS — Full Access',
      'S4 NEXUS — Business Hub',
      'AI Business Agent (agentic)',
      'Revenue & Commission Engine',
      'White-Label Ready',
    ],
  },
];

const DOOR_COLORS = { HUB: '#6366F1', EDGE: '#06B6D4', FORGE: '#D4A843', ORACLE: '#10B981', NEXUS: '#EF4444' };

export default function TheSubscription() {
  const { user, profile } = useAuthStore();
  const [inventory, setInventory] = useState({});
  const [payments, setPayments] = useState([]);
  const [loadingInv, setLoadingInv] = useState(true);
  const [loadingPay, setLoadingPay] = useState(true);
  const [checkingOut, setCheckingOut] = useState(null);
  const [error, setError] = useState('');

  const memberTier = profile?.founding_tier || profile?.plan || null;
  const isFounder = !!memberTier;

  useEffect(() => {
    function loadInventory() {
      fetch('/api/seats/inventory')
        .then(r => r.json())
        .then(data => {
          const map = {};
          (Array.isArray(data) ? data : []).forEach(t => { map[String(t.tier).toLowerCase()] = t; });
          setInventory(map);
        })
        .catch(() => {})
        .finally(() => setLoadingInv(false));
    }

    loadInventory();

    // Realtime subscription — update seat counts instantly when anyone buys or reserves
    const channel = supabase
      .channel('seat-inventory-live')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'founding_seat_inventory',
      }, () => { loadInventory(); })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'founding_members',
      }, () => { loadInventory(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('founding_members')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setPayments(data || []))
      .catch(() => {})
      .finally(() => setLoadingPay(false));
  }, [user]);

  async function handleCheckout(tierKey) {
    if (!user) return;
    setCheckingOut(tierKey);
    setError('');
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierKey, userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      window.open(data.checkoutUrl, '_blank');
    } catch (e) {
      setError(e.message);
    } finally {
      setCheckingOut(null);
    }
  }

  return (
    <>
      <SEO title="Founding Member Access" path="/dashboard/subscription" />
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', marginBottom: '4px' }}>
            FOUNDING MEMBER ACCESS
          </h1>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>One-time lifetime access — no subscriptions, no renewals. 250 seats total.</p>
        </div>

        {/* Founder status banner */}
        {isFounder && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ ...S.card, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(212,168,67,0.4)', background: 'rgba(212,168,67,0.06)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={24} color="#D4A843" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>Founding Member</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#D4A843', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.1em' }}>
                {memberTier?.toUpperCase()} ACCESS
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>LIFETIME ACTIVE</span>
            </div>
          </motion.div>
        )}

        {/* Live seat inventory summary */}
        {!loadingInv && Object.keys(inventory).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ ...S.card, marginBottom: '20px', padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Users size={14} color="#94A3B8" />
              <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', letterSpacing: '0.15em', color: '#94A3B8', fontWeight: 700 }}>LIVE SEAT AVAILABILITY</span>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981', marginLeft: '4px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
              {TIERS.map(t => {
                const inv = inventory[t.key] || {};
                const available = inv.available ?? '—';
                const total = inv.total ?? 50;
                const pct = inv.total ? Math.round(((inv.confirmed || 0) / inv.total) * 100) : 0;
                return (
                  <div key={t.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '9px', color: t.color, fontWeight: 700 }}>{t.label}</span>
                      <span style={{ fontSize: '11px', color: available === 0 ? '#EF4444' : '#10B981', fontWeight: 700 }}>{available} left</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct >= 80 ? '#EF4444' : t.color, borderRadius: '2px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#EF4444', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Tier cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
          {TIERS.map((tier, i) => {
            const inv = inventory[tier.key] || {};
            const soldOut = inv.available === 0;
            const isCurrent = memberTier?.toLowerCase() === tier.key;
            const isLoading = checkingOut === tier.key;

            return (
              <motion.div key={tier.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                style={{
                  ...S.card, padding: '20px', position: 'relative',
                  border: isCurrent ? `1.5px solid ${tier.color}60` : tier.popular ? `1px solid ${tier.color}35` : '1px solid rgba(255,255,255,0.07)',
                  background: isCurrent ? `${tier.color}08` : soldOut ? 'rgba(5,8,14,0.6)' : 'rgba(10,12,30,0.85)',
                  opacity: soldOut && !isCurrent ? 0.7 : 1,
                }}>
                {tier.popular && !isCurrent && !soldOut && (
                  <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: tier.color, color: '#000', fontSize: '9px', fontWeight: 800, padding: '3px 12px', borderRadius: '20px', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                    MOST POPULAR
                  </div>
                )}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: tier.color, color: '#000', fontSize: '9px', fontWeight: 800, padding: '3px 12px', borderRadius: '20px', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                    YOUR TIER
                  </div>
                )}
                {soldOut && !isCurrent && (
                  <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: '#EF4444', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '3px 12px', borderRadius: '20px', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                    SOLD OUT
                  </div>
                )}

                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '11px', letterSpacing: '0.15em', color: tier.color, fontWeight: 700, marginBottom: '8px' }}>{tier.label}</div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>${tier.price}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={10} color="#D4A843" /> One-time · Lifetime access
                </div>

                {/* Door access */}
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {tier.doors.map(d => (
                    <span key={d} style={{ fontSize: '8px', padding: '2px 6px', borderRadius: '4px', background: `${DOOR_COLORS[d]}18`, color: DOOR_COLORS[d], fontFamily: "'Orbitron',sans-serif", fontWeight: 700, letterSpacing: '0.05em' }}>{d}</span>
                  ))}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {tier.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '11px', color: '#C5D0E0' }}>
                      <Check size={11} color={tier.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={isCurrent || soldOut || isLoading}
                  onClick={() => handleCheckout(tier.key)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                    cursor: isCurrent || soldOut ? 'default' : 'pointer',
                    background: isCurrent ? 'rgba(255,255,255,0.05)' : soldOut ? 'rgba(255,255,255,0.03)' : `${tier.color}20`,
                    color: isCurrent ? '#94A3B8' : soldOut ? '#555' : tier.color,
                    fontSize: '11px', fontWeight: 700, fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.08em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.15s',
                    opacity: isLoading ? 0.7 : 1,
                  }}>
                  {isCurrent ? (
                    <><Lock size={11} /> YOUR PLAN</>
                  ) : soldOut ? (
                    'SOLD OUT'
                  ) : isLoading ? (
                    'LOADING...'
                  ) : (
                    <>CLAIM SEAT <ArrowRight size={11} /></>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Trust signals */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: Lock, text: 'Secure checkout via Dodo Payments' },
            { icon: Zap, text: 'Instant access on payment' },
            { icon: Crown, text: 'Lifetime access — no renewals' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ flex: 1, ...S.card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>{text}</span>
            </div>
          ))}
        </motion.div>

        {/* Payment / member history */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Receipt size={16} color="#94A3B8" />
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', letterSpacing: '0.15em', color: '#94A3B8', fontWeight: 700 }}>FOUNDING MEMBER RECORD</span>
          </div>
          {loadingPay ? (
            <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px', padding: '20px' }}>Loading...</div>
          ) : payments.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px', padding: '20px' }}>
              No founding member records yet. Claim your seat above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {payments.map((p, i) => (
                <div key={p.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CreditCard size={14} color="#94A3B8" />
                    <span style={{ fontSize: '12px', color: '#fff' }}>Founding Member — {p.tier?.toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>${parseFloat(p.amount_paid || 0).toFixed(2)}</span>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.12)', color: '#10B981', fontWeight: 700 }}>CONFIRMED</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
