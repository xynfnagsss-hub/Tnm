// =============================================================
// TNM Verification Manager
// Handles the ".verify setup" panel and the Roblox group-check flow.
// =============================================================

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const config = require('../config');
const { baseEmbed, errorEmbed, successEmbed } = require('./embeds');
const { getRobloxUserByUsername, isUserInGroup } = require('./roblox');
const { log } = require('./logger');

function buildVerifyPanelEmbed() {
  return baseEmbed({
    title: 'TNM Verification',
    description:
      'To gain access to the rest of the server, verify with your **Roblox** account.\n\n' +
      `You must be a member of our Roblox group to verify.\nGroup ID: \`${config.robloxGroupId}\`\n\n` +
      'Click **Verify** below and enter your exact Roblox username.',
  });
}

function buildVerifyPanelRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('verify_start').setLabel('Verify').setEmoji('🔗').setStyle(ButtonStyle.Primary)
  );
}

function buildVerifyModal() {
  const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('TNM Roblox Verification');

  const usernameInput = new TextInputBuilder()
    .setCustomId('roblox_username')
    .setLabel('Your exact Roblox username')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Builderman')
    .setRequired(true)
    .setMaxLength(32);

  modal.addComponents(new ActionRowBuilder().addComponents(usernameInput));
  return modal;
}

/**
 * Runs the full verification check for a submitted modal and DMs/replies the result.
 * Meant to be called from the modal submit interaction handler.
 */
async function processVerification(interaction) {
  const username = interaction.fields.getTextInputValue('roblox_username').trim();

  await interaction.deferReply({ ephemeral: true });

  if (!config.robloxGroupId) {
    await interaction.editReply({
      embeds: [errorEmbed('Verification is not fully configured yet (missing ROBLOX_GROUP_ID). Contact staff.')],
    });
    return;
  }

  let robloxUser;
  try {
    robloxUser = await getRobloxUserByUsername(username);
  } catch (err) {
    await interaction.editReply({ embeds: [errorEmbed(err.message)] });
    return;
  }

  if (!robloxUser) {
    await interaction.editReply({
      embeds: [errorEmbed(`Could not find a Roblox account named **${username}**. Double-check the spelling and try again.`)],
    });
    return;
  }

  let inGroup;
  try {
    inGroup = await isUserInGroup(robloxUser.id, config.robloxGroupId);
  } catch (err) {
    await interaction.editReply({ embeds: [errorEmbed(err.message)] });
    return;
  }

  if (!inGroup) {
    await interaction.editReply({
      embeds: [
        errorEmbed(
          `**${robloxUser.name}** is not a member of the required Roblox group yet.\n\n` +
            'Please join the group first, then click **Verify** again.',
          'Not In Group'
        ),
      ],
    });
    return;
  }

  if (config.verifiedRoleId) {
    const role = interaction.guild.roles.cache.get(config.verifiedRoleId);
    if (role) {
      await interaction.member.roles.add(role).catch(() => null);
    }
  }

  await interaction.editReply({
    embeds: [successEmbed(`Welcome, **${robloxUser.name}**! You have been verified and given access.`, 'Verified')],
  });

  await log(
    interaction.client,
    'Verification',
    '✅ Member Verified',
    `${interaction.user} verified as Roblox user **${robloxUser.name}** (ID: ${robloxUser.id})`
  );
}

module.exports = { buildVerifyPanelEmbed, buildVerifyPanelRow, buildVerifyModal, processVerification };
