// =============================================================
// TNM Permissions
// Shared logic for "is this person staff" and "is this action allowed",
// including abuse-prevention (no acting on other staff, no self-action).
// =============================================================

const config = require('../config');

/** True if the member has any of the configured staff roles. */
function isStaff(member) {
  if (!member || !member.roles) return false;
  return config.staffRoleIds.some((roleId) => member.roles.cache.has(roleId));
}

/**
 * Checks whether `actor` is allowed to take a moderation action against `target`.
 * Blocks: acting on yourself, acting on the bot, acting on another staff member,
 * and acting on someone with an equal/higher top role than the actor (Discord's
 * own hierarchy rule, re-checked here so we can return a clean error message).
 * Returns { allowed: boolean, reason?: string }
 */
function canModerate(actor, target) {
  if (!target) return { allowed: false, reason: 'That member could not be found.' };

  if (target.id === actor.id) {
    return { allowed: false, reason: 'You cannot use this action on yourself.' };
  }

  if (target.id === target.guild.client.user.id) {
    return { allowed: false, reason: 'You cannot use this action on the bot.' };
  }

  if (isStaff(target)) {
    return { allowed: false, reason: 'You cannot use this action on another staff member.' };
  }

  const actorTop = actor.roles.highest.position;
  const targetTop = target.roles.highest.position;
  if (targetTop >= actorTop && actor.guild.ownerId !== actor.id) {
    return {
      allowed: false,
      reason: 'You cannot use this action on someone with an equal or higher role than you.',
    };
  }

  if (!target.moderatable) {
    return {
      allowed: false,
      reason: "I don't have permission to take this action on that member (check my role position).",
    };
  }

  return { allowed: true };
}

module.exports = { isStaff, canModerate };
