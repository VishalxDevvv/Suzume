
const { Client, GatewayIntentBits, Events, Collection, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const Database = require('./database');
const LevelSystem = require('./levelSystem');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('./royalStyles');
const CustomEmojiManager = require('./customEmojis');
const EmojiFun = require('./emojiFeatures');
const ServerConfig = require('./serverConfig');
const PrefixSystem = require('./prefixSystem');
const fs = require('fs');
const path = require('path');
const Economy = require('./economy');
require('dotenv').config();
const express = require('express');
const cors =require('cors');
const sqlite3 = require('sqlite3').verbose();

// Bot configuration
const DEFAULT_PREFIX = process.env.BOT_PREFIX || '$';

// Command collection
const commands = new Collection();

// Prefix-free commands (economy commands that work without prefix)
const prefixFreeCommands = ['cash', 'balance', 'bal', 'money', 'wallet', 'daily', 'claim', 'leaderboard', 'top', 'lb', 'rich', 'cf', 'flip', 'give', 'gift', 'send'];

// Check if message starts with 'sz' (for sz cash, sz daily, etc.)
function checkSuzuCommand(content) {
    const words = content.toLowerCase().split(' ');
    if (words[0] === 'sz' && words.length >= 2) {
        return {
            isSuzuCommand: true,
            subcommand: words[1],
            args: words.slice(2)
        };
    }
    return { isSuzuCommand: false };
}

// Load commands from commands directory and subdirectories
function loadCommands(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const itemPath = path.join(dir, item);
        if (fs.statSync(itemPath).isDirectory()) {
            loadCommands(itemPath);
        } else if (item.endsWith('.js')) {
            const command = require(`./${path.relative(__dirname, itemPath)}`);
            commands.set(command.name, command);
        }
    }
}

// Load slash commands
const slashCommands = new Collection();
function loadSlashCommands(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const itemPath = path.join(dir, item);
        if (fs.statSync(itemPath).isDirectory()) {
            loadSlashCommands(itemPath);
        } else if (item.startsWith('slash-') && item.endsWith('.js')) {
            const command = require(`./${path.relative(__dirname, itemPath)}`);
            if (command.data) {
                slashCommands.set(command.data.name, command);
            }
        }
    }
}

if (fs.existsSync('./commands')) {
    loadCommands('./commands');
    loadSlashCommands('./commands');
    console.log(`✅ Loaded ${commands.size} prefix commands and ${slashCommands.size} slash commands`);
}

// AFK users storage (in production, use a database)
const afkUsers = new Map();

// 8ball responses
const eightBallResponses = [
    // Positive responses
    "🟢 It is certain",
    "🟢 It is decidedly so",
    "🟢 Without a doubt",
    "🟢 Yes definitely",
    "🟢 You may rely on it",
    "🟢 As I see it, yes",
    "🟢 Most likely",
    "🟢 Outlook good",
    "🟢 Yes",
    "🟢 Signs point to yes",

    // Neutral/uncertain responses
    "🟡 Reply hazy, try again",
    "🟡 Ask again later",
    "🟡 Better not tell you now",
    "🟡 Cannot predict now",
    "🟡 Concentrate and ask again",

    // Negative responses
    "🔴 Don't count on it",
    "🔴 My reply is no",
    "🔴 My sources say no",
    "🔴 Outlook not so good",
    "🔴 Very doubtful"
];

// Ship compatibility messages
const shipMessages = {
    0: "💔 No chemistry at all...",
    10: "😐 Just friends, nothing more",
    20: "🤝 Good friends, maybe?",
    30: "😊 There's some potential here",
    40: "${ROYAL_EMOJIS.HEART} Cute together!",
    50: "${ROYAL_EMOJIS.HEART} Perfect match!",
    60: "💝 Made for each other!",
    70: "💞 Soulmates detected!",
    80: "💘 Love is in the air!",
    90: "${ROYAL_EMOJIS.STAR} Absolutely perfect!",
    100: "${ROYAL_EMOJIS.SPARKLES}${ROYAL_EMOJIS.HEART} ULTIMATE LOVE MATCH! ${ROYAL_EMOJIS.HEART}${ROYAL_EMOJIS.SPARKLES}"
};

// Function to calculate ship percentage
function calculateShipPercentage(name1, name2) {
    // Create a consistent hash based on the two names
    const combined = (name1.toLowerCase() + name2.toLowerCase()).split('').sort().join('');
    let hash = 0;

    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to percentage (0-100)
    return Math.abs(hash) % 101;
}

// Function to get ship message based on percentage
function getShipMessage(percentage) {
    if (percentage === 100) return shipMessages[100];
    if (percentage >= 90) return shipMessages[90];
    if (percentage >= 80) return shipMessages[80];
    if (percentage >= 70) return shipMessages[70];
    if (percentage >= 60) return shipMessages[60];
    if (percentage >= 50) return shipMessages[50];
    if (percentage >= 40) return shipMessages[40];
    if (percentage >= 30) return shipMessages[30];
    if (percentage >= 20) return shipMessages[20];
    if (percentage >= 10) return shipMessages[10];
    return shipMessages[0];
}

// Function to create ship name
function createShipName(name1, name2) {
    const half1 = name1.slice(0, Math.ceil(name1.length / 2));
    const half2 = name2.slice(Math.floor(name2.length / 2));
    return half1 + half2;
}

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

// Initialize database and level system
const database = new Database();
const levelSystem = new LevelSystem(database);

// Create a collection for commands
client.commands = new Collection();

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async readyClient => {
    console.log(`✅ Global Bot is ready! Logged in as ${readyClient.user.tag}`);
    console.log(`${ROYAL_EMOJIS.STATS} Serving ${readyClient.guilds.cache.size} servers`);
    console.log(`🔧 Bot prefix: ${DEFAULT_PREFIX} (default, customizable per server)`);

    // Register slash commands
    try {
        console.log('🔄 Registering slash commands...');
        const commandData = slashCommands.map(command => command.data.toJSON());

        await readyClient.application.commands.set(commandData);
        console.log(`✅ Registered ${commandData.length} slash commands globally`);
    } catch (error) {
        console.error('❌ Error registering slash commands:', error);
    }

    // Set bot activity with prefix
    readyClient.user.setActivity('with Suzu Cash 💰 | Type "cash" for balance!', { type: 'PLAYING' });
});

