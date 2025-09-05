# Global Discord Bot

A global Discord bot built with discord.js v14 that works across all servers.

## Features

- **Global Commands**: Works on any server the bot joins
- **Text Commands**: !ping, !hello, !serverinfo, !botinfo, !help
- **Slash Commands**: /ping, /hello, /botinfo
- **Server Statistics**: Displays server and bot information
- **Auto-scaling**: Tracks server joins/leaves
- **Rich Embeds**: Beautiful message formatting
- **Error Handling**: Comprehensive error management
- **Level System**: XP-based leveling with database storage
- **Level Roles**: Automatic role assignment based on levels
- **Leaderboards**: Server-wide ranking system
- **Welcome/Goodbye Messages**: Customizable member join/leave messages

## Level System

The bot includes a comprehensive leveling system with the following features:

### XP System
- Users gain 15-25 XP per message (with 1-minute cooldown)
- XP requirements increase exponentially with each level
- Formula: `XP = 100 * (1.5 ^ (level - 1))`

### Commands
**Text Commands:**
- `$level [@user]` - Show level card for yourself or another user
- `$rank [@user]` - Same as level command
- `$leaderboard` - Show top 10 users in the server
- `$setlevelrole <level> @role` - Set a role to be given at a specific level (Admin only)
- `$removelevelrole <level>` - Remove a level role (Admin only)
- `$levelroles` - Show all configured level roles

**Slash Commands:**
- `/level [user]` - Show level card
- `/rank [user]` - Show level card
- `/leaderboard [limit]` - Show leaderboard (1-20 users)
- `/setlevelrole <level> <role>` - Set level role (Admin only)
- `/removelevelrole <level>` - Remove level role (Admin only)
- `/levelroles` - Show configured level roles

## Welcome/Goodbye System

Automatic welcome and goodbye messages for new and leaving members.

### Features
- **Smart Channel Detection**: Automatically finds appropriate channels
- **Configurable Channels**: Set specific channels for welcome/goodbye messages
- **Rich Embeds**: Beautiful welcome/goodbye cards with user info
- **Member Statistics**: Shows member count and join dates

### Commands
**Text Commands:**
- `+setwelcome [#channel]` - Set welcome channel (Admin only)
- `+setgoodbye [#channel]` - Set goodbye channel (Admin only)
- `+testwelcome` - Test welcome message (Admin only)
- `+testgoodbye` - Test goodbye message (Admin only)

### Auto-Detection
If no specific channels are configured, the bot will automatically look for channels named:
- **Welcome**: welcome, general, lobby, main
- **Goodbye**: goodbye, farewell, general, lobby, main

### Database
- Uses SQLite for reliable data storage
- Tracks user XP, levels, message counts, and timestamps
- Stores level role configurations per server
- Stores welcome/goodbye channel settings per server
- Automatic database initialization and table creation

## Setup Instructions

### 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Copy the bot token (you'll need this for the .env file)
5. Under "Privileged Gateway Intents", enable:
   - Message Content Intent
   - Server Members Intent (optional, for member counts)

### 2. Get Required IDs

- **Client ID**: Found in the "General Information" section of your application

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Edit the `.env` file and replace the placeholder values:

```env
DISCORD_TOKEN=your_actual_bot_token_here
CLIENT_ID=your_actual_client_id_here
BOT_PREFIX=+
```

**Prefix Configuration:**
- Default prefix is `+` (e.g., `+ping`, `+help`)
- You can change it by modifying `BOT_PREFIX` in the .env file
- Examples: `!`, `?`, `>`, `$`, etc.

### 5. Bot Permissions

