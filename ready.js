// =============================================================
// ready - fires once when the bot logs in
// Sets the TNM presence and confirms the bot is online.
// =============================================================

const { ActivityType } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[TNM] Logged in as ${client.user.tag}`);

    client.user.setPresence({
      activities: [{ name: config.brand.presence, type: ActivityType.Watching }],
      status: 'online',
    });

    console.log('[TNM] Presence set. TNM is online and Trust No Mob is in effect.');
  },
};
