// =============================================================
// TNM Prefix Command Handler
// Loads every file in src/commands/prefix into client.prefixCommands.
// These handle the "." commands specifically called out in the spec:
// .ticket setup, .level setup, .verify setup, .purge role @Role
// =============================================================

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

const PREFIX = '.';

function loadPrefixCommands(client) {
  client.prefixCommands = new Collection();

  const dir = path.join(__dirname, '..', 'commands', 'prefix');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));

  let count = 0;
  for (const file of files) {
    const command = require(path.join(dir, file));
    if (!command?.name || !command?.execute) {
      console.warn(`[TNM] Skipping invalid prefix command file: ${file}`);
      continue;
    }
    client.prefixCommands.set(command.name, command);
    count += 1;
  }

  console.log(`[TNM] Loaded ${count} prefix command(s).`);
}

module.exports = { loadPrefixCommands, PREFIX };
