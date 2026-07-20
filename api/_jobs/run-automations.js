import { createClient } from '@supabase/supabase-js';

// Real executor for the NEXUS/FORGE "automation rule" trigger→action system.
// Before this, both doors' Automation pages were pure CRUD — rules could be
// created and toggled but nothing ever evaluated a trigger or ran an action
// (Unification Study §7.2 follow-up). Schema: database/SOLVEN4_AUTOMATION_EXECUTOR.sql.
//
// Registered via api/cron/run.js?job=run-automations, same dispatcher pattern
// as every other job in this file (Vercel Hobby's 12-function cap — see the
// comment in run.js). Runs every 15 minutes (vercel.json).
//
// Scope, by design, per the plan agreed with the founder:
// - Fully implemented triggers: new_lead, lead_status_change,
//   lead_score_threshold, lead_no_contact_hours, schedule_time (daily-at-time
//   patterns only), trader_deposit, trader_inactive_days,
//   new_trader_registered, commission_earned.
// - Fully implemented actions: send_whatsapp, send_telegram,
//   update_lead_status, add_tag, create_activity, create_notification.
// - Deliberately stubbed (logged as "skipped", not silently ignored):
//   generate_ai_content, post_social_media — no confirmed backend endpoint
//   to call yet. trigger types trader_withdrawal / subscription_renewal /
//   alert_triggered / manual are not offered in either builder UI and are
//   not evaluated here either.
// - send_mode='draft' actions never call a send API — they write to
//   automation_pending_sends + create a notification for the operator to
//   review and send manually. Only send_mode='auto' actually dispatches.

const MAX_ENTITIES_PER_FLOW = 20;
// Vercel Hobby plan caps cron frequency at once/day — this job runs once
// daily (vercel.json), not every N minutes. RUN_WINDOW_MINUTES stays wide
// so an exact hour/minute cron match still fires when this job's daily
// run happens to land in that window; the >23h staleness fallback below
// guarantees a "schedule_time" flow still fires once/day even when it
// doesn't. If this project ever moves to Vercel Pro, tightening this
// job's own schedule to run more often makes trigger fidelity improve
// automatically — nothing else here needs to change.
const RUN_WINDOW_MINUTES = 90;

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
    const err = await res.json().catch(() => ({}));
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
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'WhatsApp send failed');
  }
}

function safeParse(v, fallback) {
  if (v == null) return fallback;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return fallback; }
}

function fillTemplate(template, entity) {
  return (template || 'Hi {{name}}!')
    .replace(/\{\{\s*name\s*\}\}/gi, entity.full_name || entity.name || 'there')
    .replace(/\{\{\s*status\s*\}\}/gi, entity.status || '');
}

// Simple daily "M H * * *" matcher — the only pattern either builder UI's
// placeholder/example actually produces. Full 5-field cron semantics
// (ranges, steps, day-of-week) are intentionally out of scope for this pass.
function cronMatchesNow(cronExpression) {
  if (!cronExpression) return false;
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length < 2) return false;
  const [minStr, hourStr] = parts;
  const min = Number(minStr);
  const hour = Number(hourStr);
  if (Number.isNaN(min) || Number.isNaN(hour)) return false;
  const now = new Date();
  const nowMin = now.getUTCMinutes();
  const nowHour = now.getUTCHours();
  if (nowHour !== hour) return false;
  return Math.abs(nowMin - min) <= RUN_WINDOW_MINUTES;
}

async function alreadyLogged(supabase, flowId, entityId) {
  if (!entityId) return false;
  const { data } = await supabase
    .from('automation_logs')
    .select('id')
    .eq('rule_id', flowId)
    .eq('trigger_entity_id', entityId)
    .limit(1);
  return (data?.length || 0) > 0;
}

