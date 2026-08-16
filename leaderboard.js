// =============================================================
// /leaderboard - shows the top 10 members by XP
// =============================================================

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../utils/database');
const { buildLeaderboardEmbed } = require('../../../utils/levelManager');

module.exports = {
  data: new SlashCommandBuilder().setName('leaderboard').setDescription('View the TNM XP leaderboard.'),

  async execute(interaction) {
    const allProfiles = db.all('levels');
    await interaction.reply({ embeds: [buildLeaderboardEmbed(interaction.guild, allProfiles)] });
  },
};
