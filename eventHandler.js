// =============================================================
// TNM Event Handler
// Loads every file in src/events and registers it with client.on / client.once.
// Each event file exports { name, once (optional bool), execute(...args) }.
// =============================================================

const fs = require('fs');
const path = require('path');

function loadEvents(client) {
  const eventsDir = path.join(__dirname, '..', 'events');
  const files = fs.readdirSync(eventsDir).filter((f) => f.endsWith('.js'));

  let count = 0;
  for (const file of files) {
    const event = require(path.join(eventsDir, file));

    if (!event?.name || !event?.execute) {
      console.warn(`[TNM] Skipping invalid event file: ${file}`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    count += 1;
  }

  console.log(`[TNM] Loaded ${count} event(s).`);
}

module.exports = { loadEvents };
