import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '../_lib/guard.js';

// Real wallet deposit-intent creation — the Vault's deposit flow was
// entirely `setTimeout`-simulated (see TheVault.jsx's old StripeDepositFlow/
// CryptoDepositFlow), the only real, webhook-verified payment rail was the
// Founding-Member seat checkout. This reuses the exact same providers
// (Dodo for card, NOWPayments for crypto) that checkout already proves work,
// scoped to wallet top-ups instead of seat purchases. No card data is ever
// collected by SOLVEN4 — both providers use hosted checkout pages.
const DODO_API = 'https://api.dodopayments.com/v1';
const NOW_API = 'https://api.nowpayments.io/v1';
const MIN_DEPOSIT_USD = 10;
const MAX_DEPOSIT_USD = 50000;

function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.VITE_HUB_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = getSupabase();
  const verifiedUserId = await verifyAuth(req, supabase);
  if (!verifiedUserId) return res.status(401).json({ error: 'Unauthorized — valid session required' });

  const { userEmail, amount, method } = req.body || {};
  const userId = verifiedUserId; // never trust a client-supplied userId for a money-moving endpoint
  const amountUsd = Number(amount);

  if (!userEmail) return res.status(400).json({ error: 'userEmail required' });
  if (!amountUsd || amountUsd < MIN_DEPOSIT_USD || amountUsd > MAX_DEPOSIT_USD) {
    return res.status(400).json({ error: `Amount must be between $${MIN_DEPOSIT_USD} and $${MAX_DEPOSIT_USD}` });
  }
  if (!['card', 'crypto'].includes(method)) return res.status(400).json({ error: 'method must be card or crypto' });

  const hubUrl = process.env.VITE_HUB_URL || 'https://hub.solven4.com';
  const orderId = `wallet_${userId}_${Date.now()}`;

  const { data: txRow, error: txErr } = await supabase.from('wallet_transactions').insert({
    user_id: userId, type: 'deposit', amount: amountUsd, currency: 'USD', status: 'pending',
    description: `Vault deposit via ${method === 'card' ? 'Dodo' : 'NOWPayments'}`,
    reference_type: 'wallet_deposit', reference_id: orderId, door: 'HUB',
    metadata: { method },
  }).select('id').single();
  if (txErr) return res.status(500).json({ error: txErr.message });

  try {
    if (method === 'card') {
      if (!process.env.DODO_SECRET_KEY) return res.status(503).json({ error: 'Card deposits not configured' });
      const dodoRes = await fetch(`${DODO_API}/payment-links`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.DODO_SECRET_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amountUsd * 100), currency: 'USD',
          description: `SOLVEN4 Vault deposit — $${amountUsd}`,
          customer: { email: userEmail },
          metadata: { purpose: 'wallet_deposit', orderId, userId, walletTxId: txRow.id },
          redirect_url: `${hubUrl}/dashboard/vault?success=1`,
          cancel_url: `${hubUrl}/dashboard/vault?cancelled=1`,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        }),
      });
      const link = await dodoRes.json();
      if (!dodoRes.ok) throw new Error(link.message || 'Dodo payment link creation failed');
      await supabase.from('wallet_transactions').update({ metadata: { method, dodo_payment_link_id: link.id } }).eq('id', txRow.id);
      return res.status(200).json({ checkoutUrl: link.url });
    }

    // crypto
    if (!process.env.NOWPAYMENTS_API_KEY) return res.status(503).json({ error: 'Crypto deposits not configured' });
    const nowRes = await fetch(`${NOW_API}/invoice`, {
      method: 'POST',
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_amount: amountUsd, price_currency: 'usd', order_id: orderId,
        order_description: `SOLVEN4 Vault deposit — $${amountUsd}`,
        ipn_callback_url: `${hubUrl}/api/webhooks/wallet`,
        success_url: `${hubUrl}/dashboard/vault?success=1`,
        cancel_url: `${hubUrl}/dashboard/vault?cancelled=1`,
        is_fixed_rate: true, is_fee_paid_by_user: false,
      }),
    });
    const invoice = await nowRes.json();
    if (!nowRes.ok || invoice.statusCode >= 400) throw new Error(invoice.message || 'NOWPayments invoice creation failed');
    await supabase.from('wallet_transactions').update({ metadata: { method, nowpayments_invoice_id: invoice.id } }).eq('id', txRow.id);
    return res.status(200).json({ checkoutUrl: invoice.invoice_url });
  } catch (err) {
    await supabase.from('wallet_transactions').update({ status: 'failed' }).eq('id', txRow.id);
    console.error('[wallet/deposit] failed:', err);
    return res.status(500).json({ error: err.message });
  }
}
