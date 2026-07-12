// POST { to, body } — server-side Twilio WhatsApp proxy (keeps AUTH_TOKEN off browser)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { to, body } = req.body || {};
  if (!to || !body) return res.status(400).json({ error: 'to and body required' });

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!sid || !token || !from) {
    return res.status(503).json({ error: 'WhatsApp not configured' });
  }

  const formattedTo   = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const formattedFrom = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;

  try {
    const r = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: formattedTo, From: formattedFrom, Body: body }).toString(),
      }
    );
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.message || 'Twilio error' });
    return res.json({ success: true, sid: data.sid });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
