// =============================================================
// guildMemberUpdate - logs role changes (added/removed) per member
// =============================================================

const { log } = require('../utils/logger');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    const added = newRoles.filter((r) => !oldRoles.has(r.id));
    const removed = oldRoles.filter((r) => !newRoles.has(r.id));

    if (added.size > 0) {
      await log(
        newMember.client,
        'Members',
        '🏷️ Roles Added',
        `${newMember} was given: ${added.map((r) => r.toString()).join(', ')}`
      );
    }

    if (removed.size > 0) {
      await log(
        newMember.client,
        'Members',
        '🏷️ Roles Removed',
        `${newMember} lost: ${removed.map((r) => r.toString()).join(', ')}`
      );
    }

    if (oldMember.nickname !== newMember.nickname) {
      await log(
        newMember.client,
        'Members',
        '✏️ Nickname Changed',
        `${newMember}'s nickname changed from **${oldMember.nickname ?? 'None'}** to **${newMember.nickname ?? 'None'}**.`
      );
    }
  },
};