// Listen for messages
client.on(Events.MessageCreate, async message => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Process message for level system (XP gain)
    await levelSystem.processMessage(message);

    // Check for AFK users and remove them from AFK when they send a message
    if (afkUsers.has(message.author.id)) {
        const afkData = afkUsers.get(message.author.id);
        afkUsers.delete(afkData.id);

        const backEmbed = RoyalStyler.createRoyalEmbed({
            title: 'Return Celebration',
            description: `${ROYAL_EMOJIS.CROWN} Welcome back to the community, **${message.author.username}**! ${ROYAL_EMOJIS.CROWN}\n\nYour presence has been missed!`,
            color: ROYAL_COLORS.EMERALD,
            fields: [
                {
                    name: 'Previous Duty',
                    value: `${ROYAL_EMOJIS.SCROLL} *\"${afkData.reason}\"*\n`,
                    inline: false
                }
            ],
            footer: {
                text: 'The Community Rejoices at Your Return'
            }
        });

        message.reply({ embeds: [backEmbed] });
    }

    // Check if someone mentioned an AFK user
    message.mentions.users.forEach(user => {
        if (afkUsers.has(user.id)) {
            const afkData = afkUsers.get(user.id);
            const afkEmbed = RoyalStyler.createRoyalEmbed({
                title: 'Absence Notice',
                description: `${ROYAL_EMOJIS.CRYSTAL} **${user.username}** is currently away from the community`,
                color: ROYAL_COLORS.SILVER,
                fields: [
                    {
                        name: 'Reason for Absence',
                        value: `${ROYAL_EMOJIS.SCROLL} *\"${afkData.reason}\"*\n`,
                        inline: false
                    },
                    {
                        name: 'Away Since',
                        value: `${ROYAL_EMOJIS.STAR} <t:${Math.floor(afkData.timestamp / 1000)}:R>`,
                        inline: false
                    }
                ],
                footer: {
                    text: 'Community Registry | They shall return when duties permit'
                }
            });

            message.reply({ embeds: [afkEmbed] });
        }
    });

    // Get server prefix (or default for DMs)
    const serverPrefix = message.guild ? PrefixSystem.getPrefix(message.guild.id) : DEFAULT_PREFIX;

    // Check for 'sz' commands without prefix (sz cash, sz daily, etc.)
    const suzuCheck = checkSuzuCommand(message.content);
    if (suzuCheck.isSuzuCommand) {
        const suzuCommand = commands.get('suzu');
        if (suzuCommand) {
            const args = [suzuCheck.subcommand, ...suzuCheck.args];
            try {
                await suzuCommand.execute(message, args);
            } catch (error) {
                console.error('Sz command execution error:', error);
                message.reply(`${ROYAL_EMOJIS.ERROR} There was an error executing that command!`);
            }
            return;
        }
    }

    // Check for other prefix-free economy commands
    const messageContent = message.content.toLowerCase();
    const firstWord = messageContent.split(' ')[0];

    if (prefixFreeCommands.includes(firstWord)) {
        const command = commands.get(firstWord);
        if (command) {
            const args = message.content.slice(firstWord.length).trim().split(/ +/);
            try {
                await command.execute(message, args);
            } catch (error) {
                console.error('Command execution error:', error);
                message.reply(`${ROYAL_EMOJIS.ERROR} There was an error executing that command!`);
            }
            return;
        }
    }

    // XP System - Add XP for every message (not commands)
    if (!message.content.startsWith(serverPrefix) && !prefixFreeCommands.includes(firstWord) && !suzuCheck.isSuzuCommand) {
        const settings = ServerConfig.getSettings(message.guild.id);

        // Check if levels are enabled for this server
        if (settings.level_enabled !== 0) {
            const result = await levelSystem.processMessage(message);
            if (result && result.leveledUp) {
                const levelMessage = (settings.level_message || '{user} reached level {level}!')
                    .replace('{user}', message.author.username)
                    .replace('{level}', result.newLevel);

                const levelUpEmbed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.XP} Level Up!`, 
                    description: `${ROYAL_EMOJIS.SUCCESS} ${levelMessage}`,
                    color: ROYAL_COLORS.GOLD,
                    thumbnail: message.author.displayAvatarURL()
                });

                // Send to configured level channel or current channel
                const levelChannel = settings.level_channel ?
                    message.guild.channels.cache.get(settings.level_channel) : message.channel;

                if (levelChannel) {
                    levelChannel.send({ embeds: [levelUpEmbed] });
                } else {
                    message.reply({ embeds: [levelUpEmbed] });
                }
            }
        }

        // Global XP System - Global XP gain
        const user = Economy.getUser(message.author.id);
        const now = Date.now();
        const cooldown = 60000; // 1 minute

        if (now - user.last_xp_time >= cooldown) {
            const xpGain = Math.floor(Math.random() * 11) + 15; // 15-25 XP
            const result = Economy.addXP(message.author.id, xpGain);

            if (result.levelUp) {
                // Progressive reward scaling (starts small, grows gradually)
                const baseReward = 50;
                const levelMultiplier = Math.floor(Math.pow(result.newLevel, 1.3));
                const reward = baseReward + (levelMultiplier * 10);

                Economy.updateBalance(message.author.id, reward);

                // Create level up image
                const { createCanvas, loadImage } = require('canvas');
                const { AttachmentBuilder } = require('discord.js');
                const fs = require('fs');

                const canvas = createCanvas(600, 300);
                const ctx = canvas.getContext('2d');

                // Try to load custom background
                let hasCustomBg = false;
                try {
                    const bgData = JSON.parse(fs.readFileSync('./data/backgrounds.json', 'utf8'));
                    const customBgUrl = bgData[message.author.id];

                    if (customBgUrl) {
                        const customBg = await loadImage(customBgUrl);
                        ctx.drawImage(customBg, 0, 0, 600, 300);
                        hasCustomBg = true;
                    }
                } catch (e) { /* No custom background */ }

                // Fallback gradient if no custom background
                if (!hasCustomBg) {
                    const gradient = ctx.createLinearGradient(0, 0, 600, 300);
                    gradient.addColorStop(0, '#FFD700');
                    gradient.addColorStop(1, '#FFA500');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 600, 300);
                }

                // Semi-transparent overlay
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(0, 0, 600, 300);

                // User avatar
                try {
                    const avatar = await loadImage(message.author.displayAvatarURL({ extension: 'png', size: 128 }));

                    // Avatar border
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(100, 150, 52, 0, Math.PI * 2);
                    ctx.stroke();

                    // Avatar image
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(100, 150, 50, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(avatar, 50, 100, 100, 100);
                    ctx.restore();
                } catch (error) {
                    // Fallback circle
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(100, 150, 50, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Level up text
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 36px Arial';
                ctx.fillText('🎉 LEVEL UP! 🎉', 200, 100);

                ctx.font = 'bold 28px Arial';
                ctx.fillText(`${message.author.username}`, 200, 140);

                ctx.font = 'bold 24px Arial';
                ctx.fillText(`Level ${result.newLevel}`, 200, 180);

                // Reward text
                ctx.font = 'bold 20px Arial';
                ctx.fillStyle = '#FFD700';
                ctx.fillText(`💰 +${reward.toLocaleString()} suzu cash!`, 200, 210);

                // Footer
                ctx.font = '16px Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fillText('*notices your growth* ✨', 200, 240);

                const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'levelup.png' });
                message.reply({ files: [attachment] });
            }
        }
    }

    // Check if message starts with server prefix
    if (!message.content.startsWith(serverPrefix)) return;

    // Remove prefix and get command
    const args = message.content.slice(serverPrefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Helper function to check permissions
    const hasPermission = (member, permission) => {
        return member.permissions.has(permission);
    };

    // Helper function to parse time
    const parseTime = (timeStr) => {
        const time = parseInt(timeStr);
        const unit = timeStr.slice(-1).toLowerCase();

        switch(unit) {
            case 's': return time * 1000;
            case 'm': return time * 60 * 1000;
            case 'h': return time * 60 * 60 * 1000;
            case 'd': return time * 24 * 60 * 60 * 1000;
            default: return time * 60 * 1000; // default to minutes
        }
    };

    // Check if command exists in commands collection
    if (commands.has(command)) {
        try {
            await commands.get(command).execute(message, args);
            return;
        } catch (error) {
            console.error('Command execution error:', error);
            message.reply('There was an error executing that command!');
            return;
        }
    }

    // Help command
    if (command === 'help') {
        const category = args[0]?.toLowerCase();
        let helpEmbed;

        if (!category) {
            // Main help with buttons
            helpEmbed = RoyalStyler.createRoyalHelp(serverPrefix);

            const dropdown = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('help_select')
                        .setPlaceholder('📋 Select a command category')
                        .addOptions([
                            {
                                label: 'API Commands',
                                description: '40+ API commands - Weather, Movies, Crypto, Memes & more',
                                value: 'help_api',
                                emoji: '1412013628693020775'
                            },
                            {
                                label: 'Utility Commands',
                                description: 'Calculators, Converters, Tools & Utilities',
                                value: 'help_utility',
                                emoji: '1412014731283398656'
                            },
                            {
                                label: 'Games & Fun',
                                description: 'Interactive Games, Party Games & Entertainment',
                                value: 'help_games',
                                emoji: '1412003781603754005'
                            },
                            {
                                label: 'Moderation',
                                description: 'Server Management & Moderation Tools',
                                value: 'help_mod',
                                emoji: '1412005769590739004'
                            },
                            {
                                label: 'Social & Anime',
                                description: 'Anime Search, Social Features & More',
                                value: 'help_anime',
                                emoji: '1412007203728265239'
                            }
                        ])
                );

            return message.reply({ embeds: [helpEmbed], components: [dropdown] });
        }

        switch(category) {
            case 'api':
                helpEmbed = RoyalStyler.createApiHelp(serverPrefix);
                break;
            case 'anime':
                helpEmbed = RoyalStyler.createAnimeHelp(serverPrefix);
                break;
            case 'mod':
            case 'moderation':
                helpEmbed = RoyalStyler.createModHelp(serverPrefix);
                break;
            case 'games':
            case 'game':
            case 'fun':
                helpEmbed = RoyalStyler.createGamesHelp(serverPrefix);
                break;
            case 'utility':
            case 'util':
            case 'tools':
                helpEmbed = RoyalStyler.createUtilityHelp(serverPrefix);
                break;
            default:
                helpEmbed = RoyalStyler.createRoyalHelp(serverPrefix);
        }

        message.reply({ embeds: [helpEmbed] });
    }

    // Prefix command
    else if (command === 'prefix') {
        const prefixEmbed = RoyalStyler.createRoyalEmbed({
            title: 'Command Prefix',
            description: `${ROYAL_EMOJIS.SCROLL} The sacred prefix for commands in this realm is: \n\n${serverPrefix}\n\n`,
            color: ROYAL_COLORS.ROYAL_BLUE,
            fields: [
                {
                    name: 'Usage Examples',
                    value: `${ROYAL_EMOJIS.STAR} \n${serverPrefix}ping  - Test connection\n${ROYAL_EMOJIS.STAR} \n${serverPrefix}help  - View command codex\n${ROYAL_EMOJIS.STAR} \n${serverPrefix}level  - Check rank`,
                    inline: false
                },
                {
                    name: 'Alternative Method',
                    value: `${ROYAL_EMOJIS.CRYSTAL} You may also use slash commands like \n/ping`,
                    inline: false
                }
            ],
            footer: {
                text: 'Command Registry'
            }
        });

        message.reply({ embeds: [prefixEmbed] });
    }

    // Simple ping command
    else if (command === 'ping') {
        const sent = Date.now();
        message.reply(`${ROYAL_EMOJIS.CRYSTAL} Testing royal connection...`).then(sentMessage => {
            const timeTaken = Date.now() - sent;
            const royalPingEmbed = RoyalStyler.createRoyalPing(timeTaken, Math.round(client.ws.ping));
            sentMessage.edit({ content: '', embeds: [royalPingEmbed] });
        });
    }

    // Hello command
    else if (command === 'hello') {
        const greeting = RoyalStyler.createRoyalEmbed({
            title: 'Greetings ✨',
            description: `✨ Greetings, ${message.author.username}!\n\nWelcome to **${message.guild.name}**!\n\nMay your presence bring honor and prosperity to our community!`, 
            color: ROYAL_COLORS.GOLD,
            thumbnail: message.author.displayAvatarURL({ size: 256 }),
            footer: {
                text: 'Your Humble Assistant'
            }
        });
        message.reply({ embeds: [greeting] });
    }

    // AFK command
    else if (command === 'afk') {
        const reason = args.join(' ') || 'Duties require attention';

        afkUsers.set(message.author.id, {
            reason: reason,
            timestamp: Date.now()
        });

        const afkEmbed = RoyalStyler.createRoyalEmbed({
            title: 'Absence Declaration',
            description: `${ROYAL_EMOJIS.SCROLL} **${message.author.username}** has declared a temporary absence from the community`,
            color: ROYAL_COLORS.PURPLE,
            fields: [
                {
                    name: 'Reason for Absence',
                    value: `${ROYAL_EMOJIS.CRYSTAL} *\"${reason}\"*\n`,
                    inline: false
                }
            ],
            footer: {
                text: 'Community Registry | Your return shall be celebrated'
            }
        });

        message.reply({ embeds: [afkEmbed] });
    }

    // Ban command
    else if (command === 'ban') {
        if (!hasPermission(message.member, PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ You need the "Ban Members" permission to use this command.');
        }

        const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
        if (!user) {
            return message.reply('❌ Please mention a user or provide a valid user ID.');
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await message.guild.members.ban(user, { reason: reason });

            const banEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🔨 User Banned')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [banEmbed] });
        } catch (error) {
            message.reply('❌ Failed to ban user. Make sure I have permission and the user is bannable.');
        }
    }

    // Unban command
    else if (command === 'unban') {
        if (!hasPermission(message.member, PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ You need the "Ban Members" permission to use this command.');
        }

        const userId = args[0];
        if (!userId) {
            return message.reply('❌ Please provide a user ID to unban.');
        }

        try {
            await message.guild.members.unban(userId);

            const unbanEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ User Unbanned')
                .addFields(
                    { name: 'User ID', value: userId, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true }
                )
                .setTimestamp();

            message.reply({ embeds: [unbanEmbed] });
        } catch (error) {
            message.reply('❌ Failed to unban user. Make sure the user ID is correct and they are banned.');
        }
    }

    // Kick command
    else if (command === 'kick') {
        if (!hasPermission(message.member, PermissionsBitField.Flags.KickMembers)) {
            return message.reply('❌ You need the "Kick Members" permission to use this command.');
        }

        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('❌ Please mention a user to kick.');
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await member.kick(reason);

            const kickEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('👢 User Kicked')
                .addFields(
                    { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [kickEmbed] });
        } catch (error) {
            message.reply('❌ Failed to kick user. Make sure I have permission and the user is kickable.');
        }
    }

    // Timeout command
    else if (command === 'timeout' || command === 'mute') {
        if (!hasPermission(message.member, PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ You need the "Timeout Members" permission to use this command.');
        }

        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('❌ Please mention a user to timeout.');
        }

        const timeArg = args[1];
        if (!timeArg) {
            return message.reply('❌ Please specify a time (e.g., 10m, 1h, 1d).');
        }

        const duration = parseTime(timeArg);
        const reason = args.slice(2).join(' ') || 'No reason provided';

        try {
            await member.timeout(duration, reason);

            const timeoutEmbed = new EmbedBuilder()
                .setColor(0xFF6B6B)
                .setTitle('🔇 User Timed Out')
                .addFields(
                    { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: 'Duration', value: timeArg, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [timeoutEmbed] });
        } catch (error) {
            message.reply('❌ Failed to timeout user. Make sure I have permission and the duration is valid (max 28 days).');
        }
    }

    // Untimeout command
    else if (command === 'untimeout' || command === 'unmute') {
        if (!hasPermission(message.member, PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ You need the "Timeout Members" permission to use this command.');
        }

        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('❌ Please mention a user to remove timeout from.');
        }

        try {
            await member.timeout(null);

            const untimeoutEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🔊 Timeout Removed')
                .addFields(
                    { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true }
                )
                .setTimestamp();

            message.reply({ embeds: [untimeoutEmbed] });
        } catch (error) {
            message.reply('❌ Failed to remove timeout. Make sure the user is currently timed out.');
        }
    }

    // User info command
    else if (command === 'userinfo') {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);

        const userEmbed = RoyalStyler.createRoyalUserInfo(user, member);
        message.reply({ embeds: [userEmbed] });
    }

    // 8ball command
    else if (command === '8ball') {
        const question = args.join(' ');

        if (!question) {
            const errorEmbed = RoyalStyler.createRoyalEmbed({
                title: 'Oracle Requires Inquiry',
                description: `${ROYAL_EMOJIS.CRYSTAL} Please present your question to the oracle!\n\n**Example:** \n${serverPrefix}8ball Will the kingdom prosper?
`,
                color: ROYAL_COLORS.CRIMSON,
                footer: {
                    text: 'The Oracle Awaits Your Wisdom-Seeking Question'
                }
            });
            return message.reply({ embeds: [errorEmbed] });
        }

        // Get random response
        const randomResponse = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];

        const eightBallEmbed = RoyalStyler.createRoyal8Ball(question, randomResponse);
        message.reply({ embeds: [eightBallEmbed] });
    }

    // Ship command
    else if (command === 'ship') {
        let person1, person2;

        // Check if two users are mentioned
        const mentionedUsers = message.mentions.users;

        if (mentionedUsers.size >= 2) {
            // Two users mentioned
            const usersArray = Array.from(mentionedUsers.values());
            person1 = usersArray[0].username;
            person2 = usersArray[1].username;
        } else if (mentionedUsers.size === 1) {
            // One user mentioned, ship with command author
            person1 = message.author.username;
            person2 = mentionedUsers.first().username;
        } else if (args.length >= 2) {
            // Two names provided as text
            person1 = args[0];
            person2 = args.slice(1).join(' ');
        } else if (args.length === 1) {
            // One name provided, ship with command author
            person1 = message.author.username;
            person2 = args[0];
        } else {
            const helpEmbed = RoyalStyler.createRoyalEmbed({
                title: 'Matchmaking Instructions',
                description: `${ROYAL_EMOJIS.GOLDEN_HEART} Please provide two souls for the compatibility ceremony!`, 
                color: ROYAL_COLORS.ROSE_GOLD,
                fields: [
                    {
                        name: 'Commands',
                        value: `${ROYAL_EMOJIS.SCROLL} \n${serverPrefix}ship @user1 @user2  - Match two members\n${ROYAL_EMOJIS.SCROLL} \n${serverPrefix}ship @user  - Match yourself with mentioned user\n${ROYAL_EMOJIS.SCROLL} \n${serverPrefix}ship Alice Bob  - Match by names\n${ROYAL_EMOJIS.SCROLL} \n${serverPrefix}ship Alice  - Match yourself with Alice`,
                        inline: false
                    }
                ],
                footer: {
                    text: 'Court of Love Awaits Your Command'
                }
            });
            return message.reply({ embeds: [helpEmbed] });
        }

        // Calculate ship percentage
        const percentage = calculateShipPercentage(person1, person2);
        const shipName = createShipName(person1, person2);
        const message_text = getShipMessage(percentage);

        const shipEmbed = RoyalStyler.createRoyalShip(person1, person2, percentage, shipName, message_text);
        message.reply({ embeds: [shipEmbed] });
    }

    // Avatar command
    else if (command === 'avatar' || command === 'av') {
        const user = message.mentions.users.first() || message.author;

        const avatarEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ size: 512 }))
            .setTimestamp();

        message.reply({ embeds: [avatarEmbed] });
    }

    // Server info command
    else if (command === 'serverinfo') {
        const serverEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${ROYAL_EMOJIS.STATS} Server Information`)
            .setThumbnail(message.guild.iconURL())
            .addFields(
                { name: `${ROYAL_EMOJIS.SCROLL} Server Name`, value: message.guild.name, inline: true },
                { name: `${ROYAL_EMOJIS.GEM} Total Members`, value: message.guild.memberCount.toString(), inline: true },
                { name: '👑 Owner', value: `<@${message.guild.ownerId}>`, inline: true },
                { name: '📅 Created', value: message.guild.createdAt.toDateString(), inline: true },
                { name: '🆔 Server ID', value: message.guild.id, inline: true },
                { name: '🌍 Region', value: message.guild.preferredLocale || 'Unknown', inline: true }
            )
            .setTimestamp();

        message.reply({ embeds: [serverEmbed] });
    }

    // Bot info command
    else if (command === 'botinfo') {
        const botEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🤖 Bot Information')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: `${ROYAL_EMOJIS.TAG} Bot Name`, value: client.user.username, inline: true },
                { name: `${ROYAL_EMOJIS.DIAMOND} Bot ID`, value: client.user.id, inline: true },
                { name: `${ROYAL_EMOJIS.SETTINGS} Prefix`, value: `\n${serverPrefix}\n`, inline: true },
                { name: `${ROYAL_EMOJIS.STATS} Servers`, value: client.guilds.cache.size.toString(), inline: true },
                { name: '${ROYAL_EMOJIS.USER} Total Users', value: client.users.cache.size.toString(), inline: true },
                { name: '${ROYAL_EMOJIS.PING} Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
                { name: '${ROYAL_EMOJIS.TIME} Uptime', value: formatUptime(client.uptime), inline: true },
                { name: '${ROYAL_EMOJIS.LIBRARY} Library', value: 'Discord.js v14', inline: true },
                { name: '🟢 Status', value: 'Online & Global', inline: true }
            )
            .setTimestamp();

        message.reply({ embeds: [botEmbed] });
    }

    // Level System Commands
    else if (command === 'level' || command === 'rank') {
        const targetUser = message.mentions.users.first() || message.author;
        const targetMember = message.guild.members.cache.get(targetUser.id);

        if (!targetMember) {
            return message.reply('❌ User not found in this server!');
        }

        try {
            const stats = await levelSystem.getUserStats(targetUser.id, message.guild.id);

            if (!stats) {
                const noStatsEmbed = RoyalStyler.createRoyalEmbed({
                    title: 'Registry Notice',
                    description: `${ROYAL_EMOJIS.SCROLL} ${targetUser.id === message.author.id ? 'You have not yet' : `**${targetUser.username}** has not yet`} participated in discussions to earn experience!`,
                    color: ROYAL_COLORS.SILVER,
                    footer: {
                        text: 'Begin conversing to earn your place in the hierarchy'
                    }
                });
                return message.reply({ embeds: [noStatsEmbed] });
            }

            const levelCard = RoyalStyler.createRoyalLevelCard(targetMember, stats);
            message.reply({ embeds: [levelCard] });
        } catch (error) {
            console.error('Error getting user stats:', error);
            message.reply('❌ An error occurred while fetching level data.');
        }
    }

    else if (command === 'leaderboard' || command === 'lb') {
        try {
            const leaderboardEmbed = await levelSystem.createLeaderboard(message.guild, 10);
            message.reply({ embeds: [leaderboardEmbed] });
        } catch (error) {
            console.error('Error creating leaderboard:', error);
            message.reply('❌ An error occurred while fetching leaderboard data.');
        }
    }

    else if (command === 'setlevelrole') {
        // Check if user has administrator permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need Administrator permissions to use this command!');
        }

        const level = parseInt(args[0]);
        const role = message.mentions.roles.first();

        if (!level || !role) {
            return message.reply(`❌ Invalid usage! Use: \n${serverPrefix}setlevelrole <level> @role\nExample: \n${serverPrefix}setlevelrole 10 @Level 10\n`);
        }

        if (level < 1 || level > 100) {
            return message.reply('❌ Level must be between 1 and 100!');
        }

        try {
            await database.addLevelRole(message.guild.id, level, role.id);

            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Level Role Set!')
                .setDescription(`Users who reach level **${level}** will now receive the ${role} role!`) 
                .setTimestamp();

            message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error setting level role:', error);
            message.reply('❌ An error occurred while setting the level role.');
        }
    }

    else if (command === 'removelevelrole') {
        // Check if user has administrator permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need Administrator permissions to use this command!');
        }

        const level = parseInt(args[0]);

        if (!level) {
            return message.reply(`❌ Invalid usage! Use: \n${serverPrefix}removelevelrole <level>\nExample: \n${serverPrefix}removelevelrole 10\n`);
        }

        try {
            const changes = await database.removeLevelRole(message.guild.id, level);

            if (changes === 0) {
                return message.reply(`❌ No level role found for level ${level}!`);
            }

            const successEmbed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('✅ Level Role Removed!')
                .setDescription(`Level role for level **${level}** has been removed!`) 
                .setTimestamp();

            message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error removing level role:', error);
            message.reply('❌ An error occurred while removing the level role.');
        }
    }

    else if (command === 'levelroles') {
        try {
            const levelRoles = await database.getLevelRoles(message.guild.id);

            if (levelRoles.length === 0) {
                return message.reply('❌ No level roles have been set up for this server!');
            }

            let description = '';
            for (const roleData of levelRoles) {
                const role = message.guild.roles.cache.get(roleData.role_id);
                const roleName = role ? role.name : 'Deleted Role';
                description += `**Level ${roleData.level}:** ${role ? role : roleName}\n`;
            }

            const rolesEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📋 Level Roles')
                .setDescription(description)
                .setFooter({ text: `${levelRoles.length} level role(s) configured` })
                .setTimestamp();

            message.reply({ embeds: [rolesEmbed] });
        } catch (error) {
            console.error('Error getting level roles:', error);
            message.reply('❌ An error occurred while fetching level roles.');
        }
    }

    // Welcome/Goodbye System Commands
    else if (command === 'setwelcome') {
        // Check if user has administrator permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need Administrator permissions to use this command!');
        }

        const channel = message.mentions.channels.first() || message.channel;

        try {
            await database.setWelcomeChannel(message.guild.id, channel.id);

            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Welcome Channel Set!')
                .setDescription(`Welcome messages will now be sent to ${channel}`)
                .setTimestamp();

            message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error setting welcome channel:', error);
            message.reply('❌ An error occurred while setting the welcome channel.');
        }
    }

    else if (command === 'setgoodbye') {
        // Check if user has administrator permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need Administrator permissions to use this command!');
        }

        const channel = message.mentions.channels.first() || message.channel;

        try {
            await database.setGoodbyeChannel(message.guild.id, channel.id);

            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Goodbye Channel Set!')
                .setDescription(`Goodbye messages will now be sent to ${channel}`)
                .setTimestamp();

            message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error setting goodbye channel:', error);
            message.reply('❌ An error occurred while setting the goodbye channel.');
        }
    }

    else if (command === 'testwelcome') {
        // Check if user has administrator permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need Administrator permissions to use this command!');
        }

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('${ROYAL_EMOJIS.SPARKLES} Welcome to the Server! (TEST)')
            .setDescription(`Welcome ${message.author}! We\'re glad to have you here.`) 
            .addFields(
                { name: '${ROYAL_EMOJIS.WELCOME} Hello!', value: `Welcome to **${message.guild.name}**!`, inline: false },
                { name: '${ROYAL_EMOJIS.SCROLL} Getting Started', value: `Use \n${serverPrefix}help  to see all available commands`, inline: false },
                { name: `${ROYAL_EMOJIS.STATS} Level System`, value: 'Start chatting to gain XP and level up!', inline: false },
                { name: '${ROYAL_EMOJIS.GEM} Member Count', value: `You are member #${message.guild.memberCount}`, inline: true }
            )
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: `User ID: ${message.author.id} | This is a test message` })
            .setTimestamp();

        message.reply({ embeds: [welcomeEmbed] });
    }

    else if (command === 'testgoodbye') {
        // Check if user has administrator permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need Administrator permissions to use this command!');
        }

        const goodbyeEmbed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('👋 Goodbye! (TEST)')
            .setDescription(`**${message.author.tag}** has left the server.`) 
            .addFields(
                { name: `${ROYAL_EMOJIS.STATS} Member Count`, value: `We now have ${message.guild.memberCount} members`, inline: true },
                { name: '⏰ Joined', value: message.member.joinedAt ? `<t:${Math.floor(message.member.joinedAt.getTime() / 1000)}:R>` : 'Unknown', inline: true }
            )
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: `User ID: ${message.author.id} | This is a test message` })
            .setTimestamp();

        message.reply({ embeds: [goodbyeEmbed] });
    }

    // Fun Emoji Commands
    else if (command === 'emojirain') {
        const category = args[0] || 'sparkles';
        const count = parseInt(args[1]) || 15;

        if (!EmojiFun.CUTE_EMOJIS[category]) {
            const errorEmbed = RoyalStyler.createRoyalEmbed({
                title: 'Invalid Category',
                description: `${ROYAL_EMOJIS.CRYSTAL} Category "${category}" not found!\n\nUse \n${serverPrefix}emojicategories  to see all available categories.`, 
                color: ROYAL_COLORS.CRIMSON,
                footer: {
                    text: 'Available: hearts, flowers, sparkles, cute_faces, animals, food, nature'
                }
            });
            return message.reply({ embeds: [errorEmbed] });
        }

        const rainEmbed = EmojiFun.createEmojiRainEmbed(category, Math.min(count, 30));
        message.reply({ embeds: [rainEmbed] });
    }

    else if (command === 'emojicategories') {
        const categoriesEmbed = EmojiFun.createEmojiCategoriesEmbed();
        message.reply({ embeds: [categoriesEmbed] });
    }

    else if (command === 'randomemojis') {
        const randomEmbed = EmojiFun.createRandomEmojiEmbed();
        message.reply({ embeds: [randomEmbed] });
    }

    else if (command === 'mood') {
        const mood = args[0];
        if (!mood) {
            const errorEmbed = RoyalStyler.createRoyalEmbed({
                title: 'Mood Required',
                description: `${ROYAL_EMOJIS.CRYSTAL} Please specify your mood!\n\n**Example:** \n${serverPrefix}mood happy`,
                color: ROYAL_COLORS.CRIMSON,
                footer: {
                    text: 'Available moods: happy, sad, excited, love, sleepy, angry, cool'
                }
            });
            return message.reply({ embeds: [errorEmbed] });
        }

        const moodEmbed = EmojiFun.createEmojiMoodEmbed(mood);
        message.reply({ embeds: [moodEmbed] });
    }

    // Bot Emoji Commands
    else if (command === 'botemojis') {
        const botEmojis = client.emojis.cache;

        if (botEmojis.size === 0) {
            const noEmojiEmbed = RoyalStyler.createRoyalEmbed({
                title: 'No Bot Emojis',
                description: `${ROYAL_EMOJIS.CRYSTAL} This bot doesn\'t have any custom emojis added through the developer portal!`, 
                color: ROYAL_COLORS.SILVER,
                footer: {
                    text: 'Add emojis through Discord Developer Portal'
                }
            });
            return message.reply({ embeds: [noEmojiEmbed] });
        }

        let emojiList = '';
        botEmojis.forEach(emoji => {
            const emojiString = emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`;
            emojiList += `${emojiString} \n:${emoji.name}:\n - \n${emojiString}\n`;
        });

        const botEmojiEmbed = RoyalStyler.createRoyalEmbed({
            title: 'Bot Custom Emojis',
            description: `${ROYAL_EMOJIS.SPARKLES} Here are all emojis added to this bot through the Developer Portal!\n\n${emojiList}`, 
            color: ROYAL_COLORS.GOLD,
            footer: {
                text: `Total: ${botEmojis.size} bot emoji(s) | These work in any server`
            }
        });

        message.reply({ embeds: [botEmojiEmbed] });
    }

    // Custom Emoji Commands
    else if (command === 'emojis') {
        const emojiEmbed = CustomEmojiManager.createEmojiListEmbed(message.guild);
        message.reply({ embeds: [emojiEmbed] });
    }

    else if (command === 'emojiinfo') {
        const emojiName = args[0];
        if (!emojiName) {
            const errorEmbed = RoyalStyler.createRoyalEmbed({
                title: 'Emoji Info Required',
                description: `${ROYAL_EMOJIS.CRYSTAL} Please provide an emoji name!\n\n**Example:** \n${serverPrefix}emojiinfo cute_cat`,
                color: ROYAL_COLORS.CRIMSON,
                footer: {
                    text: 'Use +emojis to see all available emojis'
                }
            });
            return message.reply({ embeds: [errorEmbed] });
        }

        const emojiInfoEmbed = CustomEmojiManager.createEmojiInfoEmbed(message.guild, emojiName);
        message.reply({ embeds: [emojiInfoEmbed] });
    }

    else if (command === 'randomemoji') {
        const randomEmoji = CustomEmojiManager.getRandomEmoji(message.guild);

        if (!randomEmoji) {
            const noEmojiEmbed = RoyalStyler.createRoyalEmbed({
                title: 'No Custom Emojis',
                description: `${ROYAL_EMOJIS.CRYSTAL} This server doesn\'t have any custom emojis yet!`, 
                color: ROYAL_COLORS.SILVER,
                footer: {
                    text: 'Add some custom emojis to make your server unique!'
                }
            });
            return message.reply({ embeds: [noEmojiEmbed] });
        }

        const randomEmojiEmbed = RoyalStyler.createRoyalEmbed({
            title: 'Random Server Emoji',
            description: `${ROYAL_EMOJIS.SPARKLES} Here\'s a random emoji from your server!\n\n${randomEmoji} ${randomEmoji} ${randomEmoji}`,
            color: ROYAL_COLORS.PURPLE,
            footer: {
                text: 'Use +emojiinfo <name> to learn more about specific emojis'
            }
        });

        message.reply({ embeds: [randomEmojiEmbed] });
    }

    // Vishal command
    else if (command === 'vishal') {
        const embed = RoyalStyler.createRoyalEmbed({
            title: `✨ <a:Diamond:1412004332487835708> Vishal <a:Diamond:1412004332487835708> ✨`, 
            description: `*Builder of projects that matter*\n*Learning, growing, moving forward*\n*Creating today with tomorrow in mind*\n\n✨ Owner of Suzume\n\n<a:gem:1412006973758767174> **Links**\n[GitHub](https://github.com/VishalxDevvv) • [Email](mailto:04vishal.com@gmail.com) • [Links](https://guns.lol/vishalxdev)\n\n<a:sparkles:1412004805517381732> **${client.guilds.cache.size}** servers • **80+** commands`,
            color: ROYAL_COLORS.PURPLE,
            footer: { text: 'Made with <3 by Vishal' }
        });

        message.reply({ embeds: [embed] });
    }

    // Unknown command
    else {
        message.reply(`❌ Unknown command: \n${serverPrefix}${command}\nUse \n${serverPrefix}help  to see all available commands.`);
    }
});

