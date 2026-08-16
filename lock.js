// =============================================================
// /lock - prevents @everyone from sending messages in a channel
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embeds');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel so @everyone cannot send messages.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((opt) => opt.setName('channel').setDescription('Channel to lock (defaults to this channel)').setRequired(false))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for locking').setRequired(false)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to lock channels.')], ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }, { reason });

      await interaction.reply({ embeds: [successEmbed(`${channel} has been locked.\n**Reason:** ${reason}`, 'Channel Locked')] });

      await log(interaction.client, 'Moderation', '🔒 Channel Locked', `${channel} was locked by ${interaction.user}.`, [
        { name: 'Reason', value: reason, inline: true },
      ]);
    } catch (err) {
      console.error('[TNM] /lock error:', err);
      await interaction.reply({ embeds: [errorEmbed('Failed to lock that channel. Check my permissions.')], ephemeral: true });
    }
  },
};
