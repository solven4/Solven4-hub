import { createClient } from '@supabase/supabase-js';

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

const EMAIL_TEMPLATES = {
  welcome: (name, tier) => ({
    subject: `Welcome to SOLVEN4 — Your ${tier} Access is Active`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#03080F;color:#E2E8F0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#6366F1,#818CF8);padding:32px;text-align:center">
          <div style="font-family:monospace;font-size:24px;font-weight:900;letter-spacing:0.18em;color:#fff">SOLVEN4</div>
          <div style="font-size:11px;letter-spacing:0.25em;color:rgba(255,255,255,0.7);margin-top:4px">NEURAL SPHERE</div>
        </div>
        <div style="padding:32px">
          <h1 style="font-size:22px;font-weight:800;margin-bottom:8px">Welcome, ${name || 'Founding Member'} 🎉</h1>
          <p style="color:#8899B4;margin-bottom:24px">Your <strong style="color:#D4A843">${tier}</strong> founding membership is now active.</p>
          <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:20px;margin-bottom:24px">
            <p style="margin:0;font-size:13px">🚀 You have <strong>lifetime access</strong> — no renewals, no subscriptions.</p>
          </div>
          <a href="https://hub.solven4.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#6366F1,#818CF8);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px">
            Enter SOLVEN4 →
          </a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#4a5a7a">
          You're receiving this because you purchased SOLVEN4 access. This is not financial advice.
        </div>
      </div>
    `,
  }),

  payment_receipt: (name, tier, amount, paymentId) => ({
    subject: `Payment Receipt — SOLVEN4 ${tier} Founding Membership`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#03080F;color:#E2E8F0;border-radius:12px;overflow:hidden">
        <div style="background:#0B1220;border-bottom:1px solid rgba(255,255,255,0.06);padding:24px 32px">
          <div style="font-family:monospace;font-size:18px;font-weight:900;letter-spacing:0.18em;color:#6366F1">SOLVEN4</div>
        </div>
        <div style="padding:32px">
          <h2 style="font-size:18px;font-weight:700;margin-bottom:20px">Payment Receipt</h2>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <tr><td style="padding:8px 0;color:#8899B4;border-bottom:1px solid rgba(255,255,255,0.05)">Product</td><td style="padding:8px 0;text-align:right;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.05)">SOLVEN4 ${tier} — Founding Lifetime</td></tr>
            <tr><td style="padding:8px 0;color:#8899B4;border-bottom:1px solid rgba(255,255,255,0.05)">Amount</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#D4A843;border-bottom:1px solid rgba(255,255,255,0.05)">$${amount} USD</td></tr>
            <tr><td style="padding:8px 0;color:#8899B4">Payment ID</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-size:11px">${paymentId}</td></tr>
          </table>
        </div>
        <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#4a5a7a">
          This is an automated receipt. SOLVEN4 is a SaaS platform for trading education and analytics.
        </div>
      </div>
    `,
  }),

  price_alert: (name, symbol, direction, price, target) => ({
    subject: `⚡ SOLVEN4 Price Alert: ${symbol} ${direction} $${target}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#03080F;color:#E2E8F0;border-radius:12px;overflow:hidden">
        <div style="background:rgba(16,185,129,0.1);border-bottom:1px solid rgba(16,185,129,0.2);padding:20px 32px;display:flex;align-items:center;gap:12px">
          <div style="font-size:28px">⚡</div>
          <div>
            <div style="font-family:monospace;font-size:11px;color:#10B981;letter-spacing:0.15em">PRICE ALERT TRIGGERED</div>
            <div style="font-size:20px;font-weight:800;color:#fff">${symbol}</div>
          </div>
        </div>
        <div style="padding:32px">
          <p style="font-size:15px;margin-bottom:16px">Hi ${name || 'Trader'},</p>
          <p style="color:#8899B4;margin-bottom:20px">Your alert for <strong style="color:#fff">${symbol}</strong> has been triggered.</p>
          <div style="background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:20px;text-align:center">
            <div style="font-size:12px;color:#8899B4;margin-bottom:4px">Current Price</div>
            <div style="font-size:28px;font-weight:800;color:#10B981">$${price}</div>
            <div style="font-size:12px;color:#8899B4;margin-top:8px">Alert: ${direction} $${target}</div>
          </div>
        </div>
        <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#4a5a7a">
          This is an educational alert, not financial advice. Trading carries significant risk.
        </div>
      </div>
    `,
  }),
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — email skipped');
    return res.json({ sent: false, reason: 'Email not configured' });
  }

  const { to, template, data = {} } = req.body;
  if (!to || !template) return res.status(400).json({ error: 'to and template required' });

  const builder = EMAIL_TEMPLATES[template];
  if (!builder) return res.status(400).json({ error: `Unknown template: ${template}` });

  const { subject, html } = builder(
    data.name,
    data.tier,
    data.amount,
    data.paymentId,
    data.symbol,
    data.direction,
    data.price,
    data.target
  );

  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SOLVEN4 <noreply@solven4.com>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const result = await emailRes.json();
    if (!emailRes.ok) throw new Error(result.message || 'Resend error');

    // Log to security_events for audit
    const supabase = getSupabase();
    supabase.from('security_events').insert({
      event_type: 'email_sent',
      severity: 'info',
      door: 'HUB',
      details: { template, to, emailId: result.id },
    }).catch(() => {});

    return res.json({ sent: true, id: result.id });

  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Email temporarily unavailable' });
  }
}
