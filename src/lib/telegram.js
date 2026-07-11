const TG_API = () => `https://api.telegram.org/bot${import.meta.env.VITE_TELEGRAM_BOT_TOKEN}`;

const DOOR_BUNDLES = {
  EDGE:   ['EDGE'],
  FORGE:  ['EDGE', 'FORGE'],
  ORACLE: ['EDGE', 'FORGE', 'ORACLE'],
  NEXUS:  ['EDGE', 'FORGE', 'ORACLE', 'NEXUS'],
};

export async function sendTelegramMessage(chatId, text, parseMode = 'HTML') {
  try {
    await fetch(`${TG_API()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode, disable_web_page_preview: true }),
    });
  } catch (err) {
    console.error('Telegram send failed:', err.message);
  }
}

export const sendTelegramAlert = (text) =>
  sendTelegramMessage(import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID, text);

export async function sendTelegramWelcome(chatId, tier) {
  const doors = DOOR_BUNDLES[tier] || [tier];
  await sendTelegramMessage(chatId,
    `🎉 <b>Welcome to SOLVEN4, Founding ${tier} Member!</b>\n\n` +
    `Your lifetime access is now active.\n\n` +
    `<b>Doors unlocked:</b> ${doors.join(' · ')}\n\n` +
    `🔗 Login: hub.solven4.com\n\n` +
    `You're part of the most exclusive community in professional trading. 🚀`
  );
}

export async function broadcastToChannel(channelId, text, parseMode = 'HTML') {
  return sendTelegramMessage(channelId, text, parseMode);
}