// Handle interaction events (for slash commands)
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = slashCommands.get(interaction.commandName);

        if (!command) {
            console.error(`No slash command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Slash command execution error:', error);
            const reply = { content: `${ROYAL_EMOJIS.ERROR} There was an error executing this command!`, ephemeral: true };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
        return;
    }

    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'help_select') {
            const category = interaction.values[0].replace('help_', '');
            const serverPrefix = interaction.guild ? PrefixSystem.getPrefix(interaction.guild.id) : DEFAULT_PREFIX;
            let helpEmbed;

            switch(category) {
                case 'api':
                    helpEmbed = RoyalStyler.createApiHelp(serverPrefix);
                    break;
                case 'anime':
                    helpEmbed = RoyalStyler.createAnimeHelp(serverPrefix);
                    break;
                case 'mod':
                    helpEmbed = RoyalStyler.createModHelp(serverPrefix);
                    break;
                case 'games':
                    helpEmbed = RoyalStyler.createGamesHelp(serverPrefix);
                    break;
                case 'utility':
                    helpEmbed = RoyalStyler.createUtilityHelp(serverPrefix);
                    break;
                default:
                    helpEmbed = RoyalStyler.createRoyalHelp(serverPrefix);
            }

            await interaction.update({ embeds: [helpEmbed] });
        }
    }

    // Handle button interactions for giveaways
    if (interaction.isButton() && interaction.customId === 'giveaway_enter') {
        const { activeGiveaways } = require('./commands/utility/giveaway');
        const giveaway = activeGiveaways.get(interaction.message.id);

        if (!giveaway) {
            return interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} This giveaway has ended!`, ephemeral: true });
        }

        if (giveaway.participants.has(interaction.user.id)) {
            return interaction.reply({ content: `${ROYAL_EMOJIS.INFO} You\'re already entered!`, ephemeral: true });
        }

        giveaway.participants.add(interaction.user.id);
        await interaction.reply({ content: `${ROYAL_EMOJIS.SUCCESS} You entered the giveaway!`, ephemeral: true });
    }

    // Handle give confirmation buttons
    if (interaction.isButton() && interaction.customId.startsWith('give_confirm_')) {
        try {
            const [, , giverId, targetId, amount] = interaction.customId.split('_');

            // Only the giver can confirm
            if (interaction.user.id !== giverId) {
                return interaction.reply({ content: `🌸 Only the person giving can confirm this transaction! 💖`, ephemeral: true });
            }

            const giver = Economy.getUser(giverId);
            const amountNum = parseInt(amount);

            // Check balance again
            if (giver.balance < amountNum) {
                return interaction.reply({ content: `🌸 You don't have enough suzu cash anymore! 💖`, ephemeral: true });
            }

            // Process transaction
            Economy.updateBalance(giverId, -amountNum);
            Economy.updateBalance(targetId, amountNum);

            const target = await interaction.client.users.fetch(targetId);

            // Simple success message without complex embed
            const successMessage = `🌸 **Gift Sent!** 🌸\n\n💖 **${interaction.user.username}** gave **${amountNum.toLocaleString()}** suzu cash to **${target.username}**! 💖\n\n🪙 Such generosity spreads joy throughout the community~`;

            await interaction.update({ content: successMessage, embeds: [], components: [] });
        } catch (error) {
            console.error('Give button error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: `🌸 Something went wrong! Please try again~ 💖`, ephemeral: true });
            }
        }
    }
});

