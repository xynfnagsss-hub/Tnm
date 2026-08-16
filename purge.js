// =============================================================
// /purge - bulk deletes messages in a channel (optionally filtered by user)
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embeds');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages in this channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((opt) => opt.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .addUserOption((opt) => opt.setName('user').setDescription('Only delete messages from this user').setRequired(false)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to purge messages.')], ephemeral: true });
    }

    const amount = interaction.options.getInteger('amount', true);
    const targetUser = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    try {
      const fetched = await interaction.channel.messages.fetch({ limit: 100 });
      const filtered = targetUser ? fetched.filter((m) => m.author.id === targetUser.id) : fetched;
      const toDelete = [...filtered.values()].slice(0, amount);

      const deleted = await interaction.channel.bulkDelete(toDelete, true);

      await interaction.editReply({
        embeds: [successEmbed(`Deleted **${deleted.size}** message(s)${targetUser ? ` from ${targetUser.tag}` : ''}.`, 'Messages Purged')],
      });

      await log(
        interaction.client,
        'Moderation',
        '🧹 Messages Purged',
        `${interaction.user} purged ${deleted.size} message(s) in ${interaction.channel}${targetUser ? ` from ${targetUser.tag}` : ''}.`
      );
    } catch (err) {
      console.error('[TNM] /purge error:', err);
      await interaction.editReply({
        embeds: [errorEmbed('Failed to purge messages. Note: Discord only allows bulk-deleting messages younger than 14 days.')],
      });
    }
  },
};
