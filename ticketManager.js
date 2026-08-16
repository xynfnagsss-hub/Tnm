// =============================================================
// TNM Ticket Manager
// All the actual ticket logic lives here so buttonHandler.js and the
// .ticket prefix command both stay thin and just call into this file.
// =============================================================

const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');

const config = require('../config');
const db = require('./database');
const { baseEmbed, successEmbed } = require('./embeds');
const { generateTranscript } = require('./transcript');
const { log } = require('./logger');

const TICKET_TYPES = {
  ticket_street: { label: 'Street Access', emoji: '🚦', slug: 'street' },
  ticket_enforcer: { label: 'Enforcer Access', emoji: '🛡️', slug: 'enforcer' },
  ticket_boss: { label: 'Boss Access', emoji: '👑', slug: 'boss' },
  ticket_elite: { label: 'ELITE ACCESS', emoji: '💎', slug: 'elite' },
};

/** The 4-button panel sent by ".ticket setup". */
function buildTicketPanelEmbed() {
  return baseEmbed({
    title: 'TNM Ticket Support',
    description:
      'Select the category below that matches what you need. A private channel ' +
      'will be created for you and the TNM staff team.\n\n' +
      '🚦 **Street Access** — general access requests\n' +
      '🛡️ **Enforcer Access** — enforcer-tier support\n' +
      '👑 **Boss Access** — boss-tier support\n' +
      '💎 **ELITE ACCESS** — elite-tier support',
  });
}

function buildTicketPanelRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_street').setLabel('Street Access').setEmoji('🚦').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket_enforcer').setLabel('Enforcer Access').setEmoji('🛡️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket_boss').setLabel('Boss Access').setEmoji('👑').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket_elite').setLabel('ELITE ACCESS').setEmoji('💎').setStyle(ButtonStyle.Primary)
  );
}

function buildTicketControlRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim Ticket').setEmoji('🖐️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket_close').setLabel('Close Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('ticket_delete').setLabel('Delete Ticket').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('ticket_transcript').setLabel('Transcript').setEmoji('📄').setStyle(ButtonStyle.Secondary)
  );
}

/**
 * Creates a new private ticket channel for `member` of the given `typeKey`
 * (one of the TICKET_TYPES keys). Returns the created channel.
 */
async function createTicket(interaction, typeKey) {
  const type = TICKET_TYPES[typeKey];
  const guild = interaction.guild;
  const member = interaction.member;

  if (!config.ticketCategoryId) {
    throw new Error('TICKET_CATEGORY_ID is not configured in .env.');
  }

  // Prevent a user from opening a duplicate ticket of the same type.
  const tickets = db.all('tickets');
  const existing = Object.values(tickets).find(
    (t) => t.userId === member.id && t.type === typeKey && t.status === 'open'
  );
  if (existing) {
    const existingChannel = guild.channels.cache.get(existing.channelId);
    if (existingChannel) {
      throw new Error(`You already have an open ${type.label} ticket: ${existingChannel}`);
    }
  }

  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    },
    {
      id: guild.client.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    ...config.staffRoleIds.map((roleId) => ({
      id: roleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
      ],
    })),
  ];

  const safeName = member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16) || 'user';
  const channel = await guild.channels.create({
    name: `${type.slug}-${safeName}`,
    type: ChannelType.GuildText,
    parent: config.ticketCategoryId,
    permissionOverwrites: overwrites,
    topic: `TNM Ticket | Type: ${type.label} | Opened by: ${member.id} | Status: open`,
  });

  db.set('tickets', channel.id, {
    channelId: channel.id,
    userId: member.id,
    type: typeKey,
    typeLabel: type.label,
    status: 'open',
    claimedBy: null,
    createdAt: Date.now(),
  });

  const welcomeEmbed = baseEmbed({
    title: `${type.emoji} ${type.label} Ticket`,
    description:
      `Welcome, ${member}. Thank you for reaching out to **TNM**.\n\n` +
      'A staff member will be with you shortly. Please describe your request in as much ' +
      'detail as possible while you wait.',
    fields: [
      { name: 'Opened By', value: `${member}`, inline: true },
      { name: 'Ticket Type', value: type.label, inline: true },
      { name: 'Status', value: '🟢 Open', inline: true },
    ],
  });

  await channel.send({
    content: `${member} | ${config.staffRoleIds.map((id) => `<@&${id}>`).join(' ')}`.trim(),
    embeds: [welcomeEmbed],
    components: [buildTicketControlRow()],
  });

  await log(
    guild.client,
    'Tickets',
    '🎫 Ticket Opened',
    `${type.label} ticket opened by ${member} in ${channel}`,
    [{ name: 'Ticket Type', value: type.label, inline: true }]
  );

  return channel;
}

