// =============================================================
// messageDelete - logs deleted messages to the log channel
// =============================================================

const { log } = require('../utils/logger');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    // Partial messages (not cached) won't have full content - log what we can.
    const content = message.content || '*(content unavailable - message was not cached)*';

    await log(
      message.client,
      'Messages',
      '🗑️ Message Deleted',
      `A message by ${message.author ?? 'Unknown User'} was deleted in ${message.channel}.`,
      [{ name: 'Content', value: content.slice(0, 1000) || 'N/A' }]
    );
  },
};