// Guild join event
client.on(Events.GuildCreate, guild => {
    console.log(`✅ Joined new server: ${guild.name} (${guild.id}) - ${guild.memberCount} members`);
});

// Guild leave event
client.on(Events.GuildDelete, guild => {
    console.log(`❌ Left server: ${guild.name} (${guild.id})`);
});

// Member join event (Welcome message)
client.on(Events.GuildMemberAdd, async (member) => {
    try {
        // Get guild settings for welcome channel
        const guildSettings = await database.getGuildSettings(member.guild.id);
        let welcomeChannel = null;

        // Use configured welcome channel if available
        if (guildSettings && guildSettings.welcome_channel_id) {
            welcomeChannel = member.guild.channels.cache.get(guildSettings.welcome_channel_id);
        }

        // If no configured channel or channel not found, find a suitable channel
        if (!welcomeChannel) {
            const welcomeChannels = ['welcome', 'general', 'lobby', 'main'];

            for (const channelName of welcomeChannels) {
                welcomeChannel = member.guild.channels.cache.find(
                    channel => channel.name.toLowerCase().includes(channelName) &&
                              channel.type === 0 && // Text channel
                              channel.permissionsFor(member.guild.members.me).has(['SendMessages', 'EmbedLinks'])
                );
                if (welcomeChannel) break;
            }

            // If still no channel found, use system channel or first available text channel
            if (!welcomeChannel) {
                welcomeChannel = member.guild.systemChannel ||
                               member.guild.channels.cache.find(
                                   channel => channel.type === 0 &&
                                             channel.permissionsFor(member.guild.members.me).has(['SendMessages', 'EmbedLinks'])
                               );
            }
        }

        if (welcomeChannel) {
            const welcomeEmbed = RoyalStyler.createRoyalWelcome(member);
            await welcomeChannel.send({ embeds: [welcomeEmbed] });
            console.log(`✅ Sent welcome message for ${member.user.tag} in ${member.guild.name}`);
        }
    } catch (error) {
        console.error('Error sending welcome message:', error);
    }
});

