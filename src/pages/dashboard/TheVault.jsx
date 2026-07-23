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
import { useLang } from '@/lib/LanguageContext';
import { Btn } from '@/hud';

const S = { bg:'#1A1B1E', surface:'rgba(10,12,30,0.9)', border:'rgba(255,255,255,0.06)', muted:'#94A3B8', accent:'#6366F1' };

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
          {tx.door && (<><span style={{ color:'rgba(255,255,255,0.1)' }}>·</span><span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'8px', fontWeight:700, color:DOOR_COLOR[tx.door]??'#94A3B8' }}>{tx.door}</span></>)}
        </div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontSize:'13px', fontWeight:500, color: isCredit?'#10B981':'#EF4444' }}>{isCredit?'+':'-'}{fmt(tx.amount)}</div>
        <div style={{ display:'flex', alignItems:'center', gap:'3px', justifyContent:'flex-end', marginTop:'2px' }}>
          <SIcon size={10} style={{ color:sc.color }} /><span style={{ fontSize:'9px', color:sc.color }}>{sc.label}</span>
        </div>
      </div>
    </div>
  );
}

/* ── CARD DEPOSIT FLOW (Dodo hosted checkout — no card data ever touches our servers) ── */
function StripeDepositFlow({ amount, onSuccess, onBack }) {
  const { t } = useLang();
  const { user } = useAuthStore();
  const [step, setStep] = useState('confirm'); // confirm | redirecting | error
  const [error, setError] = useState('');

  async function handlePay() {
    setError(''); setStep('redirecting');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ userEmail: user?.email, amount: parseFloat(amount), method: 'card' }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) { setError(data.error || 'Could not start checkout'); setStep('confirm'); return; }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.message || 'Could not start checkout');
      setStep('confirm');
    }
  }

  if (step === 'redirecting') return (
    <div style={{ textAlign:'center', padding:'40px 20px' }}>
      <div style={{ width:'48px', height:'48px', borderRadius:'50%', border:'3px solid rgba(99,102,241,0.2)', borderTopColor:'#6366F1', animation:'s4v-spin 1s linear infinite', margin:'0 auto 20px' }} />
      <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'14px', fontWeight:500, color:'#fff', marginBottom:'8px' }}>{t('REDIRECTING TO SECURE CHECKOUT', 'جارٍ التحويل إلى صفحة الدفع الآمنة')}</div>
      <div style={{ color:S.muted, fontSize:'12px' }}>{t('Connecting to Dodo Payments...', 'جارٍ الاتصال بـ Dodo Payments...')}</div>
    </div>
  );

  return (
    <div>
      {/* Provider badge */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'18px', padding:'10px 14px', borderRadius:'10px', background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.18)' }}>
        <div style={{ background:'#635BFF', borderRadius:'6px', padding:'3px 8px', fontFamily:"'Satoshi',sans-serif", fontSize:'10px', fontWeight:500, color:'#fff', letterSpacing:'0.05em' }}>dodo</div>
        <span style={{ color:S.muted, fontSize:'11px' }}>{t('Secured by Dodo Payments · hosted checkout', 'محمي بواسطة Dodo Payments · صفحة دفع مستضافة')}</span>
        <Shield size={12} style={{ color:'#10B981', marginLeft:'auto' }} />
      </div>

      {/* Amount display */}
      <div style={{ textAlign:'center', marginBottom:'20px', padding:'14px', borderRadius:'12px', background:'rgba(255,255,255,0.03)', border:`1px solid ${S.border}` }}>
        <div style={{ color:S.muted, fontSize:'10px', marginBottom:'4px' }}>{t('DEPOSIT AMOUNT', 'مبلغ الإيداع')}</div>
        <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'28px', fontWeight:500, color:'#10B981' }}>{fmt(parseFloat(amount)||0)}</div>
      </div>

      <p style={{ color:S.muted, fontSize:'12px', lineHeight:1.6, marginBottom:'8px' }}>
        {t("You'll be redirected to Dodo's secure hosted checkout to complete payment. Your card details are entered there, never on SOLVEN4's own pages.", 'سيتم تحويلك إلى صفحة الدفع الآمنة الخاصة بـ Dodo لإكمال العملية. تُدخل بيانات بطاقتك هناك، وليس على صفحات SOLVEN4 أبداً.')}
      </p>

      {error && <div style={{ marginTop:'10px', padding:'8px 12px', borderRadius:'8px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#EF4444', fontSize:'11px' }}>{error}</div>}

      <div style={{ display:'flex', gap:'8px', marginTop:'18px' }}>
        <Btn ghost onClick={onBack} style={{ padding:'12px 18px', fontSize:'11px' }}>{t('Back','رجوع')}</Btn>
        <Btn onClick={handlePay} style={{ flex:1, padding:'12px', fontSize:'12px', ['--accent']:'#635BFF' }}>
          {t('Continue to Checkout', 'المتابعة إلى الدفع')} — {fmt(parseFloat(amount)||0)}
        </Btn>
      </div>
    </div>
  );
}

