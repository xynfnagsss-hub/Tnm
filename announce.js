// =============================================================
// /announce - posts a TNM-branded announcement to a chosen channel
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { baseEmbed, successEmbed, errorEmbed } = require('../../../utils/embeds');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Post a TNM-branded announcement.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) => opt.setName('message').setDescription('The announcement text').setRequired(true))
    .addChannelOption((opt) => opt.setName('channel').setDescription('Channel to post in (defaults to this channel)').setRequired(false))
    .addStringOption((opt) => opt.setName('title').setDescription('Optional custom title').setRequired(false))
    .addRoleOption((opt) => opt.setName('ping').setDescription('Optional role to ping alongside the announcement').setRequired(false)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to make announcements.')], ephemeral: true });
    }

    const message = interaction.options.getString('message', true);
    const title = interaction.options.getString('title') || '📢 TNM Announcement';
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const pingRole = interaction.options.getRole('ping');

    if (!channel.isTextBased()) {
      return interaction.reply({ embeds: [errorEmbed('Please pick a text channel.')], ephemeral: true });
    }

    try {
      const embed = baseEmbed({ title, description: message });
      await channel.send({ content: pingRole ? `${pingRole}` : undefined, embeds: [embed] });

      await interaction.reply({ embeds: [successEmbed(`Announcement posted in ${channel}.`, 'Announcement Sent')], ephemeral: true });

      await log(interaction.client, 'Moderation', '📢 Announcement Sent', `${interaction.user} posted an announcement in ${channel}.`);
    } catch (err) {
      console.error('[TNM] /announce error:', err);
      await interaction.reply({ embeds: [errorEmbed('Failed to send that announcement. Check my permissions in that channel.')], ephemeral: true });
    }
  },
};
