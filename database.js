// =============================================================
// TNM Database
// A small, dependency-free JSON-file store. Good enough for a
// single-process bot and avoids native bindings (better-sqlite3, etc.)
// that can be painful to install on some hosts.
//
// Each "table" (warnings, levels, tickets) is its own JSON file under /data,
// loaded into memory on first access and written back to disk on every write.
// For very large servers you can later swap this module for a real database
// without touching any command code, since everything goes through get/set/push.
// =============================================================

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const cache = new Map();

function filePath(table) {
  return path.join(DATA_DIR, `${table}.json`);
}

function load(table) {
  if (cache.has(table)) return cache.get(table);

  const file = filePath(table);
  let data = {};
  if (fs.existsSync(file)) {
    try {
      data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      console.error(`[TNM] Failed to parse data/${table}.json, starting fresh.`, err);
      data = {};
    }
  }
  cache.set(table, data);
  return data;
}

function persist(table) {
  const data = cache.get(table) || {};
  fs.writeFileSync(filePath(table), JSON.stringify(data, null, 2), 'utf8');
}

/** Get a value by key from a table. Returns fallback if not found. */
function get(table, key, fallback = undefined) {
  const data = load(table);
  return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : fallback;
}

/** Set a value by key in a table and persist to disk. */
function set(table, key, value) {
  const data = load(table);
  data[key] = value;
  persist(table);
  return value;
}

/** Delete a key from a table and persist to disk. */
function del(table, key) {
  const data = load(table);
  delete data[key];
  persist(table);
}

/** Return the entire table object (key -> value). */
function all(table) {
  return load(table);
}

module.exports = { get, set, del, all };