/* ── CRYPTO DEPOSIT FLOW ── */
function CryptoDepositFlow({ selectedCrypto, onSelect, onBack }) {
  const { t } = useLang();
  const { user } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');

  async function handleCreateInvoice() {
    if (!selectedCrypto) { setError(t('Select a cryptocurrency','اختر عملة رقمية')); return; }
    if (!amount || parseFloat(amount) < 10) { setError(t('Minimum deposit is $10','الحد الأدنى للإيداع هو 10$')); return; }
    setError(''); setRedirecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ userEmail: user?.email, amount: parseFloat(amount), method: 'crypto' }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) { setError(data.error || 'Could not create invoice'); setRedirecting(false); return; }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.message || 'Could not create invoice');
      setRedirecting(false);
    }
  }

  if (redirecting) return (
    <div style={{ textAlign:'center', padding:'40px 20px' }}>
      <div style={{ width:'48px', height:'48px', borderRadius:'50%', border:'3px solid rgba(249,115,22,0.2)', borderTopColor:'#F7931A', animation:'s4v-spin 1s linear infinite', margin:'0 auto 20px' }} />
      <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'14px', fontWeight:500, color:'#fff', marginBottom:'8px' }}>{t('CREATING SECURE INVOICE', 'جارٍ إنشاء فاتورة آمنة')}</div>
      <div style={{ color:S.muted, fontSize:'12px' }}>{t('Connecting to NOWPayments...', 'جارٍ الاتصال بـ NOWPayments...')}</div>
    </div>
  );

  return (
    <div>
      {/* Currency grid */}
      <div style={{ marginBottom:'16px' }}>
        <div style={{ fontSize:'10px', color:S.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:'8px', textTransform:'uppercase' }}>{t('Select Cryptocurrency', 'اختر العملة الرقمية')}</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px' }}>
          {CRYPTO_CURRENCIES.map(c => {
            const key = getCryptoKey(c);
            const selKey = selectedCrypto ? getCryptoKey(selectedCrypto) : null;
            const isSelected = key === selKey;
            return (
              <button key={key} onClick={() => onSelect(c)}
                style={{ padding:'8px 6px', borderRadius:'10px', cursor:'pointer', border:`1px solid ${isSelected?c.color+'50':'rgba(255,255,255,0.06)'}`,
                  background: isSelected?`${c.color}15`:'rgba(255,255,255,0.02)', transition:'all 0.15s', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
                <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'9px', fontWeight:500, color:isSelected?c.color:'#CBD5E1' }}>{c.symbol}</span>
                <span style={{ fontSize:'7px', color:S.muted, textAlign:'center', lineHeight:1.2 }}>{c.network}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedCrypto && (
        <AnimatePresence>
          <motion.div key={getCryptoKey(selectedCrypto)} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', fontSize:'10px', color:S.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:'6px', textTransform:'uppercase' }}>{t('Amount (USD)', 'المبلغ (USD)')}</label>
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"
                style={{ width:'100%', padding:'14px', borderRadius:'10px', fontSize:'22px', fontWeight:500, color:'#fff', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, outline:'none', boxSizing:'border-box', fontFamily:"'Satoshi',sans-serif" }} />
            </div>

            <div style={{ padding:'12px 14px', borderRadius:'10px', background:`${selectedCrypto.color}08`, border:`1px solid ${selectedCrypto.color}20`, marginBottom:'14px', fontSize:'11px', color:'#CBD5E1', lineHeight:1.6 }}>
              {t("You'll be redirected to NOWPayments' secure hosted invoice, which issues a real one-time deposit address for", "سيتم تحويلك إلى فاتورة NOWPayments الآمنة المستضافة، والتي تصدر عنوان إيداع حقيقي لمرة واحدة لـ")} <strong>{selectedCrypto.symbol} ({selectedCrypto.network})</strong> {t('and monitors blockchain confirmations for you. Funds are credited to your Vault automatically once confirmed.', 'وتراقب تأكيدات البلوكتشين نيابة عنك. تُضاف الأموال إلى خزنتك تلقائياً بمجرد التأكيد.')}
            </div>

            {error && <div style={{ marginBottom:'10px', padding:'8px 12px', borderRadius:'8px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#EF4444', fontSize:'11px' }}>{error}</div>}

            <Btn onClick={handleCreateInvoice} style={{ width:'100%', padding:'13px', fontSize:'12px', ['--accent']:selectedCrypto.color }}>
              {t('Create Deposit Invoice', 'إنشاء فاتورة الإيداع')}
            </Btn>
          </motion.div>
        </AnimatePresence>
      )}

      <button onClick={onBack} style={{ marginTop:'14px', padding:'10px 18px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, cursor:'pointer', color:S.muted, fontSize:'12px', fontWeight:700 }}>{t('Back','رجوع')}</button>
    </div>
  );
}

/* ── CRYPTO WITHDRAWAL FLOW ── */
function CryptoWithdrawalFlow({ balance, onSuccess, onBack }) {
  const { t } = useLang();
  const [step, setStep] = useState('form'); // form | review | processing | success
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [confirmations, setConfirmations] = useState(0);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!selectedCrypto) { setError(t('Select a cryptocurrency','اختر عملة رقمية')); return; }
    if (!toAddress.trim() || toAddress.length < 20) { setError(t('Enter a valid wallet address','أدخل عنوان محفظة صالح')); return; }
    if (!amount || parseFloat(amount) < 50) { setError(t('Minimum withdrawal is $50','الحد الأدنى للسحب هو 50$')); return; }
    if (parseFloat(amount) > balance) { setError(t('Insufficient balance','الرصيد غير كافٍ')); return; }
    setError(''); setStep('review');
  }

  const { user } = useAuthStore();

  async function handleConfirm() {
    setStep('processing');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ amount: parseFloat(amount), destination: toAddress, network: selectedCrypto?.network }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || 'Withdrawal request failed'); setStep('review'); return; }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Withdrawal request failed');
      setStep('review');
    }
  }

  if (step === 'processing') return (
    <div>
      <div style={{ textAlign:'center', padding:'20px 0 10px' }}>
        <div style={{ width:'44px', height:'44px', borderRadius:'50%', border:'3px solid rgba(99,102,241,0.2)', borderTopColor:'#6366F1', animation:'s4v-spin 1s linear infinite', margin:'0 auto' }} />
        <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'13px', fontWeight:500, color:'#fff', marginTop:'12px', marginBottom:'6px' }}>
          {t('SUBMITTING WITHDRAWAL REQUEST','جارٍ إرسال طلب السحب')}
        </div>
        <div style={{ color:S.muted, fontSize:'11px' }}>{t('Your request will be reviewed and processed by the SOLVEN4 team.', 'سيتم مراجعة طلبك ومعالجته من قبل فريق SOLVEN4.')}</div>
      </div>
      <div style={{ display:'flex', gap:'6px', marginTop:'12px' }}>
        {Array.from({length:3},(_,i)=>(
          <div key={i} style={{ flex:1, height:'5px', borderRadius:'3px', background:'rgba(255,255,255,0.08)', transition:'background 0.5s' }} />
        ))}
      </div>
    </div>
  );

  if (step === 'review') return (
    <div>
      <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'10px', color:'#D4A843', fontWeight:700, marginBottom:'16px', letterSpacing:'0.15em' }}>{t('REVIEW WITHDRAWAL', 'مراجعة السحب')}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'18px' }}>
        {[
          { label:t('Amount','المبلغ'),    value:fmt(parseFloat(amount)) },
          { label:t('Currency','العملة'),  value:`${selectedCrypto.symbol} (${selectedCrypto.network})` },
          { label:t('To Address','إلى العنوان'),value:toAddress, mono:true },
          { label:t('Network Fee','رسوم الشبكة'),value:t('Covered by SOLVEN4','مغطاة من SOLVEN4') },
          { label:t('Estimated','المدة المتوقعة'), value:t('Instant · blockchain confirmation','فوري · تأكيد على البلوكتشين') },
        ].map(r => (
          <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', borderRadius:'8px', background:'rgba(255,255,255,0.02)', border:`1px solid ${S.border}` }}>
            <span style={{ color:S.muted, fontSize:'11px' }}>{r.label}</span>
            <span style={{ color:'#fff', fontSize:'11px', fontWeight:700, fontFamily:r.mono?'monospace':'inherit', maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis' }}>{r.value}</span>
          </div>
        ))}
      </div>
      <div style={{ padding:'10px 12px', borderRadius:'8px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.18)', marginBottom:'16px', fontSize:'11px', color:'#F97316' }}>
        ⚠️ {t('Cryptocurrency withdrawals are irreversible. Verify the address before confirming.', 'سحوبات العملات الرقمية لا يمكن التراجع عنها. تحقق من العنوان قبل التأكيد.')}
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <Btn ghost onClick={()=>setStep('form')} style={{ padding:'12px 18px', fontSize:'11px' }}>{t('Back','رجوع')}</Btn>
        <Btn onClick={handleConfirm} style={{ flex:1, padding:'12px', fontSize:'12px' }}>
          {t('Confirm & Broadcast', 'تأكيد وبث')}
        </Btn>
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
              <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'9px', fontWeight:500, color:isSel?c.color:'#CBD5E1' }}>{c.symbol}</span>
              <span style={{ fontSize:'7px', color:S.muted }}>{c.network}</span>
            </button>
          );
        })}
      </div>
      <div style={{ marginBottom:'12px' }}>
        <label style={{ display:'block', fontSize:'10px', color:S.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:'5px', textTransform:'uppercase' }}>{t('Your Wallet Address', 'عنوان محفظتك')}</label>
        <input value={toAddress} onChange={e=>{setToAddress(e.target.value);setError('');}} placeholder={selectedCrypto?t(`Enter your ${selectedCrypto.symbol} address`,`أدخل عنوان ${selectedCrypto.symbol} الخاص بك`):t('Select currency first','اختر العملة أولاً')}
          style={{ width:'100%', padding:'11px 14px', borderRadius:'10px', fontSize:'12px', color:'#fff', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, outline:'none', boxSizing:'border-box', fontFamily:'monospace' }} />
      </div>
      <div style={{ marginBottom:'12px' }}>
        <label style={{ display:'block', fontSize:'10px', color:S.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:'5px', textTransform:'uppercase' }}>{t('Amount (USD)', 'المبلغ (USD)')}</label>
        <input type="number" value={amount} onChange={e=>{setAmount(e.target.value);setError('');}} placeholder="0.00"
          style={{ width:'100%', padding:'12px 14px', borderRadius:'10px', fontSize:'20px', fontWeight:500, color:'#fff', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, outline:'none', boxSizing:'border-box', fontFamily:"'Satoshi',sans-serif" }} />
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'5px', fontSize:'10px', color:S.muted }}>
          <span>{t('Min: $50', 'الحد الأدنى: 50$')}</span>
          <button onClick={()=>setAmount(String(Math.floor(balance)))} style={{ background:'none', border:'none', cursor:'pointer', color:'#6366F1', fontSize:'10px', fontWeight:700 }}>{t('Max','الحد الأقصى')}: {fmt(balance)}</button>
        </div>
      </div>
      {error && <div style={{ marginBottom:'10px', padding:'8px 12px', borderRadius:'8px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#EF4444', fontSize:'11px' }}>{error}</div>}
      <div style={{ padding:'8px 12px', borderRadius:'8px', background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)', marginBottom:'14px', fontSize:'10px', color:'#10B981' }}>
        ✓ {t('Zero withdrawal fees · Blockchain confirmation in real-time · Instant approval', 'بدون رسوم سحب · تأكيد فوري على البلوكتشين · موافقة فورية')}
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <Btn ghost onClick={onBack} style={{ padding:'12px 18px', fontSize:'11px' }}>{t('Back','رجوع')}</Btn>
        <Btn onClick={handleSubmit} style={{ flex:1, padding:'12px', fontSize:'12px' }}>
          {t('Review Withdrawal →', 'مراجعة السحب ←')}
        </Btn>
      </div>
    </div>
  );
}

