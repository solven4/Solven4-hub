// Shared Resend email sender — used by payment webhooks and cron jobs.
// Degrades gracefully (no-op) when RESEND_API_KEY is not set.

const FROM = 'SOLVEN4 <noreply@solven4.com>';

const shell = (inner) => `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#03080F;color:#E2E8F0;border-radius:12px;overflow:hidden">
    ${inner}
    <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#4a5a7a">
      SOLVEN4 is a SaaS platform for trading education, IB relationship management, and professional analytics. This is not financial advice.
    </div>
  </div>`;

const TEMPLATES = {
  welcome: ({ name, tier, doors }) => ({
    subject: `Welcome to SOLVEN4 — Your ${tier} Access is Active`,
    html: shell(`
      <div style="background:linear-gradient(135deg,#6366F1,#818CF8);padding:32px;text-align:center">
        <div style="font-family:monospace;font-size:24px;font-weight:900;letter-spacing:0.18em;color:#fff">SOLVEN4</div>
      </div>
      <div style="padding:32px">
        <h1 style="font-size:22px;font-weight:800;margin-bottom:8px">Welcome, ${name || 'Founding Member'} 🎉</h1>
        <p style="color:#8899B4;margin-bottom:20px">Your <strong style="color:#D4A843">${tier}</strong> founding membership is now active.</p>
        <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:18px;margin-bottom:22px">
          <p style="margin:0 0 6px;font-size:13px">🚀 <strong>Lifetime access</strong> — no renewals, no subscriptions.</p>
          <p style="margin:0;font-size:13px;color:#8899B4">Doors unlocked: <strong style="color:#fff">${(doors || [tier]).join(' · ')}</strong></p>
        </div>
        <a href="https://solven4-hub.vercel.app/dashboard" style="display:inline-block;background:linear-gradient(135deg,#6366F1,#818CF8);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px">Enter SOLVEN4 →</a>
      </div>`),
  }),

  payment_receipt: ({ name, tier, amount, paymentId, method }) => ({
    subject: `Payment Receipt — SOLVEN4 ${tier} Founding Membership`,
    html: shell(`
      <div style="background:#0B1220;border-bottom:1px solid rgba(255,255,255,0.06);padding:24px 32px">
        <div style="font-family:monospace;font-size:18px;font-weight:900;letter-spacing:0.18em;color:#6366F1">SOLVEN4</div>
      </div>
      <div style="padding:32px">
        <h2 style="font-size:18px;font-weight:700;margin-bottom:20px">Payment Receipt</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr><td style="padding:8px 0;color:#8899B4;border-bottom:1px solid rgba(255,255,255,0.05)">Member</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05)">${name || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#8899B4;border-bottom:1px solid rgba(255,255,255,0.05)">Product</td><td style="padding:8px 0;text-align:right;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.05)">SOLVEN4 ${tier} — Founding Lifetime</td></tr>
          <tr><td style="padding:8px 0;color:#8899B4;border-bottom:1px solid rgba(255,255,255,0.05)">Amount</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#D4A843;border-bottom:1px solid rgba(255,255,255,0.05)">$${amount} USD</td></tr>
          <tr><td style="padding:8px 0;color:#8899B4;border-bottom:1px solid rgba(255,255,255,0.05)">Method</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05)">${method || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#8899B4">Payment ID</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-size:11px">${paymentId || '—'}</td></tr>
        </table>
      </div>`),
  }),

  tier_upgrade: ({ name, tier }) => ({
    subject: `Your ORACLE Brain is now ${tier}`,
    html: shell(`
      <div style="background:linear-gradient(135deg,#10B981,#059669);padding:28px;text-align:center">
        <div style="font-family:monospace;font-size:20px;font-weight:900;letter-spacing:0.18em;color:#fff">ORACLE ${tier}</div>
      </div>
      <div style="padding:32px">
        <h1 style="font-size:20px;font-weight:800;margin-bottom:8px">Upgrade complete, ${name || 'Trader'} ⚡</h1>
        <p style="color:#8899B4;margin-bottom:20px">Your ORACLE Brain tier is now <strong style="color:#10B981">${tier}</strong>. Higher daily limits and deeper memory are active immediately.</p>
        <a href="https://solven4-oracle-eight.vercel.app" style="display:inline-block;background:#10B981;color:#03080F;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px">Open ORACLE →</a>
      </div>`),
  }),
};

// Send an email. Returns { sent, id? , reason? }. Never throws.
export async function sendEmail(template, to, data = {}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: 'RESEND_API_KEY not set' };
  if (!to) return { sent: false, reason: 'no recipient' };
  const builder = TEMPLATES[template];
  if (!builder) return { sent: false, reason: `unknown template ${template}` };

  try {
    const { subject, html } = builder(data);
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: Array.isArray(to) ? to : [to], subject, html }),
    });
    const result = await r.json();
    if (!r.ok) return { sent: false, reason: result.message || 'resend error' };
    return { sent: true, id: result.id };
  } catch (err) {
    return { sent: false, reason: err.message };
  }
}
