// =============================================================
// .verify setup
// Posts the TNM Roblox verification panel in the current channel.
// =============================================================

const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const { buildVerifyPanelEmbed, buildVerifyPanelRow } = require('../../utils/verifyManager');
const config = require('../../config');

module.exports = {
  name: 'verify',
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (sub !== 'setup') {
      return message.reply({ embeds: [errorEmbed('Usage: `.verify setup`')] });
    }

    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply({ embeds: [errorEmbed('You need the **Manage Server** permission to run this.')] });
    }

    if (!config.robloxGroupId || !config.verifiedRoleId) {
      return message.reply({
        embeds: [errorEmbed('`ROBLOX_GROUP_ID` and/or `VERIFIED_ROLE_ID` are not set in your .env file yet. Add them, restart the bot, then try again.')],
      });
    }

    await message.channel.send({ embeds: [buildVerifyPanelEmbed()], components: [buildVerifyPanelRow()] });

    await message.reply({ embeds: [successEmbed('Verification panel has been posted.')] }).then((m) => {
      setTimeout(() => m.delete().catch(() => {}), 5000);
    });

    await message.delete().catch(() => {});
  },
};
