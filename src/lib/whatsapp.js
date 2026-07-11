export async function sendWhatsAppMessage(to, body) {
  const formattedTo   = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const formattedFrom = `whatsapp:${import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER}`;
  const sid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;

  const credentials = btoa(`${sid}:${import.meta.env.VITE_TWILIO_AUTH_TOKEN}`);

  try {
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: formattedTo, From: formattedFrom, Body: body }).toString(),
    });
  } catch (err) {
    console.error('WhatsApp send failed:', err.message);
  }
}

export const WA_TEMPLATES = {
  welcome: (tier) =>
    `✅ *Welcome to SOLVEN4!*\n\nYou're now a Founding *${tier}* Member with lifetime access.\n\nLogin: hub.solven4.com 🚀`,

  paymentConfirm: (tier, amount) =>
    `✅ *Payment Confirmed*\n\nTier: ${tier}\nAmount: $${amount} USD\n\nYour lifetime access is now active.`,

  launchCountdown: (days) =>
    `🚀 *SOLVEN4 LAUNCH IN ${days} DAYS*\n\nAll 5 doors open July 20. Are you ready?\n\nhub.solven4.com`,
};
