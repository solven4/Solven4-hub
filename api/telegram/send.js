// POST { chatId, text, parseMode? } — server-side Telegram proxy (keeps BOT_TOKEN off browser)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { chatId, text, parseMode = 'HTML' } = req.body || {};
  if (!chatId || !text) return res.status(400).json({ error: 'chatId and text required' });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return res.status(503).json({ error: 'Telegram not configured' });

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.description || 'Telegram error' });
    return res.json({ success: true, messageId: data.result?.message_id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
