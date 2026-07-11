import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from('founding_seat_inventory')
    .select('tier, total_seats, seats_reserved, seats_confirmed')
    .order('tier');

  if (error) return res.status(500).json({ error: error.message });

  const inventory = (data || []).map(row => ({
    tier: row.tier,
    total: row.total_seats,
    confirmed: row.seats_confirmed,
    reserved: row.seats_reserved,
    available: row.total_seats - row.seats_confirmed - row.seats_reserved,
  }));

  return res.json(inventory);
}