const TABS = ['overview','income','history','deposit','withdraw','subscriptions'];

export default function TheVault() {
  const { t } = useLang();
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
        setWallet(w ?? { balance: 0, pending_balance: 0, currency: 'USD', total_earned: 0, monthly_target: 15000, commission_pending: 0 });
        setTxs(t || []);
      } catch { setWallet({ balance: 0, pending_balance: 0, currency: 'USD', total_earned: 0, monthly_target: 15000, commission_pending: 0 }); setTxs([]); }
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
    <div className="s4hud" style={{ ['--accent']:S.accent, minHeight:'100vh', padding:'20px', background:S.bg, color:'#fff', fontFamily:"'Satoshi',sans-serif" }}>

      {/* ── HERO BALANCE ── */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="s4-glass spatial lift"
        style={{ position:'relative', overflow:'hidden', padding:'28px 32px', marginBottom:'20px',
          background:'linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(10,12,30,0.96) 55%,rgba(139,92,246,0.1) 100%)' }}>
        <span className="s4-bracket tl" /><span className="s4-bracket br" />
        <div style={{ position:'absolute', inset:0, opacity:0.3,
          backgroundImage:'linear-gradient(rgba(99,102,241,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.06) 1px,transparent 1px)',
          backgroundSize:'28px 28px', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'24px', flexWrap:'wrap' }}>
            <div>
              <div className="s4-label s4-accent" style={{ letterSpacing:'0.3em', marginBottom:8 }}>{t('AVAILABLE BALANCE · SOLVEN4 VAULT', 'الرصيد المتاح · خزنة SOLVEN4')}</div>
              <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'48px', fontWeight:500, color:'#fff', lineHeight:1, marginBottom:'6px' }}>
                {fmt(balance)}<span style={{ fontSize:'16px', color:S.muted, marginLeft:'8px', fontWeight:400 }}>{currency}</span>
              </div>
              <div style={{ display:'flex', gap:'16px', marginTop:'8px' }}>
                {pending > 0 && <div style={{ display:'flex', alignItems:'center', gap:'5px', color:'#F97316', fontSize:'12px' }}><Clock size={12} /> +{fmt(pending)} {t('pending','قيد الانتظار')}</div>}
                {commPend > 0 && <div style={{ display:'flex', alignItems:'center', gap:'5px', color:'#D4A843', fontSize:'12px' }}><Zap size={12} /> {fmt(commPend)} {t('commissions clearing','عمولات قيد التسوية')}</div>}
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
              <Btn onClick={() => setTab('deposit')} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 20px', fontSize:'12px', ['--accent']:'#10B981' }}>
                <Plus size={15} /> {t('Deposit','إيداع')}
              </Btn>
              <Btn onClick={() => setTab('withdraw')} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 20px', fontSize:'12px' }}>
                <Send size={15} /> {t('Withdraw','سحب')}
              </Btn>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px', marginTop:'20px', paddingTop:'16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            {[
              { label:t('Lifetime Earned','إجمالي الأرباح'),  value:fmt(lifetime), color:'#10B981' },
              { label:t('This Month In','الوارد هذا الشهر'),    value:fmt(totalIn),  color:'#D4A843' },
              { label:t('This Month Out','الصادر هذا الشهر'),   value:fmt(totalOut), color:'#EF4444' },
              { label:t('Net This Month','الصافي هذا الشهر'),   value:fmt(totalIn-totalOut), color:(totalIn-totalOut)>=0?'#10B981':'#EF4444' },
              { label:t('Monthly Target','الهدف الشهري'),   value:`${targetPct}%`, color:'#6366F1', bar:true },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'15px', fontWeight:500, color:s.color, marginBottom:'3px' }}>{s.value}</div>
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
        {[['overview',t('overview','نظرة عامة')], ['income',t('income','الدخل')], ['history',t('history','السجل')], ['deposit',t('deposit','إيداع')], ['withdraw',t('withdraw','سحب')], ['subscriptions',t('subscriptions','الاشتراكات')]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ fontFamily:"'Satoshi',sans-serif", padding:'7px 16px', borderRadius:'8px', fontSize:'10px', letterSpacing:'0.06em', fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.15s', textTransform:'uppercase',
              background: tab===key?S.accent:'transparent', color: tab===key?'#fff':S.muted }}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <motion.div key="ov" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'16px' }}>
          <div className="s4-glass spatial lift" style={{ overflow:'hidden' }}>
            <div style={{ padding:'16px 18px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                <History size={13} color="#6366F1" />
                <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'9px', letterSpacing:'0.15em', fontWeight:700, color:'#6366F1' }}>{t('RECENT TRANSACTIONS', 'أحدث المعاملات')}</span>
              </div>
              <button onClick={()=>setTab('history')} style={{ fontSize:'11px', color:S.muted, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'3px' }}>{t('View all', 'عرض الكل')} <ChevronRight size={11} /></button>
            </div>
            <div style={{ padding:'4px 8px' }}>{txs.slice(0,6).map(tx=><TxRow key={tx.id} tx={tx} />)}</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div className="s4-glass spatial lift" style={{ padding:'18px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'14px' }}>
                <BarChart2 size={13} color="#10B981" /><span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'9px', letterSpacing:'0.15em', fontWeight:700, color:'#10B981' }}>{t('6-MONTH INCOME', 'الدخل خلال 6 أشهر')}</span>
              </div>
              <SparkBar data={MONTHLY_DATA} maxVal={MAX_MONTHLY} />
            </div>
            <div className="s4-glass spatial lift" style={{ padding:'18px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                  <PieChart size={13} color="#D4A843" /><span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'9px', letterSpacing:'0.15em', fontWeight:700, color:'#D4A843' }}>{t('INCOME BY DOOR', 'الدخل حسب الباب')}</span>
                </div>
                <button onClick={()=>setTab('income')} style={{ fontSize:'10px', color:S.muted, background:'none', border:'none', cursor:'pointer' }}>{t('Details →', 'التفاصيل ←')}</button>
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
            <div className="s4-glass spatial lift" style={{ padding:'18px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'12px' }}>
                <Zap size={13} color="#D4A843" /><span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'9px', letterSpacing:'0.15em', fontWeight:700, color:'#D4A843' }}>{t('QUICK ACTIONS', 'إجراءات سريعة')}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'7px' }}>
                {[
                  { Icon:Plus, label:t('Deposit','إيداع'), color:'#10B981', action:()=>setTab('deposit') },
                  { Icon:Send, label:t('Withdraw','سحب'), color:'#6366F1', action:()=>setTab('withdraw') },
                  { Icon:Download, label:t('Statement','كشف حساب'), color:'#94A3B8', action:()=>{} },
                  { Icon:Repeat, label:t('Subscriptions','الاشتراكات'), color:'#8B5CF6', action:()=>setTab('subscriptions') },
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
          <div className="s4-glass spatial lift" style={{ padding:'22px' }}>
            <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#D4A843', fontWeight:700, marginBottom:'20px' }}>{t('INCOME BREAKDOWN — THIS MONTH', 'تفصيل الدخل — هذا الشهر')}</div>
            {INCOME_SOURCES.map(r=>(
              <div key={r.label} style={{ marginBottom:'16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                  <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:`${r.color}15`, border:`1px solid ${r.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <r.Icon size={15} style={{ color:r.color }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>{r.label}</span>
                      <span style={{ color:r.color, fontSize:'14px', fontWeight:500, fontFamily:"'Satoshi',sans-serif" }}>{fmt(r.value)}</span>
                    </div>
                    <div style={{ color:S.muted, fontSize:'10px', marginTop:'2px' }}>{r.desc}</div>
                  </div>
                </div>
                <div style={{ height:'5px', borderRadius:'3px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${Math.round(r.value/INCOME_TOTAL*100)}%` }} transition={{ delay:0.3, duration:0.8 }}
                    style={{ height:'100%', background:`linear-gradient(90deg,${r.color}80,${r.color})`, borderRadius:'3px' }} />
                </div>
                <div style={{ textAlign:'right', marginTop:'3px', color:S.muted, fontSize:'9px' }}>{Math.round(r.value/INCOME_TOTAL*100)}{t('% of total','% من الإجمالي')}</div>
              </div>
            ))}
            <div style={{ marginTop:'20px', paddingTop:'16px', borderTop:`1px solid ${S.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:S.muted, fontSize:'12px' }}>{t('Total Monthly Income', 'إجمالي الدخل الشهري')}</span>
              <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'20px', fontWeight:500, color:'#10B981' }}>{fmt(INCOME_TOTAL)}</span>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div className="s4-glass spatial lift" style={{ padding:'22px' }}>
              <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#6366F1', fontWeight:700, marginBottom:'16px' }}>{t('6-MONTH REVENUE TREND', 'اتجاه الإيرادات خلال 6 أشهر')}</div>
              <SparkBar data={MONTHLY_DATA} maxVal={MAX_MONTHLY} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'14px' }}>
                {[
                  { label:t('Best Month','أفضل شهر'), value:'Jul 2026 · '+fmt(12560), color:'#10B981' },
                  { label:t('Avg Monthly','المتوسط الشهري'), value:fmt(Math.round(MONTHLY_DATA.reduce((s,d)=>s+d.income,0)/MONTHLY_DATA.length)), color:'#D4A843' },
                  { label:t('Monthly Target','الهدف الشهري'), value:fmt(target), color:'#6366F1' },
                  { label:t('Target Progress','تقدم الهدف'), value:`${targetPct}%`, color:targetPct>=100?'#10B981':'#F97316' },
                ].map(s=>(
                  <div key={s.label} style={{ background:'rgba(255,255,255,0.02)', borderRadius:'10px', padding:'10px' }}>
                    <div style={{ color:S.muted, fontSize:'9px', marginBottom:'4px' }}>{s.label}</div>
                    <div style={{ color:s.color, fontSize:'13px', fontWeight:500 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="s4-glass spatial lift" style={{ padding:'22px', borderColor:'rgba(16,185,129,0.25)' }}>
              <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#10B981', fontWeight:700, marginBottom:'12px' }}>{t('FINANCIAL HEALTH', 'الصحة المالية')}</div>
              {[
                { label:t('P&L This Month','الأرباح والخسائر هذا الشهر'), value:fmt(totalIn-totalOut), up:(totalIn-totalOut)>=0 },
                { label:t('Lifetime Earned','إجمالي الأرباح'), value:fmt(lifetime), up:true },
                { label:t('Pending Payouts','مدفوعات معلقة'), value:fmt(pending+commPend), up:true },
              ].map(s=>(
                <div key={s.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${S.border}` }}>
                  <span style={{ color:'#CBD5E1', fontSize:'12px' }}>{s.label}</span>
                  <span style={{ fontSize:'13px', fontWeight:500, color:s.up?'#10B981':'#EF4444' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <motion.div key="history" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          className="s4-glass spatial lift" style={{ overflow:'hidden' }}>
          <div style={{ padding:'16px 18px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
            <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'9px', letterSpacing:'0.15em', fontWeight:700, color:'#6366F1' }}>{t('FULL TRANSACTION HISTORY', 'سجل المعاملات الكامل')}</div>
            <div style={{ flex:1 }} />
            <div style={{ position:'relative' }}>
              <Search size={12} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:S.muted }} />
              <input value={searchTx} onChange={e=>setSearchTx(e.target.value)} placeholder={t('Search...','بحث...')}
                style={{ padding:'6px 10px 6px 28px', borderRadius:'8px', fontSize:'11px', color:'#fff', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, outline:'none', width:'160px' }} />
            </div>
            <div style={{ display:'flex', gap:'4px' }}>
              {[['all',t('all','الكل')],['commission',t('commission','عمولة')],['deposit',t('deposit','إيداع')],['withdrawal',t('withdrawal','سحب')],['subscription',t('subscription','اشتراك')]].map(([f,label])=>(
                <button key={f} onClick={()=>setTxFilter(f)}
                  style={{ padding:'5px 10px', borderRadius:'6px', fontSize:'9px', fontWeight:700, cursor:'pointer', border:'none', textTransform:'capitalize', transition:'all 0.15s',
                    background:txFilter===f?'#6366F1':'rgba(255,255,255,0.05)', color:txFilter===f?'#fff':S.muted }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding:'4px 10px' }}>
            {filteredTxs.length === 0
              ? <div style={{ textAlign:'center', padding:'44px' }}>
                  <History size={32} color="#94A3B8" style={{ margin:'0 auto 12px', display:'block', opacity:0.4 }} />
                  <p style={{ color:S.muted, fontSize:'12.5px' }}>{t('No transactions found', 'لم يتم العثور على معاملات')}</p>
                </div>
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
            <div className="s4-glass" style={{ padding:'40px', textAlign:'center', borderColor:'rgba(16,185,129,0.35)' }}>
              <CheckCircle2 size={52} style={{ color:'#10B981', margin:'0 auto 16px', display:'block' }} />
              <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'16px', fontWeight:500, color:'#fff', marginBottom:'8px' }}>{t('DEPOSIT CONFIRMED', 'تم تأكيد الإيداع')}</div>
              <div style={{ color:S.muted, fontSize:'13px', marginBottom:'24px' }}>{t('Your funds have been credited to your SOLVEN4 Vault.', 'تم إضافة أموالك إلى خزنة SOLVEN4 الخاصة بك.')}</div>
              <button onClick={resetDeposit} style={{ padding:'10px 28px', borderRadius:'10px', background:'#10B981', color:'#fff', fontWeight:700, fontSize:'12px', border:'none', cursor:'pointer' }}>
                {t('Make Another Deposit', 'إجراء إيداع آخر')}
              </button>
            </div>
          ) : !depositMethod ? (
            /* Method selector */
            <div className="s4-glass spatial lift" style={{ padding:'28px' }}>
              <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#10B981', fontWeight:700, marginBottom:'6px', display:'flex', alignItems:'center', gap:'7px' }}>
                <Plus size={13} /> {t('ADD FUNDS TO VAULT', 'إضافة أموال إلى الخزنة')}
              </div>
              <p style={{ color:S.muted, fontSize:'12px', marginBottom:'24px' }}>{t('Choose your preferred deposit method. All deposits are secured and verified.', 'اختر طريقة الإيداع المفضلة لديك. جميع الإيداعات آمنة وموثقة.')}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {[
                  { id:'stripe', label:t('Stripe','سترايب'), sub:t('Credit & Debit Card','بطاقة ائتمان وخصم'), color:'#635BFF', badge:t('Instant','فوري'), icon:'💳',
                    desc:t('Visa, Mastercard, Amex. Instant deposit. Processed securely by Stripe.','فيزا، ماستركارد، أمريكان إكسبريس. إيداع فوري. معالجة آمنة عبر سترايب.') },
                  { id:'crypto', label:t('Cryptocurrency','عملات رقمية'), sub:t('BTC, ETH, USDT & more','BTC وETH وUSDT وغيرها'), color:'#F7931A', badge:t('On-chain verified','موثّق على البلوكتشين'), icon:'₿',
                    desc:t('8 currencies supported. Blockchain-verified deposit with real-time confirmations.','دعم لـ 8 عملات. إيداع موثّق على البلوكتشين مع تأكيدات فورية.') },
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
            <div className="s4-glass spatial lift" style={{ padding:'28px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
                <button onClick={() => setDepositMethod(null)} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:S.muted, fontSize:'11px' }}>{t('← Back','→ رجوع')}</button>
                <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'10px', color:'#635BFF', fontWeight:700, letterSpacing:'0.15em' }}>{t('STRIPE DEPOSIT', 'إيداع سترايب')}</div>
              </div>
              <label style={{ display:'block', fontSize:'10px', color:S.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:'6px', textTransform:'uppercase' }}>{t('Amount (USD)', 'المبلغ (USD)')}</label>
              <input type="number" value={depositAmount} onChange={e=>setDepositAmount(e.target.value)} placeholder="0.00"
                style={{ width:'100%', padding:'14px', borderRadius:'10px', fontSize:'24px', fontWeight:500, color:'#fff', background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, outline:'none', boxSizing:'border-box', fontFamily:"'Satoshi',sans-serif", marginBottom:'10px' }} />
              <div style={{ display:'flex', gap:'8px', marginBottom:'18px' }}>
                {[100,500,1000,5000].map(v=>(
                  <button key={v} onClick={()=>setDepositAmount(String(v))}
                    style={{ flex:1, padding:'7px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:S.muted }}>
                    ${v.toLocaleString()}
                  </button>
                ))}
              </div>
              <div style={{ padding:'10px 12px', borderRadius:'8px', background:'rgba(99,91,255,0.06)', border:'1px solid rgba(99,91,255,0.15)', marginBottom:'16px', fontSize:'11px', color:S.muted }}>
                {t('Minimum deposit: $100 · Instantly credited to your Vault · No Stripe fees charged', 'الحد الأدنى للإيداع: 100$ · يُضاف فوراً إلى خزنتك · بدون رسوم من سترايب')}
              </div>
              <Btn onClick={()=>{ if(parseFloat(depositAmount)>=100) setDepositAmountConfirmed(true); }}
                style={{ width:'100%', padding:'14px', fontSize:'12px', ['--accent']:'#635BFF', opacity:parseFloat(depositAmount)<100?0.5:1 }}>
                {t('Continue to Card Details', 'متابعة إلى تفاصيل البطاقة')}
              </Btn>
            </div>
          ) : depositMethod === 'stripe' && depositAmountConfirmed ? (
            <div className="s4-glass spatial lift" style={{ padding:'28px' }}>
              <StripeDepositFlow amount={depositAmount} onSuccess={() => setDepositSuccess(true)} onBack={()=>setDepositAmountConfirmed(false)} />
            </div>
          ) : depositMethod === 'crypto' ? (
            <div className="s4-glass spatial lift" style={{ padding:'28px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
                <button onClick={() => setDepositMethod(null)} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:S.muted, fontSize:'11px' }}>{t('← Back','→ رجوع')}</button>
                <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'10px', color:'#F7931A', fontWeight:700, letterSpacing:'0.15em' }}>{t('CRYPTO DEPOSIT', 'إيداع بالعملات الرقمية')}</div>
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
            <div className="s4-glass" style={{ padding:'40px', textAlign:'center', borderColor:'rgba(99,102,241,0.35)' }}>
              <CheckCircle2 size={52} style={{ color:'#6366F1', margin:'0 auto 16px', display:'block' }} />
              <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'16px', fontWeight:500, color:'#fff', marginBottom:'8px' }}>{t('WITHDRAWAL REQUESTED', 'تم طلب السحب')}</div>
              <div style={{ color:S.muted, fontSize:'13px', marginBottom:'24px' }}>{t('Your request has been submitted and is pending review. You\'ll be notified once it\'s processed.', 'تم إرسال طلبك وهو قيد المراجعة. سيتم إشعارك بمجرد معالجته.')}</div>
              <button onClick={resetWithdraw} style={{ padding:'10px 28px', borderRadius:'10px', background:'#6366F1', color:'#fff', fontWeight:700, fontSize:'12px', border:'none', cursor:'pointer' }}>
                {t('New Withdrawal', 'سحب جديد')}
              </button>
            </div>
          ) : !withdrawMethod ? (
            <div className="s4-glass spatial lift" style={{ padding:'28px' }}>
              <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'10px', letterSpacing:'0.2em', color:'#6366F1', fontWeight:700, marginBottom:'6px', display:'flex', alignItems:'center', gap:'7px' }}>
                <Send size={13} /> {t('REQUEST WITHDRAWAL', 'طلب سحب')}
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderRadius:'10px', background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.15)', marginBottom:'24px' }}>
                <span style={{ color:S.muted, fontSize:'12px' }}>{t('Available Balance', 'الرصيد المتاح')}</span>
                <span style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'18px', fontWeight:500, color:'#fff' }}>{fmt(balance)}</span>
              </div>
              <p style={{ color:S.muted, fontSize:'12px', marginBottom:'20px' }}>{t('Select your withdrawal method. All withdrawals are processed with zero fees.', 'اختر طريقة السحب. تتم معالجة جميع عمليات السحب بدون رسوم.')}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {[
                  { id:'crypto', label:t('Cryptocurrency','عملات رقمية'), sub:t('BTC, ETH, USDT & more','BTC وETH وUSDT وغيرها'), color:'#F7931A', badge:t('Instant · On-chain','فوري · على البلوكتشين'), icon:'₿',
                    desc:t('Automated blockchain withdrawal. Real-time confirmation. Instant approval.','سحب آلي عبر البلوكتشين. تأكيد فوري. موافقة فورية.') },
                  { id:'stripe', label:t('Stripe Payout','دفعة سترايب'), sub:t('Bank / Card transfer','تحويل بنكي / بطاقة'), color:'#635BFF', badge:t('1–3 business days','1-3 أيام عمل'), icon:'🏦',
                    desc:t('Transfer to your bank account or card via Stripe Connect payout.','تحويل إلى حسابك البنكي أو بطاقتك عبر دفعات سترايب كونيكت.') },
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
            <div className="s4-glass spatial lift" style={{ padding:'28px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
                <button onClick={()=>setWithdrawMethod(null)} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:S.muted, fontSize:'11px' }}>{t('← Back','→ رجوع')}</button>
                <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'10px', color:'#F7931A', fontWeight:700, letterSpacing:'0.15em' }}>{t('CRYPTO WITHDRAWAL', 'سحب بالعملات الرقمية')}</div>
              </div>
              <CryptoWithdrawalFlow balance={balance} onSuccess={()=>setWithdrawSuccess(true)} onBack={()=>setWithdrawMethod(null)} />
            </div>
          ) : withdrawMethod === 'stripe' ? (
            <div className="s4-glass spatial lift" style={{ padding:'28px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
                <button onClick={()=>setWithdrawMethod(null)} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${S.border}`, borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:S.muted, fontSize:'11px' }}>{t('← Back','→ رجوع')}</button>
                <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'10px', color:'#635BFF', fontWeight:700, letterSpacing:'0.15em' }}>{t('STRIPE PAYOUT', 'دفعة سترايب')}</div>
              </div>
              <div style={{ padding:'16px', borderRadius:'12px', background:'rgba(99,91,255,0.06)', border:'1px solid rgba(99,91,255,0.18)', marginBottom:'16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                  <div style={{ background:'#635BFF', borderRadius:'5px', padding:'2px 7px', fontFamily:"'Satoshi',sans-serif", fontSize:'9px', fontWeight:500, color:'#fff' }}>stripe</div>
                  <span style={{ color:S.muted, fontSize:'11px' }}>{t('Payouts powered by Stripe Connect', 'الدفعات مدعومة عبر سترايب كونيكت')}</span>
                </div>
                <p style={{ color:'#CBD5E1', fontSize:'11px', lineHeight:1.6 }}>{t('Connect your Stripe account to receive payouts directly to your bank. First-time setup requires Stripe identity verification (1–2 minutes).', 'اربط حساب سترايب الخاص بك لاستلام الدفعات مباشرة إلى بنكك. الإعداد لأول مرة يتطلب توثيق الهوية عبر سترايب (1-2 دقيقة).')}</p>
              </div>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                onClick={()=>toast.info('Stripe Connect onboarding will open in a new window once connected to backend')}
                style={{ width:'100%', padding:'14px', borderRadius:'12px', fontWeight:500, fontSize:'13px', color:'#fff', border:'none', cursor:'pointer',
                  background:'linear-gradient(135deg,#635BFF,#6366F1)', boxShadow:'0 0 24px rgba(99,91,255,0.3)' }}>
                {t('Connect Stripe & Request Payout', 'ربط سترايب وطلب الدفعة')}
              </motion.button>
              <div style={{ textAlign:'center', marginTop:'10px', color:S.muted, fontSize:'10px' }}>{t('Payouts typically arrive within 1–3 business days', 'تصل الدفعات عادةً خلال 1-3 أيام عمل')}</div>
            </div>
          ) : null}
        </motion.div>
      )}

      {/* ── SUBSCRIPTIONS ── */}
      {tab === 'subscriptions' && (
        <motion.div key="subscriptions" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px' }}>
            {SUBS.map(s=>(
              <div key={s.door} className="s4-glass" style={{ padding:'20px', borderColor:`${s.color}30` }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:`${s.color}15`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <CreditCard size={16} style={{ color:s.color }} />
                    </div>
                    <div>
                      <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'10px', color:s.color, fontWeight:700 }}>{s.door}</div>
                      <div style={{ color:'#fff', fontSize:'12px', fontWeight:600 }}>{s.plan}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'18px', fontWeight:500, color:'#fff' }}>${s.price}</div>
                    <div style={{ color:S.muted, fontSize:'9px' }}>/month</div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                    <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#10B981', boxShadow:'0 0 6px #10B981' }} />
                    <span style={{ color:'#10B981', fontSize:'10px', fontWeight:700 }}>{t('ACTIVE', 'نشط')}</span>
                  </div>
                  <span style={{ color:S.muted, fontSize:'10px' }}>{t('Renews', 'التجديد')} {s.renews}</span>
                  <button onClick={()=>toast.info(`Managing ${s.door} subscription`)}
                    style={{ padding:'5px 10px', borderRadius:'6px', fontSize:'10px', fontWeight:700, cursor:'pointer', border:`1px solid ${s.color}30`, background:`${s.color}10`, color:s.color }}>
                    {t('Manage', 'إدارة')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'14px', padding:'14px 18px', borderRadius:'14px', background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ color:'#fff', fontSize:'13px', fontWeight:700 }}>{t('Total Monthly Subscriptions', 'إجمالي الاشتراكات الشهرية')}</div>
              <div style={{ color:S.muted, fontSize:'11px' }}>{t('All 4 doors · billed monthly', 'كل الأبواب الأربعة · فوترة شهرية')}</div>
            </div>
            <div style={{ fontFamily:"'Satoshi',sans-serif", fontSize:'22px', fontWeight:500, color:'#6366F1' }}>${SUBS.reduce((s,r)=>s+r.price,0)}/mo</div>
          </div>
        </motion.div>
      )}

      </AnimatePresence>
      <style>{`@keyframes s4v-spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
