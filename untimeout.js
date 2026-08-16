// =============================================================
// /untimeout - removes an active timeout from a member
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embeds');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove an active timeout from a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName('user').setDescription('The member to remove timeout from').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to manage timeouts.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!targetMember) {
      return interaction.reply({ embeds: [errorEmbed('That member could not be found.')], ephemeral: true });
    }

    if (!targetMember.communicationDisabledUntil) {
      return interaction.reply({ embeds: [errorEmbed('That member is not currently timed out.')], ephemeral: true });
    }

    try {
      await targetMember.timeout(null, `${reason} | Timeout removed by ${interaction.user.tag}`);

      await interaction.reply({ embeds: [successEmbed(`${targetUser.tag}'s timeout has been removed.`, 'Timeout Removed')] });

      await log(interaction.client, 'Moderation', '⏱️ Timeout Removed', `${targetUser.tag} (${targetUser.id})'s timeout was removed by ${interaction.user}.`, [
        { name: 'Reason', value: reason, inline: true },
      ]);
    } catch (err) {
      console.error('[TNM] /untimeout error:', err);
      await interaction.reply({ embeds: [errorEmbed('Failed to remove the timeout.')], ephemeral: true });
    }
  },
};
