// =============================================================
// /slowmode - sets a channel's slowmode delay
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embeds');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set the slowmode delay for a channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption((opt) =>
      opt.setName('seconds').setDescription('Delay in seconds (0 to disable, max 21600)').setRequired(true).setMinValue(0).setMaxValue(21600)
    )
    .addChannelOption((opt) => opt.setName('channel').setDescription('Channel to update (defaults to this channel)').setRequired(false)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to manage slowmode.')], ephemeral: true });
    }

    const seconds = interaction.options.getInteger('seconds', true);
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    try {
      await channel.setRateLimitPerUser(seconds, `Set by ${interaction.user.tag}`);

      const description = seconds === 0 ? `Slowmode has been disabled in ${channel}.` : `Slowmode set to **${seconds}s** in ${channel}.`;
      await interaction.reply({ embeds: [successEmbed(description, 'Slowmode Updated')] });

      await log(interaction.client, 'Moderation', '🐌 Slowmode Updated', `${interaction.user} set slowmode to ${seconds}s in ${channel}.`);
    } catch (err) {
      console.error('[TNM] /slowmode error:', err);
      await interaction.reply({ embeds: [errorEmbed('Failed to update slowmode. Check my permissions.')], ephemeral: true });
    }
  },
};
