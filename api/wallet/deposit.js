import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '../_lib/guard.js';

// Real wallet deposit + withdrawal — the Vault's deposit/withdraw flows were
// entirely `setTimeout`-simulated (see TheVault.jsx's old StripeDepositFlow/
// CryptoDepositFlow), the only real, webhook-verified payment rail was the
// Founding-Member seat checkout. This reuses the exact same providers
// (Dodo for card, NOWPayments for crypto) that checkout already proves work,
// scoped to wallet top-ups instead of seat purchases. No card data is ever
// collected by SOLVEN4 — both providers use hosted checkout pages.
//
// Deposit and withdraw are combined into one file (dispatched by
// ?action=withdraw via vercel.json rewrite) to stay under Vercel Hobby's
// 12-function-per-deployment cap — see api/webhooks/nowpayments.js for the
// same reasoning applied to the wallet deposit IPN.
const DODO_API = 'https://api.dodopayments.com/v1';
const NOW_API = 'https://api.nowpayments.io/v1';
const MIN_DEPOSIT_USD = 10;
const MAX_DEPOSIT_USD = 50000;
const MIN_WITHDRAWAL_USD = 20;

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

async function sendTelegramAlert(text) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_ADMIN_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID, text, parse_mode: 'HTML' }),
  }).catch(console.error);
}

async function handleDeposit(req, res, supabase, userId) {
  const { userEmail, amount, method } = req.body || {};
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

    // crypto — IPN handled by api/webhooks/nowpayments.js (order_id prefix
    // "wallet_" routes it to wallet-crediting logic there instead of the
    // founding-seat path).
    if (!process.env.NOWPAYMENTS_API_KEY) return res.status(503).json({ error: 'Crypto deposits not configured' });
    const nowRes = await fetch(`${NOW_API}/invoice`, {
      method: 'POST',
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_amount: amountUsd, price_currency: 'usd', order_id: orderId,
        order_description: `SOLVEN4 Vault deposit — $${amountUsd}`,
        ipn_callback_url: `${hubUrl}/api/webhooks/nowpayments`,
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

async function handleWithdraw(req, res, supabase, userId) {
  const { amount, destination, network } = req.body || {};
  const amountUsd = Number(amount);

  if (!amountUsd || amountUsd < MIN_WITHDRAWAL_USD) return res.status(400).json({ error: `Minimum withdrawal is $${MIN_WITHDRAWAL_USD}` });
  if (!destination) return res.status(400).json({ error: 'destination address required' });

  try {
    const { data: txs, error: txErr } = await supabase
      .from('wallet_transactions').select('type, amount, status').eq('user_id', userId);
    if (txErr) throw txErr;

    const CREDIT_TYPES = new Set(['commission', 'deposit', 'refund', 'referral', 'copy_trade', 'xp_bonus', 'arena_prize']);
    const balance = (txs || []).reduce((sum, tx) => {
      if (tx.status !== 'completed' && tx.status !== 'pending') return sum;
      const signed = CREDIT_TYPES.has(tx.type) ? Number(tx.amount) : -Number(tx.amount);
      return sum + signed;
    }, 0);

    if (amountUsd > balance) {
      return res.status(400).json({ error: `Insufficient balance. Available: $${balance.toFixed(2)}` });
    }

    const { data: txRow, error: insErr } = await supabase.from('wallet_transactions').insert({
      user_id: userId, type: 'withdrawal', amount: amountUsd, currency: 'USD', status: 'pending',
      description: `Withdrawal request — ${network || 'crypto'} to ${destination.slice(0, 10)}...`,
      reference_type: 'wallet_withdrawal', door: 'HUB',
      metadata: { destination, network },
    }).select('id').single();
    if (insErr) throw insErr;

    await sendTelegramAlert(`💸 <b>WITHDRAWAL REQUEST</b>\nUser: ${userId}\nAmount: $${amountUsd}\nDestination: ${destination}\nTx: ${txRow.id}\n\nReview in Cockpit → Finance Center.`);

    return res.status(200).json({ success: true, transactionId: txRow.id, status: 'pending' });
  } catch (err) {
    console.error('[wallet/withdraw] failed:', err);
    return res.status(500).json({ error: err.message });
  }
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = getSupabase();
  const userId = await verifyAuth(req, supabase);
  if (!userId) return res.status(401).json({ error: 'Unauthorized — valid session required' });

  const action = req.query?.action || 'deposit';
  if (action === 'withdraw') return handleWithdraw(req, res, supabase, userId);
  return handleDeposit(req, res, supabase, userId);
}
