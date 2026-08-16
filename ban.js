// =============================================================
// /ban - bans a member from the server
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embeds');
const { canModerate } = require('../../../utils/permissions');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((opt) => opt.setName('user').setDescription('The member to ban').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the ban').setRequired(false))
    .addIntegerOption((opt) =>
      opt
        .setName('delete_days')
        .setDescription('Days of message history to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to ban members.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_days') ?? 0;

    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (targetMember) {
      const check = canModerate(interaction.member, targetMember);
      if (!check.allowed) {
        return interaction.reply({ embeds: [errorEmbed(check.reason)], ephemeral: true });
      }
    }

    try {
      await targetUser
        .send({ embeds: [errorEmbed(`You have been banned from **${interaction.guild.name}**.\n**Reason:** ${reason}`, 'You Were Banned')] })
        .catch(() => {}); // ignore if DMs are closed

      await interaction.guild.members.ban(targetUser.id, {
        deleteMessageSeconds: deleteDays * 86400,
        reason: `${reason} | Banned by ${interaction.user.tag}`,
      });

      await interaction.reply({
        embeds: [successEmbed(`${targetUser.tag} has been banned.\n**Reason:** ${reason}`, 'Member Banned')],
      });

      await log(interaction.client, 'Moderation', '🔨 Member Banned', `${targetUser.tag} (${targetUser.id}) was banned by ${interaction.user}.`, [
        { name: 'Reason', value: reason, inline: true },
      ]);
    } catch (err) {
      console.error('[TNM] /ban error:', err);
      await interaction.reply({ embeds: [errorEmbed('Failed to ban that user. Check my role position and permissions.')], ephemeral: true });
    }
  },
};
