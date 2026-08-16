// =============================================================
// .purge role @Role
// Removes the given role from every member who has it, showing live
// progress in a single edited embed. Distinct from the /purge slash
// command, which bulk-deletes messages.
// =============================================================

const { PermissionFlagsBits } = require('discord.js');
const { baseEmbed, errorEmbed, successEmbed } = require('../../utils/embeds');
const { log } = require('../../utils/logger');

module.exports = {
  name: 'purge',
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (sub !== 'role') {
      return message.reply({ embeds: [errorEmbed('Usage: `.purge role @Role`')] });
    }

    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply({ embeds: [errorEmbed('You need the **Manage Roles** permission to run this.')] });
    }

    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      return message.reply({ embeds: [errorEmbed('Please mention or provide the ID of a role. Usage: `.purge role @Role`')] });
    }

    if (role.position >= message.member.roles.highest.position && message.guild.ownerId !== message.author.id) {
      return message.reply({ embeds: [errorEmbed('You cannot purge a role equal to or higher than your own highest role.')] });
    }

    if (role.managed) {
      return message.reply({ embeds: [errorEmbed('That role is managed by an integration and cannot be removed manually.')] });
    }

    await message.guild.members.fetch(); // ensure the full member cache is populated for large servers
    const members = [...message.guild.members.cache.filter((m) => m.roles.cache.has(role.id)).values()];

    if (members.length === 0) {
      return message.reply({ embeds: [errorEmbed(`No members currently have ${role}.`)] });
    }

    const progressMessage = await message.channel.send({
      embeds: [baseEmbed({ title: '🧹 Purging Role', description: `Removing ${role} from **0 / ${members.length}** members...` })],
    });

    let processed = 0;
    let failed = 0;

    for (const member of members) {
      try {
        await member.roles.remove(role, `Role purge by ${message.author.tag}`);
      } catch {
        failed += 1;
      }
      processed += 1;

      // Update progress every 10 members (or on the last one) to stay well under rate limits.
      if (processed % 10 === 0 || processed === members.length) {
        await progressMessage
          .edit({
            embeds: [
              baseEmbed({
                title: '🧹 Purging Role',
                description: `Removing ${role} from **${processed} / ${members.length}** members...`,
              }),
            ],
          })
          .catch(() => {});
      }
    }

    await progressMessage.edit({
      embeds: [
        successEmbed(
          `Removed ${role} from **${processed - failed}** member(s).` + (failed > 0 ? `\n${failed} removal(s) failed.` : ''),
          'Role Purge Complete'
        ),
      ],
    });

    await log(
      message.client,
      'Moderation',
      '🧹 Role Purged',
      `${message.author} removed ${role} from ${processed - failed} member(s)${failed > 0 ? ` (${failed} failed)` : ''}.`
    );
  },
};
