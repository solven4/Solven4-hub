import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function sendTelegram(channelId, content) {
  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: channelId, text: content, parse_mode: 'HTML', disable_web_page_preview: true }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.description || 'Telegram send failed');
  }
}

async function sendWhatsApp(to, body) {
  const formattedTo   = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const formattedFrom = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
  const sid           = process.env.TWILIO_ACCOUNT_SID;
  const credentials   = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ To: formattedTo, From: formattedFrom, Body: body }).toString(),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'WhatsApp send failed');
  }
}

export default async function handler(req, res) {
  // Only Vercel Cron or admin calls
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: due, error } = await supabase
    .from('social_queue')
    .select('*')
    .eq('status', 'queued')
    .lte('scheduled_for', now)
    .limit(20);

  if (error) return res.status(500).json({ error: error.message });
  if (!due?.length) return res.json({ processed: 0 });

  const results = await Promise.allSettled(
    due.map(async (item) => {
      try {
        if (item.platform === 'telegram' && item.channel_id) {
          await sendTelegram(item.channel_id, item.content);
        } else if (item.platform === 'whatsapp' && item.channel_id) {
          await sendWhatsApp(item.channel_id, item.content);
        }
        await supabase.from('social_queue').update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        }).eq('id', item.id);
      } catch (err) {
        await supabase.from('social_queue').update({
          status: 'failed',
          error: err.message,
        }).eq('id', item.id);
        throw err;
      }
    })
  );

  const sent   = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return res.json({ processed: due.length, sent, failed });
}
