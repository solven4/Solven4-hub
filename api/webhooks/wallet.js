import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// NOWPayments IPN handler for Vault crypto deposits (api/wallet/deposit.js
// sets ipn_callback_url to this endpoint specifically, distinct from the
// founding-seat crypto webhook at api/webhooks/nowpayments.js which is
// scoped to seat_reservations — kept separate rather than overloading that
// webhook's founding-member logic with wallet semantics).

function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function sendTelegramAlert(text) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_ADMIN_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID, text, parse_mode: 'HTML' }),
  }).catch(console.error);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const signature = req.headers['x-nowpayments-sig'];
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  const supabase = getSupabase();

  if (!ipnSecret) {
    console.error('[webhooks/wallet] NOWPAYMENTS_IPN_SECRET not set — rejecting unverified webhook.');
    return res.status(500).json({ error: 'Webhook verification not configured' });
  }

  const sortedBody = JSON.stringify(req.body, Object.keys(req.body).sort());
  const expected = crypto.createHmac('sha512', ipnSecret).update(sortedBody).digest('hex');
  if (!signature || signature !== expected) {
    await supabase.from('security_events').insert({
      event_type: 'invalid_webhook_signature', severity: 'high',
      source_ip: req.headers['x-forwarded-for'] || 'unknown', path: '/api/webhooks/wallet',
      details: { received: signature || '(missing)' },
    }).catch(() => {});
    await sendTelegramAlert('🚨 <b>INVALID WALLET WEBHOOK SIGNATURE</b>' + (!signature ? ' (header missing)' : ''));
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const { payment_id, payment_status, order_id, price_amount } = req.body;

  try {
    if (!['confirmed', 'finished'].includes(payment_status)) {
      return res.json({ received: true, status: payment_status, action: 'ignored' });
    }

    const { data: txRow } = await supabase.from('wallet_transactions').select('*').eq('reference_id', order_id).single();
    if (!txRow) {
      await sendTelegramAlert(`⚠️ Wallet webhook: confirmed payment but transaction <code>${order_id}</code> not found`);
      return res.status(200).json({ received: true, warning: 'transaction not found' });
    }
    if (txRow.status === 'completed') return res.json({ received: true, duplicate: true });

    const amountUsd = Number(price_amount);

    await supabase.from('wallet_transactions').update({
      status: 'completed', metadata: { ...txRow.metadata, nowpayments_payment_id: String(payment_id) },
    }).eq('id', txRow.id);

    await supabase.rpc('allocate_revenue', {
      p_amount_usd: amountUsd, p_source: 'nowpayments', p_source_id: String(payment_id),
      p_description: `Vault deposit — ${txRow.user_id}`,
    }).catch(() => {});

    await sendTelegramAlert(`💰 <b>VAULT CRYPTO DEPOSIT</b>\nUser: ${txRow.user_id}\nAmount: $${amountUsd}\nPayment ID: ${payment_id}`);
    return res.json({ received: true });
  } catch (err) {
    console.error('[webhooks/wallet] failed:', err);
    await sendTelegramAlert(`❌ Wallet webhook error: ${err.message}`);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
