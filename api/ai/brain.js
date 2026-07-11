import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const PERSONA_SYSTEMS = {
  oracle: `You are THE ORACLE — SOLVEN4's market intelligence AI. You analyze forex markets, macroeconomic conditions, geopolitical events, and trading sentiment with authority and precision. You provide structured educational market analysis, never investment advice. Format responses with clear sections. Always end with: "⚠️ Educational analysis only. Trading carries significant risk."`,

  strategist: `You are THE STRATEGIST — SOLVEN4's IB network and growth AI. You specialize in IB network expansion, referral strategies, commission tier optimization, and building a book of business as an introducing broker. Think in leverage, compounding networks, and systems. Give specific action plans with timelines.`,

  operator: `You are THE OPERATOR — SOLVEN4's business automation AI. You specialize in workflow design, CRM optimization, content calendar systems, WhatsApp/Telegram automation, and converting manual processes into scalable machines. Give concrete, implementable systems — not theory.`,

  signal: `You are THE SIGNAL — SOLVEN4's trading execution AI. You specialize in trade setup analysis, risk management, position sizing, entry/exit strategies, and trading psychology. Review setups and give direct, structured feedback in numbered points. Never recommend specific trades as investment advice. Always include position sizing math when relevant.`,
};

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

  const { personaId, messages, userId } = req.body;
  const system = PERSONA_SYSTEMS[personaId];
  if (!system) return res.status(400).json({ error: 'Invalid persona' });

  const identifier = userId || req.headers['x-forwarded-for'] || 'anon';
  const supabase = getSupabase();

  // Simple rate limit via DB (no Redis dependency in dev)
  const since = new Date(Date.now() - 60000).toISOString();
  const { count } = await supabase
    .from('ai_cost_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId || null)
    .gte('created_at', since)
    .eq('feature', `brain_${personaId}`);

  if (count >= 10) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment before sending another message.' });
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const start = Date.now();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5-20251001',
      max_tokens: 1500,
      system,
      messages: (messages || []).slice(-20).filter(m => m.role && m.content),
    });

    const text = response.content.find(b => b.type === 'text')?.text || '';
    const latency = Date.now() - start;

    // Log cost (fire-and-forget)
    const inputCost  = (response.usage.input_tokens / 1_000_000) * 3.00;
    const outputCost = (response.usage.output_tokens / 1_000_000) * 15.00;
    const totalCost  = inputCost + outputCost;

    supabase.from('ai_cost_log').insert({
      door: 'HUB',
      feature: `brain_${personaId}`,
      user_id: userId || null,
      model: 'claude-sonnet-5',
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      cost_usd: totalCost,
      latency_ms: latency,
    }).then(() => {
      // Budget alert check
      return supabase.from('ai_cost_log')
        .select('cost_usd')
        .gte('created_at', new Date(Date.now() - 86400000).toISOString());
    }).then(({ data: todayCost }) => {
      const daily = (todayCost || []).reduce((s, r) => s + Number(r.cost_usd), 0);
      if (daily > 50 && process.env.TELEGRAM_BOT_TOKEN) {
        fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID,
            text: `⚠️ AI COST ALERT\nDaily spend: $${daily.toFixed(2)}\nThreshold: $50`,
          }),
        }).catch(() => {});
      }
    }).catch(() => {});

    return res.json({ content: text, usage: response.usage });

  } catch (err) {
    console.error('Brain AI error:', err);
    return res.status(500).json({ error: 'AI service temporarily unavailable. Please try again.' });
  }
}
