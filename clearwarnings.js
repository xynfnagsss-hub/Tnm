// =============================================================
// /clearwarnings - wipes a member's warning history
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embeds');
const { clearWarnings, getWarnings } = require('../../../utils/warnManager');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription("Clear a member's warning history.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName('user').setDescription('The member to clear warnings for').setRequired(true)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to clear warnings.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user', true);
    const existing = getWarnings(targetUser.id);

    if (existing.length === 0) {
      return interaction.reply({ embeds: [errorEmbed('This member has no warnings to clear.')], ephemeral: true });
    }

    clearWarnings(targetUser.id);

    await interaction.reply({ embeds: [successEmbed(`Cleared ${existing.length} warning(s) for ${targetUser.tag}.`, 'Warnings Cleared')] });

    await log(interaction.client, 'Moderation', '🧹 Warnings Cleared', `${interaction.user} cleared ${existing.length} warning(s) for ${targetUser.tag} (${targetUser.id}).`);
  },
};
