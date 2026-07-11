import { createClient } from '@supabase/supabase-js';

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

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const supabase = getSupabase();

  // Check for existing code
  const { data: existing } = await supabase
    .from('referrals')
    .select('referral_code')
    .eq('referrer_user_id', userId)
    .is('referred_user_id', null)
    .single();

  if (existing?.referral_code) {
    return res.json({ code: existing.referral_code });
  }

  // Generate unique code
  const prefix = userId.slice(0, 4).toUpperCase().replace(/-/g, 'X');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const code   = `S4-${prefix}-${suffix}`;

  await supabase.from('referrals').insert({
    referrer_user_id: userId,
    referral_code: code,
  });

  return res.json({ code });
}
