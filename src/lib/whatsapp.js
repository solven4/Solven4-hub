// All Twilio calls route through /api/whatsapp/send — credentials stay server-side
async function sendViaProxy(to, body) {
  try {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, body }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('WhatsApp send failed:', err.error || res.status);
    }
  } catch (err) {
    console.error('WhatsApp send failed:', err.message);
  }
}

export async function sendWhatsAppMessage(to, body) {
  return sendViaProxy(to, body);
}

export const WA_TEMPLATES = {
  welcome: (tier) =>
    `✅ *Welcome to SOLVEN4!*\n\nYou're now a Founding *${tier}* Member with lifetime access.\n\nLogin: hub.solven4.com 🚀`,

  paymentConfirm: (tier, amount) =>
    `✅ *Payment Confirmed*\n\nTier: ${tier}\nAmount: $${amount} USD\n\nYour lifetime access is now active.`,

  launchCountdown: (days) =>
    `🚀 *SOLVEN4 LAUNCH IN ${days} DAYS*\n\nAll 5 doors open July 20. Are you ready?\n\nhub.solven4.com`,
};
