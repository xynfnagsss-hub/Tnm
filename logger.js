// =============================================================
// TNM Logger
// Every log category (moderation, tickets, messages, members, etc.)
// goes through this one function so LOG_CHANNEL_ID is the single
// source of truth for "where do logs go".
// =============================================================

const config = require('../config');
const { baseEmbed } = require('./embeds');

/**
 * Sends a log embed to the configured log channel.
 * @param {import('discord.js').Client} client
 * @param {string} category e.g. "Moderation", "Tickets", "Messages", "Members", "Verification"
 * @param {string} title
 * @param {string} description
 * @param {Array} [fields]
 */
async function log(client, category, title, description, fields = []) {
  try {
    if (!config.logChannelId) return;
    const channel = await client.channels.fetch(config.logChannelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const embed = baseEmbed({
      title: `${title}`,
      description,
      fields,
      thumbnail: false,
    }).setAuthor({ name: `TNM Logs • ${category}` });

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('[TNM] Failed to send log:', err);
  }
}

module.exports = { log };
