import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// Cron: 0 7 * * * — generates daily market briefing and broadcasts to Telegram + social_queue
function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function fetchMarketSnapshot() {
  const results = {};

  // BTC + ETH prices (free via CoinGecko)
  try {
    const cg = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
    ).then(r => r.json());
    results.crypto = {
      BTC: { price: cg?.bitcoin?.usd, change24h: cg?.bitcoin?.usd_24h_change?.toFixed(2) },
      ETH: { price: cg?.ethereum?.usd, change24h: cg?.ethereum?.usd_24h_change?.toFixed(2) },
    };
  } catch { results.crypto = null; }

  // FRED — latest Fed Funds Rate (free)
  try {
    const fredApiKey = process.env.FRED_API_KEY;
    if (fredApiKey) {
      const fed = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&limit=1&sort_order=desc&api_key=${fredApiKey}&file_type=json`
      ).then(r => r.json());
      results.fedRate = fed?.observations?.[0]?.value;
    }
  } catch { results.fedRate = null; }

  // Twelve Data live forex — EUR/USD, GBP/USD, Gold (XAU/USD)
  try {
    const tdKey = process.env.TWELVE_DATA_API_KEY;
    if (tdKey) {
      const td = await fetch(
        `https://api.twelvedata.com/price?symbol=EUR/USD,GBP/USD,XAU/USD&apikey=${tdKey}`
      ).then(r => r.json());
      results.forex = td;
    }
  } catch { results.forex = null; }

  return results;
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabase();

  // Check idempotency — don't generate twice in the same UTC day
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const { data: existing } = await supabase
    .from('market_briefs')
    .select('id')
    .gte('created_at', todayStart.toISOString())
    .eq('brief_type', 'daily')
    .single();

  if (existing) {
    return res.json({ skipped: true, reason: 'Already generated today' });
  }

  const snapshot = await fetchMarketSnapshot();

  const contextParts = [];
  if (snapshot.crypto?.BTC) {
    contextParts.push(`BTC: $${snapshot.crypto.BTC.price?.toLocaleString()} (${snapshot.crypto.BTC.change24h}% 24h)`);
  }
  if (snapshot.crypto?.ETH) {
    contextParts.push(`ETH: $${snapshot.crypto.ETH.price?.toLocaleString()} (${snapshot.crypto.ETH.change24h}% 24h)`);
  }
  if (snapshot.fedRate) contextParts.push(`Fed Funds Rate: ${snapshot.fedRate}%`);
  if (snapshot.forex?.['EUR/USD']?.price) contextParts.push(`EUR/USD: ${snapshot.forex['EUR/USD'].price}`);
  if (snapshot.forex?.['XAU/USD']?.price) contextParts.push(`Gold: $${snapshot.forex['XAU/USD'].price}`);

  const marketContext = contextParts.length
    ? `Current market snapshot:\n${contextParts.join('\n')}`
    : 'Market data unavailable — generate based on general knowledge.';

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5-20251001',
      max_tokens: 800,
      system: `You are THE ORACLE — SOLVEN4's daily market intelligence AI. Generate a concise, high-signal daily briefing for professional traders and introducing brokers.

Format EXACTLY as:
📊 SOLVEN4 ORACLE — DAILY BRIEF
[DATE]

🔑 KEY LEVELS TO WATCH
• [2-3 key price levels / zones across major pairs or assets]

📰 MACRO CONTEXT
• [2-3 bullet points on macro events driving markets today]

💡 ORACLE INSIGHT
[1-2 sentence trading education insight — what pattern, theme, or concept applies today]

⚠️ This is educational market analysis, not financial advice. Trading carries significant risk.

Keep the full message under 280 words. Use clean formatting — Telegram renders HTML.`,
      messages: [{
        role: 'user',
        content: `Generate the daily briefing for ${dateStr}.\n\n${marketContext}`,
      }],
    });

    const brief = response.content.find(b => b.type === 'text')?.text || '';

    // Store in market_briefs
    await supabase.from('market_briefs').insert({
      brief_type: 'daily',
      content: brief,
      market_data: snapshot,
      model: 'claude-sonnet-5',
      created_at: new Date().toISOString(),
    });

    // Queue for Telegram channel broadcast
    const channelId = process.env.VITE_TELEGRAM_LAUNCH_CHANNEL_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (channelId) {
      await supabase.from('social_queue').insert({
        platform: 'telegram',
        channel_id: channelId,
        content: brief,
        status: 'queued',
        scheduled_for: new Date().toISOString(),
        source: 'oracle_daily_briefing',
      });
    }

    // Log AI cost
    const cost = (response.usage.input_tokens / 1_000_000 * 3) + (response.usage.output_tokens / 1_000_000 * 15);
    supabase.from('ai_cost_log').insert({
      door: 'HUB',
      feature: 'daily_briefing_cron',
      model: 'claude-sonnet-5',
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      cost_usd: cost,
    }).catch(() => {});

    return res.json({ success: true, briefLength: brief.length, queued: !!channelId });

  } catch (err) {
    console.error('Daily briefing error:', err);
    return res.status(500).json({ error: err.message });
  }
}
