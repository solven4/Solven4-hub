import { createClient } from '@supabase/supabase-js';

// NOWPayments — crypto checkout (BTC, ETH, USDT, SOL, etc.)
// Docs: https://documenter.getpostman.com/view/7907941/2s93JqTRWN
const NOW_API = 'https://api.nowpayments.io/v1';

const FOUNDING_AMOUNTS = {
  EDGE:   297,
  FORGE:  497,
  ORACLE: 797,
  NEXUS:  1297,
};

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
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Crypto checkout not configured' });

  const { tier, userId, userEmail, referralCode } = req.body;
  if (!tier || !userId || !userEmail) return res.status(400).json({ error: 'tier, userId, userEmail required' });

  const amount = FOUNDING_AMOUNTS[tier];
  if (!amount) return res.status(400).json({ error: `Invalid tier: ${tier}` });

  const supabase = getSupabase();

  try {
    // Reserve seat
    const { data: reservation, error: resErr } = await supabase.rpc('reserve_founding_seat', {
      p_tier: tier,
      p_user_id: userId,
      p_hold_minutes: 60, // Crypto needs longer — blockchain confirmation
    });
    if (resErr) throw resErr;
    if (!reservation.reserved) {
      return res.status(409).json({ error: `No seats remaining for ${tier} tier.` });
    }

    const hubUrl = process.env.VITE_HUB_URL || 'https://hub.solven4.com';

    // Create NOWPayments invoice
    const nowRes = await fetch(`${NOW_API}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        order_id: reservation.reservationId,
        order_description: `SOLVEN4 ${tier} — Founding Lifetime Membership`,
        ipn_callback_url: `${hubUrl}/api/webhooks/nowpayments`,
        success_url: `${hubUrl}/dashboard/subscription?success=1&tier=${tier}&method=crypto`,
        cancel_url: `${hubUrl}/dashboard/subscription?cancelled=1`,
        is_fixed_rate: true,
        is_fee_paid_by_user: false,
        // Pass metadata in order_id as JSON-encoded string (NOWPayments doesn't have metadata field)
      }),
    });

    const invoice = await nowRes.json();
    if (!nowRes.ok || invoice.statusCode >= 400) {
      await supabase.from('seat_reservations').update({ status: 'expired' }).eq('id', reservation.reservationId);
      throw new Error(invoice.message || 'NOWPayments invoice creation failed');
    }

    // Store the mapping reservation → invoice for webhook lookup
    await supabase.from('seat_reservations').update({
      payment_processor: 'nowpayments',
      external_payment_id: String(invoice.id),
      metadata: { tier, userId, referralCode: referralCode || null },
    }).eq('id', reservation.reservationId);

    return res.json({
      checkoutUrl: invoice.invoice_url,
      invoiceId: invoice.id,
      reservationId: reservation.reservationId,
      seatsRemaining: reservation.seatsRemaining,
    });

  } catch (err) {
    console.error('Crypto session error:', err);
    return res.status(500).json({ error: err.message });
  }
}
