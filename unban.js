// =============================================================
// /unban - unbans a user by ID
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embeds');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user by their ID.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((opt) => opt.setName('user_id').setDescription('The user ID to unban').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the unban').setRequired(false)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to unban members.')], ephemeral: true });
    }

    const userId = interaction.options.getString('user_id', true).trim();
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!/^\d{15,25}$/.test(userId)) {
      return interaction.reply({ embeds: [errorEmbed('That does not look like a valid user ID.')], ephemeral: true });
    }

    try {
      const bans = await interaction.guild.bans.fetch();
      if (!bans.has(userId)) {
        return interaction.reply({ embeds: [errorEmbed('That user is not currently banned.')], ephemeral: true });
      }

      await interaction.guild.members.unban(userId, `${reason} | Unbanned by ${interaction.user.tag}`);

      await interaction.reply({ embeds: [successEmbed(`<@${userId}> has been unbanned.\n**Reason:** ${reason}`, 'Member Unbanned')] });

      await log(interaction.client, 'Moderation', '🔓 Member Unbanned', `User ID ${userId} was unbanned by ${interaction.user}.`, [
        { name: 'Reason', value: reason, inline: true },
      ]);
    } catch (err) {
      console.error('[TNM] /unban error:', err);
      await interaction.reply({ embeds: [errorEmbed('Failed to unban that user.')], ephemeral: true });
    }
  },
};
