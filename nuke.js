// =============================================================
// /nuke - completely wipes a channel by cloning it and deleting the original
// =============================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { baseEmbed, errorEmbed } = require('../../../utils/embeds');
const { log } = require('../../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Completely wipe this channel (clone + delete original).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((opt) => opt.setName('channel').setDescription('Channel to nuke (defaults to this channel)').setRequired(false)),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to nuke channels.')], ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;

    // Reply BEFORE deleting, since if we nuke the channel the interaction was sent in,
    // that interaction's reply target ceases to exist once the channel is gone.
    await interaction.reply({ embeds: [baseEmbed({ title: '💥 Nuking Channel...', description: `Nuking ${channel}, one moment.` })] });

    try {
      const position = channel.position;
      const clone = await channel.clone({ reason: `Nuked by ${interaction.user.tag}` });
      await clone.setPosition(position);
      await channel.delete(`Nuked by ${interaction.user.tag}`);

      await clone.send({
        embeds: [
          baseEmbed({
            title: '💥 Channel Nuked',
            description: `This channel was nuked by ${interaction.user}. Fresh start.`,
          }),
        ],
      });

      await log(interaction.client, 'Moderation', '💥 Channel Nuked', `${interaction.user} nuked #${channel.name}.`);
    } catch (err) {
      console.error('[TNM] /nuke error:', err);
      await interaction.followUp({ embeds: [errorEmbed('Failed to fully nuke that channel. Check my permissions.')], ephemeral: true }).catch(() => {});
    }
  },
};
