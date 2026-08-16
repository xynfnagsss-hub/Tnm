// =============================================================
// TNM Bot - Entry Point
// Boots the Discord client, loads commands/events, and logs in.
// Run with: npm start
// =============================================================

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config');
const { loadSlashCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { loadPrefixCommands } = require('./handlers/prefixHandler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User],
});

loadSlashCommands(client);
loadPrefixCommands(client);
loadEvents(client);

// Catch anything that slips past individual handlers so the process never
// crashes silently on an unhandled promise rejection.
process.on('unhandledRejection', (err) => {
  console.error('[TNM] Unhandled promise rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('[TNM] Uncaught exception:', err);
});

client.login(config.token).catch((err) => {
  console.error('[TNM] Failed to log in. Double-check DISCORD_TOKEN in your .env file.', err);
  process.exit(1);
});
