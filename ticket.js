// =============================================================
// .ticket setup
// Posts the 4-button TNM ticket panel in the current channel.
// =============================================================

const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const { buildTicketPanelEmbed, buildTicketPanelRow } = require('../../utils/ticketManager');
const config = require('../../config');

module.exports = {
  name: 'ticket',
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (sub !== 'setup') {
      return message.reply({ embeds: [errorEmbed('Usage: `.ticket setup`')] });
    }

    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply({ embeds: [errorEmbed('You need the **Manage Server** permission to run this.')] });
    }

    if (!config.ticketCategoryId) {
      return message.reply({
        embeds: [errorEmbed('`TICKET_CATEGORY_ID` is not set in your .env file yet. Add it, restart the bot, then try again.')],
      });
    }

    await message.channel.send({ embeds: [buildTicketPanelEmbed()], components: [buildTicketPanelRow()] });

    await message.reply({ embeds: [successEmbed('Ticket panel has been posted.')] }).then((m) => {
      setTimeout(() => m.delete().catch(() => {}), 5000);
    });

    await message.delete().catch(() => {});
  },
};
