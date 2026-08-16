// =============================================================
// TNM Roblox Verification Helper
// Uses Roblox's public APIs (no auth required for these endpoints):
//  1. users.roblox.com  - resolve a username to a userId
//  2. groups.roblox.com - list the groups that user belongs to
// =============================================================

const axios = require('axios');

/**
 * Resolves a Roblox username to { id, name } or null if not found.
 */
async function getRobloxUserByUsername(username) {
  try {
    const res = await axios.post(
      'https://users.roblox.com/v1/usernames/users',
      { usernames: [username], excludeBannedUsers: false },
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    );

    const user = res.data && res.data.data && res.data.data[0];
    if (!user) return null;

    return { id: user.id, name: user.name, displayName: user.displayName };
  } catch (err) {
    console.error('[TNM] Roblox username lookup failed:', err.message);
    throw new Error('Could not reach Roblox to look up that username. Try again in a moment.');
  }
}

/**
 * Returns true if the given Roblox userId is a member of the given groupId.
 */
async function isUserInGroup(userId, groupId) {
  try {
    const res = await axios.get(
      `https://groups.roblox.com/v2/users/${userId}/groups/roles`,
      { timeout: 10000 }
    );

    const groups = (res.data && res.data.data) || [];
    return groups.some((entry) => String(entry.group.id) === String(groupId));
  } catch (err) {
    console.error('[TNM] Roblox group lookup failed:', err.message);
    throw new Error('Could not reach Roblox to check group membership. Try again in a moment.');
  }
}

module.exports = { getRobloxUserByUsername, isUserInGroup };
