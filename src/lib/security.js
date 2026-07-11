import { supabase } from './supabase.js';

// Client-side: log security events via Supabase (anon key, public data only)
// For high-severity events, the serverless functions use the service role
export async function logSecurityEvent({ type, door, path, details }) {
  await supabase.from('security_events').insert({
    event_type: type,
    severity: HIGH_SEVERITY.includes(type) ? 'high' : 'info',
    door: door || null,
    path: path || window.location.pathname,
    details: details || null,
  });
}

const HIGH_SEVERITY = [
  'invalid_webhook_signature',
  'duplicate_payment_attempt',
  'suspicious_ip',
  'refund_flagged',
];

// Compute security score from events in last 24h (called by SecurityCenter)
export async function computeSecurityScore() {
  const since = new Date(Date.now() - 86400000).toISOString();
  const { data: events } = await supabase
    .from('security_events')
    .select('event_type')
    .gte('created_at', since);

  let score = 100;
  const counts = {};
  (events || []).forEach(e => { counts[e.event_type] = (counts[e.event_type] || 0) + 1; });

  score -= Math.min(30, (counts.auth_failed || 0) * 2);
  score -= Math.min(25, (counts.rate_limit_hit || 0));
  score -= (counts.invalid_webhook_signature || 0) * 15;
  score -= (counts.suspicious_ip || 0) * 10;
  score -= (counts.duplicate_payment_attempt || 0) * 20;

  return Math.max(0, Math.round(score));
}
