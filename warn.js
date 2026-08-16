// =============================================================
// /warn - issues a warning to a member (stored persistently)
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embeds');
const { canModerate } = require('../../../utils/permissions');
const { addWarning } = require('../../../utils/warnManager');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning to a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName('user').setDescription('The member to warn').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the warning').setRequired(true)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to warn members.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    const check = canModerate(interaction.member, targetMember);
    if (!check.allowed) {
      return interaction.reply({ embeds: [errorEmbed(check.reason)], ephemeral: true });
    }

    const warnings = addWarning(targetUser.id, interaction.user.id, reason);

    await targetUser
      .send({ embeds: [errorEmbed(`You have been warned in **${interaction.guild.name}**.\n**Reason:** ${reason}`, 'You Received a Warning')] })
      .catch(() => {});

    await interaction.reply({
      embeds: [successEmbed(`${targetUser.tag} has been warned.\n**Reason:** ${reason}\n**Total Warnings:** ${warnings.length}`, 'Member Warned')],
    });

    await log(interaction.client, 'Moderation', '⚠️ Member Warned', `${targetUser.tag} (${targetUser.id}) was warned by ${interaction.user}.`, [
      { name: 'Reason', value: reason, inline: true },
      { name: 'Total Warnings', value: String(warnings.length), inline: true },
    ]);
  },
};
