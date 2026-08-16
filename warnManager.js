// =============================================================
// TNM Warn Manager
// Stores warnings per-user (an array of { reason, moderatorId, timestamp }).
// =============================================================

const db = require('./database');

function getWarnings(userId) {
  return db.get('warnings', userId, []);
}

function addWarning(userId, moderatorId, reason) {
  const warnings = getWarnings(userId);
  warnings.push({ reason, moderatorId, timestamp: Date.now() });
  db.set('warnings', userId, warnings);
  return warnings;
}

function clearWarnings(userId) {
  db.set('warnings', userId, []);
}

module.exports = { getWarnings, addWarning, clearWarnings };
