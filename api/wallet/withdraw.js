import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '../_lib/guard.js';

// Real withdrawal request creation — replaces TheVault.jsx's simulated
// blockchain confirmation flow. A real user withdrawal is never fully
// automated here: this writes a genuine 'pending' wallet_transactions row
// against the user's actual available balance and alerts founders via
// Telegram, for review/payout through Cockpit's Finance Center (already a
// real, working admin workflow — see solven4_cockpit FinancialCenter.jsx).
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

async function sendTelegramAlert(text) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_ADMIN_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID, text, parse_mode: 'HTML' }),
  }).catch(console.error);
}

const MIN_WITHDRAWAL_USD = 20;

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = getSupabase();
  const userId = await verifyAuth(req, supabase);
  if (!userId) return res.status(401).json({ error: 'Unauthorized — valid session required' });

  const { amount, destination, network } = req.body || {};
  const amountUsd = Number(amount);

  if (!amountUsd || amountUsd < MIN_WITHDRAWAL_USD) return res.status(400).json({ error: `Minimum withdrawal is $${MIN_WITHDRAWAL_USD}` });
  if (!destination) return res.status(400).json({ error: 'destination address required' });

  try {
    // Real available-balance check — sum completed credits minus completed/pending debits.
    const { data: txs, error: txErr } = await supabase
      .from('wallet_transactions').select('type, amount, status').eq('user_id', userId);
    if (txErr) throw txErr;

    const CREDIT_TYPES = new Set(['commission', 'deposit', 'refund', 'referral', 'copy_trade', 'xp_bonus', 'arena_prize']);
    const balance = (txs || []).reduce((sum, tx) => {
      if (tx.status !== 'completed' && tx.status !== 'pending') return sum;
      const signed = CREDIT_TYPES.has(tx.type) ? Number(tx.amount) : -Number(tx.amount);
      return sum + signed;
    }, 0);

    if (amountUsd > balance) {
      return res.status(400).json({ error: `Insufficient balance. Available: $${balance.toFixed(2)}` });
    }

    const { data: txRow, error: insErr } = await supabase.from('wallet_transactions').insert({
      user_id: userId, type: 'withdrawal', amount: amountUsd, currency: 'USD', status: 'pending',
      description: `Withdrawal request — ${network || 'crypto'} to ${destination.slice(0, 10)}...`,
      reference_type: 'wallet_withdrawal', door: 'HUB',
      metadata: { destination, network },
    }).select('id').single();
    if (insErr) throw insErr;

    await sendTelegramAlert(`💸 <b>WITHDRAWAL REQUEST</b>\nUser: ${userId}\nAmount: $${amountUsd}\nDestination: ${destination}\nTx: ${txRow.id}\n\nReview in Cockpit → Finance Center.`);

    return res.status(200).json({ success: true, transactionId: txRow.id, status: 'pending' });
  } catch (err) {
    console.error('[wallet/withdraw] failed:', err);
    return res.status(500).json({ error: err.message });
  }
}
