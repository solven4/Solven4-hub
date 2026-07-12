// Shared server guard — CORS allowlist, AI rate limiting, cost logging + governor.
// Replicated byte-for-byte across all SOLVEN4 apps' api/_lib/. Keep in sync.

const ALLOWED_ORIGINS = [
  'https://solven4-hub.vercel.app',
  'https://solven4-edge-six.vercel.app',
  'https://solven4-forge-pi.vercel.app',
  'https://solven4-oracle-eight.vercel.app',
  'https://solven4-nexus-self.vercel.app',
  'https://solven4-cockpit.vercel.app',
];

// Anthropic pricing per 1M tokens (claude-sonnet-5 tier). Adjust if model changes.
const PRICING = {
  'claude-sonnet-5':          { in: 3.0,  out: 15.0 },
  'claude-opus-4-8':          { in: 15.0, out: 75.0 },
  'claude-haiku-4-5-20251001':{ in: 0.8,  out: 4.0 },
  default:                    { in: 3.0,  out: 15.0 },
};

// Apply CORS. In production restrict to known SOLVEN4 origins; allow localhost in dev.
export function applyCors(req, res, methods = 'GET, POST, OPTIONS') {
  const origin = req.headers?.origin || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin);
  res.setHeader('Access-Control-Allow-Origin', isAllowed ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Per-user daily rate limit. Returns { allowed, used, limit }.
// limit = Infinity means unlimited (still counts usage).
export async function checkRateLimit(supabase, { userId, door, feature, limit }) {
  if (!userId) return { allowed: true, used: 0, limit }; // anonymous: skip (endpoint may still gate)
  try {
    const { data, error } = await supabase.rpc('increment_ai_usage', {
      p_user_id: userId, p_door: door || null, p_feature: feature,
    });
    if (error) return { allowed: true, used: 0, limit }; // fail-open on infra error
    const used = data ?? 0;
    const allowed = limit === Infinity || used <= limit;
    return { allowed, used, limit };
  } catch {
    return { allowed: true, used: 0, limit };
  }
}

// Is the platform-wide AI budget exceeded? (cost governor)
export async function isAiThrottled(supabase) {
  try {
    const { data } = await supabase.from('platform_config').select('value').eq('key', 'ai_budget').maybeSingle();
    const budget = data?.value || {};
    if (budget.throttled === true) return true;
    const dailyCap = Number(budget.daily_usd || 25);
    const since = new Date(); since.setUTCHours(0, 0, 0, 0);
    const { data: rows } = await supabase.from('ai_cost_log').select('cost_usd').gte('created_at', since.toISOString());
    const spent = (rows || []).reduce((s, r) => s + Number(r.cost_usd || 0), 0);
    return spent >= dailyCap;
  } catch {
    return false; // fail-open
  }
}

// Log an AI call's cost. Fire-and-forget.
export async function logAiCost(supabase, { userId, door, feature, model, inputTokens = 0, outputTokens = 0 }) {
  try {
    const p = PRICING[model] || PRICING.default;
    const cost = (inputTokens / 1e6) * p.in + (outputTokens / 1e6) * p.out;
    await supabase.from('ai_cost_log').insert({
      user_id: userId || null, door: door || null, feature: feature || null,
      model: model || 'unknown', input_tokens: inputTokens, output_tokens: outputTokens,
      cost_usd: Number(cost.toFixed(6)),
    });
  } catch { /* never block on cost logging */ }
}

export const THROTTLE_MESSAGE =
  'AI features are temporarily paused (daily capacity reached). Please try again later.';