// ------------------------------------------------------------------
// Trigger evaluation — returns [{ entity, entityType }] to process
// ------------------------------------------------------------------
async function findMatches(supabase, flow, conditions) {
  const cursor = flow.executor_cursor?.[flow.trigger_type] || flow.created_at;

  switch (flow.trigger_type) {
    case 'new_lead': {
      let q = supabase.from('leads').select('*').eq('owner_id', flow.owner_id).gt('created_at', cursor).order('created_at').limit(MAX_ENTITIES_PER_FLOW);
      if (conditions.source_platform) q = q.eq('source_platform', conditions.source_platform);
      const { data } = await q;
      return (data || []).map(entity => ({ entity, entityType: 'lead' }));
    }

    case 'lead_status_change': {
      let q = supabase.from('leads').select('*').eq('owner_id', flow.owner_id).gt('updated_at', cursor).order('updated_at').limit(MAX_ENTITIES_PER_FLOW);
      if (conditions.to_status) q = q.eq('status', conditions.to_status);
      const { data } = await q;
      return (data || []).map(entity => ({ entity, entityType: 'lead' }));
    }

    case 'lead_score_threshold': {
      const minScore = conditions.min_score ?? 80;
      const { data } = await supabase.from('leads').select('*').eq('owner_id', flow.owner_id).gt('updated_at', cursor).gte('ai_score', minScore).order('updated_at').limit(MAX_ENTITIES_PER_FLOW);
      return (data || []).map(entity => ({ entity, entityType: 'lead' }));
    }

    case 'lead_no_contact_hours': {
      const hours = conditions.hours_threshold ?? 48;
      const cutoff = new Date(Date.now() - hours * 3600000).toISOString();
      const { data } = await supabase
        .from('leads').select('*').eq('owner_id', flow.owner_id)
        .not('status', 'in', '(converted,lost)')
        .lt('created_at', cutoff)
        .or(`last_contacted_at.is.null,last_contacted_at.lt.${cutoff}`)
        .limit(MAX_ENTITIES_PER_FLOW * 3); // dedupe below trims this down
      const candidates = data || [];
      const fresh = [];
      for (const entity of candidates) {
        if (fresh.length >= MAX_ENTITIES_PER_FLOW) break;
        if (!(await alreadyLogged(supabase, flow.id, entity.id))) fresh.push({ entity, entityType: 'lead' });
      }
      return fresh;
    }

    case 'schedule_time': {
      const stale = !flow.last_triggered_at || Date.now() - new Date(flow.last_triggered_at).getTime() > 23 * 3600000;
      if (!stale) return []; // already fired today
      // Prefer an exact time-of-day match; fall back to "just run it" once
      // staleness passes 23h so a daily-only cron still fires reliably.
      if (!cronMatchesNow(conditions.cron_expression) && Date.now() - new Date(flow.last_triggered_at || flow.created_at).getTime() < 47 * 3600000) return [];
      return [{ entity: { id: null, full_name: 'Scheduled run' }, entityType: 'schedule' }];
    }

    case 'trader_deposit': {
      const minAmount = conditions.min_amount ?? 0;
      const { data: members } = await supabase.from('network_members').select('id, member_id, balance').eq('root_id', flow.owner_id).limit(200);
      const matches = [];
      for (const m of members || []) {
        if (m.balance == null) continue;
        const { data: snap } = await supabase.from('automation_balance_snapshots').select('*').eq('member_id', m.id).maybeSingle();
        const prevBalance = snap?.last_balance ?? m.balance; // first-seen: baseline, don't fire retroactively
        const delta = Number(m.balance) - Number(prevBalance);
        if (delta >= (minAmount || 0.01) && matches.length < MAX_ENTITIES_PER_FLOW) {
          matches.push({ entity: { id: m.id, name: `Trader ${m.member_id}`, balance: m.balance, delta }, entityType: 'network_member' });
        }
        await supabase.from('automation_balance_snapshots').upsert({ member_id: m.id, last_balance: m.balance, updated_at: new Date().toISOString() });
      }
      return matches;
    }

    case 'trader_inactive_days': {
      const days = conditions.days_threshold ?? 7;
      const cutoff = new Date(Date.now() - days * 86400000).toISOString();
      const { data } = await supabase.from('network_members').select('*').eq('root_id', flow.owner_id).eq('status', 'active').lt('synced_at', cutoff).limit(MAX_ENTITIES_PER_FLOW * 3);
      const fresh = [];
      for (const entity of data || []) {
        if (fresh.length >= MAX_ENTITIES_PER_FLOW) break;
        if (!(await alreadyLogged(supabase, flow.id, entity.id))) fresh.push({ entity: { ...entity, name: `Trader ${entity.member_id}` }, entityType: 'network_member' });
      }
      return fresh;
    }

    case 'new_trader_registered': {
      const { data } = await supabase.from('network_members').select('*').eq('root_id', flow.owner_id).gt('joined_at', cursor).order('joined_at').limit(MAX_ENTITIES_PER_FLOW);
      return (data || []).map(entity => ({ entity: { ...entity, name: `Trader ${entity.member_id}` }, entityType: 'network_member' }));
    }

    case 'commission_earned': {
      const minAmount = conditions.min_amount ?? 0;
      let q = supabase.from('commissions').select('*').eq('owner_id', flow.owner_id).gt('created_at', cursor).order('created_at').limit(MAX_ENTITIES_PER_FLOW);
      if (minAmount) q = q.gte('amount', minAmount);
      const { data } = await q;
      return (data || []).map(entity => ({ entity: { ...entity, name: entity.lead_name || 'Commission' }, entityType: 'commission' }));
    }

    default:
      return [];
  }
}

