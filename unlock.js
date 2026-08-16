// =============================================================
// /unlock - restores @everyone's ability to send messages in a channel
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embeds');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a previously locked channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((opt) => opt.setName('channel').setDescription('Channel to unlock (defaults to this channel)').setRequired(false))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for unlocking').setRequired(false)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to unlock channels.')], ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null }, { reason });

      await interaction.reply({ embeds: [successEmbed(`${channel} has been unlocked.\n**Reason:** ${reason}`, 'Channel Unlocked')] });

      await log(interaction.client, 'Moderation', '🔓 Channel Unlocked', `${channel} was unlocked by ${interaction.user}.`, [
        { name: 'Reason', value: reason, inline: true },
      ]);
    } catch (err) {
      console.error('[TNM] /unlock error:', err);
      await interaction.reply({ embeds: [errorEmbed('Failed to unlock that channel. Check my permissions.')], ephemeral: true });
    }
  },
};
