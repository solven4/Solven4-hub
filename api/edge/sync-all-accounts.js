import { createClient } from '@supabase/supabase-js';

// Cron: */30 * * * * — syncs all active MT5 connections via MetaAPI
// MetaAPI docs: https://metaapi.cloud/docs/client/
const META_API_BASE = 'https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai';

function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function syncAccount(conn, metaToken) {
  const accountId = conn.metaapi_account_id;
  if (!accountId) return { skipped: true, reason: 'no metaapi_account_id' };

  const headers = {
    'auth-token': metaToken,
    'Content-Type': 'application/json',
  };

  // Get account info (balance, equity)
  const infoRes = await fetch(`${META_API_BASE}/users/current/accounts/${accountId}/account-information`, { headers });
  if (!infoRes.ok) {
    const err = await infoRes.json();
    return { error: err.message || `MetaAPI ${infoRes.status}` };
  }
  const info = await infoRes.json();

  // Get open positions
  const posRes = await fetch(`${META_API_BASE}/users/current/accounts/${accountId}/positions`, { headers });
  const positions = posRes.ok ? await posRes.json() : [];

  // Get recent history (last 24h)
  const since = new Date(Date.now() - 86400000).toISOString();
  const histRes = await fetch(
    `${META_API_BASE}/users/current/accounts/${accountId}/history-deals/time/${since}/${new Date().toISOString()}`,
    { headers }
  );
  const history = histRes.ok ? await histRes.json() : [];

  return {
    balance: info.balance,
    equity: info.equity,
    margin: info.margin,
    freeMargin: info.freeMargin,
    marginLevel: info.marginLevel,
    openPositions: positions.length,
    dealsToday: history.length,
    positions,
    history,
  };
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const metaToken = process.env.METAAPI_TOKEN;
  if (!metaToken) {
    return res.json({ skipped: true, reason: 'METAAPI_TOKEN not configured' });
  }

  const supabase = getSupabase();

  // Get all active MT5 connections
  const { data: connections, error } = await supabase
    .from('mt5_connections')
    .select('*')
    .eq('status', 'connected')
    .not('metaapi_account_id', 'is', null);

  if (error) return res.status(500).json({ error: error.message });
  if (!connections?.length) return res.json({ synced: 0, message: 'No active connections' });

  let synced = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    connections.map(async (conn) => {
      try {
        const data = await syncAccount(conn, metaToken);
        if (data.error || data.skipped) { failed++; return; }

        // Update connection with latest balance/equity
        await supabase.from('mt5_connections').update({
          balance: data.balance,
          equity: data.equity,
          margin: data.margin,
          free_margin: data.freeMargin,
          margin_level: data.marginLevel,
          last_synced_at: new Date().toISOString(),
          open_positions_count: data.openPositions,
        }).eq('id', conn.id);

        // Insert today's history deals as trades (avoid duplicates by deal_id)
        if (data.history?.length) {
          const trades = data.history
            .filter(d => d.type === 'DEAL_TYPE_BUY' || d.type === 'DEAL_TYPE_SELL')
            .map(d => ({
              user_id: conn.user_id,
              mt5_connection_id: conn.id,
              deal_id: d.id,
              symbol: d.symbol,
              type: d.type === 'DEAL_TYPE_BUY' ? 'buy' : 'sell',
              volume: d.volume,
              entry_price: d.price,
              profit: d.profit,
              commission: d.commission,
              swap: d.swap,
              opened_at: d.time,
              source: 'metaapi_sync',
            }));

          if (trades.length) {
            await supabase.from('trades')
              .upsert(trades, { onConflict: 'deal_id', ignoreDuplicates: true });
          }
        }

        synced++;
      } catch (err) {
        console.error(`Sync failed for connection ${conn.id}:`, err.message);
        await supabase.from('mt5_connections').update({
          sync_error: err.message,
          last_sync_attempt_at: new Date().toISOString(),
        }).eq('id', conn.id);
        failed++;
      }
    })
  );

  return res.json({ synced, failed, total: connections.length });
}