For a global bot with moderation features, use this invite URL template (replace CLIENT_ID):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=1099511627775&scope=bot%20applications.commands
```

**Required Permissions for Full Functionality:**
- **General**: Send Messages, Use Slash Commands, Embed Links, Read Message History
- **Moderation**: Ban Members, Kick Members, Moderate Members (Timeout)
- **Utility**: Add Reactions, Use External Emojis, Manage Messages
- **Advanced**: Administrator (for full moderation capabilities)

**Permission Breakdown by Command:**
- `ban/unban`: Requires "Ban Members" permission
- `kick`: Requires "Kick Members" permission  
- `timeout/untimeout`: Requires "Moderate Members" permission
- `userinfo/avatar`: No special permissions needed
- `afk`: No special permissions needed

### 6. Deploy Global Slash Commands

```bash
node deploy-commands.js
```

**Note**: Global commands take up to 1 hour to propagate across all Discord servers.

### 7. Delete Slash Commands (if needed)

To delete all global slash commands:
```bash
node delete-commands.js
```

To delete guild-specific commands (requires GUILD_ID in .env):
```bash
node delete-guild-commands.js
```

**Available npm scripts:**
```bash
npm run deploy              # Deploy global commands
npm run delete-commands     # Delete all global commands
npm run delete-guild-commands # Delete guild-specific commands
```

### 7. Start the Bot

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Available Commands

### Text Commands (Prefix: `+`)

**📋 General Commands:**
- `$help` - Shows all available commands
- `$ping` - Shows bot latency and API ping
- `$hello` - Greets the user with server name
- `$serverinfo` - Displays detailed server information
- `$botinfo` - Shows bot statistics and uptime
- `$prefix` - Shows current bot prefix

**🔨 Moderation Commands:**
- `$ban @user [reason]` - Ban a user from the server
- `$unban <user_id>` - Unban a user by their ID
- `$kick @user [reason]` - Kick a user from the server
- `$timeout @user <duration> [reason]` - Timeout a user (e.g., 10m, 1h, 1d)
- `$untimeout @user` - Remove timeout from a user
- `$mute` - Alias for timeout
- `$unmute` - Alias for untimeout

**💬 Utility Commands:**
- `$afk [reason]` - Set yourself as AFK
- `$userinfo [@user]` - Get information about a user
- `$avatar [@user]` - Get a user's avatar

**🎮 Fun Commands:**
- `$8ball <question>` - Ask the magic 8-ball a question
- `$ship <person1> [person2]` - Calculate love compatibility between two people

### Slash Commands
- `/ping` - Shows bot latency and API ping
- `/hello` - Greets the user with server name
- `/botinfo` - Shows bot statistics and uptime
- `/ban <user> [reason]` - Ban a user from the server
- `/unban <user_id>` - Unban a user by their ID
- `/kick <user> [reason]` - Kick a user from the server
- `/timeout <user> <duration> [reason]` - Timeout a user
- `/untimeout <user>` - Remove timeout from a user
- `/userinfo [user]` - Get information about a user
- `/avatar [user]` - Get a user's avatar
- `/8ball <question>` - Ask the magic 8-ball a question
- `/ship <person1> [person2]` - Calculate love compatibility between two people

## Global Bot Features

### Server Tracking
- Logs when the bot joins/leaves servers
- Displays total server count in bot info
- Shows total user count across all servers

### Scalability
- Designed to handle multiple servers simultaneously
- Efficient memory usage with caching
- Global command deployment for consistency

### Monitoring
- Real-time server count tracking
- Uptime monitoring
- Performance metrics (ping, latency)

## File Structure

```
bot-discord/
├── bot.js                    # Main bot file with global features
├── deploy-commands.js        # Global slash command registration
├── delete-commands.js        # Delete all global slash commands
├── delete-guild-commands.js  # Delete guild-specific slash commands
├── package.json              # Project dependencies and scripts
├── .env                     # Environment variables (not in git)
├── .gitignore               # Git ignore file
└── README.md                # This file
```

## Making Your Bot Public

### 1. Bot Verification (for 100+ servers)
- Bots in 100+ servers require verification
- Submit your bot for review in the Developer Portal
- Ensure compliance with Discord's Terms of Service

### 2. Bot Lists (Optional)
Consider submitting to bot listing websites:
- Top.gg
- Discord Bot List
- Bots on Discord

### 3. Privacy Policy & Terms
For public bots, consider adding:
- Privacy policy for data handling
- Terms of service
- Support server/contact information

## Troubleshooting

### Common Issues
- **Commands not appearing**: Global commands take up to 1 hour to sync
- **Permission errors**: Ensure bot has proper permissions in target servers
- **Rate limiting**: Implement proper rate limiting for high-traffic bots

### Performance Tips
- Use intents efficiently to reduce memory usage
- Implement command cooldowns for spam prevention
- Monitor bot performance across multiple servers

### Support
- Check Discord.js documentation for API updates
- Monitor Discord API status for service issues
- Implement proper logging for debugging across servers
