import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = getSupabase();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('social_queue')
      .select('*')
      .order('scheduled_for')
      .limit(100);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { platform, channelId, content, scheduledFor, createdBy } = req.body;

    if (!['telegram', 'whatsapp'].includes(platform)) {
      return res.status(400).json({ error: 'Platform must be telegram or whatsapp' });
    }
    if (!content || !scheduledFor) {
      return res.status(400).json({ error: 'content and scheduledFor are required' });
    }

    const { data, error } = await supabase.from('social_queue').insert({
      platform,
      channel_id: channelId,
      content,
      scheduled_for: scheduledFor,
      created_by: createdBy || null,
    }).select().single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ queued: true, id: data.id });
  }

  return res.status(405).end();
}
