// =============================================================
// TNM Embed Builders
// Every embed in the bot should be created through one of these
// helpers so the branding (color, footer, logo) stays consistent.
// =============================================================

const { EmbedBuilder } = require('discord.js');
const config = require('../config');

/**
 * Base TNM embed - black theme, "Powered by TNM" footer, TNM logo thumbnail.
 * @param {object} options
 * @param {string} [options.title]
 * @param {string} [options.description]
 * @param {Array} [options.fields]
 * @param {boolean} [options.thumbnail=true] - show the TNM logo as a thumbnail
 */
function baseEmbed({ title, description, fields, thumbnail = true } = {}) {
  const embed = new EmbedBuilder()
    .setColor(config.brand.color)
    .setFooter({ text: config.brand.footer, iconURL: config.brand.logoUrl })
    .setTimestamp();

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (fields && fields.length) embed.addFields(fields);
  if (thumbnail) embed.setThumbnail(config.brand.logoUrl);

  return embed;
}

/** Green-tinted-but-still-monochrome success embed (kept black to respect the B&W theme). */
function successEmbed(description, title = 'Success') {
  return baseEmbed({ title: `✅ ${title}`, description });
}

/** Error embed - still black & white themed, just prefixed clearly. */
function errorEmbed(description, title = 'Error') {
  return baseEmbed({ title: `⛔ ${title}`, description });
}

/** Info embed for neutral messages. */
function infoEmbed(description, title = 'Notice') {
  return baseEmbed({ title: `ℹ️ ${title}`, description });
}

module.exports = { baseEmbed, successEmbed, errorEmbed, infoEmbed };
