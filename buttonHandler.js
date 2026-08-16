// =============================================================
// TNM Button Handler
// Called from events/interactionCreate.js whenever a button is clicked.
// Routes by customId prefix to ticket logic or verification logic.
// =============================================================

const { errorEmbed } = require('../utils/embeds');
const { isStaff } = require('../utils/permissions');
const ticketManager = require('../utils/ticketManager');
const verifyManager = require('../utils/verifyManager');

async function handleButton(interaction) {
  const { customId } = interaction;

  try {
    // --- Ticket creation buttons ---
    if (Object.prototype.hasOwnProperty.call(ticketManager.TICKET_TYPES, customId)) {
      await interaction.deferReply({ ephemeral: true });
      const channel = await ticketManager.createTicket(interaction, customId);
      await interaction.editReply({
        content: `Your ticket has been created: ${channel}`,
      });
      return;
    }

    // --- Ticket control buttons ---
    if (customId === 'ticket_claim') {
      if (!isStaff(interaction.member)) {
        await interaction.reply({ embeds: [errorEmbed('Only staff can claim tickets.')], ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      await ticketManager.claimTicket(interaction);
      await interaction.editReply({ content: `You claimed this ticket, ${interaction.user}.` });
      return;
    }

    if (customId === 'ticket_close') {
      if (!isStaff(interaction.member)) {
        await interaction.reply({ embeds: [errorEmbed('Only staff can close tickets.')], ephemeral: true });
        return;
      }
      await interaction.reply({
        content: 'Please select a reason to close this ticket:',
        components: [ticketManager.buildCloseReasonRow()],
        ephemeral: true,
      });
      return;
    }

    if (customId === 'ticket_delete') {
      if (!isStaff(interaction.member)) {
        await interaction.reply({ embeds: [errorEmbed('Only staff can delete tickets.')], ephemeral: true });
        return;
      }
      await ticketManager.deleteTicket(interaction);
      return;
    }

    if (customId === 'ticket_transcript') {
      await ticketManager.sendTranscript(interaction);
      return;
    }

    // --- Verification button ---
    if (customId === 'verify_start') {
      await interaction.showModal(verifyManager.buildVerifyModal());
      return;
    }

    console.warn(`[TNM] Unhandled button customId: ${customId}`);
  } catch (err) {
    console.error('[TNM] Button handler error:', err);
    const payload = { embeds: [errorEmbed(err.message || 'Something went wrong.')], ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
}

module.exports = { handleButton };
