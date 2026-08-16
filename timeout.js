// =============================================================
// /timeout - times out a member for a given duration
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embeds');
const { canModerate } = require('../../../utils/permissions');
const { log } = require('../../../utils/logger');

const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000; // Discord's hard cap: 28 days

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member for a set duration.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName('user').setDescription('The member to timeout').setRequired(true))
    .addIntegerOption((opt) => opt.setName('minutes').setDescription('Duration in minutes (max 40320 / 28 days)').setRequired(true).setMinValue(1))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the timeout').setRequired(false)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to timeout members.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user', true);
    const minutes = interaction.options.getInteger('minutes', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    const check = canModerate(interaction.member, targetMember);
    if (!check.allowed) {
      return interaction.reply({ embeds: [errorEmbed(check.reason)], ephemeral: true });
    }

    const durationMs = Math.min(minutes * 60 * 1000, MAX_TIMEOUT_MS);

    try {
      await targetMember.timeout(durationMs, `${reason} | Timed out by ${interaction.user.tag}`);

      await interaction.reply({
        embeds: [successEmbed(`${targetUser.tag} has been timed out for **${minutes} minute(s)**.\n**Reason:** ${reason}`, 'Member Timed Out')],
      });

      await log(
        interaction.client,
        'Moderation',
        '⏱️ Member Timed Out',
        `${targetUser.tag} (${targetUser.id}) was timed out by ${interaction.user} for ${minutes} minute(s).`,
        [{ name: 'Reason', value: reason, inline: true }]
      );
    } catch (err) {
      console.error('[TNM] /timeout error:', err);
      await interaction.reply({ embeds: [errorEmbed('Failed to timeout that user. Check my role position and permissions.')], ephemeral: true });
    }
  },
};
