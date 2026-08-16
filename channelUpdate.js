// =============================================================
// channelUpdate - logs channel renames, topic, and permission changes
// =============================================================

const { log } = require('../utils/logger');

module.exports = {
  name: 'channelUpdate',
  async execute(oldChannel, newChannel) {
    if (!newChannel.guild) return;

    const changes = [];

    if (oldChannel.name !== newChannel.name) {
      changes.push(`**Name:** \`${oldChannel.name}\` → \`${newChannel.name}\``);
    }
    if (oldChannel.topic !== newChannel.topic && 'topic' in newChannel) {
      changes.push(`**Topic changed**`);
    }
    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser && 'rateLimitPerUser' in newChannel) {
      changes.push(`**Slowmode:** \`${oldChannel.rateLimitPerUser ?? 0}s\` → \`${newChannel.rateLimitPerUser ?? 0}s\``);
    }

    if (changes.length === 0) return; // permission-overwrite-only updates fire this event too; nothing textual changed

    await log(newChannel.client, 'Channels', '🔧 Channel Updated', `${newChannel} was updated.\n\n${changes.join('\n')}`);
  },
};
