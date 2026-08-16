// =============================================================
// TNM Command Handler
// Recursively loads every slash command file under src/commands/slash
// into client.slashCommands (a Collection keyed by command name).
// =============================================================

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

function loadSlashCommands(client) {
  client.slashCommands = new Collection();

  const baseDir = path.join(__dirname, '..', 'commands', 'slash');
  const categories = fs.readdirSync(baseDir).filter((f) =>
    fs.statSync(path.join(baseDir, f)).isDirectory()
  );

  let count = 0;
  for (const category of categories) {
    const categoryDir = path.join(baseDir, category);
    const files = fs.readdirSync(categoryDir).filter((f) => f.endsWith('.js'));

    for (const file of files) {
      const command = require(path.join(categoryDir, file));

      if (!command?.data || !command?.execute) {
        console.warn(`[TNM] Skipping invalid command file: ${category}/${file}`);
        continue;
      }

      client.slashCommands.set(command.data.name, command);
      count += 1;
    }
  }

  console.log(`[TNM] Loaded ${count} slash command(s).`);
}

module.exports = { loadSlashCommands };
