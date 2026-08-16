// =============================================================
// /warnings - lists a member's warning history
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { baseEmbed, errorEmbed } = require('../../../utils/embeds');
const { getWarnings } = require('../../../utils/warnManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription("View a member's warning history.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName('user').setDescription('The member to check').setRequired(true)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to view warnings.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user', true);
    const warnings = getWarnings(targetUser.id);

    if (warnings.length === 0) {
      return interaction.reply({
        embeds: [baseEmbed({ title: `Warnings — ${targetUser.tag}`, description: 'This member has no warnings.' })],
        ephemeral: true,
      });
    }

    const description = warnings
      .map(
        (w, i) =>
          `**#${i + 1}** — ${w.reason}\n<t:${Math.floor(w.timestamp / 1000)}:R> by <@${w.moderatorId}>`
      )
      .join('\n\n');

    await interaction.reply({
      embeds: [baseEmbed({ title: `Warnings — ${targetUser.tag} (${warnings.length} total)`, description })],
      ephemeral: true,
    });
  },
};
