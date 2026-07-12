import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only Vercel Cron can call this
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabase.rpc('release_expired_seat_reservations');
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ released: data });
}