/** Staff claims a ticket - locks "claim" to that one staff member. */
async function claimTicket(interaction) {
  const record = db.get('tickets', interaction.channel.id);
  if (!record) throw new Error('This channel is not an active ticket.');
  if (record.claimedBy) {
    throw new Error(`This ticket is already claimed by <@${record.claimedBy}>.`);
  }

  record.claimedBy = interaction.user.id;
  db.set('tickets', interaction.channel.id, record);

  await interaction.channel.setTopic(
    `TNM Ticket | Type: ${record.typeLabel} | Opened by: ${record.userId} | Claimed by: ${interaction.user.id} | Status: open`
  );

  await log(
    interaction.client,
    'Tickets',
    '🖐️ Ticket Claimed',
    `${interaction.user} claimed ${interaction.channel}`
  );

  return record;
}

/** The reason select menu shown when a staff member presses "Close Ticket". */
function buildCloseReasonRow() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('ticket_close_reason')
      .setPlaceholder('Select a reason for closing this ticket')
      .addOptions(
        { label: 'Resolved', value: 'Resolved', emoji: '✅' },
        { label: 'User Inactive', value: 'User Inactive', emoji: '💤' },
        { label: 'Invalid Request', value: 'Invalid Request', emoji: '🚫' },
        { label: 'Other', value: 'Other', emoji: '➖' }
      )
  );
}

/** Closes a ticket: revokes the opener's send access and generates a transcript. */
async function closeTicket(interaction, reason = 'Not specified') {
  const record = db.get('tickets', interaction.channel.id);
  if (!record) throw new Error('This channel is not an active ticket.');

  await interaction.channel.permissionOverwrites.edit(record.userId, {
    SendMessages: false,
  });

  record.status = 'closed';
  record.closeReason = reason;
  db.set('tickets', interaction.channel.id, record);

  const { attachment } = await generateTranscript(interaction.channel);

  await interaction.channel.send({
    embeds: [
      successEmbed(
        `This ticket was closed by ${interaction.user}.\n**Reason:** ${reason}\n\nA transcript has been saved below.`,
        'Ticket Closed'
      ),
    ],
    files: [attachment],
  });

  await log(
    interaction.client,
    'Tickets',
    '🔒 Ticket Closed',
    `${interaction.user} closed ${interaction.channel} (opened by <@${record.userId}>)`,
    [{ name: 'Reason', value: reason, inline: true }]
  );

  // Also drop a copy of the transcript in the log channel for record-keeping.
  const { attachment: logCopy } = await generateTranscript(interaction.channel);
  const logChannel = config.logChannelId
    ? await interaction.client.channels.fetch(config.logChannelId).catch(() => null)
    : null;
  if (logChannel?.isTextBased()) {
    await logChannel.send({ files: [logCopy] }).catch(() => {});
  }

  return record;
}

/** Permanently deletes a ticket channel. Staff only (enforced by the caller). */
async function deleteTicket(interaction) {
  const record = db.get('tickets', interaction.channel.id);
  const channelName = interaction.channel.name;

  await interaction.reply({
    embeds: [infoEmbedDeleteNotice(interaction.user)],
  });

  await log(
    interaction.client,
    'Tickets',
    '🗑️ Ticket Deleted',
    `${interaction.user} deleted ticket #${channelName}` +
      (record ? ` (opened by <@${record.userId}>)` : '')
  );

  db.del('tickets', interaction.channel.id);

  setTimeout(() => {
    interaction.channel.delete('Ticket deleted via TNM ticket panel').catch(() => {});
  }, 4000);
}

function infoEmbedDeleteNotice(user) {
  return baseEmbed({
    title: '🗑️ Deleting Ticket',
    description: `This ticket is being deleted by ${user} in a few seconds...`,
  });
}

/** Sends the current transcript to the requester without closing the ticket. */
async function sendTranscript(interaction) {
  const { attachment } = await generateTranscript(interaction.channel);
  await interaction.reply({
    embeds: [successEmbed('Transcript generated.', 'Transcript')],
    files: [attachment],
  });
}

module.exports = {
  TICKET_TYPES,
  buildTicketPanelEmbed,
  buildTicketPanelRow,
  buildTicketControlRow,
  buildCloseReasonRow,
  createTicket,
  claimTicket,
  closeTicket,
  deleteTicket,
  sendTranscript,
};
