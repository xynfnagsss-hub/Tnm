# TNM — Trust No Mob

A production-ready Discord bot built on Discord.js v14, covering a full ticket system, moderation suite, XP/leveling, Roblox group verification, and server-wide logging — all themed in black & white with "Powered by TNM" branding.

## ⚠️ Before you do anything else

If you ever pasted your real bot token anywhere outside your own `.env` file (in a chat, a screenshot, a public repo), **regenerate it immediately** in the [Discord Developer Portal](https://discord.com/developers/applications) → your application → **Bot** → **Reset Token**. A leaked token gives full control of your bot to whoever has it.

## 1. Install

```bash
npm install
```

Requires Node.js 18.17+.

## 2. Configure

```bash
cp .env.example .env
```

Open `.env` and fill in every value. Enable **Developer Mode** in Discord (User Settings → Advanced) so you can right-click anything and "Copy ID".

| Variable | Where to find it |
|---|---|
| `DISCORD_TOKEN` | Developer Portal → your app → Bot → Reset Token |
| `CLIENT_ID` | Developer Portal → your app → General Information → Application ID |
| `GUILD_ID` | Right-click your server icon → Copy Server ID |
| `STAFF_ROLE_IDS` | Right-click each staff role → Copy Role ID (comma-separated) |
| `LOG_CHANNEL_ID` | Right-click your logs channel → Copy Channel ID |
| `TICKET_CATEGORY_ID` | Right-click the category tickets should be created under → Copy Category ID |
| `ROBLOX_GROUP_ID` | The number in your group's URL: `roblox.com/communities/GROUP_ID/...` |
| `VERIFIED_ROLE_ID` | Right-click the role verified members should get → Copy Role ID |
| `LEVEL_UP_CHANNEL_ID` | A channel ID, or leave as `any` to announce wherever the user is chatting |
| `LEVEL_ROLES` | Format: `level:roleId,level:roleId` e.g. `5:123...,10:456...` |

The bot needs the **Server Members**, **Message Content**, and **Presence** privileged intents enabled in the Developer Portal (Bot page → Privileged Gateway Intents).

## 3. Invite the bot

Generate an invite link from the Developer Portal (OAuth2 → URL Generator) with the `bot` and `applications.commands` scopes, and grant it at minimum: `Manage Channels`, `Manage Roles`, `Manage Messages`, `Kick Members`, `Ban Members`, `Moderate Members`, `Manage Nicknames`, `Read Message History`, `Send Messages`, `Embed Links`, `Attach Files`.

Make sure the bot's role is positioned **above** every role it needs to manage (staff roles it needs to see tickets from, level roles, the verified role, etc.).

## 4. Deploy slash commands

```bash
npm run deploy
```

Run this once, and again any time you add or change a slash command.

## 5. Start the bot

```bash
npm start
```

## Commands

### Prefix (`.`) commands
- `.ticket setup` — posts the 4-button ticket panel
- `.verify setup` — posts the Roblox verification panel
- `.level setup` — shows the active leveling configuration
- `.purge role @Role` — removes a role from every member who has it, with live progress

### Slash commands
- **Moderation:** `/ban` `/unban` `/kick` `/timeout` `/untimeout` `/warn` `/warnings` `/clearwarnings` `/lock` `/unlock` `/slowmode` `/purge` `/nuke` `/role` `/nickname` `/announce`
- **Leveling:** `/rank` `/leaderboard`

## Project structure

```
src/
  index.js              # entry point
  config.js             # loads and validates .env
  deploy-commands.js    # registers slash commands
  handlers/             # command/event/button/select-menu loaders
  commands/
    slash/moderation/   # /ban, /kick, etc.
    slash/leveling/     # /rank, /leaderboard
    prefix/             # .ticket, .verify, .level, .purge
  events/                # one file per Discord.js event
  utils/                 # embeds, database, permissions, logger, ticket/level/verify managers
data/                    # JSON storage (auto-created, gitignored)
transcripts/             # saved ticket transcripts (auto-created, gitignored)
```

## Storage

This bot uses a lightweight built-in JSON file database (`src/utils/database.js`) — no external database setup required. Data lives in `/data` as one JSON file per table (`tickets.json`, `levels.json`, `warnings.json`). For very high-traffic servers you can swap this module for a real database later without touching command code, since everything goes through `get` / `set` / `all`.

## Branding

Edit `src/config.js` → `brand` to change the embed color, footer text, presence, or logo URL (currently a placeholder — swap `logoUrl` for your own hosted TNM logo whenever you have one).