// Member leave event (Goodbye message)
client.on(Events.GuildMemberRemove, async (member) => {
    try {
        // Get guild settings for goodbye channel
        const guildSettings = await database.getGuildSettings(member.guild.id);
        let goodbyeChannel = null;

        // Use configured goodbye channel if available
        if (guildSettings && guildSettings.goodbye_channel_id) {
            goodbyeChannel = member.guild.channels.cache.get(guildSettings.goodbye_channel_id);
        }

        // If no configured channel or channel not found, find a suitable channel
        if (!goodbyeChannel) {
            const goodbyeChannels = ['goodbye', 'farewell', 'general', 'lobby', 'main'];

            for (const channelName of goodbyeChannels) {
                goodbyeChannel = member.guild.channels.cache.find(
                    channel => channel.name.toLowerCase().includes(channelName) &&
                              channel.type === 0 && // Text channel
                              channel.permissionsFor(member.guild.members.me)?.has(['SendMessages', 'EmbedLinks'])
                );
                if (goodbyeChannel) break;
            }

            // If still no channel found, use system channel or first available text channel
            if (!goodbyeChannel) {
                goodbyeChannel = member.guild.systemChannel ||
                               member.guild.channels.cache.find(
                                   channel => channel.type === 0 &&
                                             channel.permissionsFor(member.guild.members.me)?.has(['SendMessages', 'EmbedLinks'])
                               );
            }
        }

        if (goodbyeChannel) {
            const goodbyeEmbed = RoyalStyler.createRoyalGoodbye(member);
            await goodbyeChannel.send({ embeds: [goodbyeEmbed] });
            console.log(`👋 Sent goodbye message for ${member.user.tag} in ${member.guild.name}`);
        }
    } catch (error) {
        console.error('Error sending goodbye message:', error);
    }
});

