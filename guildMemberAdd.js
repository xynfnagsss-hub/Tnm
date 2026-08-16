// =============================================================
// guildMemberAdd - logs member joins to the log channel
// =============================================================

const { log } = require('../utils/logger');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const accountAge = Math.floor(member.user.createdTimestamp / 1000);

    await log(member.client, 'Members', '📥 Member Joined', `${member} (${member.user.tag}) joined the server.`, [
      { name: 'Account Created', value: `<t:${accountAge}:R>`, inline: true },
      { name: 'Member Count', value: String(member.guild.memberCount), inline: true },
    ]);
  },
};
