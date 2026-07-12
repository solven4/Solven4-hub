import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// Cron: 0 20 * * 0 (Sunday 20:00 UTC) — personalized weekly performance report per user
function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function sendTelegram(chatId, text) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) return;
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  }).catch(() => {});
}

async function generateUserReport(userId, supabase, anthropic) {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  // Gather user data from all doors
  const [tradesRes, referralsRes, profileRes] = await Promise.all([
    supabase.from('trades').select('symbol,type,profit,volume,opened_at').eq('user_id', userId).gte('opened_at', weekAgo),
    supabase.from('referrals').select('status,commission_usd,tier_purchased').eq('referrer_user_id', userId).gte('created_at', weekAgo),
    supabase.from('profiles').select('full_name,xp_points,rank,telegram_chat_id,plan').eq('id', userId).single(),
  ]);

  const trades = tradesRes.data || [];
  const referrals = referralsRes.data || [];
  const profile = profileRes.data;

  if (!profile) return null;

  const totalPnL = trades.reduce((s, t) => s + Number(t.profit || 0), 0);
  const wins = trades.filter(t => Number(t.profit) > 0).length;
  const winRate = trades.length ? ((wins / trades.length) * 100).toFixed(0) : 'N/A';
  const newCommissions = referrals.reduce((s, r) => s + Number(r.commission_usd || 0), 0);
  const newReferrals = referrals.length;

  const dataContext = `
User: ${profile.full_name || 'Trader'}
Plan: ${profile.plan || 'free'} | Rank: ${profile.rank || 'rookie'} | XP: ${profile.xp_points || 0}

EDGE (Trading) — Last 7 days:
- Total trades: ${trades.length}
- Win rate: ${winRate}%
- Total P&L: $${totalPnL.toFixed(2)}
- Symbols traded: ${[...new Set(trades.map(t => t.symbol))].join(', ') || 'none'}

FORGE (IB Network) — Last 7 days:
- New referrals: ${newReferrals}
- New commissions earned: $${newCommissions.toFixed(2)}
`.trim();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5-20251001',
    max_tokens: 600,
    system: `You are SOLVEN4's weekly report AI. Generate a concise, personalized weekly performance digest.
Format:
📈 SOLVEN4 WEEKLY REPORT
[User name] | [Date range]

TRADING PERFORMANCE
[2-3 bullets with specific insights from their data]

IB NETWORK
[1-2 bullets about their referral activity]

THIS WEEK'S FOCUS
[1 specific, actionable recommendation based on their data]

Keep it under 200 words. Be direct and data-driven. Never give investment advice.`,
    messages: [{
      role: 'user',
      content: `Generate weekly report:\n\n${dataContext}`,
    }],
  });

  const report = response.content.find(b => b.type === 'text')?.text || '';

  // Log AI cost
  const cost = (response.usage.input_tokens / 1_000_000 * 3) + (response.usage.output_tokens / 1_000_000 * 15);
  supabase.from('ai_cost_log').insert({
    door: 'HUB',
    feature: 'weekly_report_cron',
    user_id: userId,
    model: 'claude-sonnet-5',
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    cost_usd: cost,
  }).catch(() => {});

  // Store report
  await supabase.from('market_briefs').insert({
    brief_type: 'weekly_user',
    user_id: userId,
    content: report,
    model: 'claude-sonnet-5',
  });

  // Send via Telegram if user has chat_id
  if (profile.telegram_chat_id) {
    await sendTelegram(profile.telegram_chat_id, report);
  }

  return { userId, sent: !!profile.telegram_chat_id };
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabase();

  // Get all active users (have logged in within last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id')
    .gte('updated_at', thirtyDaysAgo)
    .not('plan', 'eq', 'free')
    .limit(50); // Safety cap — increase as user base grows

  if (error) return res.status(500).json({ error: error.message });
  if (!users?.length) return res.json({ processed: 0, message: 'No active users' });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let processed = 0;
  let failed = 0;

  // Process in batches of 5 to avoid API rate limits
  for (let i = 0; i < users.length; i += 5) {
    const batch = users.slice(i, i + 5);
    const results = await Promise.allSettled(
      batch.map(u => generateUserReport(u.id, supabase, anthropic))
    );
    processed += results.filter(r => r.status === 'fulfilled' && r.value).length;
    failed += results.filter(r => r.status === 'rejected').length;

    // Rate limit gap between batches
    if (i + 5 < users.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return res.json({ processed, failed, total: users.length });
}
