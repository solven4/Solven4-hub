import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '../_lib/email.js';

const DOOR_BUNDLES = {
  EDGE:   ['EDGE'],
  FORGE:  ['EDGE', 'FORGE'],
  ORACLE: ['EDGE', 'FORGE', 'ORACLE'],
  NEXUS:  ['EDGE', 'FORGE', 'ORACLE', 'NEXUS'],
};

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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID,
      text,
      parse_mode: 'HTML',
    }),
  }).catch(console.error);
}

async function handleWalletDepositIpn(supabase, body) {
  const { payment_id, payment_status, order_id, price_amount } = body;
  try {
    const { data: txRow } = await supabase.from('wallet_transactions').select('*').eq('reference_id', order_id).single();
    if (!txRow) {
      await sendTelegramAlert(`⚠️ Wallet webhook: confirmed payment but transaction <code>${order_id}</code> not found`);
      return { received: true, warning: 'transaction not found' };
    }
    if (txRow.status === 'completed') return { received: true, duplicate: true };

    const amountUsd = Number(price_amount);

    await supabase.from('wallet_transactions').update({
      status: 'completed', metadata: { ...txRow.metadata, nowpayments_payment_id: String(payment_id) },
    }).eq('id', txRow.id);

    await supabase.rpc('allocate_revenue', {
      p_amount_usd: amountUsd, p_source: 'nowpayments', p_source_id: String(payment_id),
      p_description: `Vault deposit — ${txRow.user_id}`,
    }).catch(() => {});

    await sendTelegramAlert(`💰 <b>VAULT CRYPTO DEPOSIT</b>\nUser: ${txRow.user_id}\nAmount: $${amountUsd}\nPayment ID: ${payment_id}`);
    return { received: true };
  } catch (err) {
    console.error('[webhooks/nowpayments] wallet IPN failed:', err);
    await sendTelegramAlert(`❌ Wallet webhook error: ${err.message}`);
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Verify NOWPayments IPN signature.
  // SECURITY FIX (payment audit C3): this previously only verified when
  // BOTH ipnSecret was configured AND the signature header was present —
  // an attacker could bypass verification entirely just by omitting the
  // x-nowpayments-sig header, even with a secret configured. Now: if a
  // secret is configured, a missing/invalid signature is always rejected.
  const signature = req.headers['x-nowpayments-sig'];
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

  if (ipnSecret) {
    // NOWPayments signs: HMAC-SHA512 of sorted JSON body
    const sortedBody = JSON.stringify(req.body, Object.keys(req.body).sort());
    const expected = crypto
      .createHmac('sha512', ipnSecret)
      .update(sortedBody)
      .digest('hex');

    if (!signature || signature !== expected) {
      const supabase = getSupabase();
      await supabase.from('security_events').insert({
        event_type: 'invalid_webhook_signature',
        severity: 'high',
        source_ip: req.headers['x-forwarded-for'] || 'unknown',
        path: '/api/webhooks/nowpayments',
        details: { received: signature || '(missing)' },
      });
      await sendTelegramAlert('🚨 <b>INVALID NOWPAYMENTS SIGNATURE</b>' + (!signature ? ' (header missing)' : ''));
      return res.status(400).json({ error: 'Invalid signature' });
    }
  } else {
    // No secret configured on this deploy at all — refuse to process
    // payment webhooks unverified rather than silently trusting them.
    console.error('NOWPAYMENTS_IPN_SECRET not set — rejecting webhook rather than processing unverified.');
    return res.status(500).json({ error: 'Webhook verification not configured' });
  }

  const { payment_id, payment_status, order_id: reservationId, price_amount, outcome_currency } = req.body;
  const supabase = getSupabase();

  try {
    // Only process confirmed/finished payments
    if (!['confirmed', 'finished'].includes(payment_status)) {
      return res.json({ received: true, status: payment_status, action: 'ignored' });
    }

    // Wallet Vault deposits use order_id "wallet_<userId>_<ts>" (see
    // api/wallet/deposit.js) — distinct from founding-seat reservation IDs.
    // Handled here (rather than a separate webhook file) to stay under
    // Vercel Hobby's 12-function-per-deployment cap.
    if (reservationId?.startsWith('wallet_')) {
      const result = await handleWalletDepositIpn(supabase, req.body);
      return res.status(200).json(result);
    }

    // Look up the reservation to get tier + userId
    const { data: reservation } = await supabase
      .from('seat_reservations')
      .select('*')
      .eq('id', reservationId)
      .single();

    if (!reservation) {
      await sendTelegramAlert(`⚠️ NOWPayments: confirmed payment but reservation <code>${reservationId}</code> not found`);
      return res.status(200).json({ received: true, warning: 'reservation not found' });
    }

    const { tier, userId, referralCode } = reservation.metadata || {};

    // Idempotency check
    const { data: existing } = await supabase
      .from('founding_members')
      .select('id')
      .eq('payment_id', String(payment_id))
      .single();
    if (existing) return res.json({ received: true, duplicate: true });

    // Confirm seat
    await supabase.rpc('confirm_founding_seat', {
      p_reservation_id: reservationId,
      p_payment_id: String(payment_id),
    });

    const amountUsd = Number(price_amount);

    // Create founding member
    await supabase.from('founding_members').insert({
      user_id: userId,
      founding_tier: tier,
      founding_doors: DOOR_BUNDLES[tier] || [tier],
      payment_id: String(payment_id),
      payment_processor: 'nowpayments',
      amount_paid_usd: amountUsd,
      reservation_id: reservationId,
    });

    // Revenue allocation
    await supabase.rpc('allocate_revenue', {
      p_amount_usd: amountUsd,
      p_source: 'nowpayments',
      p_source_id: String(payment_id),
      p_description: `Founding ${tier} membership — crypto`,
    });

    // Referral commission
    if (referralCode) {
      const { data: ref } = await supabase
        .from('referrals')
        .select('id, referrer_user_id')
        .eq('referral_code', referralCode)
        .eq('referred_user_id', null)
        .single();
      if (ref) {
        await supabase.from('referrals').update({
          referred_user_id: userId,
          tier_purchased: tier,
          commission_usd: (amountUsd * 0.10).toFixed(2),
          status: 'pending_clearance',
          payment_id: String(payment_id),
          refund_window_expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
          converted_at: new Date().toISOString(),
        }).eq('id', ref.id);
      }
    }

    await sendTelegramAlert(
      `💰 <b>CRYPTO PAYMENT CONFIRMED</b>\n\n` +
      `Tier: <b>${tier}</b>\nAmount: <b>$${amountUsd}</b>\n` +
      `Currency: ${outcome_currency?.toUpperCase() || 'crypto'}\n` +
      `Payment ID: ${payment_id}`
    );

    // Email: welcome + receipt (look up buyer email via profiles → auth)
    try {
      const { data: prof } = await supabase
        .from('profiles').select('email, full_name').eq('id', userId).maybeSingle();
      if (prof?.email) {
        const doors = DOOR_BUNDLES[tier] || [tier];
        await sendEmail('welcome', prof.email, { name: prof.full_name, tier, doors });
        await sendEmail('payment_receipt', prof.email, {
          name: prof.full_name, tier, amount: amountUsd, paymentId: String(payment_id), method: 'NOWPayments (crypto)',
        });
      }
    } catch { /* email is best-effort */ }

    return res.json({ received: true });

  } catch (err) {
    console.error('NOWPayments webhook error:', err);
    await sendTelegramAlert(`❌ NOWPayments webhook error: ${err.message}`);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
