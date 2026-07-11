import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

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

async function sendWhatsApp(to, body) {
  if (!process.env.TWILIO_ACCOUNT_SID || !to) return;
  const formattedTo   = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const formattedFrom = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
  const credentials   = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ To: formattedTo, From: formattedFrom, Body: body }).toString(),
  }).catch(console.error);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. Verify Dodo webhook signature
  const signature = req.headers['dodo-signature'] || req.headers['x-dodo-signature'] || '';
  const rawBody   = JSON.stringify(req.body);
  const expected  = crypto
    .createHmac('sha256', process.env.DODO_WEBHOOK_SECRET || '')
    .update(rawBody)
    .digest('hex');

  if (process.env.DODO_WEBHOOK_SECRET && signature !== `sha256=${expected}`) {
    const supabase = getSupabase();
    await supabase.from('security_events').insert({
      event_type: 'invalid_webhook_signature',
      severity: 'high',
      source_ip: req.headers['x-forwarded-for'] || 'unknown',
      path: '/api/webhooks/dodo',
      details: { received: signature, path: '/api/webhooks/dodo' },
    });
    await sendTelegramAlert('🚨 <b>INVALID WEBHOOK SIGNATURE</b> on Dodo webhook endpoint');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const supabase = getSupabase();
  const { type, data } = req.body;

  try {
    if (type === 'payment.succeeded') {
      const { id: paymentId, metadata, amount, customer } = data;
      const { tier, userId, reservationId, userPhone, referralCode } = metadata || {};

      // Idempotency check — don't process twice
      const { data: existing } = await supabase
        .from('founding_members')
        .select('id')
        .eq('payment_id', paymentId)
        .single();
      if (existing) return res.json({ received: true, duplicate: true });

      // Confirm seat
      await supabase.rpc('confirm_founding_seat', {
        p_reservation_id: reservationId,
        p_payment_id: paymentId,
      });

      const amountUsd = amount / 100;

      // Create founding member record
      await supabase.from('founding_members').insert({
        user_id: userId,
        founding_tier: tier,
        founding_doors: DOOR_BUNDLES[tier] || [tier],
        payment_id: paymentId,
        payment_processor: 'dodo',
        amount_paid_usd: amountUsd,
        reservation_id: reservationId,
      });

      // Auto-allocate revenue to treasury
      await supabase.rpc('allocate_revenue', {
        p_amount_usd: amountUsd,
        p_source: 'dodo',
        p_source_id: paymentId,
        p_description: `Founding ${tier} membership`,
      });

      // Handle referral commission (10% during 14-day refund window)
      if (referralCode) {
        const { data: ref } = await supabase
          .from('referrals')
          .select('id, referrer_user_id')
          .eq('referral_code', referralCode)
          .eq('referred_user_id', null)
          .single();
        if (ref) {
          const commission = amountUsd * 0.10;
          await supabase.from('referrals').update({
            referred_user_id: userId,
            tier_purchased: tier,
            commission_usd: commission,
            status: 'pending_clearance',
            payment_id: paymentId,
            refund_window_expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
            converted_at: new Date().toISOString(),
          }).eq('id', ref.id);
        }
      }

      // Admin Telegram alert
      await sendTelegramAlert(
        `🎉 <b>NEW FOUNDING MEMBER</b>\n\n` +
        `Tier: <b>${tier}</b>\nDoors: ${(DOOR_BUNDLES[tier] || [tier]).join(', ')}\n` +
        `Amount: <b>$${amountUsd}</b>\nEmail: ${customer?.email || 'N/A'}\n` +
        `Payment ID: ${paymentId}${referralCode ? `\nReferral: ${referralCode}` : ''}`
      );

      // WhatsApp confirmation to buyer
      if (userPhone) {
        await sendWhatsApp(userPhone,
          `✅ *SOLVEN4 Payment Confirmed*\n\nWelcome, Founding ${tier} Member!\n` +
          `Your lifetime access is now active.\n\nAmount: $${amountUsd} USD\n\n` +
          `Login at hub.solven4.com 🚀`
        );
      }

      // Log security event
      await supabase.from('security_events').insert({
        event_type: 'auth_succeeded',
        severity: 'info',
        door: 'HUB',
        details: { context: 'payment_success', tier, paymentId },
      });
    }

    if (type === 'payment.failed' || type === 'payment.expired') {
      const reservationId = data?.metadata?.reservationId;
      if (reservationId) {
        await supabase
          .from('seat_reservations')
          .update({ status: 'expired' })
          .eq('id', reservationId)
          .eq('status', 'pending');
      }
    }

  } catch (err) {
    console.error('Dodo webhook error:', err);
    await supabase.from('security_events').insert({
      event_type: 'auth_failed',
      severity: 'high',
      path: '/api/webhooks/dodo',
      details: { error: err.message, type },
    });
    return res.status(500).json({ error: 'Webhook processing failed' });
  }

  return res.json({ received: true });
}
