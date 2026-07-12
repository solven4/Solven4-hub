// All Telegram calls route through /api/telegram/send — bot token stays server-side
async function sendViaProxy(chatId, text, parseMode = 'HTML') {
  try {
    await fetch('/api/telegram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, text, parseMode }),
    });
  } catch (err) {
    console.error('Telegram send failed:', err.message);
  }
}

const DOOR_BUNDLES = {
  EDGE:   ['EDGE'],
  FORGE:  ['EDGE', 'FORGE'],
  ORACLE: ['EDGE', 'FORGE', 'ORACLE'],
  NEXUS:  ['EDGE', 'FORGE', 'ORACLE', 'NEXUS'],
};

export async function sendTelegramMessage(chatId, text, parseMode = 'HTML') {
  return sendViaProxy(chatId, text, parseMode);
}

export const sendTelegramAlert = (text) => {
  const adminChatId = import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID;
  return sendViaProxy(adminChatId, text);
};

export async function sendTelegramWelcome(chatId, tier) {
  const doors = DOOR_BUNDLES[tier] || [tier];
  await sendViaProxy(chatId,
    `🎉 <b>Welcome to SOLVEN4, Founding ${tier} Member!</b>\n\n` +
    `Your lifetime access is now active.\n\n` +
    `<b>Doors unlocked:</b> ${doors.join(' · ')}\n\n` +
    `🔗 Login: hub.solven4.com\n\n` +
    `You're part of the most exclusive community in professional trading. 🚀`
  );
}

export async function broadcastToChannel(channelId, text, parseMode = 'HTML') {
  return sendViaProxy(channelId, text, parseMode);
}
