// =============================================================
// guildMemberRemove - logs member leaves to the log channel
// =============================================================

const { log } = require('../utils/logger');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const roles = member.roles?.cache
      ? [...member.roles.cache.filter((r) => r.id !== member.guild.id).values()].map((r) => r.name).join(', ') || 'None'
      : 'Unknown';

    await log(member.client, 'Members', '📤 Member Left', `${member.user?.tag ?? 'Unknown User'} left the server.`, [
      { name: 'Roles Had', value: roles.slice(0, 500) },
      { name: 'Member Count', value: String(member.guild.memberCount), inline: true },
    ]);
  },
};
