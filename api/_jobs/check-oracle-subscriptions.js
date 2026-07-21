import { createClient } from '@supabase/supabase-js';

// Safety net for ORACLE Brain recurring subscriptions — if a Dodo renewal
// webhook is ever missed (network blip, Dodo retry exhaustion, etc.), this
// catches any subscription whose current_period_end has already passed
// without having been renewed, and downgrades it back to the free 'signal'
// tier. Mirrors release-expired.js's role for founding-member seat holds.

function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: expired, error } = await supabase
    .from('oracle_subscriptions')
    .select('id, user_id, tier, current_period_end')
    .in('status', ['active', 'past_due'])
    .lt('current_period_end', now);

  if (error) return res.status(500).json({ error: error.message });
  if (!expired?.length) return res.json({ downgraded: 0 });

  let downgraded = 0;
  for (const sub of expired) {
    await supabase.from('oracle_subscriptions')
      .update({ status: 'expired', updated_at: now })
      .eq('id', sub.id);
    await supabase.from('profiles')
      .update({ oracle_tier: 'signal', plan: 'signal', updated_at: now })
      .eq('id', sub.user_id);
    await supabase.from('activities').insert({
      user_id: sub.user_id, activity_type: 'oracle_tier_downgraded',
      metadata: { to: 'signal', reason: 'subscription_expired_no_renewal_webhook', from_tier: sub.tier },
    }).catch(() => {});
    downgraded++;
  }

  return res.json({ downgraded });
}
