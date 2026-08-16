// =============================================================
// interactionCreate - the single entry point for all interactions.
// Routes to the slash command handler, button handler, select menu
// handler, or the verification modal handler.
// =============================================================

const { errorEmbed } = require('../utils/embeds');
const { handleButton } = require('../handlers/buttonHandler');
const { handleSelectMenu } = require('../handlers/selectMenuHandler');
const verifyManager = require('../utils/verifyManager');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.slashCommands.get(interaction.commandName);
        if (!command) {
          console.warn(`[TNM] Received unknown slash command: ${interaction.commandName}`);
          return;
        }
        await command.execute(interaction);
        return;
      }

      if (interaction.isButton()) {
        await handleButton(interaction);
        return;
      }

      if (interaction.isStringSelectMenu()) {
        await handleSelectMenu(interaction);
        return;
      }

      if (interaction.isModalSubmit() && interaction.customId === 'verify_modal') {
        await verifyManager.processVerification(interaction);
        return;
      }
    } catch (err) {
      console.error('[TNM] Unhandled interaction error:', err);
      const payload = { embeds: [errorEmbed('An unexpected error occurred while processing that.')], ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(payload).catch(() => {});
      } else if (interaction.isRepliable?.()) {
        await interaction.reply(payload).catch(() => {});
      }
    }
  },
};
