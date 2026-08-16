// =============================================================
// voiceStateUpdate - logs voice channel joins, leaves, and switches
// =============================================================

const { log } = require('../utils/logger');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const member = newState.member ?? oldState.member;
    if (!member) return;

    // Joined a voice channel
    if (!oldState.channelId && newState.channelId) {
      await log(newState.client, 'Voice', '🔊 Voice Joined', `${member} joined voice channel ${newState.channel}.`);
      return;
    }

    // Left voice entirely
    if (oldState.channelId && !newState.channelId) {
      await log(oldState.client, 'Voice', '🔇 Voice Left', `${member} left voice channel ${oldState.channel}.`);
      return;
    }

    // Switched voice channels
    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      await log(newState.client, 'Voice', '🔀 Voice Switched', `${member} moved from ${oldState.channel} to ${newState.channel}.`);
    }
  },
};
