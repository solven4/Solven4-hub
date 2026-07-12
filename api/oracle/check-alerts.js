import { createClient } from '@supabase/supabase-js';

// Cron: */5 * * * * — checks oracle_alerts vs live prices, fires Telegram + email
function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getLivePrices(symbols) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    // CoinGecko is free for BTC/ETH — use as fallback
    const cgSyms = symbols.filter(s => ['BTC', 'ETH'].includes(s));
    if (!cgSyms.length) return {};
    const cgRes = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`
    );
    const cg = await cgRes.json();
    return {
      BTC: { price: cg?.bitcoin?.usd },
      ETH: { price: cg?.ethereum?.usd },
    };
  }

  const symsStr = symbols.join(',');
  const tdRes = await fetch(
    `https://api.twelvedata.com/price?symbol=${symsStr}&apikey=${apiKey}`
  );
  const data = await tdRes.json();

  // Twelve Data returns single object for one symbol, object map for many
  if (symbols.length === 1) {
    return { [symbols[0]]: { price: Number(data.price) } };
  }
  const result = {};
  for (const [sym, val] of Object.entries(data)) {
    if (val?.price) result[sym] = { price: Number(val.price) };
  }
  return result;
}

async function sendTelegramDM(userId, supabase, message) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  // Look up user's telegram chat_id from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('telegram_chat_id, telegram_username')
    .eq('id', userId)
    .single();

  const chatId = profile?.telegram_chat_id;
  if (!chatId) return;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  }).catch(() => {});
}

async function sendEmail(to, template, data) {
  const hubUrl = process.env.VITE_HUB_URL || 'https://hub.solven4.com';
  await fetch(`${hubUrl}/api/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CRON_SECRET}` },
    body: JSON.stringify({ to, template, data }),
  }).catch(() => {});
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabase();

  // Fetch all active, non-triggered alerts
  const { data: alerts, error } = await supabase
    .from('oracle_alerts')
    .select('*, profiles(email, full_name, telegram_chat_id)')
    .eq('triggered', false)
    .eq('active', true)
    .limit(100);

  if (error) return res.status(500).json({ error: error.message });
  if (!alerts?.length) return res.json({ checked: 0, triggered: 0 });

  // Collect unique symbols
  const symbols = [...new Set(alerts.map(a => a.symbol?.toUpperCase()).filter(Boolean))];
  const prices = await getLivePrices(symbols);

  let triggered = 0;
  const results = await Promise.allSettled(
    alerts.map(async (alert) => {
      const sym = alert.symbol?.toUpperCase();
      const livePrice = prices[sym]?.price;
      if (livePrice == null) return;

      const target = Number(alert.target_price);
      const shouldTrigger =
        (alert.direction === 'above' && livePrice >= target) ||
        (alert.direction === 'below' && livePrice <= target);

      if (!shouldTrigger) return;

      // Mark triggered
      await supabase.from('oracle_alerts').update({
        triggered: true,
        triggered_at: new Date().toISOString(),
        triggered_price: livePrice,
      }).eq('id', alert.id);

      const dirLabel = alert.direction === 'above' ? '🟢 rose above' : '🔴 fell below';
      const msg = `⚡ <b>PRICE ALERT</b>\n\n<b>${sym}</b> ${dirLabel} <b>$${target.toLocaleString()}</b>\n\nCurrent: <b>$${livePrice.toLocaleString()}</b>\n\n📊 <a href="https://oracle.solven4.com/tools">View on ORACLE</a>`;

      const email = alert.profiles?.email;
      const name = alert.profiles?.full_name;

      // Fire Telegram DM
      await sendTelegramDM(alert.user_id, supabase, msg);

      // Fire email fallback
      if (email) {
        await sendEmail(email, 'price_alert', {
          name,
          symbol: sym,
          direction: alert.direction === 'above' ? 'rose above' : 'fell below',
          price: livePrice.toLocaleString(),
          target: target.toLocaleString(),
        });
      }

      triggered++;
    })
  );

  return res.json({ checked: alerts.length, triggered, symbols });
}
