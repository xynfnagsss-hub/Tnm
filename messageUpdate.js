// =============================================================
// messageUpdate - logs edited messages to the log channel
// =============================================================

const { log } = require('../utils/logger');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return; // embeds loading, pins, etc. - ignore non-text edits

    const before = oldMessage.content || '*(content unavailable)*';
    const after = newMessage.content || '*(content unavailable)*';

    await log(
      newMessage.client,
      'Messages',
      '✏️ Message Edited',
      `${newMessage.author} edited a message in ${newMessage.channel}. [Jump to message](${newMessage.url})`,
      [
        { name: 'Before', value: before.slice(0, 500) || 'N/A' },
        { name: 'After', value: after.slice(0, 500) || 'N/A' },
      ]
    );
  },
};
