import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, DollarSign,
  CreditCard, History, Send, Plus, Shield, Zap, ChevronRight,
  CheckCircle2, Clock, XCircle, Copy, Download, Target,
  BarChart2, PieChart, Filter, Search, AlertCircle, Star,
  Building2, Users, BookOpen, Network, ArrowRight, Repeat,
  Bitcoin, Globe, RefreshCw, ExternalLink, Eye, EyeOff,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const S = { bg:'#05050C', surface:'rgba(10,12,30,0.9)', border:'rgba(255,255,255,0.06)', muted:'#94A3B8', accent:'#6366F1' };

/* ── CRYPTO CURRENCIES ── */
const CRYPTO_CURRENCIES = [
  { symbol:'BTC',      name:'Bitcoin',             network:'Bitcoin',     color:'#F7931A', address:'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', minDeposit:0.001,  decimals:8 },
  { symbol:'ETH',      name:'Ethereum',            network:'ERC-20',      color:'#627EEA', address:'0x742d35Cc6634C0532925a3b8D4C9C5F0e2f4b07e', minDeposit:0.01,   decimals:6 },
  { symbol:'USDT',     name:'Tether USD',          network:'ERC-20',      color:'#26A17B', address:'0x742d35Cc6634C0532925a3b8D4C9C5F0e2f4b07e', minDeposit:50,     decimals:2 },
  { symbol:'USDT',     name:'Tether USD',          network:'TRC-20',      color:'#26A17B', address:'TJYeasTPa6gpEJcSbCjTEDRR2ZnRiMFKGa',       minDeposit:50,     decimals:2 },
  { symbol:'USDC',     name:'USD Coin',             network:'ERC-20',      color:'#2775CA', address:'0x742d35Cc6634C0532925a3b8D4C9C5F0e2f4b07e', minDeposit:50,     decimals:2 },
  { symbol:'BNB',      name:'BNB Smart Chain',     network:'BEP-20',      color:'#F3BA2F', address:'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2', minDeposit:0.1,    decimals:4 },
  { symbol:'SOL',      name:'Solana',              network:'Solana',      color:'#9945FF', address:'DjkH7NkFxvHXr8gA1WujGbFNqE6P2tBGtCXm1qFkZ8vp',minDeposit:0.5,   decimals:4 },
  { symbol:'MATIC',    name:'Polygon',             network:'Polygon',     color:'#8247E5', address:'0x742d35Cc6634C0532925a3b8D4C9C5F0e2f4b07e', minDeposit:10,     decimals:2 },
];

const getCryptoKey = c => `${c.symbol}-${c.network}`;

/* ── MOCK DATA ── */
const MOCK_WALLET = { balance:24880.50, pending:1340.00, currency:'USD', lifetime_earned:89440.00, monthly_target:15000, commission_pending:4820.00 };

const MOCK_TXS = [
  { id:'t1',  type:'commission', amount:1240.00, status:'completed', door:'FORGE',  description:'IB Network commission — batch #47',      created_at: new Date(Date.now()-2*3600000).toISOString() },
  { id:'t2',  type:'commission', amount:840.00,  status:'completed', door:'NEXUS',  description:'Referral payout — Q3 cycle',              created_at: new Date(Date.now()-18*3600000).toISOString() },
  { id:'t3',  type:'deposit',    amount:5000.00, status:'completed', door:'HUB',    description:'USDT deposit — TRC-20 · confirmed on-chain',created_at: new Date(Date.now()-2*86400000).toISOString() },
  { id:'t4',  type:'withdrawal', amount:3000.00, status:'completed', door:'HUB',    description:'ETH withdrawal — blockchain verified',    created_at: new Date(Date.now()-3*86400000).toISOString() },
  { id:'t5',  type:'commission', amount:320.00,  status:'pending',   door:'FORGE',  description:'Pending commission — Trader #183',        created_at: new Date(Date.now()-3*86400000).toISOString() },
  { id:'t6',  type:'subscription',amount:89.00,  status:'completed', door:'EDGE',   description:'S4 EDGE Professional — Monthly',          created_at: new Date(Date.now()-7*86400000).toISOString() },
  { id:'t7',  type:'commission', amount:580.00,  status:'completed', door:'ORACLE', description:'Academy enrollment commissions',          created_at: new Date(Date.now()-9*86400000).toISOString() },
  { id:'t8',  type:'deposit',    amount:2000.00, status:'completed', door:'HUB',    description:'Stripe deposit — card ****4242',          created_at: new Date(Date.now()-12*86400000).toISOString() },
  { id:'t9',  type:'commission', amount:2100.00, status:'completed', door:'NEXUS',  description:'Business license commission — Q2',        created_at: new Date(Date.now()-20*86400000).toISOString() },
  { id:'t10', type:'withdrawal', amount:5000.00, status:'completed', door:'HUB',    description:'USDT TRC-20 withdrawal — 3 confirmations', created_at: new Date(Date.now()-25*86400000).toISOString() },
  { id:'t11', type:'commission', amount:1460.00, status:'completed', door:'FORGE',  description:'IB Network commission — batch #46',       created_at: new Date(Date.now()-30*86400000).toISOString() },
  { id:'t12', type:'deposit',    amount:1500.00, status:'completed', door:'HUB',    description:'BTC deposit · 2 confirmations received',  created_at: new Date(Date.now()-35*86400000).toISOString() },
];

const INCOME_SOURCES = [
  { label:'FORGE Commissions', value:4820, color:'#D4A843', Icon:Users,     desc:'IB network & referral commissions' },
  { label:'NEXUS Revenue',     value:3240, color:'#EF4444', Icon:Building2, desc:'Business licenses & clients' },
  { label:'ORACLE Academy',    value:2180, color:'#10B981', Icon:BookOpen,  desc:'Course enrollments & certs' },
  { label:'Referral Program',  value:1340, color:'#6366F1', Icon:Network,   desc:'Multi-door affiliate earnings' },
  { label:'EDGE Signals',      value:980,  color:'#06B6D4', Icon:TrendingUp,desc:'Signal subscriptions' },
];
const INCOME_TOTAL = INCOME_SOURCES.reduce((s,r)=>s+r.value,0);

const MONTHLY_DATA = [
  { month:'Feb', income:6200,  out:2800 },
  { month:'Mar', income:7100,  out:3200 },
  { month:'Apr', income:8400,  out:3600 },
  { month:'May', income:9200,  out:4100 },
  { month:'Jun', income:10800, out:3900 },
  { month:'Jul', income:12560, out:4400 },
];
const MAX_MONTHLY = Math.max(...MONTHLY_DATA.map(d=>d.income));

const SUBS = [
  { door:'S4 EDGE',   color:'#06B6D4', plan:'Professional', price:89,  renews:'Aug 3' },
  { door:'S4 FORGE',  color:'#D4A843', plan:'Operator Pro', price:149, renews:'Aug 7' },
  { door:'S4 ORACLE', color:'#10B981', plan:'Academy Plus', price:79,  renews:'Aug 12' },
  { door:'S4 NEXUS',  color:'#EF4444', plan:'Business Suite',price:199,renews:'Aug 1' },
];

const DOOR_COLOR  = { EDGE:'#06B6D4', FORGE:'#D4A843', ORACLE:'#10B981', NEXUS:'#EF4444', HUB:'#6366F1' };
const TYPE_COLOR  = { commission:'#D4A843', withdrawal:'#EF4444', deposit:'#10B981', subscription:'#8B5CF6', refund:'#3B82F6' };
const STATUS_CFG  = {
  completed:{ color:'#10B981', Icon:CheckCircle2, label:'Completed' },
  pending:  { color:'#F97316', Icon:Clock,        label:'Pending' },
  failed:   { color:'#EF4444', Icon:XCircle,      label:'Failed' },
};

