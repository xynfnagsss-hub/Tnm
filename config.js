// =============================================================
// TNM Config Loader
// Reads all settings from .env and exposes them as one object.
// Fails fast (with a clear message) if a required value is missing,
// instead of letting the bot crash mysteriously later.
// =============================================================

require('dotenv').config();

/**
 * Splits a comma-separated env value into a clean array of strings.
 * Returns an empty array if the value is unset or blank.
 */
function parseList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Parses LEVEL_ROLES="5:roleId,10:roleId2" into [{ level: 5, roleId: 'roleId' }, ...]
 */
function parseLevelRoles(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [level, roleId] = entry.split(':').map((p) => p.trim());
      return { level: Number(level), roleId };
    })
    .filter((entry) => Number.isFinite(entry.level) && entry.roleId);
}

const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,

  staffRoleIds: parseList(process.env.STAFF_ROLE_IDS),
  logChannelId: process.env.LOG_CHANNEL_ID,
  ticketCategoryId: process.env.TICKET_CATEGORY_ID,

  robloxGroupId: process.env.ROBLOX_GROUP_ID,
  verifiedRoleId: process.env.VERIFIED_ROLE_ID,

  levelUpChannelId: process.env.LEVEL_UP_CHANNEL_ID || 'any',
  xpMin: Number(process.env.XP_MIN) || 15,
  xpMax: Number(process.env.XP_MAX) || 25,
  xpCooldownSeconds: Number(process.env.XP_COOLDOWN_SECONDS) || 60,
  levelRoles: parseLevelRoles(process.env.LEVEL_ROLES),

  // Branding - safe to edit directly, these aren't secrets.
  brand: {
    name: 'TNM',
    tagline: 'Trust No Mob',
    footer: 'Powered by TNM',
    presence: 'Trust No Mob | Powered by TNM',
    // Pure black embed color (renders as true black on Discord's dark theme,
    // and as near-black on light theme, matching the black & white theme).
    color: 0x000000,
    // Placeholder logo - swap this URL for your own hosted TNM logo whenever you like.
    logoUrl: 'https://placehold.co/256x256/000000/FFFFFF/png?text=TNM',
  },
};

const requiredForBoot = ['token', 'clientId', 'guildId'];
const missing = requiredForBoot.filter((key) => !config[key]);
if (missing.length > 0) {
  console.error(
    `[TNM] Missing required .env values: ${missing.join(', ')}. ` +
      'Copy .env.example to .env and fill these in before starting the bot.'
  );
  process.exit(1);
}

module.exports = config;
