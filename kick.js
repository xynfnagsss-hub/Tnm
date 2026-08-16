// =============================================================
// /kick - kicks a member from the server
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embeds');
const { canModerate } = require('../../../utils/permissions');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((opt) => opt.setName('user').setDescription('The member to kick').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the kick').setRequired(false)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to kick members.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    const check = canModerate(interaction.member, targetMember);
    if (!check.allowed) {
      return interaction.reply({ embeds: [errorEmbed(check.reason)], ephemeral: true });
    }

    try {
      await targetUser
        .send({ embeds: [errorEmbed(`You have been kicked from **${interaction.guild.name}**.\n**Reason:** ${reason}`, 'You Were Kicked')] })
        .catch(() => {});

      await targetMember.kick(`${reason} | Kicked by ${interaction.user.tag}`);

      await interaction.reply({ embeds: [successEmbed(`${targetUser.tag} has been kicked.\n**Reason:** ${reason}`, 'Member Kicked')] });

      await log(interaction.client, 'Moderation', '👢 Member Kicked', `${targetUser.tag} (${targetUser.id}) was kicked by ${interaction.user}.`, [
        { name: 'Reason', value: reason, inline: true },
      ]);
    } catch (err) {
      console.error('[TNM] /kick error:', err);
      await interaction.reply({ embeds: [errorEmbed('Failed to kick that user. Check my role position and permissions.')], ephemeral: true });
    }
  },
};