function fmt(n) { return `$${Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`; }

function SparkBar({ data, maxVal }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:'4px', height:'48px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
          <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'1px', height:'44px', justifyContent:'flex-end' }}>
            <motion.div initial={{ height:0 }} animate={{ height:`${(d.income/maxVal)*100}%` }}
              transition={{ delay:0.5+i*0.08, duration:0.6 }}
              style={{ width:'100%', background:'linear-gradient(180deg,#10B981,#059669)', borderRadius:'2px 2px 0 0', minHeight:'2px' }} />
          </div>
          <span style={{ color:'#94A3B8', fontSize:'8px' }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function TxRow({ tx }) {
  const isCredit = ['commission','deposit','refund','referral','copy_trade','xp_bonus','arena_prize'].includes(tx.type);
  const sc = STATUS_CFG[tx.status] ?? STATUS_CFG.pending;
  const SIcon = sc.Icon;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 8px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ width:'36px', height:'36px', borderRadius:'10px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
        background:`${TYPE_COLOR[tx.type]??'#94A3B8'}15`, border:`1px solid ${TYPE_COLOR[tx.type]??'#94A3B8'}25` }}>
        {isCredit ? <ArrowDownLeft size={15} style={{ color:TYPE_COLOR[tx.type]??'#10B981' }} /> : <ArrowUpRight size={15} style={{ color:TYPE_COLOR[tx.type]??'#EF4444' }} />}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tx.description}</div>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'2px' }}>
          <span style={{ fontSize:'10px', color:'#94A3B8' }}>{new Date(tx.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</span>
          {tx.door && (<><span style={{ color:'rgba(255,255,255,0.1)' }}>·</span><span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'8px', fontWeight:700, color:DOOR_COLOR[tx.door]??'#94A3B8' }}>{tx.door}</span></>)}
        </div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontSize:'13px', fontWeight:800, color: isCredit?'#10B981':'#EF4444' }}>{isCredit?'+':'-'}{fmt(tx.amount)}</div>
        <div style={{ display:'flex', alignItems:'center', gap:'3px', justifyContent:'flex-end', marginTop:'2px' }}>
          <SIcon size={10} style={{ color:sc.color }} /><span style={{ fontSize:'9px', color:sc.color }}>{sc.label}</span>
        </div>
      </div>
    </div>
  );
}

