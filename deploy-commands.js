// =============================================================
// TNM Slash Command Deployer
// Registers every command in src/commands/slash to your test/production
// guild instantly (guild commands update immediately, unlike global
// commands which can take up to an hour to propagate).
// Run with: npm run deploy
// =============================================================

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('./config');

function collectCommandData() {
  const baseDir = path.join(__dirname, 'commands', 'slash');
  const categories = fs.readdirSync(baseDir).filter((f) => fs.statSync(path.join(baseDir, f)).isDirectory());

  const commands = [];
  for (const category of categories) {
    const categoryDir = path.join(baseDir, category);
    const files = fs.readdirSync(categoryDir).filter((f) => f.endsWith('.js'));
    for (const file of files) {
      const command = require(path.join(categoryDir, file));
      if (command?.data) commands.push(command.data.toJSON());
    }
  }
  return commands;
}

async function deploy() {
  const commands = collectCommandData();
  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    console.log(`[TNM] Deploying ${commands.length} slash command(s) to guild ${config.guildId}...`);

    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });

    console.log('[TNM] Slash commands deployed successfully.');
  } catch (err) {
    console.error('[TNM] Failed to deploy slash commands:', err);
    process.exit(1);
  }
}

deploy();
