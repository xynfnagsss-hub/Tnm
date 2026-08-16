// =============================================================
// messageCreate
// Two jobs:
//   1. Route "." prefix commands (.ticket, .verify, .level, .purge role)
//   2. Grant leveling XP for eligible chat messages
// =============================================================

const { PREFIX } = require('../handlers/prefixHandler');
const { errorEmbed } = require('../utils/embeds');
const { grantXp } = require('../utils/levelManager');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    // --- XP granting (applies to all normal chat messages, including ones that
    // aren't prefix commands - a short prefix command shouldn't block XP either,
    // so we grant XP first and then separately handle command routing). ---
    grantXp(message).catch((err) => console.error('[TNM] XP grant failed:', err));

    // --- Prefix command routing ---
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command = message.client.prefixCommands.get(commandName);
    if (!command) return; // not one of our commands - ignore silently

    try {
      await command.execute(message, args);
    } catch (err) {
      console.error(`[TNM] Prefix command "${commandName}" error:`, err);
      await message.reply({ embeds: [errorEmbed('Something went wrong running that command.')] }).catch(() => {});
    }
  },
};
