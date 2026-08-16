// =============================================================
// .level setup
// The leveling system runs automatically (XP is granted on every
// eligible message via events/messageCreate.js). This command gives
// staff a quick confirmation embed showing the active configuration.
// =============================================================

const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, baseEmbed } = require('../../utils/embeds');
const config = require('../../config');

module.exports = {
  name: 'level',
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (sub !== 'setup') {
      return message.reply({ embeds: [errorEmbed('Usage: `.level setup`')] });
    }

    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply({ embeds: [errorEmbed('You need the **Manage Server** permission to run this.')] });
    }

    const levelRolesText = config.levelRoles.length
      ? config.levelRoles.map((r) => `Level ${r.level} → <@&${r.roleId}>`).join('\n')
      : 'No level roles configured (set `LEVEL_ROLES` in .env).';

    const announceChannel = config.levelUpChannelId === 'any' ? 'The channel the user is chatting in' : `<#${config.levelUpChannelId}>`;

    const embed = baseEmbed({
      title: '📈 TNM Leveling System',
      description: 'The leveling system is **active**. Members automatically earn XP from chatting.',
      fields: [
        { name: 'XP Per Message', value: `${config.xpMin}-${config.xpMax}`, inline: true },
        { name: 'XP Cooldown', value: `${config.xpCooldownSeconds}s`, inline: true },
        { name: 'Level-Up Announcements', value: announceChannel, inline: true },
        { name: 'Level Roles', value: levelRolesText },
        { name: 'Commands', value: 'Use `/rank` to view a rank card and `/leaderboard` for the top members.' },
      ],
    });

    await message.channel.send({ embeds: [embed] });
    await message.delete().catch(() => {});
  },
};
