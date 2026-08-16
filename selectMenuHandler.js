// =============================================================
// TNM Select Menu Handler
// Called from events/interactionCreate.js whenever a select menu is used.
// Add new customId branches here as new select menus are introduced.
// =============================================================

const { errorEmbed } = require('../utils/embeds');
const ticketManager = require('../utils/ticketManager');

async function handleSelectMenu(interaction) {
  const { customId } = interaction;

  try {
    if (customId === 'ticket_close_reason') {
      const reason = interaction.values[0];
      await interaction.deferUpdate();
      await ticketManager.closeTicket(interaction, reason);
      return;
    }

    console.warn(`[TNM] Unhandled select menu customId: ${customId}`);
  } catch (err) {
    console.error('[TNM] Select menu handler error:', err);
    const payload = { embeds: [errorEmbed(err.message || 'Something went wrong.')], ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
}

module.exports = { handleSelectMenu };
