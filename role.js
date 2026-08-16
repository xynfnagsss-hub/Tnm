// =============================================================
// /role - add or remove a role from a member
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embeds');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove a role from a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a role to a member')
        .addUserOption((opt) => opt.setName('user').setDescription('The member').setRequired(true))
        .addRoleOption((opt) => opt.setName('role').setDescription('The role to add').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a role from a member')
        .addUserOption((opt) => opt.setName('user').setDescription('The member').setRequired(true))
        .addRoleOption((opt) => opt.setName('role').setDescription('The role to remove').setRequired(true))
    ),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to manage roles.')], ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user', true);
    const role = interaction.options.getRole('role', true);
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!targetMember) {
      return interaction.reply({ embeds: [errorEmbed('That member could not be found.')], ephemeral: true });
    }

    if (role.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('You cannot manage a role equal to or higher than your own highest role.')], ephemeral: true });
    }

    if (role.managed) {
      return interaction.reply({ embeds: [errorEmbed('That role is managed by an integration and cannot be assigned manually.')], ephemeral: true });
    }

    try {
      if (sub === 'add') {
        if (targetMember.roles.cache.has(role.id)) {
          return interaction.reply({ embeds: [errorEmbed(`${targetUser.tag} already has that role.`)], ephemeral: true });
        }
        await targetMember.roles.add(role, `Added by ${interaction.user.tag}`);
        await interaction.reply({ embeds: [successEmbed(`Added ${role} to ${targetUser.tag}.`, 'Role Added')] });
        await log(interaction.client, 'Moderation', '➕ Role Added', `${interaction.user} added ${role} to ${targetUser.tag}.`);
      } else {
        if (!targetMember.roles.cache.has(role.id)) {
          return interaction.reply({ embeds: [errorEmbed(`${targetUser.tag} doesn't have that role.`)], ephemeral: true });
        }
        await targetMember.roles.remove(role, `Removed by ${interaction.user.tag}`);
        await interaction.reply({ embeds: [successEmbed(`Removed ${role} from ${targetUser.tag}.`, 'Role Removed')] });
        await log(interaction.client, 'Moderation', '➖ Role Removed', `${interaction.user} removed ${role} from ${targetUser.tag}.`);
      }
    } catch (err) {
      console.error('[TNM] /role error:', err);
      await interaction.reply({ embeds: [errorEmbed('Failed to update that role. Check my role position and permissions.')], ephemeral: true });
    }
  },
};
