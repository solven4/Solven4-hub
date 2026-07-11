import { createClient } from '@supabase/supabase-js';

const DODO_API = 'https://api.dodopayments.com/v1';

const FOUNDING_PRICES = {
  EDGE:   { amount: 29700, name: 'SOLVEN4 EDGE — Founding Member (Lifetime)' },
  FORGE:  { amount: 49700, name: 'SOLVEN4 FORGE — Founding Member (Lifetime)' },
  ORACLE: { amount: 79700, name: 'SOLVEN4 ORACLE — Founding Member (Lifetime)' },
  NEXUS:  { amount: 129700, name: 'SOLVEN4 NEXUS — Founding Member (Lifetime)' },
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { tier, userId, userEmail, userPhone, referralCode } = req.body;

    if (!FOUNDING_PRICES[tier]) return res.status(400).json({ error: 'Invalid tier' });
    if (!userId || !userEmail)  return res.status(400).json({ error: 'Missing userId or userEmail' });

    const supabase = getSupabase();

    // Reserve seat atomically
    const { data: reservation, error: resErr } = await supabase.rpc('reserve_founding_seat', {
      p_tier: tier,
      p_user_id: userId,
      p_hold_minutes: 15,
    });

    if (resErr) throw resErr;
    if (!reservation.reserved) {
      return res.status(409).json({ error: `No seats remaining for ${tier} tier. All seats are sold out.` });
    }

    // Build metadata
    const metadata = { tier, userId, reservationId: reservation.reservationId };
    if (userPhone)    metadata.userPhone    = userPhone;
    if (referralCode) metadata.referralCode = referralCode;

    const hubUrl = process.env.VITE_HUB_URL || 'https://hub.solven4.com';

    // Create Dodo payment link
    const dodoRes = await fetch(`${DODO_API}/payment-links`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DODO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: FOUNDING_PRICES[tier].amount,
        currency: 'USD',
        description: FOUNDING_PRICES[tier].name,
        customer: { email: userEmail },
        metadata,
        redirect_url: `${hubUrl}/dashboard/subscription?success=1&tier=${tier}`,
        cancel_url: `${hubUrl}/dashboard/subscription?cancelled=1`,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      }),
    });

    const paymentLink = await dodoRes.json();
    if (!dodoRes.ok) {
      // Release the reservation if Dodo fails
      await supabase.from('seat_reservations')
        .update({ status: 'expired' })
        .eq('id', reservation.reservationId);
      throw new Error(paymentLink.message || 'Dodo payment link creation failed');
    }

    return res.status(200).json({
      checkoutUrl: paymentLink.url,
      reservationId: reservation.reservationId,
      seatsRemaining: reservation.seatsRemaining,
    });

  } catch (err) {
    console.error('create-session error:', err);
    return res.status(500).json({ error: err.message });
  }
}
