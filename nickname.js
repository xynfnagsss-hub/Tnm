// =============================================================
// /nickname - sets or clears a member's nickname
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embeds');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription("Set or clear a member's nickname.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .addUserOption((opt) => opt.setName('user').setDescription('The member').setRequired(true))
    .addStringOption((opt) => opt.setName('nickname').setDescription('New nickname (leave blank to clear)').setRequired(false).setMaxLength(32)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageNicknames)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to manage nicknames.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user', true);
    const nickname = interaction.options.getString('nickname');
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!targetMember) {
      return interaction.reply({ embeds: [errorEmbed('That member could not be found.')], ephemeral: true });
    }

    try {
      await targetMember.setNickname(nickname || null, `Changed by ${interaction.user.tag}`);

      const description = nickname
        ? `${targetUser.tag}'s nickname was changed to **${nickname}**.`
        : `${targetUser.tag}'s nickname was cleared.`;

      await interaction.reply({ embeds: [successEmbed(description, 'Nickname Updated')] });

      await log(interaction.client, 'Moderation', '✏️ Nickname Updated', `${interaction.user} updated ${targetUser.tag}'s nickname.`);
    } catch (err) {
      console.error('[TNM] /nickname error:', err);
      await interaction.reply({ embeds: [errorEmbed("Failed to update that member's nickname. Check my role position.")], ephemeral: true });
    }
  },
};
