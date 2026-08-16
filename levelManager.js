// =============================================================
// TNM Leveling Manager
// XP-on-message with cooldown, level curve, level roles, rank card,
// and leaderboard - all backed by the JSON database.
// =============================================================

const config = require('../config');
const db = require('./database');
const { baseEmbed } = require('./embeds');
const { log } = require('./logger');

const cooldowns = new Map(); // userId -> last XP timestamp (in-memory, resets on restart, which is fine for a cooldown)

/** XP required to reach `level` (simple, steadily increasing curve). */
function xpForLevel(level) {
  return 5 * level ** 2 + 50 * level + 100;
}

function getProfile(userId) {
  return db.get('levels', userId, { xp: 0, level: 0, totalMessages: 0 });
}

function saveProfile(userId, profile) {
  db.set('levels', userId, profile);
}

/**
 * Call this from messageCreate for every eligible (non-bot, non-command) message.
 * Handles cooldown, XP grant, level-up detection, role rewards, and announcements.
 */
async function grantXp(message) {
  const userId = message.author.id;
  const now = Date.now();
  const last = cooldowns.get(userId) || 0;

  if (now - last < config.xpCooldownSeconds * 1000) return;
  cooldowns.set(userId, now);

  const profile = getProfile(userId);
  const gained = Math.floor(Math.random() * (config.xpMax - config.xpMin + 1)) + config.xpMin;

  profile.xp += gained;
  profile.totalMessages += 1;

  let leveledUp = false;
  while (profile.xp >= xpForLevel(profile.level + 1)) {
    profile.level += 1;
    leveledUp = true;
  }

  saveProfile(userId, profile);

  if (leveledUp) {
    await announceLevelUp(message, profile);
    await applyLevelRoles(message.member, profile.level);
  }
}

async function announceLevelUp(message, profile) {
  const embed = baseEmbed({
    title: '🎉 Level Up!',
    description: `${message.author} just reached **Level ${profile.level}** in TNM!`,
  });

  const targetChannel =
    config.levelUpChannelId === 'any'
      ? message.channel
      : message.guild.channels.cache.get(config.levelUpChannelId) || message.channel;

  await targetChannel.send({ embeds: [embed] }).catch(() => {});
}

async function applyLevelRoles(member, level) {
  if (!member || !config.levelRoles.length) return;

  const rolesToGrant = config.levelRoles.filter((entry) => entry.level <= level);
  for (const entry of rolesToGrant) {
    const role = member.guild.roles.cache.get(entry.roleId);
    if (role && !member.roles.cache.has(role.id)) {
      await member.roles.add(role).catch(() => {});
      await log(
        member.client,
        'Leveling',
        '🏅 Level Role Granted',
        `${member} was granted ${role} for reaching level ${level}.`
      );
    }
  }
}

/** Builds a text-based rank card embed (no external image dependency required). */
function buildRankEmbed(user, profile) {
  const currentLevelXp = xpForLevel(profile.level);
  const nextLevelXp = xpForLevel(profile.level + 1);
  const progress = Math.max(0, profile.xp - currentLevelXp);
  const needed = nextLevelXp - currentLevelXp;
  const percent = Math.min(1, progress / needed);

  const barLength = 20;
  const filled = Math.round(percent * barLength);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

  return baseEmbed({
    title: `📊 Rank — ${user.username}`,
    description:
      `**Level:** ${profile.level}\n` +
      `**Total XP:** ${profile.xp}\n` +
      `**Progress to Level ${profile.level + 1}:**\n` +
      `\`${bar}\` ${Math.round(percent * 100)}%\n` +
      `(${progress} / ${needed} XP)`,
  }).setThumbnail(user.displayAvatarURL({ size: 256 }));
}

/** Builds a top-10 leaderboard embed for the guild. */
function buildLeaderboardEmbed(guild, allProfiles) {
  const ranked = Object.entries(allProfiles)
    .map(([userId, profile]) => ({ userId, ...profile }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);

  const medals = ['🥇', '🥈', '🥉'];
  const lines = ranked.map((entry, i) => {
    const rank = medals[i] || `#${i + 1}`;
    return `${rank} <@${entry.userId}> — Level **${entry.level}** (${entry.xp} XP)`;
  });

  return baseEmbed({
    title: `🏆 TNM Leaderboard — ${guild.name}`,
    description: lines.length ? lines.join('\n') : 'No one has earned XP yet. Start chatting!',
  });
}

module.exports = {
  xpForLevel,
  getProfile,
  saveProfile,
  grantXp,
  buildRankEmbed,
  buildLeaderboardEmbed,
};