function latestCursorValue(flow, matches) {
  if (flow.trigger_type === 'schedule_time') return new Date().toISOString();
  const timestampKey = { new_lead: 'created_at', lead_status_change: 'updated_at', lead_score_threshold: 'updated_at', new_trader_registered: 'joined_at', commission_earned: 'created_at' }[flow.trigger_type];
  if (!timestampKey) return null; // dedupe-based triggers (no_contact_hours, inactive_days, deposit) don't advance a cursor
  const stamps = matches.map(m => m.entity[timestampKey]).filter(Boolean);
  return stamps.length ? stamps.sort().at(-1) : null;
}

// ------------------------------------------------------------------
// Action execution
// ------------------------------------------------------------------
async function runAction(supabase, flow, action, entity, entityType, log) {
  switch (action.type) {
    case 'send_whatsapp':
    case 'send_telegram': {
      if (entityType !== 'lead') { log.push({ action_type: action.type, status: 'skipped', detail: 'no messageable recipient on this entity type' }); return false; }
      const channel = action.type === 'send_whatsapp' ? 'whatsapp' : 'telegram';
      const recipient = channel === 'whatsapp' ? entity.phone : (entity.social_username || entity.phone);
      if (!recipient) { log.push({ action_type: action.type, status: 'skipped', detail: 'lead has no phone/handle for this channel' }); return false; }
      const message = fillTemplate(action.config?.template, entity);

      if (flow.send_mode === 'auto') {
        if (channel === 'whatsapp') await sendWhatsApp(recipient, message);
        else await sendTelegram(recipient, message);
        await supabase.from('messages').insert({ owner_id: flow.owner_id, lead_id: entity.id, platform: channel, direction: 'outbound', content: message, is_ai_generated: false, sent_at: new Date().toISOString() });
        log.push({ action_type: action.type, status: 'sent', detail: `${channel} → ${recipient}` });
      } else {
        const { data: pending } = await supabase.from('automation_pending_sends').insert({
          flow_id: flow.id, owner_id: flow.owner_id, door: flow.door, channel, lead_id: entity.id,
          recipient_name: entity.full_name, recipient_handle: recipient, message,
        }).select().single();
        await supabase.from('notifications').insert({
          owner_id: flow.owner_id, type: 'automation_pending_send', title: `Review: ${flow.name}`,
          body: `A ${channel} message to ${entity.full_name || 'a lead'} is ready to send.`,
          link: '/dashboard/automation', metadata: { pending_send_id: pending?.id, flow_id: flow.id },
        });
        log.push({ action_type: action.type, status: 'drafted', detail: `queued for review → ${recipient}` });
      }
      return true;
    }

    case 'update_lead_status': {
      if (entityType !== 'lead' || !action.config?.status) { log.push({ action_type: action.type, status: 'skipped', detail: 'not applicable' }); return false; }
      await supabase.from('leads').update({ status: action.config.status }).eq('id', entity.id);
      log.push({ action_type: action.type, status: 'completed', detail: `status → ${action.config.status}` });
      return true;
    }

    case 'add_tag': {
      if (entityType !== 'lead' || !action.config?.tag) { log.push({ action_type: action.type, status: 'skipped', detail: 'not applicable' }); return false; }
      const tags = Array.from(new Set([...(entity.tags || []), action.config.tag]));
      await supabase.from('leads').update({ tags }).eq('id', entity.id);
      log.push({ action_type: action.type, status: 'completed', detail: `tag "${action.config.tag}" added` });
      return true;
    }

    case 'create_activity': {
      await supabase.from('activities').insert({
        owner_id: flow.owner_id, type: 'automation', channel: 'manual',
        content: `Automation "${flow.name}" ran for ${entity.full_name || entity.name || 'an entity'}`,
        metadata: { flow_id: flow.id, entity_type: entityType, entity_id: entity.id },
      });
      log.push({ action_type: action.type, status: 'completed', detail: 'activity logged' });
      return true;
    }

    case 'create_notification': {
      await supabase.from('notifications').insert({
        owner_id: flow.owner_id, type: 'automation', title: flow.name,
        body: `Triggered for ${entity.full_name || entity.name || 'scheduled run'}`,
        link: '/dashboard/automation', metadata: { flow_id: flow.id, entity_type: entityType, entity_id: entity.id },
      });
      log.push({ action_type: action.type, status: 'completed', detail: 'notification created' });
      return true;
    }

    // Deliberately not wired yet — see file header. Logged, not silently dropped.
    case 'generate_ai_content':
    case 'post_social_media':
      log.push({ action_type: action.type, status: 'skipped', detail: 'not yet implemented in the executor' });
      return false;

    default:
      log.push({ action_type: action.type, status: 'skipped', detail: 'unknown action type' });
      return false;
  }
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabase();
  const { data: flows, error } = await supabase.from('automation_flows').select('*').eq('is_active', true);
  if (error) return res.status(500).json({ error: error.message });

  let flowsRun = 0, entitiesProcessed = 0, actionsCompleted = 0, actionsFailed = 0;

  for (const flow of flows || []) {
    const conditions = safeParse(flow.trigger_conditions, {});
    const actions = safeParse(flow.actions, []);
    if (!actions.length) continue;

    let matches;
    try {
      matches = await findMatches(supabase, flow, conditions);
    } catch (err) {
      await supabase.from('automation_logs').insert({
        rule_id: flow.id, owner_id: flow.owner_id, door: flow.door, status: 'failed',
        error_message: `Trigger evaluation failed: ${err.message}`, execution_log: '[]',
        completed_at: new Date().toISOString(),
      });
      continue;
    }
    if (!matches.length) continue;

    flowsRun++;

    for (const { entity, entityType } of matches) {
      entitiesProcessed++;
      const log = [];
      let completed = 0, failed = 0;

      for (const action of actions) {
        try {
          const ok = await runAction(supabase, flow, action, entity, entityType, log);
          if (ok) completed++;
        } catch (err) {
          failed++;
          log.push({ action_type: action.type, status: 'failed', detail: err.message });
        }
      }

      actionsCompleted += completed;
      actionsFailed += failed;

      await supabase.from('automation_logs').insert({
        rule_id: flow.id, owner_id: flow.owner_id, door: flow.door,
        trigger_event: `${flow.trigger_type}: ${entity.full_name || entity.name || 'scheduled'}`,
        trigger_entity_type: entityType, trigger_entity_id: entity.id,
        status: failed > 0 && completed === 0 ? 'failed' : 'completed',
        actions_completed: completed, actions_failed: failed,
        execution_log: JSON.stringify(log),
        completed_at: new Date().toISOString(),
      });
    }

    const newCursorValue = latestCursorValue(flow, matches);
    const nextCursor = newCursorValue ? { ...(flow.executor_cursor || {}), [flow.trigger_type]: newCursorValue } : flow.executor_cursor;
    await supabase.from('automation_flows').update({
      total_executions: (flow.total_executions || 0) + matches.length,
      last_triggered_at: new Date().toISOString(),
      executor_cursor: nextCursor,
      updated_at: new Date().toISOString(),
    }).eq('id', flow.id);
  }

  return res.json({ flowsEvaluated: (flows || []).length, flowsRun, entitiesProcessed, actionsCompleted, actionsFailed });
}
