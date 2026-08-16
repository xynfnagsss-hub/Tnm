// =============================================================
// /rank - shows a member's XP, level, and progress bar
// =============================================================

const { SlashCommandBuilder } = require('discord.js');
const { getProfile, buildRankEmbed } = require('../../../utils/levelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription("View your (or another member's) TNM rank.")
    .addUserOption((opt) => opt.setName('user').setDescription('The member to check (defaults to you)').setRequired(false)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const profile = getProfile(targetUser.id);

    await interaction.reply({ embeds: [buildRankEmbed(targetUser, profile)] });
  },
};