// Helper function to format uptime
function formatUptime(uptime) {
    const seconds = Math.floor((uptime / 1000) % 60);
    const minutes = Math.floor((uptime / (1000 * 60)) % 60);
    const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    database.close();
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
});

client.login(process.env.BOT_TOKEN);

const app = express();
app.use(cors());
app.use(express.json());

// Database connections
const economyDb = new sqlite3.Database(path.join(__dirname, './global_economy.db'));
const levelsDb = new sqlite3.Database(path.join(__dirname, './levels.db'));
const configDb = new sqlite3.Database(path.join(__dirname, './server_config.db'));

// API Endpoints
app.get('/api/stats', (req, res) => {
    res.json({
        totalUsers: client.users.cache.size,
        activeServers: client.guilds.cache.size,
    });
});

// Economy API
app.get('/api/economy/:userId', (req, res) => {
  economyDb.get('SELECT * FROM economy WHERE user_id = ?', [req.params.userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || { user_id: req.params.userId, balance: 0 });
  });
});

app.put('/api/economy/:userId', (req, res) => {
  const { balance } = req.body;
  economyDb.run('INSERT OR REPLACE INTO economy (user_id, balance) VALUES (?, ?)', 
    [req.params.userId, balance], (err) => {
    res.json({ success: !err, error: err?.message });
  });
});

// Levels API
app.get('/api/levels/:userId', (req, res) => {
  levelsDb.get('SELECT * FROM levels WHERE user_id = ?', [req.params.userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || { user_id: req.params.userId, xp: 0, level: 1 });
  });
});

app.put('/api/levels/:userId', (req, res) => {
  const { xp, level } = req.body;
  levelsDb.run('INSERT OR REPLACE INTO levels (user_id, xp, level) VALUES (?, ?, ?)', 
    [req.params.userId, xp, level], (err) => {
    res.json({ success: !err, error: err?.message });
  });
});

// Server Config API
app.get('/api/config/:guildId', (req, res) => {
  configDb.get('SELECT * FROM server_config WHERE guild_id = ?', [req.params.guildId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || { guild_id: req.params.guildId });
  });
});

app.put('/api/config/:guildId', (req, res) => {
  const { prefix, settings } = req.body;
  configDb.run('INSERT OR REPLACE INTO server_config (guild_id, prefix, settings) VALUES (?, ?, ?)', 
    [req.params.guildId, prefix, JSON.stringify(settings)], (err) => {
    res.json({ success: !err, error: err?.message });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { client };
