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

// Vercel's default body parser JSON-parses the request before a handler
// ever sees it, which loses the exact bytes Dodo actually signed —
// re-serializing via JSON.stringify(req.body) is not guaranteed to
// reproduce the same bytes (whitespace/key-order/number-formatting can
// differ), so it can cause legitimate signatures to fail verification
// (payment audit C4). Reading the raw body ourselves fixes that.
export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await readRawBody(req);
  let parsedBody;
  try { parsedBody = JSON.parse(rawBody); } catch { return res.status(400).json({ error: 'Invalid JSON body' }); }

  // 1. Verify Dodo webhook signature.
  // SECURITY FIX (payment audit C3/C4): previously skipped verification
  // entirely whenever DODO_WEBHOOK_SECRET was unset on a given deploy —
  // any POST with the right shape was trusted. Now refuses to process
  // unless a secret is configured and the signature matches.
  const signature = req.headers['dodo-signature'] || req.headers['x-dodo-signature'] || '';
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('DODO_WEBHOOK_SECRET not set — rejecting webhook rather than processing unverified.');
    return res.status(500).json({ error: 'Webhook verification not configured' });
  }

  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

  if (signature !== `sha256=${expected}`) {
    const supabase = getSupabase();
    await supabase.from('security_events').insert({
      event_type: 'invalid_webhook_signature',
      severity: 'high',
      source_ip: req.headers['x-forwarded-for'] || 'unknown',
      path: '/api/webhooks/dodo',
      details: { received: signature || '(missing)', path: '/api/webhooks/dodo' },
    });
    await sendTelegramAlert('🚨 <b>INVALID WEBHOOK SIGNATURE</b> on Dodo webhook endpoint');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const supabase = getSupabase();
  const { type, data } = parsedBody;

  try {
    if (type === 'payment.succeeded') {
      const { id: paymentId, metadata, amount, customer } = data;

      // ── ORACLE Brain tier upgrade (separate purpose, not a founding seat) ──
      if (metadata?.purpose === 'oracle_tier') {
        const { userId: upUser, targetTier } = metadata;
        const { data: prof } = await supabase
          .from('profiles').select('oracle_tier, email, full_name').eq('id', upUser).maybeSingle();
        await supabase.from('profiles')
          .update({ oracle_tier: targetTier, plan: targetTier, updated_at: new Date().toISOString() })
          .eq('id', upUser);
        await supabase.from('activities').insert({
          user_id: upUser, activity_type: 'oracle_tier_upgraded',
          metadata: { from: prof?.oracle_tier || 'signal', to: targetTier, paymentId },
        }).catch(() => {});
        if (prof?.email) {
          await sendEmail('tier_upgrade', prof.email, { name: prof.full_name, tier: (targetTier || '').toUpperCase() });
        }
        await sendTelegramAlert(`⚡ <b>ORACLE TIER UPGRADE</b>\nUser: ${prof?.email || upUser}\nTo: <b>${targetTier}</b>\nAmount: $${amount / 100}`);
        return res.json({ received: true, oracle_tier_upgraded: true });
      }

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

      // Email: welcome + receipt to buyer (Resend — no-op if key unset)
      if (customer?.email) {
        const doors = DOOR_BUNDLES[tier] || [tier];
        await sendEmail('welcome', customer.email, { name: customer?.name, tier, doors });
        await sendEmail('payment_receipt', customer.email, {
          name: customer?.name, tier, amount: amountUsd, paymentId, method: 'Dodo Payments',
        });
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

    // ── ORACLE Brain recurring subscription lifecycle ──
    // NOTE: exact event `type` strings and `data` fields below follow Dodo's
    // documented subscription webhook shape as of this build — verify
    // against Dodo's current API reference (same caveat noted in
    // api/brain/tier.js where the subscription is created).
    if (type?.startsWith('subscription.')) {
      const sub = data;
      const meta = sub?.metadata || {};
      const dodoSubId = sub?.id || sub?.subscription_id;
      const upUser = meta.userId;
      const targetTier = meta.targetTier;

      if (type === 'subscription.active' || type === 'subscription.renewed') {
        const periodEnd = sub?.current_period_end || sub?.next_billing_date || null;
        await supabase.from('oracle_subscriptions').upsert({
          user_id: upUser, tier: targetTier, dodo_subscription_id: dodoSubId,
          status: 'active', current_period_end: periodEnd,
          cancel_at_period_end: !!sub?.cancel_at_period_end,
          amount_usd: sub?.amount ? sub.amount / 100 : undefined,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        const { data: prof } = await supabase
          .from('profiles').select('oracle_tier, email, full_name').eq('id', upUser).maybeSingle();
        await supabase.from('profiles')
          .update({ oracle_tier: targetTier, plan: targetTier, updated_at: new Date().toISOString() })
          .eq('id', upUser);

        if (type === 'subscription.active') {
          await supabase.from('activities').insert({
            user_id: upUser, activity_type: 'oracle_tier_upgraded',
            metadata: { from: prof?.oracle_tier || 'signal', to: targetTier, dodoSubId, recurring: true },
          }).catch(() => {});
          if (prof?.email) {
            await sendEmail('tier_upgrade', prof.email, { name: prof.full_name, tier: (targetTier || '').toUpperCase() });
          }
          await sendTelegramAlert(`⚡ <b>ORACLE SUBSCRIPTION ACTIVE</b>\nUser: ${prof?.email || upUser}\nTier: <b>${targetTier}</b>`);
        }
      }

      if (type === 'subscription.past_due') {
        await supabase.from('oracle_subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('dodo_subscription_id', dodoSubId);
        await sendTelegramAlert(`⚠️ <b>ORACLE SUBSCRIPTION PAST DUE</b>\nSubscription: ${dodoSubId}`);
      }

      if (type === 'subscription.cancelled' || type === 'subscription.expired' || type === 'subscription.failed') {
        const { data: cancelledSub } = await supabase
          .from('oracle_subscriptions')
          .update({ status: type === 'subscription.cancelled' ? 'cancelled' : 'expired', updated_at: new Date().toISOString() })
          .eq('dodo_subscription_id', dodoSubId)
          .select('user_id')
          .maybeSingle();

        const downgradeUser = cancelledSub?.user_id || upUser;
        if (downgradeUser) {
          await supabase.from('profiles')
            .update({ oracle_tier: 'signal', plan: 'signal', updated_at: new Date().toISOString() })
            .eq('id', downgradeUser);
          await supabase.from('activities').insert({
            user_id: downgradeUser, activity_type: 'oracle_tier_downgraded',
            metadata: { to: 'signal', reason: type, dodoSubId },
          }).catch(() => {});
        }
        await sendTelegramAlert(`📉 <b>ORACLE SUBSCRIPTION ${type === 'subscription.cancelled' ? 'CANCELLED' : 'ENDED'}</b>\nSubscription: ${dodoSubId}`);
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