/* ── STRIPE DEPOSIT FLOW ── */
function StripeDepositFlow({ amount, onSuccess, onBack }) {
  const [step, setStep] = useState('form'); // form | processing | success
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [showCvc, setShowCvc] = useState(false);
  const [error, setError] = useState('');

  const formatCard = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry = v => { const d=v.replace(/\D/g,'').slice(0,4); return d.length>2?d.slice(0,2)+'/'+d.slice(2):d; };

  async function handlePay() {
    if (!cardNum.replace(/\s/g,'') || cardNum.replace(/\s/g,'').length < 16) { setError('Enter a valid 16-digit card number'); return; }
    if (!expiry || expiry.length < 5) { setError('Enter a valid expiry (MM/YY)'); return; }
    if (!cvc || cvc.length < 3) { setError('Enter a valid CVC'); return; }
    if (!name.trim()) { setError('Enter cardholder name'); return; }
    setError(''); setStep('processing');
    // Simulate Stripe processing (in production: call /api/stripe/create-payment-intent)
    await new Promise(r => setTimeout(r, 2800));
    setStep('success');
    setTimeout(onSuccess, 1500);
  }

  if (step === 'processing') return (
    <div style={{ textAlign:'center', padding:'40px 20px' }}>
      <div style={{ width:'48px', height:'48px', borderRadius:'50%', border:'3px solid rgba(99,102,241,0.2)', borderTopColor:'#6366F1', animation:'s4v-spin 1s linear infinite', margin:'0 auto 20px' }} />
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'14px', fontWeight:900, color:'#fff', marginBottom:'8px' }}>PROCESSING PAYMENT</div>
      <div style={{ color:S.muted, fontSize:'12px' }}>Connecting to Stripe secure servers...</div>
    </div>
  );

  if (step === 'success') return (
    <div style={{ textAlign:'center', padding:'40px 20px' }}>
      <CheckCircle2 size={48} style={{ color:'#10B981', margin:'0 auto 16px', display:'block' }} />
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'14px', fontWeight:900, color:'#fff', marginBottom:'8px' }}>PAYMENT CONFIRMED</div>
      <div style={{ color:'#10B981', fontSize:'12px' }}>{fmt(parseFloat(amount))} credited to your Vault</div>
    </div>
  );

  return (
    <div>
      {/* Stripe badge */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'18px', padding:'10px 14px', borderRadius:'10px', background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.18)' }}>
        <div style={{ background:'#635BFF', borderRadius:'6px', padding:'3px 8px', fontFamily:"'Orbitron',sans-serif", fontSize:'10px', fontWeight:900, color:'#fff', letterSpacing:'0.05em' }}>stripe</div>
        <span style={{ color:S.muted, fontSize:'11px' }}>Secured by Stripe · 256-bit SSL encryption</span>
        <Shield size={12} style={{ color:'#10B981', marginLeft:'auto' }} />
      </div>

      {/* Amount display */}
      <div style={{ textAlign:'center', marginBottom:'20px', padding:'14px', borderRadius:'12px', background:'rgba(255,255,255,0.03)', border:`1px solid ${S.border}` }}>
        <div style={{ color:S.muted, fontSize:'10px', marginBottom:'4px' }}>DEPOSIT AMOUNT</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'28px', fontWeight:900, color:'#10B981' }}>{fmt(parseFloat(amount)||0)}</div>
      </div>

      {/* Card form */}
      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        <div>
          <label style={{ display:'block', fontSize:'10px', color:S.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:'5px', textTransform:'uppercase' }}>Card Number</label>
          <div style={{ position:'relative' }}>
            <input value={cardNum} onChange={e=>setCardNum(formatCard(e.target.value))} placeholder="4242 4242 4242 4242"
              style={{ width:'100%', padding:'11px 40px 11px 14px', borderRadius:'10px', fontSize:'14px', color:'#fff', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, outline:'none', boxSizing:'border-box', fontFamily:'monospace', letterSpacing:'0.08em' }} />
            <CreditCard size={16} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', color:S.muted }} />
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          <div>
            <label style={{ display:'block', fontSize:'10px', color:S.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:'5px', textTransform:'uppercase' }}>Expiry</label>
            <input value={expiry} onChange={e=>setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY"
              style={{ width:'100%', padding:'11px 14px', borderRadius:'10px', fontSize:'14px', color:'#fff', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, outline:'none', boxSizing:'border-box', fontFamily:'monospace' }} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'10px', color:S.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:'5px', textTransform:'uppercase' }}>CVC</label>
            <div style={{ position:'relative' }}>
              <input type={showCvc?'text':'password'} value={cvc} onChange={e=>setCvc(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="•••"
                style={{ width:'100%', padding:'11px 36px 11px 14px', borderRadius:'10px', fontSize:'14px', color:'#fff', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, outline:'none', boxSizing:'border-box', fontFamily:'monospace' }} />
              <button onClick={()=>setShowCvc(v=>!v)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:S.muted, padding:0 }}>
                {showCvc ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>
        </div>
        <div>
          <label style={{ display:'block', fontSize:'10px', color:S.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:'5px', textTransform:'uppercase' }}>Cardholder Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name as on card"
            style={{ width:'100%', padding:'11px 14px', borderRadius:'10px', fontSize:'14px', color:'#fff', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, outline:'none', boxSizing:'border-box' }} />
        </div>
      </div>

      {error && <div style={{ marginTop:'10px', padding:'8px 12px', borderRadius:'8px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#EF4444', fontSize:'11px' }}>{error}</div>}

      <div style={{ display:'flex', gap:'8px', marginTop:'18px' }}>
        <button onClick={onBack} style={{ padding:'12px 18px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, cursor:'pointer', color:S.muted, fontSize:'12px', fontWeight:700 }}>Back</button>
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={handlePay}
          style={{ flex:1, padding:'12px', borderRadius:'10px', background:'linear-gradient(135deg,#635BFF,#6366F1)', border:'none', cursor:'pointer', color:'#fff', fontSize:'13px', fontWeight:900, boxShadow:'0 0 24px rgba(99,91,255,0.35)' }}>
          Pay {fmt(parseFloat(amount)||0)} with Stripe
        </motion.button>
      </div>
      <div style={{ textAlign:'center', marginTop:'10px', color:S.muted, fontSize:'10px' }}>
        Your card data is processed securely by Stripe and never stored on our servers
      </div>
    </div>
  );
}

/* ── CRYPTO DEPOSIT FLOW ── */
function CryptoDepositFlow({ selectedCrypto, onSelect, onBack }) {
  const [copied, setCopied] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [confirmations, setConfirmations] = useState(0);

  function copyAddress() {
    navigator.clipboard.writeText(selectedCrypto.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function simulateBlockchain() {
    setAwaitingConfirm(true);
    let count = 0;
    const iv = setInterval(() => {
      count++;
      setConfirmations(count);
      if (count >= 3) clearInterval(iv);
    }, 2000);
  }

  return (
    <div>
      {/* Currency grid */}
      <div style={{ marginBottom:'16px' }}>
        <div style={{ fontSize:'10px', color:S.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:'8px', textTransform:'uppercase' }}>Select Cryptocurrency</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px' }}>
          {CRYPTO_CURRENCIES.map(c => {
            const key = getCryptoKey(c);
            const selKey = selectedCrypto ? getCryptoKey(selectedCrypto) : null;
            const isSelected = key === selKey;
            return (
              <button key={key} onClick={() => { onSelect(c); setAwaitingConfirm(false); setConfirmations(0); }}
                style={{ padding:'8px 6px', borderRadius:'10px', cursor:'pointer', border:`1px solid ${isSelected?c.color+'50':'rgba(255,255,255,0.06)'}`,
                  background: isSelected?`${c.color}15`:'rgba(255,255,255,0.02)', transition:'all 0.15s', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
                <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', fontWeight:900, color:isSelected?c.color:'#CBD5E1' }}>{c.symbol}</span>
                <span style={{ fontSize:'7px', color:S.muted, textAlign:'center', lineHeight:1.2 }}>{c.network}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedCrypto && (
        <AnimatePresence>
          <motion.div key={getCryptoKey(selectedCrypto)} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
            {/* Network warning */}
            <div style={{ padding:'10px 12px', borderRadius:'8px', background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', marginBottom:'14px', display:'flex', gap:'8px', alignItems:'flex-start' }}>
              <AlertCircle size={13} style={{ color:'#F97316', flexShrink:0, marginTop:'1px' }} />
              <div style={{ fontSize:'11px', color:'#F97316' }}>
                <strong>Network: {selectedCrypto.network}</strong> — Only send {selectedCrypto.symbol} via the <strong>{selectedCrypto.network}</strong> network. Sending via wrong network will result in permanent loss of funds.
              </div>
            </div>

            {/* Address display */}
            <div style={{ padding:'16px', borderRadius:'12px', background:`${selectedCrypto.color}06`, border:`1px solid ${selectedCrypto.color}20`, marginBottom:'14px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <div style={{ width:'24px', height:'24px', borderRadius:'6px', background:`${selectedCrypto.color}20`, border:`1px solid ${selectedCrypto.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'7px', color:selectedCrypto.color, fontWeight:900 }}>{selectedCrypto.symbol}</span>
                  </div>
                  <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', color:selectedCrypto.color, fontWeight:700 }}>{selectedCrypto.name} DEPOSIT ADDRESS</span>
                </div>
                <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'6px', padding:'2px 8px', fontSize:'9px', color:'#10B981', fontWeight:700 }}>VERIFIED</div>
              </div>
              <div style={{ fontFamily:'monospace', fontSize:'12px', color:'#fff', wordBreak:'break-all', lineHeight:1.6, marginBottom:'10px', padding:'10px', borderRadius:'8px', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.06)' }}>
                {selectedCrypto.address}
              </div>
              <button onClick={copyAddress}
                style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'8px', background:`${selectedCrypto.color}15`, border:`1px solid ${selectedCrypto.color}30`, cursor:'pointer', color:selectedCrypto.color, fontSize:'11px', fontWeight:700 }}>
                {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                {copied ? 'Address Copied!' : 'Copy Address'}
              </button>
            </div>

            {/* Deposit details */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'14px' }}>
              {[
                { label:'Min Deposit', value:`${selectedCrypto.minDeposit} ${selectedCrypto.symbol}` },
                { label:'Network', value:selectedCrypto.network },
                { label:'Confirmations', value:selectedCrypto.network === 'Bitcoin' ? '2 required' : '3 required' },
              ].map(d => (
                <div key={d.label} style={{ padding:'10px', borderRadius:'8px', background:'rgba(255,255,255,0.02)', border:`1px solid ${S.border}`, textAlign:'center' }}>
                  <div style={{ color:S.muted, fontSize:'9px', marginBottom:'3px' }}>{d.label}</div>
                  <div style={{ color:'#fff', fontSize:'11px', fontWeight:700 }}>{d.value}</div>
                </div>
              ))}
            </div>

            {/* Blockchain confirmation simulator */}
            {!awaitingConfirm ? (
              <div style={{ padding:'12px 14px', borderRadius:'10px', background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)', display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ flex:1 }}>
                  <div style={{ color:'#CBD5E1', fontSize:'11px', fontWeight:700, marginBottom:'2px' }}>Sent your {selectedCrypto.symbol}?</div>
                  <div style={{ color:S.muted, fontSize:'10px' }}>Once you send, click to start blockchain confirmation monitoring</div>
                </div>
                <button onClick={simulateBlockchain}
                  style={{ padding:'8px 14px', borderRadius:'8px', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', cursor:'pointer', color:'#10B981', fontSize:'11px', fontWeight:700, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'5px' }}>
                  <RefreshCw size={11} /> I Sent {selectedCrypto.symbol}
                </button>
              </div>
            ) : (
              <div style={{ padding:'14px', borderRadius:'10px', background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                  {confirmations >= (selectedCrypto.network === 'Bitcoin' ? 2 : 3)
                    ? <CheckCircle2 size={16} style={{ color:'#10B981' }} />
                    : <div style={{ width:'16px', height:'16px', borderRadius:'50%', border:'2px solid rgba(99,102,241,0.2)', borderTopColor:'#6366F1', animation:'s4v-spin 1s linear infinite' }} />
                  }
                  <span style={{ color:'#fff', fontSize:'12px', fontWeight:700 }}>
                    {confirmations >= (selectedCrypto.network === 'Bitcoin' ? 2 : 3) ? 'Deposit Confirmed!' : 'Monitoring blockchain...'}
                  </span>
                </div>
                <div style={{ display:'flex', gap:'6px' }}>
                  {Array.from({ length: selectedCrypto.network === 'Bitcoin' ? 2 : 3 }, (_, i) => (
                    <div key={i} style={{ flex:1, height:'6px', borderRadius:'3px', background: confirmations > i ? '#10B981' : 'rgba(255,255,255,0.08)', transition:'background 0.5s' }} />
                  ))}
                </div>
                <div style={{ color:S.muted, fontSize:'10px', marginTop:'6px' }}>
                  {confirmations >= (selectedCrypto.network === 'Bitcoin' ? 2 : 3)
                    ? `✓ ${confirmations} confirmations — funds credited to your Vault`
                    : `${confirmations} of ${selectedCrypto.network === 'Bitcoin' ? 2 : 3} confirmations received`
                  }
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <button onClick={onBack} style={{ marginTop:'14px', padding:'10px 18px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, cursor:'pointer', color:S.muted, fontSize:'12px', fontWeight:700 }}>Back</button>
    </div>
  );
}

/* ── CRYPTO WITHDRAWAL FLOW ── */
function CryptoWithdrawalFlow({ balance, onSuccess, onBack }) {
  const [step, setStep] = useState('form'); // form | review | processing | success
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [confirmations, setConfirmations] = useState(0);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!selectedCrypto) { setError('Select a cryptocurrency'); return; }
    if (!toAddress.trim() || toAddress.length < 20) { setError('Enter a valid wallet address'); return; }
    if (!amount || parseFloat(amount) < 50) { setError('Minimum withdrawal is $50'); return; }
    if (parseFloat(amount) > balance) { setError('Insufficient balance'); return; }
    setError(''); setStep('review');
  }

  async function handleConfirm() {
    setStep('processing');
    // Simulate backend → blockchain broadcast
    await new Promise(r => setTimeout(r, 2000));
    const hash = '0x' + Array.from({length:64},()=>Math.floor(Math.random()*16).toString(16)).join('');
    setTxHash(hash);
    let count = 0;
    const iv = setInterval(() => { count++; setConfirmations(count); if (count >= 3) { clearInterval(iv); setTimeout(onSuccess, 1000); } }, 1800);
  }

  if (step === 'processing') return (
    <div>
      <div style={{ textAlign:'center', padding:'20px 0 10px' }}>
        {confirmations >= 3 ? <CheckCircle2 size={44} style={{ color:'#10B981', margin:'0 auto', display:'block' }} /> :
          <div style={{ width:'44px', height:'44px', borderRadius:'50%', border:'3px solid rgba(99,102,241,0.2)', borderTopColor:'#6366F1', animation:'s4v-spin 1s linear infinite', margin:'0 auto' }} />}
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'13px', fontWeight:900, color:'#fff', marginTop:'12px', marginBottom:'6px' }}>
          {confirmations >= 3 ? 'WITHDRAWAL COMPLETE' : 'BROADCASTING TO BLOCKCHAIN'}
        </div>
        <div style={{ color:S.muted, fontSize:'11px' }}>{confirmations >= 3 ? `${confirmations} confirmations received` : `${confirmations}/3 confirmations`}</div>
      </div>
      {txHash && (
        <div style={{ padding:'12px', borderRadius:'10px', background:'rgba(255,255,255,0.02)', border:`1px solid ${S.border}`, marginTop:'14px' }}>
          <div style={{ color:S.muted, fontSize:'9px', marginBottom:'4px', fontWeight:700 }}>TRANSACTION HASH</div>
          <div style={{ fontFamily:'monospace', fontSize:'9px', color:'#10B981', wordBreak:'break-all' }}>{txHash}</div>
        </div>
      )}
      <div style={{ display:'flex', gap:'6px', marginTop:'12px' }}>
        {Array.from({length:3},(_,i)=>(
          <div key={i} style={{ flex:1, height:'5px', borderRadius:'3px', background:confirmations>i?'#10B981':'rgba(255,255,255,0.08)', transition:'background 0.5s' }} />
        ))}
      </div>
    </div>
  );

  if (step === 'review') return (
    <div>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', color:'#D4A843', fontWeight:700, marginBottom:'16px', letterSpacing:'0.15em' }}>REVIEW WITHDRAWAL</div>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'18px' }}>
        {[
          { label:'Amount',    value:fmt(parseFloat(amount)) },
          { label:'Currency',  value:`${selectedCrypto.symbol} (${selectedCrypto.network})` },
          { label:'To Address',value:toAddress, mono:true },
          { label:'Network Fee',value:'Covered by SOLVEN4' },
          { label:'Estimated', value:'Instant · blockchain confirmation' },
        ].map(r => (
          <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', borderRadius:'8px', background:'rgba(255,255,255,0.02)', border:`1px solid ${S.border}` }}>
            <span style={{ color:S.muted, fontSize:'11px' }}>{r.label}</span>
            <span style={{ color:'#fff', fontSize:'11px', fontWeight:700, fontFamily:r.mono?'monospace':'inherit', maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis' }}>{r.value}</span>
          </div>
        ))}
      </div>
      <div style={{ padding:'10px 12px', borderRadius:'8px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.18)', marginBottom:'16px', fontSize:'11px', color:'#F97316' }}>
        ⚠️ Cryptocurrency withdrawals are irreversible. Verify the address before confirming.
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <button onClick={()=>setStep('form')} style={{ padding:'12px 18px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, cursor:'pointer', color:S.muted, fontSize:'12px', fontWeight:700 }}>Back</button>
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={handleConfirm}
          style={{ flex:1, padding:'12px', borderRadius:'10px', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', border:'none', cursor:'pointer', color:'#fff', fontSize:'13px', fontWeight:900, boxShadow:'0 0 24px rgba(99,102,241,0.3)' }}>
          Confirm & Broadcast
        </motion.button>
      </div>
    </div>
  );

  // form step
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px', marginBottom:'14px' }}>
        {CRYPTO_CURRENCIES.map(c => {
          const key = getCryptoKey(c);
          const selKey = selectedCrypto ? getCryptoKey(selectedCrypto) : null;
          const isSel = key === selKey;
          return (
            <button key={key} onClick={()=>{ setSelectedCrypto(c); setError(''); }}
              style={{ padding:'8px 6px', borderRadius:'10px', cursor:'pointer', border:`1px solid ${isSel?c.color+'50':'rgba(255,255,255,0.06)'}`,
                background:isSel?`${c.color}15`:'rgba(255,255,255,0.02)', transition:'all 0.15s', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
              <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', fontWeight:900, color:isSel?c.color:'#CBD5E1' }}>{c.symbol}</span>
              <span style={{ fontSize:'7px', color:S.muted }}>{c.network}</span>
            </button>
          );
        })}
      </div>
      <div style={{ marginBottom:'12px' }}>
        <label style={{ display:'block', fontSize:'10px', color:S.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:'5px', textTransform:'uppercase' }}>Your Wallet Address</label>
        <input value={toAddress} onChange={e=>{setToAddress(e.target.value);setError('');}} placeholder={selectedCrypto?`Enter your ${selectedCrypto.symbol} address`:'Select currency first'}
          style={{ width:'100%', padding:'11px 14px', borderRadius:'10px', fontSize:'12px', color:'#fff', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, outline:'none', boxSizing:'border-box', fontFamily:'monospace' }} />
      </div>
      <div style={{ marginBottom:'12px' }}>
        <label style={{ display:'block', fontSize:'10px', color:S.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:'5px', textTransform:'uppercase' }}>Amount (USD)</label>
        <input type="number" value={amount} onChange={e=>{setAmount(e.target.value);setError('');}} placeholder="0.00"
          style={{ width:'100%', padding:'12px 14px', borderRadius:'10px', fontSize:'20px', fontWeight:800, color:'#fff', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, outline:'none', boxSizing:'border-box', fontFamily:"'Orbitron',sans-serif" }} />
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'5px', fontSize:'10px', color:S.muted }}>
          <span>Min: $50</span>
          <button onClick={()=>setAmount(String(Math.floor(balance)))} style={{ background:'none', border:'none', cursor:'pointer', color:'#6366F1', fontSize:'10px', fontWeight:700 }}>Max: {fmt(balance)}</button>
        </div>
      </div>
      {error && <div style={{ marginBottom:'10px', padding:'8px 12px', borderRadius:'8px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#EF4444', fontSize:'11px' }}>{error}</div>}
      <div style={{ padding:'8px 12px', borderRadius:'8px', background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)', marginBottom:'14px', fontSize:'10px', color:'#10B981' }}>
        ✓ Zero withdrawal fees · Blockchain confirmation in real-time · Instant approval
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <button onClick={onBack} style={{ padding:'12px 18px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, cursor:'pointer', color:S.muted, fontSize:'12px', fontWeight:700 }}>Back</button>
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={handleSubmit}
          style={{ flex:1, padding:'12px', borderRadius:'10px', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', border:'none', cursor:'pointer', color:'#fff', fontSize:'13px', fontWeight:900 }}>
          Review Withdrawal →
        </motion.button>
      </div>
    </div>
  );
}

const TABS = ['overview','income','history','deposit','withdraw','subscriptions'];

export default function TheVault() {
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [txFilter, setTxFilter] = useState('all');
  const [searchTx, setSearchTx] = useState('');

  // Deposit state
  const [depositMethod, setDepositMethod] = useState(null);   // null | 'stripe' | 'crypto'
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAmountConfirmed, setDepositAmountConfirmed] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [selectedDepositCrypto, setSelectedDepositCrypto] = useState(null);

  // Withdraw state
  const [withdrawMethod, setWithdrawMethod] = useState(null); // null | 'stripe' | 'crypto'
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      try {
        const [{ data: w }, { data: t }] = await Promise.all([
          supabase.from('wallets').select('*').eq('user_id', user.id).single(),
          supabase.from('wallet_transactions').select('*').eq('user_id', user.id).order('created_at',{ascending:false}).limit(50),
        ]);
        setWallet(w ?? MOCK_WALLET);
        setTxs(t?.length ? t : MOCK_TXS);
      } catch { setWallet(MOCK_WALLET); setTxs(MOCK_TXS); }
      finally { setLoading(false); }
    }
    load();
  }, [user?.id]);

  const balance  = wallet?.balance ?? 0;
  const pending  = wallet?.pending_balance ?? wallet?.pending ?? 0;
  const lifetime = wallet?.total_earned ?? wallet?.lifetime_earned ?? 0;
  const currency = wallet?.currency ?? 'USD';
  const target   = wallet?.monthly_target ?? 15000;
  const commPend = wallet?.commission_pending ?? 0;
  const totalIn  = txs.filter(t=>['commission','deposit','refund'].includes(t.type)).reduce((s,t)=>s+(t.amount??0),0);
  const totalOut = txs.filter(t=>['withdrawal','subscription'].includes(t.type)).reduce((s,t)=>s+(t.amount??0),0);
  const targetPct = Math.min(100, Math.round((totalIn / target) * 100));

  const filteredTxs = txs.filter(t => {
    const matchType = txFilter === 'all' || t.type === txFilter;
    const matchSearch = !searchTx || t.description?.toLowerCase().includes(searchTx.toLowerCase());
    return matchType && matchSearch;
  });

  function resetDeposit() { setDepositMethod(null); setDepositAmount(''); setDepositAmountConfirmed(false); setDepositSuccess(false); setSelectedDepositCrypto(null); }
  function resetWithdraw() { setWithdrawMethod(null); setWithdrawSuccess(false); }

  return (
    <div style={{ minHeight:'100vh', padding:'20px', background:S.bg, color:'#fff', fontFamily:"'Space Grotesk',sans-serif" }}>

      {/* ── HERO BALANCE ── */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        style={{ position:'relative', borderRadius:'24px', overflow:'hidden', padding:'28px 32px', marginBottom:'20px',
          background:'linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(10,12,30,0.96) 55%,rgba(139,92,246,0.1) 100%)',
          backdropFilter:'blur(24px)', border:'1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.3,
          backgroundImage:'linear-gradient(rgba(99,102,241,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.06) 1px,transparent 1px)',
          backgroundSize:'28px 28px', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'24px', flexWrap:'wrap' }}>
            <div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.3em', color:S.muted, marginBottom:'8px' }}>AVAILABLE BALANCE · SOLVEN4 VAULT</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'48px', fontWeight:900, color:'#fff', lineHeight:1, marginBottom:'6px' }}>
                {fmt(balance)}<span style={{ fontSize:'16px', color:S.muted, marginLeft:'8px', fontWeight:400 }}>{currency}</span>
              </div>
              <div style={{ display:'flex', gap:'16px', marginTop:'8px' }}>
                {pending > 0 && <div style={{ display:'flex', alignItems:'center', gap:'5px', color:'#F97316', fontSize:'12px' }}><Clock size={12} /> +{fmt(pending)} pending</div>}
                {commPend > 0 && <div style={{ display:'flex', alignItems:'center', gap:'5px', color:'#D4A843', fontSize:'12px' }}><Zap size={12} /> {fmt(commPend)} commissions clearing</div>}
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
              <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} onClick={() => setTab('deposit')}
                style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 20px', borderRadius:'12px', cursor:'pointer', fontWeight:700, fontSize:'13px', color:'#fff', border:'none', background:'linear-gradient(135deg,#10B981,#059669)', boxShadow:'0 0 20px rgba(16,185,129,0.35)' }}>
                <Plus size={15} /> Deposit
              </motion.button>
              <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} onClick={() => setTab('withdraw')}
                style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 20px', borderRadius:'12px', cursor:'pointer', fontWeight:700, fontSize:'13px', color:'#fff', border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow:'0 0 20px rgba(99,102,241,0.35)' }}>
                <Send size={15} /> Withdraw
              </motion.button>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px', marginTop:'20px', paddingTop:'16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            {[
              { label:'Lifetime Earned',  value:fmt(lifetime), color:'#10B981' },
              { label:'This Month In',    value:fmt(totalIn),  color:'#D4A843' },
              { label:'This Month Out',   value:fmt(totalOut), color:'#EF4444' },
              { label:'Net This Month',   value:fmt(totalIn-totalOut), color:(totalIn-totalOut)>=0?'#10B981':'#EF4444' },
              { label:'Monthly Target',   value:`${targetPct}%`, color:'#6366F1', bar:true },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'15px', fontWeight:900, color:s.color, marginBottom:'3px' }}>{s.value}</div>
                <div style={{ color:S.muted, fontSize:'9px', marginBottom:s.bar?'6px':0 }}>{s.label}</div>
                {s.bar && <div style={{ height:'3px', borderRadius:'2px', background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${targetPct}%` }} transition={{ delay:0.6, duration:0.8 }}
                    style={{ height:'100%', background:'#6366F1', borderRadius:'2px' }} />
                </div>}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── TABS ── */}
      <div style={{ display:'flex', gap:'4px', padding:'4px', borderRadius:'12px', background:'rgba(10,12,30,0.8)', border:'1px solid rgba(255,255,255,0.06)', marginBottom:'20px', width:'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:'7px 16px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.15s', textTransform:'capitalize',
              background: tab===t?'#6366F1':'transparent', color: tab===t?'#fff':S.muted }}>
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <motion.div key="ov" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'16px' }}>
          <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', overflow:'hidden', backdropFilter:'blur(20px)' }}>
            <div style={{ padding:'16px 18px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                <History size={13} color="#6366F1" />
                <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.15em', fontWeight:700, color:'#6366F1' }}>RECENT TRANSACTIONS</span>
              </div>
              <button onClick={()=>setTab('history')} style={{ fontSize:'11px', color:S.muted, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'3px' }}>View all <ChevronRight size={11} /></button>
            </div>
            <div style={{ padding:'4px 8px' }}>{txs.slice(0,6).map(tx=><TxRow key={tx.id} tx={tx} />)}</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'18px', backdropFilter:'blur(20px)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'14px' }}>
                <BarChart2 size={13} color="#10B981" /><span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.15em', fontWeight:700, color:'#10B981' }}>6-MONTH INCOME</span>
              </div>
              <SparkBar data={MONTHLY_DATA} maxVal={MAX_MONTHLY} />
            </div>
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'18px', backdropFilter:'blur(20px)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                  <PieChart size={13} color="#D4A843" /><span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.15em', fontWeight:700, color:'#D4A843' }}>INCOME BY DOOR</span>
                </div>
                <button onClick={()=>setTab('income')} style={{ fontSize:'10px', color:S.muted, background:'none', border:'none', cursor:'pointer' }}>Details →</button>
              </div>
              {INCOME_SOURCES.slice(0,3).map(r=>(
                <div key={r.label} style={{ marginBottom:'8px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                    <span style={{ color:'#CBD5E1', fontSize:'11px' }}>{r.label}</span>
                    <span style={{ color:r.color, fontSize:'11px', fontWeight:700 }}>{fmt(r.value)}</span>
                  </div>
                  <div style={{ height:'3px', borderRadius:'2px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                    <motion.div initial={{ width:0 }} animate={{ width:`${Math.round(r.value/INCOME_TOTAL*100)}%` }} transition={{ delay:0.4, duration:0.7 }}
                      style={{ height:'100%', background:r.color, borderRadius:'2px' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'18px', backdropFilter:'blur(20px)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'12px' }}>
                <Zap size={13} color="#D4A843" /><span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.15em', fontWeight:700, color:'#D4A843' }}>QUICK ACTIONS</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'7px' }}>
                {[
                  { Icon:Plus, label:'Deposit', color:'#10B981', action:()=>setTab('deposit') },
                  { Icon:Send, label:'Withdraw', color:'#6366F1', action:()=>setTab('withdraw') },
                  { Icon:Download, label:'Statement', color:'#94A3B8', action:()=>{} },
                  { Icon:Repeat, label:'Subscriptions', color:'#8B5CF6', action:()=>setTab('subscriptions') },
                ].map(a=>(
                  <button key={a.label} onClick={a.action}
                    style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 10px', borderRadius:'10px', cursor:'pointer', border:`1px solid ${a.color}20`, background:`${a.color}08`, transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${a.color}15`;e.currentTarget.style.borderColor=`${a.color}35`;}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${a.color}08`;e.currentTarget.style.borderColor=`${a.color}20`;}}>
                    <a.Icon size={13} style={{ color:a.color, flexShrink:0 }} />
                    <span style={{ fontSize:'11px', fontWeight:700, color:'#fff' }}>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── INCOME ── */}
      {tab === 'income' && (
        <motion.div key="income" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'22px', backdropFilter:'blur(20px)' }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#D4A843', fontWeight:700, marginBottom:'20px' }}>INCOME BREAKDOWN — THIS MONTH</div>
            {INCOME_SOURCES.map(r=>(
              <div key={r.label} style={{ marginBottom:'16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                  <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:`${r.color}15`, border:`1px solid ${r.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <r.Icon size={15} style={{ color:r.color }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>{r.label}</span>
                      <span style={{ color:r.color, fontSize:'14px', fontWeight:900, fontFamily:"'Orbitron',sans-serif" }}>{fmt(r.value)}</span>
                    </div>
                    <div style={{ color:S.muted, fontSize:'10px', marginTop:'2px' }}>{r.desc}</div>
                  </div>
                </div>
                <div style={{ height:'5px', borderRadius:'3px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${Math.round(r.value/INCOME_TOTAL*100)}%` }} transition={{ delay:0.3, duration:0.8 }}
                    style={{ height:'100%', background:`linear-gradient(90deg,${r.color}80,${r.color})`, borderRadius:'3px' }} />
                </div>
                <div style={{ textAlign:'right', marginTop:'3px', color:S.muted, fontSize:'9px' }}>{Math.round(r.value/INCOME_TOTAL*100)}% of total</div>
              </div>
            ))}
            <div style={{ marginTop:'20px', paddingTop:'16px', borderTop:`1px solid ${S.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:S.muted, fontSize:'12px' }}>Total Monthly Income</span>
              <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'20px', fontWeight:900, color:'#10B981' }}>{fmt(INCOME_TOTAL)}</span>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'22px', backdropFilter:'blur(20px)' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#6366F1', fontWeight:700, marginBottom:'16px' }}>6-MONTH REVENUE TREND</div>
              <SparkBar data={MONTHLY_DATA} maxVal={MAX_MONTHLY} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'14px' }}>
                {[
                  { label:'Best Month', value:'Jul 2026 · '+fmt(12560), color:'#10B981' },
                  { label:'Avg Monthly', value:fmt(Math.round(MONTHLY_DATA.reduce((s,d)=>s+d.income,0)/MONTHLY_DATA.length)), color:'#D4A843' },
                  { label:'Monthly Target', value:fmt(target), color:'#6366F1' },
                  { label:'Target Progress', value:`${targetPct}%`, color:targetPct>=100?'#10B981':'#F97316' },
                ].map(s=>(
                  <div key={s.label} style={{ background:'rgba(255,255,255,0.02)', borderRadius:'10px', padding:'10px' }}>
                    <div style={{ color:S.muted, fontSize:'9px', marginBottom:'4px' }}>{s.label}</div>
                    <div style={{ color:s.color, fontSize:'13px', fontWeight:800 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:S.surface, border:'1px solid rgba(16,185,129,0.15)', borderRadius:'18px', padding:'22px', backdropFilter:'blur(20px)' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#10B981', fontWeight:700, marginBottom:'12px' }}>FINANCIAL HEALTH</div>
              {[
                { label:'P&L This Month', value:fmt(totalIn-totalOut), up:(totalIn-totalOut)>=0 },
                { label:'Lifetime Earned', value:fmt(lifetime), up:true },
                { label:'Pending Payouts', value:fmt(pending+commPend), up:true },
              ].map(s=>(
                <div key={s.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${S.border}` }}>
                  <span style={{ color:'#CBD5E1', fontSize:'12px' }}>{s.label}</span>
                  <span style={{ fontSize:'13px', fontWeight:800, color:s.up?'#10B981':'#EF4444' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <motion.div key="history" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', overflow:'hidden', backdropFilter:'blur(20px)' }}>
          <div style={{ padding:'16px 18px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'9px', letterSpacing:'0.15em', fontWeight:700, color:'#6366F1' }}>FULL TRANSACTION HISTORY</div>
            <div style={{ flex:1 }} />
            <div style={{ position:'relative' }}>
              <Search size={12} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:S.muted }} />
              <input value={searchTx} onChange={e=>setSearchTx(e.target.value)} placeholder="Search..."
                style={{ padding:'6px 10px 6px 28px', borderRadius:'8px', fontSize:'11px', color:'#fff', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, outline:'none', width:'160px' }} />
            </div>
            <div style={{ display:'flex', gap:'4px' }}>
              {['all','commission','deposit','withdrawal','subscription'].map(f=>(
                <button key={f} onClick={()=>setTxFilter(f)}
                  style={{ padding:'5px 10px', borderRadius:'6px', fontSize:'9px', fontWeight:700, cursor:'pointer', border:'none', textTransform:'capitalize', transition:'all 0.15s',
                    background:txFilter===f?'#6366F1':'rgba(255,255,255,0.05)', color:txFilter===f?'#fff':S.muted }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding:'4px 10px' }}>
            {filteredTxs.length === 0
              ? <div style={{ textAlign:'center', padding:'32px', color:S.muted, fontSize:'13px' }}>No transactions found</div>
              : filteredTxs.map(tx=><TxRow key={tx.id} tx={tx} />)
            }
          </div>
        </motion.div>
      )}

      {/* ── DEPOSIT ── */}
      {tab === 'deposit' && (
        <motion.div key="deposit" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          style={{ maxWidth:'560px' }}>
          {depositSuccess ? (
            <div style={{ background:S.surface, border:'1px solid rgba(16,185,129,0.3)', borderRadius:'18px', padding:'40px', textAlign:'center', backdropFilter:'blur(20px)' }}>
              <CheckCircle2 size={52} style={{ color:'#10B981', margin:'0 auto 16px', display:'block' }} />
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'16px', fontWeight:900, color:'#fff', marginBottom:'8px' }}>DEPOSIT CONFIRMED</div>
              <div style={{ color:S.muted, fontSize:'13px', marginBottom:'24px' }}>Your funds have been credited to your SOLVEN4 Vault.</div>
              <button onClick={resetDeposit} style={{ padding:'10px 28px', borderRadius:'10px', background:'#10B981', color:'#fff', fontWeight:700, fontSize:'12px', border:'none', cursor:'pointer' }}>
                Make Another Deposit
              </button>
            </div>
          ) : !depositMethod ? (
            /* Method selector */
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'28px', backdropFilter:'blur(20px)' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#10B981', fontWeight:700, marginBottom:'6px', display:'flex', alignItems:'center', gap:'7px' }}>
                <Plus size={13} /> ADD FUNDS TO VAULT
              </div>
              <p style={{ color:S.muted, fontSize:'12px', marginBottom:'24px' }}>Choose your preferred deposit method. All deposits are secured and verified.</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {[
                  { id:'stripe', label:'Stripe', sub:'Credit & Debit Card', color:'#635BFF', badge:'Instant', icon:'💳',
                    desc:'Visa, Mastercard, Amex. Instant deposit. Processed securely by Stripe.' },
                  { id:'crypto', label:'Cryptocurrency', sub:'BTC, ETH, USDT & more', color:'#F7931A', badge:'On-chain verified', icon:'₿',
                    desc:'8 currencies supported. Blockchain-verified deposit with real-time confirmations.' },
                ].map(m => (
                  <button key={m.id} onClick={() => setDepositMethod(m.id)}
                    style={{ padding:'20px', borderRadius:'14px', cursor:'pointer', border:`1px solid ${m.color}25`, background:`${m.color}08`, textAlign:'left', transition:'all 0.15s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=`${m.color}50`; e.currentTarget.style.background=`${m.color}14`; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=`${m.color}25`; e.currentTarget.style.background=`${m.color}08`; }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                      <span style={{ fontSize:'28px' }}>{m.icon}</span>
                      <span style={{ background:`${m.color}15`, border:`1px solid ${m.color}30`, borderRadius:'6px', padding:'2px 8px', fontSize:'9px', color:m.color, fontWeight:700 }}>{m.badge}</span>
                    </div>
                    <div style={{ color:'#fff', fontSize:'14px', fontWeight:700, marginBottom:'3px' }}>{m.label}</div>
                    <div style={{ color:m.color, fontSize:'10px', fontWeight:700, marginBottom:'6px' }}>{m.sub}</div>
                    <div style={{ color:S.muted, fontSize:'10px', lineHeight:1.5 }}>{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : depositMethod === 'stripe' && !depositAmountConfirmed ? (
            /* Stripe amount entry */
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'28px', backdropFilter:'blur(20px)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
                <button onClick={() => setDepositMethod(null)} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:S.muted, fontSize:'11px' }}>← Back</button>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', color:'#635BFF', fontWeight:700, letterSpacing:'0.15em' }}>STRIPE DEPOSIT</div>
              </div>
              <label style={{ display:'block', fontSize:'10px', color:S.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:'6px', textTransform:'uppercase' }}>Amount (USD)</label>
              <input type="number" value={depositAmount} onChange={e=>setDepositAmount(e.target.value)} placeholder="0.00"
                style={{ width:'100%', padding:'14px', borderRadius:'10px', fontSize:'24px', fontWeight:800, color:'#fff', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, outline:'none', boxSizing:'border-box', fontFamily:"'Orbitron',sans-serif", marginBottom:'10px' }} />
              <div style={{ display:'flex', gap:'8px', marginBottom:'18px' }}>
                {[100,500,1000,5000].map(v=>(
                  <button key={v} onClick={()=>setDepositAmount(String(v))}
                    style={{ flex:1, padding:'7px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:S.muted }}>
                    ${v.toLocaleString()}
                  </button>
                ))}
              </div>
              <div style={{ padding:'10px 12px', borderRadius:'8px', background:'rgba(99,91,255,0.06)', border:'1px solid rgba(99,91,255,0.15)', marginBottom:'16px', fontSize:'11px', color:S.muted }}>
                Minimum deposit: $100 · Instantly credited to your Vault · No Stripe fees charged
              </div>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                onClick={()=>{ if(parseFloat(depositAmount)>=100) setDepositAmountConfirmed(true); }}
                style={{ width:'100%', padding:'14px', borderRadius:'12px', fontWeight:900, fontSize:'13px', color:'#fff', border:'none', cursor:'pointer',
                  background:'linear-gradient(135deg,#635BFF,#6366F1)', boxShadow:'0 0 24px rgba(99,91,255,0.3)', opacity:parseFloat(depositAmount)<100?0.5:1 }}>
                Continue to Card Details
              </motion.button>
            </div>
          ) : depositMethod === 'stripe' && depositAmountConfirmed ? (
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'28px', backdropFilter:'blur(20px)' }}>
              <StripeDepositFlow amount={depositAmount} onSuccess={() => setDepositSuccess(true)} onBack={()=>setDepositAmountConfirmed(false)} />
            </div>
          ) : depositMethod === 'crypto' ? (
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'28px', backdropFilter:'blur(20px)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
                <button onClick={() => setDepositMethod(null)} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:S.muted, fontSize:'11px' }}>← Back</button>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', color:'#F7931A', fontWeight:700, letterSpacing:'0.15em' }}>CRYPTO DEPOSIT</div>
              </div>
              <CryptoDepositFlow selectedCrypto={selectedDepositCrypto} onSelect={setSelectedDepositCrypto} onBack={()=>setDepositMethod(null)} />
            </div>
          ) : null}
        </motion.div>
      )}

      {/* ── WITHDRAW ── */}
      {tab === 'withdraw' && (
        <motion.div key="withdraw" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          style={{ maxWidth:'560px' }}>
          {withdrawSuccess ? (
            <div style={{ background:S.surface, border:'1px solid rgba(99,102,241,0.3)', borderRadius:'18px', padding:'40px', textAlign:'center', backdropFilter:'blur(20px)' }}>
              <CheckCircle2 size={52} style={{ color:'#6366F1', margin:'0 auto 16px', display:'block' }} />
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'16px', fontWeight:900, color:'#fff', marginBottom:'8px' }}>WITHDRAWAL COMPLETE</div>
              <div style={{ color:S.muted, fontSize:'13px', marginBottom:'24px' }}>Funds have been broadcast to the blockchain and confirmed.</div>
              <button onClick={resetWithdraw} style={{ padding:'10px 28px', borderRadius:'10px', background:'#6366F1', color:'#fff', fontWeight:700, fontSize:'12px', border:'none', cursor:'pointer' }}>
                New Withdrawal
              </button>
            </div>
          ) : !withdrawMethod ? (
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'28px', backdropFilter:'blur(20px)' }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#6366F1', fontWeight:700, marginBottom:'6px', display:'flex', alignItems:'center', gap:'7px' }}>
                <Send size={13} /> REQUEST WITHDRAWAL
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderRadius:'10px', background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.15)', marginBottom:'24px' }}>
                <span style={{ color:S.muted, fontSize:'12px' }}>Available Balance</span>
                <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'18px', fontWeight:900, color:'#fff' }}>{fmt(balance)}</span>
              </div>
              <p style={{ color:S.muted, fontSize:'12px', marginBottom:'20px' }}>Select your withdrawal method. All withdrawals are processed with zero fees.</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {[
                  { id:'crypto', label:'Cryptocurrency', sub:'BTC, ETH, USDT & more', color:'#F7931A', badge:'Instant · On-chain', icon:'₿',
                    desc:'Automated blockchain withdrawal. Real-time confirmation. Instant approval.' },
                  { id:'stripe', label:'Stripe Payout', sub:'Bank / Card transfer', color:'#635BFF', badge:'1–3 business days', icon:'🏦',
                    desc:'Transfer to your bank account or card via Stripe Connect payout.' },
                ].map(m=>(
                  <button key={m.id} onClick={()=>setWithdrawMethod(m.id)}
                    style={{ padding:'20px', borderRadius:'14px', cursor:'pointer', border:`1px solid ${m.color}25`, background:`${m.color}08`, textAlign:'left', transition:'all 0.15s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=`${m.color}50`; e.currentTarget.style.background=`${m.color}14`; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=`${m.color}25`; e.currentTarget.style.background=`${m.color}08`; }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                      <span style={{ fontSize:'28px' }}>{m.icon}</span>
                      <span style={{ background:`${m.color}15`, border:`1px solid ${m.color}30`, borderRadius:'6px', padding:'2px 8px', fontSize:'9px', color:m.color, fontWeight:700 }}>{m.badge}</span>
                    </div>
                    <div style={{ color:'#fff', fontSize:'14px', fontWeight:700, marginBottom:'3px' }}>{m.label}</div>
                    <div style={{ color:m.color, fontSize:'10px', fontWeight:700, marginBottom:'6px' }}>{m.sub}</div>
                    <div style={{ color:S.muted, fontSize:'10px', lineHeight:1.5 }}>{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : withdrawMethod === 'crypto' ? (
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'28px', backdropFilter:'blur(20px)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
                <button onClick={()=>setWithdrawMethod(null)} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:S.muted, fontSize:'11px' }}>← Back</button>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', color:'#F7931A', fontWeight:700, letterSpacing:'0.15em' }}>CRYPTO WITHDRAWAL</div>
              </div>
              <CryptoWithdrawalFlow balance={balance} onSuccess={()=>setWithdrawSuccess(true)} onBack={()=>setWithdrawMethod(null)} />
            </div>
          ) : withdrawMethod === 'stripe' ? (
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:'18px', padding:'28px', backdropFilter:'blur(20px)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
                <button onClick={()=>setWithdrawMethod(null)} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:S.muted, fontSize:'11px' }}>← Back</button>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', color:'#635BFF', fontWeight:700, letterSpacing:'0.15em' }}>STRIPE PAYOUT</div>
              </div>
              <div style={{ padding:'16px', borderRadius:'12px', background:'rgba(99,91,255,0.06)', border:'1px solid rgba(99,91,255,0.18)', marginBottom:'16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                  <div style={{ background:'#635BFF', borderRadius:'5px', padding:'2px 7px', fontFamily:"'Orbitron',sans-serif", fontSize:'9px', fontWeight:900, color:'#fff' }}>stripe</div>
                  <span style={{ color:S.muted, fontSize:'11px' }}>Payouts powered by Stripe Connect</span>
                </div>
                <p style={{ color:'#CBD5E1', fontSize:'11px', lineHeight:1.6 }}>Connect your Stripe account to receive payouts directly to your bank. First-time setup requires Stripe identity verification (1–2 minutes).</p>
              </div>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                onClick={()=>toast.info('Stripe Connect onboarding will open in a new window once connected to backend')}
                style={{ width:'100%', padding:'14px', borderRadius:'12px', fontWeight:900, fontSize:'13px', color:'#fff', border:'none', cursor:'pointer',
                  background:'linear-gradient(135deg,#635BFF,#6366F1)', boxShadow:'0 0 24px rgba(99,91,255,0.3)' }}>
                Connect Stripe & Request Payout
              </motion.button>
              <div style={{ textAlign:'center', marginTop:'10px', color:S.muted, fontSize:'10px' }}>Payouts typically arrive within 1–3 business days</div>
            </div>
          ) : null}
        </motion.div>
      )}

      {/* ── SUBSCRIPTIONS ── */}
      {tab === 'subscriptions' && (
        <motion.div key="subscriptions" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px' }}>
            {SUBS.map(s=>(
              <div key={s.door} style={{ background:S.surface, border:`1px solid ${s.color}20`, borderRadius:'16px', padding:'20px', backdropFilter:'blur(20px)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:`${s.color}15`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <CreditCard size={16} style={{ color:s.color }} />
                    </div>
                    <div>
                      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'10px', color:s.color, fontWeight:700 }}>{s.door}</div>
                      <div style={{ color:'#fff', fontSize:'12px', fontWeight:600 }}>{s.plan}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'18px', fontWeight:900, color:'#fff' }}>${s.price}</div>
                    <div style={{ color:S.muted, fontSize:'9px' }}>/month</div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                    <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#10B981', boxShadow:'0 0 6px #10B981' }} />
                    <span style={{ color:'#10B981', fontSize:'10px', fontWeight:700 }}>ACTIVE</span>
                  </div>
                  <span style={{ color:S.muted, fontSize:'10px' }}>Renews {s.renews}</span>
                  <button onClick={()=>toast.info(`Managing ${s.door} subscription`)}
                    style={{ padding:'5px 10px', borderRadius:'6px', fontSize:'10px', fontWeight:700, cursor:'pointer', border:`1px solid ${s.color}30`, background:`${s.color}10`, color:s.color }}>
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'14px', padding:'14px 18px', borderRadius:'14px', background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>Total Monthly Subscriptions</div>
              <div style={{ color:S.muted, fontSize:'11px' }}>All 4 doors · billed monthly</div>
            </div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'22px', fontWeight:900, color:'#6366F1' }}>${SUBS.reduce((s,r)=>s+r.price,0)}/mo</div>
          </div>
        </motion.div>
      )}

      </AnimatePresence>
      <style>{`@keyframes s4v-spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
