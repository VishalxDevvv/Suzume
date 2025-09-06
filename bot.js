// --- Keep Render happy with a fake web server ---
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("✅ Bot is running and keeping Render alive!"));
app.listen(PORT, () => console.log(`🌐 Listening on port ${PORT}`));
// hehe
// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process, just log the error
});

process.on('uncaughtException', (error) => {
    console.log('Uncaught Exception:', error);
    // Don't exit the process, just log the error
});

const { Client, GatewayIntentBits, Events, Collection, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { Player } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const Database = require('./database');
const LevelSystem = require('./levelSystem');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('./royalStyles');
const CustomEmojiManager = require('./customEmojis');
const EmojiFun = require('./emojiFeatures');
const ServerConfig = require('./serverConfig');
const Economy = require('./economy.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load suzu command
let suzuCommand;
try {
    suzuCommand = require('./commands/economy/suzu.js');
} catch (error) {
    console.error('Failed to load suzu command:', error);
}

// Bot configuration
const PREFIX = process.env.BOT_PREFIX || '+';

// Command collection
const commands = new Collection();

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

if (fs.existsSync('./commands')) {
    loadCommands('./commands');
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
    40: "💕 Cute together!",
    50: "💖 Perfect match!",
    60: "💝 Made for each other!",
    70: "💞 Soulmates detected!",
    80: "💘 Love is in the air!",
    90: "💯 Absolutely perfect!",
    100: "🔥💕 ULTIMATE LOVE MATCH! 💕🔥"
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
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Initialize database and level system
const database = new Database();
const levelSystem = new LevelSystem(database);

// Create a collection for commands
client.commands = new Collection();

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
    console.log(`✅ Global Bot is ready! Logged in as ${readyClient.user.tag}`);
    console.log(`${ROYAL_EMOJIS.STATS} Serving ${readyClient.guilds.cache.size} servers`);
    console.log(`🔧 Bot prefix: ${PREFIX}`);
    
    // Set bot activity with prefix
    readyClient.user.setActivity(`${PREFIX}help | Discord.js`, { type: 'PLAYING' });
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
        afkUsers.delete(message.author.id);
        
        const backEmbed = RoyalStyler.createRoyalEmbed({
            title: 'Return Celebration',
            description: `${ROYAL_EMOJIS.CROWN} Welcome back to the community, **${message.author.username}**! ${ROYAL_EMOJIS.CROWN}\n\nYour presence has been missed!`,
            color: ROYAL_COLORS.EMERALD,
            fields: [
                {
                    name: 'Previous Duty',
                    value: `${ROYAL_EMOJIS.SCROLL} *"${afkData.reason}"*`,
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
                        value: `${ROYAL_EMOJIS.SCROLL} *"${afkData.reason}"*`,
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

    // XP System - Add XP for every message (not commands)
    if (!message.content.startsWith(PREFIX) && !message.author.bot) {
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
                    try {
                        await levelChannel.send({ embeds: [levelUpEmbed] });
                    } catch (error) {
                        // If can't send to level channel, try replying to user
                        try {
                            await message.reply({ embeds: [levelUpEmbed] });
                        } catch (replyError) {
                            console.log('Cannot send level up message - missing permissions');
                        }
                    }
                } else {
                    try {
                        await message.reply({ embeds: [levelUpEmbed] });
                    } catch (error) {
                        console.log('Cannot send level up message - missing permissions');
                    }
                }
            }
        }
    }

    // Check for sz commands without prefix first
    const messageContent = message.content.trim();
    const firstWord = messageContent.split(' ')[0].toLowerCase();
    
    if (firstWord === 'sz' || firstWord === 'suzu') {
        const args = messageContent.split(' ').slice(1);
        try {
            if (suzuCommand) {
                await suzuCommand.execute(message, args);
            } else {
                message.reply('❌ Suzu command not available.');
            }
            return;
        } catch (error) {
            console.error('Suzu command error:', error);
            message.reply('❌ Error executing suzu command.');
            return;
        }
    }

    // Check if message starts with prefix
    if (!message.content.startsWith(PREFIX)) return;

    // Remove prefix and get command
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
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

    // Check if command exists in commands collection or as an alias
    let commandToExecute = null;
    
    if (commands.has(command)) {
        commandToExecute = commands.get(command);
    } else {
        // Check for aliases
        for (const [name, cmd] of commands) {
            if (cmd.aliases && cmd.aliases.includes(command)) {
                commandToExecute = cmd;
                break;
            }
        }
    }
    
    if (commandToExecute) {
        try {
            await commandToExecute.execute(message, args);
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
            helpEmbed = RoyalStyler.createRoyalHelp(PREFIX);
            
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
                                emoji: ROYAL_EMOJIS.API
                            },
                            {
                                label: 'Utility Commands', 
                                description: 'Calculators, Converters, Tools & Utilities',
                                value: 'help_utility',
                                emoji: ROYAL_EMOJIS.UTILITY
                            },
                            {
                                label: 'Games & Fun',
                                description: 'Interactive Games, Party Games & Entertainment',
                                value: 'help_games', 
                                emoji: ROYAL_EMOJIS.GAMES
                            },
                            {
                                label: 'Moderation',
                                description: 'Server Management & Moderation Tools',
                                value: 'help_mod',
                                emoji: ROYAL_EMOJIS.MODERATION
                            },
                            {
                                label: 'Social & Anime',
                                description: 'Anime Search, Social Features & More',
                                value: 'help_anime',
                                emoji: ROYAL_EMOJIS.SOCIAL
                            }
                        ])
                );
            
            return message.reply({ embeds: [helpEmbed], components: [dropdown] });
        }
        
        switch(category) {
            case 'api':
                helpEmbed = RoyalStyler.createApiHelp(PREFIX);
                break;
            case 'anime':
                helpEmbed = RoyalStyler.createAnimeHelp(PREFIX);
                break;
            case 'mod':
            case 'moderation':
                helpEmbed = RoyalStyler.createModHelp(PREFIX);
                break;
            case 'games':
            case 'game':
            case 'fun':
                helpEmbed = RoyalStyler.createGamesHelp(PREFIX);
                break;
            case 'utility':
            case 'util':
            case 'tools':
                helpEmbed = RoyalStyler.createUtilityHelp(PREFIX);
                break;
            default:
                helpEmbed = RoyalStyler.createRoyalHelp(PREFIX);
        }
        
        message.reply({ embeds: [helpEmbed] });
    }

    // Prefix command
    else if (command === 'prefix') {
        const prefixEmbed = RoyalStyler.createRoyalEmbed({
            title: 'Command Prefix',
            description: `${ROYAL_EMOJIS.SCROLL} The sacred prefix for commands in this realm is: \`${PREFIX}\``,
            color: ROYAL_COLORS.ROYAL_BLUE,
            fields: [
                {
                    name: 'Usage Examples',
                    value: `${ROYAL_EMOJIS.STAR} \`${PREFIX}ping\` - Test connection\n${ROYAL_EMOJIS.STAR} \`${PREFIX}help\` - View command codex\n${ROYAL_EMOJIS.STAR} \`${PREFIX}level\` - Check rank`,
                    inline: false
                },
                {
                    name: 'Alternative Method',
                    value: `${ROYAL_EMOJIS.CRYSTAL} You may also use slash commands like \`/ping\``,
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
            title: 'Greetings <:Alp_greet:1410660404404813826>',
            description: `<:Alp_greet:1410660404404813826> Greetings, ${message.author.username}!\n\nWelcome to **${message.guild.name}**!\n\nMay your presence bring honor and prosperity to our community!`,
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
                    value: `${ROYAL_EMOJIS.CRYSTAL} *"${reason}"*`,
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
                description: `${ROYAL_EMOJIS.CRYSTAL} Please present your question to the oracle!\n\n**Example:** \`${PREFIX}8ball Will the kingdom prosper?\``,
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
                        value: `${ROYAL_EMOJIS.SCROLL} \`${PREFIX}ship @user1 @user2\` - Match two members\n${ROYAL_EMOJIS.SCROLL} \`${PREFIX}ship @user\` - Match yourself with mentioned user\n${ROYAL_EMOJIS.SCROLL} \`${PREFIX}ship Alice Bob\` - Match by names\n${ROYAL_EMOJIS.SCROLL} \`${PREFIX}ship Alice\` - Match yourself with Alice`,
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
                { name: '🏷️ Server Name', value: message.guild.name, inline: true },
                { name: '👥 Total Members', value: message.guild.memberCount.toString(), inline: true },
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
                { name: '🏷️ Bot Name', value: client.user.username, inline: true },
                { name: '🆔 Bot ID', value: client.user.id, inline: true },
                { name: '🔧 Prefix', value: `\`${PREFIX}\``, inline: true },
                { name: `${ROYAL_EMOJIS.STATS} Servers`, value: client.guilds.cache.size.toString(), inline: true },
                { name: '👥 Total Users', value: client.users.cache.size.toString(), inline: true },
                { name: '🏓 Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
                { name: '⏱️ Uptime', value: formatUptime(client.uptime), inline: true },
                { name: '📚 Library', value: 'Discord.js v14', inline: true },
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

            const levelCard = await levelSystem.createLevelCard(targetMember, stats);
            message.reply(levelCard);
        } catch (error) {
            console.error('Error getting user stats:', error);
            message.reply('❌ An error occurred while fetching level data.');
        }
    }

    else if (command === 'leaderboard' || command === 'lb') {
        try {
            const result = await levelSystem.createLeaderboard(message.guild, 10, 1);
            message.reply({ embeds: [result.embed], components: result.components });
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
            return message.reply(`❌ Invalid usage! Use: \`${PREFIX}setlevelrole <level> @role\`\nExample: \`${PREFIX}setlevelrole 10 @Level 10\``);
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
            return message.reply(`❌ Invalid usage! Use: \`${PREFIX}removelevelrole <level>\`\nExample: \`${PREFIX}removelevelrole 10\``);
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
            .setTitle('🎉 Welcome to the Server! (TEST)')
            .setDescription(`Welcome ${message.author}! We're glad to have you here.`)
            .addFields(
                { name: '👋 Hello!', value: `Welcome to **${message.guild.name}**!`, inline: false },
                { name: '📋 Getting Started', value: `Use \`${PREFIX}help\` to see all available commands`, inline: false },
                { name: `${ROYAL_EMOJIS.STATS} Level System`, value: 'Start chatting to gain XP and level up!', inline: false },
                { name: '👥 Member Count', value: `You are member #${message.guild.memberCount}`, inline: true }
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
                description: `${ROYAL_EMOJIS.CRYSTAL} Category "${category}" not found!\n\nUse \`+emojicategories\` to see all available categories.`,
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
                description: `${ROYAL_EMOJIS.CRYSTAL} Please specify your mood!\n\n**Example:** \`${PREFIX}mood happy\``,
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
                description: `${ROYAL_EMOJIS.CRYSTAL} This bot doesn't have any custom emojis added through the developer portal!`,
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
            emojiList += `${emojiString} \`:${emoji.name}:\` - \`${emojiString}\`\n`;
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
                description: `${ROYAL_EMOJIS.CRYSTAL} Please provide an emoji name!\n\n**Example:** \`${PREFIX}emojiinfo cute_cat\``,
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
                description: `${ROYAL_EMOJIS.CRYSTAL} This server doesn't have any custom emojis yet!`,
                color: ROYAL_COLORS.SILVER,
                footer: {
                    text: 'Add some custom emojis to make your server unique!'
                }
            });
            return message.reply({ embeds: [noEmojiEmbed] });
        }
        
        const randomEmojiEmbed = RoyalStyler.createRoyalEmbed({
            title: 'Random Server Emoji',
            description: `${ROYAL_EMOJIS.SPARKLES} Here's a random emoji from your server!\n\n${randomEmoji} ${randomEmoji} ${randomEmoji}`,
            color: ROYAL_COLORS.PURPLE,
            footer: {
                text: 'Use +emojiinfo <name> to learn more about specific emojis'
            }
        });
        
        message.reply({ embeds: [randomEmojiEmbed] });
    }

    // Economy Commands (suzu/sz)
    else if (command === 'suzu' || command === 'sz') {
        try {
            if (suzuCommand) {
                await suzuCommand.execute(message, args);
            } else {
                message.reply('❌ Suzu command not available.');
            }
        } catch (error) {
            console.error('Suzu command error:', error);
            message.reply('❌ Error executing suzu command.');
        }
    }

    // Unknown command
    else {
        message.reply(`❌ Unknown command: \`${PREFIX}${command}\`\nUse \`${PREFIX}help\` to see all available commands.`);
    }
});

// Handle interaction events (for slash commands)
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    // Check if command exists in commands collection first
    if (commands.has(commandName)) {
        try {
            // Create a mock message object for compatibility
            const mockMessage = {
                author: interaction.user,
                guild: interaction.guild,
                channel: interaction.channel,
                member: interaction.member,
                mentions: {
                    users: {
                        first: () => interaction.options.getUser('user') || interaction.options.getUser('person1') || interaction.options.getUser('person2')
                    }
                },
                reply: async (content) => {
                    if (interaction.replied || interaction.deferred) {
                        return await interaction.followUp(content);
                    } else {
                        return await interaction.reply(content);
                    }
                }
            };

            // Get command arguments
            const args = [];
            if (interaction.options.getString('city')) args.push(interaction.options.getString('city'));
            if (interaction.options.getString('coin')) args.push(interaction.options.getString('coin'));
            if (interaction.options.getString('hex')) args.push(interaction.options.getString('hex'));
            if (interaction.options.getString('term')) args.push(interaction.options.getString('term'));
            if (interaction.options.getString('text')) args.push(interaction.options.getString('text'));
            if (interaction.options.getInteger('length')) args.push(interaction.options.getInteger('length').toString());
            if (interaction.options.getString('question')) args.push(interaction.options.getString('question'));

            await commands.get(commandName).execute(mockMessage, args);
            return;
        } catch (error) {
            console.error('Slash command execution error:', error);
            const errorMsg = { content: 'There was an error executing that command!', flags: 64 };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMsg);
            } else {
                await interaction.reply(errorMsg);
            }
            return;
        }
    }

    // Helper function to parse time for slash commands
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

    if (commandName === 'ping') {
        const sent = Date.now();
        await interaction.reply('🏓 Pinging...');
        const timeTaken = Date.now() - sent;
        await interaction.editReply(`🏓 Pong! Latency: ${timeTaken}ms | API Latency: ${Math.round(client.ws.ping)}ms`);
    } 
    
    else if (commandName === 'hello') {
        await interaction.reply(`Hello ${interaction.user.username}! 👋 Welcome to **${interaction.guild.name}**!`);
    }
    
    else if (commandName === 'botinfo') {
        const botEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🤖 Bot Information')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '🏷️ Bot Name', value: client.user.username, inline: true },
                { name: '🆔 Bot ID', value: client.user.id, inline: true },
                { name: `${ROYAL_EMOJIS.STATS} Servers`, value: client.guilds.cache.size.toString(), inline: true },
                { name: '👥 Total Users', value: client.users.cache.size.toString(), inline: true },
                { name: '🏓 Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
                { name: '⏱️ Uptime', value: formatUptime(client.uptime), inline: true },
                { name: '📚 Library', value: 'Discord.js v14', inline: true },
                { name: '🟢 Status', value: 'Online & Global', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [botEmbed] });
    }

    else if (commandName === 'ban') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return await interaction.reply({ content: '❌ You need the "Ban Members" permission to use this command.', flags: 64 });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        try {
            await interaction.guild.members.ban(user, { reason: reason });
            
            const banEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🔨 User Banned')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [banEmbed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to ban user. Make sure I have permission and the user is bannable.', flags: 64 });
        }
    }

    else if (commandName === 'unban') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return await interaction.reply({ content: '❌ You need the "Ban Members" permission to use this command.', flags: 64 });
        }

        const userId = interaction.options.getString('userid');
        
        try {
            await interaction.guild.members.unban(userId);
            
            const unbanEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ User Unbanned')
                .addFields(
                    { name: 'User ID', value: userId, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [unbanEmbed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to unban user. Make sure the user ID is correct and they are banned.', flags: 64 });
        }
    }

    else if (commandName === 'kick') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return await interaction.reply({ content: '❌ You need the "Kick Members" permission to use this command.', flags: 64 });
        }

        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        if (!member) {
            return await interaction.reply({ content: '❌ User not found in this server.', flags: 64 });
        }

        try {
            await member.kick(reason);
            
            const kickEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('👢 User Kicked')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [kickEmbed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to kick user. Make sure I have permission and the user is kickable.', flags: 64 });
        }
    }

    else if (commandName === 'timeout') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return await interaction.reply({ content: '❌ You need the "Timeout Members" permission to use this command.', flags: 64 });
        }

        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        if (!member) {
            return await interaction.reply({ content: '❌ User not found in this server.', flags: 64 });
        }

        const duration = parseTime(durationStr);
        
        try {
            await member.timeout(duration, reason);
            
            const timeoutEmbed = new EmbedBuilder()
                .setColor(0xFF6B6B)
                .setTitle('🔇 User Timed Out')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Duration', value: durationStr, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [timeoutEmbed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to timeout user. Make sure I have permission and the duration is valid (max 28 days).', flags: 64 });
        }
    }

    else if (commandName === 'untimeout') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return await interaction.reply({ content: '❌ You need the "Timeout Members" permission to use this command.', flags: 64 });
        }

        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        
        if (!member) {
            return await interaction.reply({ content: '❌ User not found in this server.', flags: 64 });
        }

        try {
            await member.timeout(null);
            
            const untimeoutEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🔊 Timeout Removed')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [untimeoutEmbed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to remove timeout. Make sure the user is currently timed out.', flags: 64 });
        }
    }

    else if (commandName === 'userinfo') {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const userEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('👤 User Information')
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '🏷️ Username', value: user.tag, inline: true },
                { name: '🆔 User ID', value: user.id, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true }
            );

        if (member) {
            userEmbed.addFields(
                { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
                { name: '🎭 Roles', value: member.roles.cache.map(role => role.name).join(', ') || 'None', inline: false }
            );
        }

        await interaction.reply({ embeds: [userEmbed] });
    }

    else if (commandName === 'avatar') {
        const user = interaction.options.getUser('user') || interaction.user;
        
        const avatarEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ size: 512 }))
            .setTimestamp();

        await interaction.reply({ embeds: [avatarEmbed] });
    }

    else if (commandName === '8ball') {
        const question = interaction.options.getString('question');
        
        // Get random response
        const randomResponse = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
        
        const eightBallEmbed = new EmbedBuilder()
            .setColor(0x9932CC)
            .setTitle('🎱 Magic 8-Ball')
            .addFields(
                { name: '❓ Question', value: question, inline: false },
                { name: '🔮 Answer', value: randomResponse, inline: false }
            )
            .setFooter({ text: `Asked by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [eightBallEmbed] });
    }

    else if (commandName === 'ship') {
        const person1User = interaction.options.getUser('person1');
        const person2User = interaction.options.getUser('person2');
        
        let person1, person2;
        
        if (person2User) {
            // Two users provided
            person1 = person1User.username;
            person2 = person2User.username;
        } else {
            // Only one user provided, ship with command author
            person1 = interaction.user.username;
            person2 = person1User.username;
        }

        // Calculate ship percentage
        const percentage = calculateShipPercentage(person1, person2);
        const shipName = createShipName(person1, person2);
        const message_text = getShipMessage(percentage);
        
        // Create progress bar
        const filledBars = Math.floor(percentage / 10);
        const emptyBars = 10 - filledBars;
        const progressBar = '💖'.repeat(filledBars) + '🤍'.repeat(emptyBars);
        
        // Determine embed color based on percentage
        let embedColor;
        if (percentage >= 80) embedColor = 0xFF1493; // Deep pink
        else if (percentage >= 60) embedColor = 0xFF69B4; // Hot pink
        else if (percentage >= 40) embedColor = 0xFFC0CB; // Pink
        else if (percentage >= 20) embedColor = 0xDDA0DD; // Plum
        else embedColor = 0x808080; // Gray

        const shipEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('💕 Love Calculator 💕')
            .addFields(
                { name: '👫 Couple', value: `**${person1}** x **${person2}**`, inline: false },
                { name: '💖 Ship Name', value: `**${shipName}**`, inline: true },
                { name: '💯 Love Percentage', value: `**${percentage}%**`, inline: true },
                { name: '${ROYAL_EMOJIS.STATS} Love Meter', value: progressBar, inline: false },
                { name: '💌 Result', value: message_text, inline: false }
            )
            .setFooter({ text: `Shipped by ${interaction.user.username} | Results may vary 😉` })
            .setTimestamp();

        await interaction.reply({ embeds: [shipEmbed] });
    }

    // Level System Slash Commands
    else if (commandName === 'level' || commandName === 'rank') {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = interaction.guild.members.cache.get(targetUser.id);
        
        if (!targetMember) {
            return await interaction.reply({ content: '❌ User not found in this server!', flags: 64 });
        }

        try {
            const stats = await levelSystem.getUserStats(targetUser.id, interaction.guild.id);
            
            if (!stats) {
                return await interaction.reply({ 
                    content: `${targetUser.id === interaction.user.id ? 'You haven\'t' : `${targetUser.username} hasn't`} sent any messages yet!`, 
                    flags: 64 
                });
            }

            const levelCard = await levelSystem.createLevelCard(targetMember, stats);
            await interaction.reply(levelCard);
        } catch (error) {
            console.error('Error getting user stats:', error);
            await interaction.reply({ content: '❌ An error occurred while fetching level data.', flags: 64 });
        }
    }

    else if (commandName === 'leaderboard') {
        const limit = interaction.options.getInteger('limit') || 10;
        
        try {
            const result = await levelSystem.createLeaderboard(interaction.guild, limit, 1);
            await interaction.reply({ embeds: [result.embed], components: result.components });
        } catch (error) {
            console.error('Error creating leaderboard:', error);
            await interaction.reply({ content: '❌ An error occurred while fetching leaderboard data.', flags: 64 });
        }
    }

    else if (commandName === 'setlevelrole') {
        // Check if user has administrator permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({ content: '❌ You need Administrator permissions to use this command!', flags: 64 });
        }

        const level = interaction.options.getInteger('level');
        const role = interaction.options.getRole('role');

        try {
            await database.addLevelRole(interaction.guild.id, level, role.id);
            
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Level Role Set!')
                .setDescription(`Users who reach level **${level}** will now receive the ${role} role!`)
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error setting level role:', error);
            await interaction.reply({ content: '❌ An error occurred while setting the level role.', flags: 64 });
        }
    }

    else if (commandName === 'removelevelrole') {
        // Check if user has administrator permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({ content: '❌ You need Administrator permissions to use this command!', flags: 64 });
        }

        const level = interaction.options.getInteger('level');

        try {
            const changes = await database.removeLevelRole(interaction.guild.id, level);
            
            if (changes === 0) {
                return await interaction.reply({ content: `❌ No level role found for level ${level}!`, flags: 64 });
            }

            const successEmbed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('✅ Level Role Removed!')
                .setDescription(`Level role for level **${level}** has been removed!`)
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error removing level role:', error);
            await interaction.reply({ content: '❌ An error occurred while removing the level role.', flags: 64 });
        }
    }

    else if (commandName === 'levelroles') {
        try {
            const levelRoles = await database.getLevelRoles(interaction.guild.id);
            
            if (levelRoles.length === 0) {
                return await interaction.reply({ content: '❌ No level roles have been set up for this server!', flags: 64 });
            }

            let description = '';
            for (const roleData of levelRoles) {
                const role = interaction.guild.roles.cache.get(roleData.role_id);
                const roleName = role ? role.name : 'Deleted Role';
                description += `**Level ${roleData.level}:** ${role ? role : roleName}\n`;
            }

            const rolesEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📋 Level Roles')
                .setDescription(description)
                .setFooter({ text: `${levelRoles.length} level role(s) configured` })
                .setTimestamp();

            await interaction.reply({ embeds: [rolesEmbed] });
        } catch (error) {
            console.error('Error getting level roles:', error);
            await interaction.reply({ content: '❌ An error occurred while fetching level roles.', flags: 64 });
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
client.on(Events.GuildMemberAdd, async member => {
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
            try {
                const welcomeEmbed = RoyalStyler.createRoyalWelcome(member);
                await welcomeChannel.send({ embeds: [welcomeEmbed] });
                console.log(`✅ Sent welcome message for ${member.user.tag} in ${member.guild.name}`);
            } catch (error) {
                console.log(`❌ Cannot send welcome message - missing permissions in ${member.guild.name}`);
            }
        }
    } catch (error) {
        console.error('Error sending welcome message:', error);
    }
});

// Member leave event (Goodbye message)
client.on(Events.GuildMemberRemove, async member => {
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
            try {
                const goodbyeEmbed = RoyalStyler.createRoyalGoodbye(member);
                await goodbyeChannel.send({ embeds: [goodbyeEmbed] });
                console.log(`👋 Sent goodbye message for ${member.user.tag} in ${member.guild.name}`);
            } catch (error) {
                console.log(`❌ Cannot send goodbye message - missing permissions in ${member.guild.name}`);
            }
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
    database.close();
    client.destroy();
    process.exit(0);
});

// Handle interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    // AI suggestions dropdown handler
    if (interaction.customId === 'ai_suggestions') {
        const { useMainPlayer } = require('discord-player');
        const player = useMainPlayer();
        
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: 'You need to be in a voice channel!', ephemeral: true });
        }

        const selectedTracks = interaction.values;
        let addedCount = 0;
        
        for (const track of selectedTracks) {
            try {
                await player.play(interaction.member.voice.channel, track, {
                    nodeOptions: {
                        metadata: { 
                            channel: interaction.channel, 
                            requestedBy: interaction.user 
                        },
                        volume: 75
                    }
                });
                addedCount++;
            } catch (error) {
                console.log(`Failed to add: ${track}`);
            }
        }
        
        await interaction.reply({ 
            content: `🤖 Added ${addedCount}/${selectedTracks.length} AI suggested tracks to queue!`, 
            ephemeral: true 
        });
        return;
    }

    // Music button handlers
    if (interaction.customId.startsWith('music_')) {
        const { useMainPlayer } = require('discord-player');
        const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guild.id);

        if (!queue || !queue.currentTrack) {
            return interaction.reply({ content: '❌ No music is currently playing!', ephemeral: true });
        }

        switch (interaction.customId) {
            case 'music_pause':
                if (queue.node.isPaused()) {
                    queue.node.resume();
                    await interaction.reply({ content: '▶️ Resumed the music!', ephemeral: true });
                } else {
                    queue.node.pause();
                    await interaction.reply({ content: '⏸️ Paused the music!', ephemeral: true });
                }
                break;

            case 'music_skip':
                queue.node.skip();
                await interaction.reply({ content: '⏭️ Skipped the current song!', ephemeral: true });
                break;

            case 'music_stop':
                queue.delete();
                await interaction.reply({ content: '⏹️ Stopped music and cleared queue!', ephemeral: true });
                break;

            case 'music_shuffle':
                if (queue.tracks.size < 2) {
                    return interaction.reply({ content: '❌ Need at least 2 songs in queue to shuffle!', ephemeral: true });
                }
                queue.tracks.shuffle();
                await interaction.reply({ content: `🔀 Shuffled ${queue.tracks.size} songs!`, ephemeral: true });
                break;

            case 'music_loop':
                const modes = ['Off', 'Track', 'Queue'];
                const currentMode = queue.repeatMode;
                const nextMode = (currentMode + 1) % 3;
                queue.setRepeatMode(nextMode);
                await interaction.reply({ content: `🔁 Loop mode: ${modes[nextMode]}`, ephemeral: true });
                break;

            case 'music_queue':
                const { EmbedBuilder } = require('discord.js');
                const embed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🎵 Music Queue')
                    .setTimestamp();

                embed.addFields({
                    name: '🎶 Now Playing',
                    value: `**${queue.currentTrack.title}**\nBy: ${queue.currentTrack.author}`,
                    inline: false
                });

                if (queue.tracks.size > 0) {
                    const tracks = queue.tracks.toArray().slice(0, 10);
                    const trackList = tracks.map((track, index) => 
                        `${index + 1}. **${track.title}** - ${track.author}`
                    ).join('\n');

                    embed.addFields({
                        name: `📋 Up Next (${queue.tracks.size} songs)`,
                        value: trackList,
                        inline: false
                    });
                }

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;

            case 'music_volume':
                await interaction.reply({ 
                    content: `🔊 Current volume: **${queue.node.volume}%**\nUse \`$volume <0-100>\` to change it!`, 
                    ephemeral: true 
                });
                break;

            case 'music_previous':
                if (queue.history.tracks.length === 0) {
                    return interaction.reply({ content: '❌ No previous songs in history!', ephemeral: true });
                }
                await queue.history.back();
                await interaction.reply({ content: '⏮️ Playing previous song!', ephemeral: true });
                break;
        }
        return;
    }

    // AI suggestion button handlers
    if (interaction.customId.startsWith('ai_')) {
        const { useMainPlayer, QueryType } = require('discord-player');
        const player = useMainPlayer();
        
        const originalMessage = await interaction.message.fetch();
        const suggestions = originalMessage.aiSuggestions || [];
        
        if (!suggestions.length) {
            return interaction.reply({ content: '❌ No suggestions available!', ephemeral: true });
        }

        switch (interaction.customId) {
            case 'ai_add_all':
                if (!interaction.member.voice.channel) {
                    return interaction.reply({ content: 'You need to be in a voice channel!', ephemeral: true });
                }
                
                let addedCount = 0;
                for (const suggestion of suggestions) {
                    try {
                        await player.play(interaction.member.voice.channel, suggestion, {
                            nodeOptions: {
                                metadata: { channel: interaction.channel, requestedBy: interaction.user },
                                volume: 75
                            }
                        });
                        addedCount++;
                    } catch (error) {
                        console.log(`Failed to add: ${suggestion}`);
                    }
                }
                
                await interaction.reply({ 
                    content: `🎵 Added ${addedCount}/${suggestions.length} AI suggestions to queue!`, 
                    ephemeral: true 
                });
                break;

            case 'ai_add_random':
                if (!interaction.member.voice.channel) {
                    return interaction.reply({ content: 'You need to be in a voice channel!', ephemeral: true });
                }
                
                const randomSong = suggestions[Math.floor(Math.random() * suggestions.length)];
                try {
                    await player.play(interaction.member.voice.channel, randomSong, {
                        nodeOptions: {
                            metadata: { channel: interaction.channel, requestedBy: interaction.user },
                            volume: 75
                        }
                    });
                    await interaction.reply({ 
                        content: `🎲 Added random AI suggestion: **${randomSong}**`, 
                        ephemeral: true 
                    });
                } catch (error) {
                    await interaction.reply({ 
                        content: '❌ Failed to add random suggestion!', 
                        ephemeral: true 
                    });
                }
                break;

            case 'ai_refresh':
                await interaction.reply({ 
                    content: '🔄 Use the suggest command again for new AI recommendations!', 
                    ephemeral: true 
                });
                break;
        }
        return;
    }

    const customId = interaction.isButton() ? interaction.customId : interaction.values[0];
    let helpEmbed;

    // Leaderboard button handling
    if (customId.startsWith('lb_')) {
        if (customId.startsWith('lb_page_')) {
            const page = parseInt(customId.split('_')[2]);
            const result = await levelSystem.createLeaderboard(interaction.guild, 10, page);
            return interaction.update({ embeds: [result.embed], components: result.components });
        }
        
        if (customId === 'lb_refresh') {
            // Check if this is XP leaderboard or Economy leaderboard
            const currentTitle = interaction.message.embeds[0]?.title || '';
            
            if (currentTitle.includes('XP Leaderboard')) {
                // Refresh XP leaderboard
                const result = await levelSystem.createLeaderboard(interaction.guild, 10, 1);
                return interaction.update({ embeds: [result.embed], components: result.components });
            } else {
                // Refresh Economy leaderboard
                const top = Economy.getLeaderboard(10);
                let description = '🌍 **Global Leaderboard** - Richest users across all servers!\n\n';
                
                for (let i = 0; i < top.length; i++) {
                    const user = top[i];
                    const medal = i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                    try {
                        const discordUser = await interaction.client.users.fetch(user.user_id);
                        description += `${medal} **${discordUser.username}** - **${user.balance.toLocaleString()}** suzu cash\n`;
                    } catch {
                        description += `${medal} **Unknown User** - **${user.balance.toLocaleString()}** suzu cash\n`;
                    }
                }
                
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.CROWN} Global Suzu Cash Leaderboard`,
                    description: description || 'No users found!',
                    color: ROYAL_COLORS.PURPLE,
                    footer: { text: 'Compete with users from all servers! 💖' }
                });

                return interaction.update({ embeds: [embed] });
            }
        }
        
        if (customId === 'lb_stats') {
            const stats = Economy.getGlobalStats();
            const embed = RoyalStyler.createRoyalEmbed({
                title: `${ROYAL_EMOJIS.STATS} Global Economy Statistics`,
                description: `🌍 **Suzume's Global Economy**\n\n👥 **Total Users:** ${stats.total_users.toLocaleString()}\n💰 **Total Money:** ${stats.total_money.toLocaleString()} suzu cash\n🎲 **Total Flips:** ${stats.total_flips.toLocaleString()}\n💚 **Total Won:** ${stats.total_won.toLocaleString()}\n💔 **Total Lost:** ${stats.total_lost.toLocaleString()}\n\n✨ Your balance works on every server!`,
                color: ROYAL_COLORS.ROYAL_BLUE,
                footer: { text: 'Global economy powered by Suzume 💖' }
            });
            return interaction.update({ embeds: [embed] });
        }
        
        if (customId === 'lb_myrank') {
            const user = Economy.getUser(interaction.user.id);
            const leaderboard = Economy.getLeaderboard(1000);
            const position = leaderboard.findIndex(u => u.user_id === interaction.user.id) + 1;
            const rank = position > 0 ? `#${position}` : 'Unranked';

            const embed = RoyalStyler.createRoyalEmbed({
                title: `🏆 ${interaction.user.username}'s Rank`,
                description: `${interaction.user} here's your ranking information ✨`,
                fields: [
                    {
                        name: '🏆 Global Rank',
                        value: rank,
                        inline: true
                    },
                    {
                        name: '💰 Balance',
                        value: `${user.balance.toLocaleString()} suzu cash`,
                        inline: true
                    },
                    {
                        name: '🎲 Total Flips',
                        value: `${user.flip_count.toLocaleString()}`,
                        inline: true
                    }
                ],
                color: ROYAL_COLORS.GOLD,
                thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
                footer: { text: 'Keep climbing the ranks! 🚀' }
            });
            return interaction.update({ embeds: [embed] });
        }
    }

    // Help category selection
    if (customId.startsWith('help_')) {
        const category = customId.replace('help_', '');
        
        switch(category) {
            case 'api':
                helpEmbed = RoyalStyler.createApiHelp(PREFIX);
                break;
            case 'anime':
                helpEmbed = RoyalStyler.createAnimeHelp(PREFIX);
                break;
            case 'utility':
                helpEmbed = RoyalStyler.createUtilityHelp(PREFIX);
                break;
            case 'mod':
                helpEmbed = RoyalStyler.createModHelp(PREFIX);
                break;
            case 'games':
                helpEmbed = RoyalStyler.createGamesHelp(PREFIX);
                break;
        }
        
        if (helpEmbed) {
            const backButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('help_back')
                        .setLabel('⬅️ Back to Main')
                        .setStyle(ButtonStyle.Secondary)
                );
            
            return interaction.update({ embeds: [helpEmbed], components: [backButton] });
        }
    }
    
    // Back button
    if (customId === 'help_back') {
        helpEmbed = RoyalStyler.createRoyalHelp(PREFIX);
        
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
                            emoji: ROYAL_EMOJIS.API
                        },
                        {
                            label: 'Utility Commands', 
                            description: 'Calculators, Converters, Tools & Utilities',
                            value: 'help_utility',
                            emoji: ROYAL_EMOJIS.UTILITY
                        },
                        {
                            label: 'Games & Fun',
                            description: 'Interactive Games, Party Games & Entertainment',
                            value: 'help_games', 
                            emoji: ROYAL_EMOJIS.GAMES
                        },
                        {
                            label: 'Moderation',
                            description: 'Server Management & Moderation Tools',
                            value: 'help_mod',
                            emoji: ROYAL_EMOJIS.MODERATION
                        },
                        {
                            label: 'Social & Anime',
                            description: 'Anime Search, Social Features & More',
                            value: 'help_anime',
                            emoji: ROYAL_EMOJIS.SOCIAL
                        }
                    ])
            );
        
        return interaction.update({ embeds: [helpEmbed], components: [dropdown] });
    }

    // Truth/Dare/Random button handling
    if (customId === 'truth_new' || customId === 'dare_new' || customId === 'random_new') {
        try {
            let endpoint, color, emoji, type;
            
            if (customId === 'truth_new') {
                endpoint = 'truth';
                color = '#4CAF50';
                emoji = '🤔';
                type = 'TRUTH';
            } else if (customId === 'dare_new') {
                endpoint = 'dare';
                color = '#F44336';
                emoji = '😈';
                type = 'DARE';
            } else {
                endpoint = Math.random() < 0.5 ? 'truth' : 'dare';
                color = endpoint === 'truth' ? '#4CAF50' : '#F44336';
                emoji = endpoint === 'truth' ? '🤔' : '😈';
                type = endpoint.toUpperCase();
            }

            let apiUrl;
            if (endpoint === 'truth') {
                apiUrl = `https://api.truthordarebot.xyz/v1/${endpoint}`;
            } else {
                apiUrl = `https://api.truthordarebot.xyz/api/${endpoint}`;
            }

            const response = await fetch(apiUrl);
            const data = await response.json();

            const embed = new EmbedBuilder()
                .setTitle(`Requested by ${interaction.user.username}`)
                .setDescription(`**${data.question}**`)
                .setColor(color)
                .setFooter({ text: `Type: ${data.type} | Rating: ${data.rating} | ID: ${data.id}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('truth_new')
                        .setLabel('Truth')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('dare_new')
                        .setLabel('Dare')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('random_new')
                        .setLabel('Random')
                        .setStyle(ButtonStyle.Primary)
                );

            return interaction.reply({ embeds: [embed], components: [row] }).catch(error => {
                console.error('Permission error in truth/dare buttons:', error);
                if (error.code === 50013) {
                    return interaction.reply({ content: 'I don\'t have permission to send messages in this channel!', ephemeral: true }).catch(() => {});
                }
            });
        } catch (error) {
            console.error('API error:', error);
            return interaction.reply({ content: 'Failed to fetch question from API!', ephemeral: true });
        }
    }

    try {
        let response, data, embed;

        switch (interaction.customId) {
            case "get_truth":
                response = await fetch("https://api.truthordarebot.xyz/v1/truth");
                data = await response.json();
                const truthQuestion = String(data.question || "Question not available");
                const truthId = Math.random().toString(36).substring(2, 8).toUpperCase();
                embed = new EmbedBuilder()
                    .setTitle(`Requested by ${interaction.user.username}`)
                    .setDescription(truthQuestion)
                    .setColor(0x4169E1)
                    .setFooter({ text: `Type: TRUTH | Rating: PG13 | ID: ${truthId}` })
                    .setTimestamp();
                break;

            case "new_dare":
            case "get_dare":
                response = await fetch("https://api.truthordarebot.xyz/api/dare");
                data = await response.json();
                embed = new EmbedBuilder()
                    .setTitle(`Requested by ${interaction.user.username}`)
                    .setDescription(`😈 **${data.question || "Challenge not available"}**`)
                    .setColor(0xFF4500)
                    .setFooter({ text: `Type: ${data.type || "DARE"} | Rating: ${data.rating || "PG13"} | ID: ${data.id || "N/A"}` })
                    .setTimestamp();
                break;

            case "get_wyr":
                response = await fetch("https://api.truthordarebot.xyz/api/wyr");
                data = await response.json();
                embed = new EmbedBuilder()
                    .setTitle(`Requested by ${interaction.user.username}`)
                    .setDescription(`🤷 **${data.question || "Question not available"}**`)
                    .setColor(0x9932CC)
                    .setFooter({ text: `Type: ${data.type || "WYR"} | Rating: ${data.rating || "PG13"} | ID: ${data.id || "N/A"}` })
                    .setTimestamp();
                break;

            case "get_nhie":

            case "tnd_truth":
                response = await fetch("https://api.truthordarebot.xyz/v1/truth");
                data = await response.json();
                embed = new EmbedBuilder()
                    .setTitle(`Requested by ${interaction.user.username}`)
                    .setDescription(`🤔 **${data.question || "Question not available"}**`)
                    .setColor(0x4CAF50)
                    .setFooter({ text: `Type: ${data.type || "TRUTH"} | Rating: ${data.rating || "PG13"} | ID: ${data.id || "N/A"}` })
                    .setTimestamp();
                break;

            case "tnd_dare":
                response = await fetch("https://api.truthordarebot.xyz/api/dare");
                data = await response.json();
                embed = new EmbedBuilder()
                    .setTitle(`Requested by ${interaction.user.username}`)
                    .setDescription(`😈 **${data.question || "Challenge not available"}**`)
                    .setColor(0xF44336)
                    .setFooter({ text: `Type: ${data.type || "DARE"} | Rating: ${data.rating || "PG13"} | ID: ${data.id || "N/A"}` })
                    .setTimestamp();
                break;

            case "tnd_random":
                const randomEndpoint = Math.random() < 0.5 ? "truth" : "dare";
                response = await fetch(`https://api.truthordarebot.xyz/api/${randomEndpoint}`);
                data = await response.json();
                const randomColor = randomEndpoint === "truth" ? 0x4CAF50 : 0xF44336;
                const randomEmoji = randomEndpoint === "truth" ? "🤔" : "😈";
                embed = new EmbedBuilder()
                    .setTitle(`Requested by ${interaction.user.username}`)
                    .setDescription(`${randomEmoji} **${data.question || "Question not available"}**`)
                    .setColor(randomColor)
                    .setFooter({ text: `Type: ${data.type || randomEndpoint.toUpperCase()} | Rating: ${data.rating || "PG13"} | ID: ${data.id || "N/A"}` })
                    .setTimestamp();
                break;
                response = await fetch("https://api.truthordarebot.xyz/api/nhie");
                data = await response.json();
                embed = new EmbedBuilder()
                    .setTitle(`Requested by ${interaction.user.username}`)
                    .setDescription(`🙋 **${data.question || "Question not available"}**`)
                    .setColor(0xFF69B4)
                    .setFooter({ text: `Type: ${data.type || "NHIE"} | Rating: ${data.rating || "PG13"} | ID: ${data.id || "N/A"}` })
                    .setTimestamp();
                break;
        }

        await interaction.update({ embeds: [embed] });
    } catch (error) {
        console.error('Button interaction error:', error);
        await interaction.reply({ content: 'Failed to fetch new question!', flags: 64 });
    }
});

// Welcome new members
client.on(Events.GuildMemberAdd, async (member) => {
    const settings = ServerConfig.getSettings(member.guild.id);
    
    if (settings.welcome_channel) {
        const channel = member.guild.channels.cache.get(settings.welcome_channel);
        if (channel) {
            const message = (settings.welcome_message || 'Welcome {user} to {server}!')
                .replace('{user}', member.toString())
                .replace('{server}', member.guild.name);
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.WELCOME} Welcome to the Kingdom!`)
                .setColor(ROYAL_COLORS.EMERALD)
                .setDescription(message)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Member', value: member.user.tag, inline: true },
                    { name: '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: '👥 Member Count', value: member.guild.memberCount.toString(), inline: true }
                )
                .setFooter({ text: '© Vishal\'s Royal Bot • Welcome to our community!' })
                .setTimestamp();
            
            try {
                channel.send({ embeds: [embed] });
            } catch (error) {
                console.log('❌ Cannot send welcome message - missing permissions');
            }
        }
    }
});

// Goodbye to leaving members
client.on(Events.GuildMemberRemove, async (member) => {
    const settings = ServerConfig.getSettings(member.guild.id);
    
    if (settings.goodbye_channel) {
        const channel = member.guild.channels.cache.get(settings.goodbye_channel);
        if (channel) {
            const message = (settings.goodbye_message || 'Goodbye {user}!')
                .replace('{user}', member.user.tag)
                .replace('{server}', member.guild.name);
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.LOADING} Farewell`)
                .setColor(ROYAL_COLORS.BURGUNDY)
                .setDescription(message)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Member', value: member.user.tag, inline: true },
                    { name: '📅 Joined', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
                    { name: '👥 Members Left', value: member.guild.memberCount.toString(), inline: true }
                )
                .setFooter({ text: '© Vishal\'s Royal Bot • Until we meet again' })
                .setTimestamp();
            
            try {
                channel.send({ embeds: [embed] });
            } catch (error) {
                console.log('❌ Cannot send goodbye message - missing permissions');
            }
        }
    }
});

// Initialize discord-player with working config
const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
        filter: 'audioonly'
    },
    skipFFmpeg: false,
    useLegacyFFmpeg: false
});

// Register the Youtubei extractor (this is what makes it work!)
player.extractors.register(YoutubeiExtractor, {});

// Add player event listeners for debugging
player.events.on('playerStart', (queue, track) => {
    console.log(`🎵 Started playing: ${track.title}`);
    queue.metadata.channel.send(`🎵 Now playing: **${track.title}**`);
});

player.events.on('audioTrackAdd', (queue, track) => {
    console.log(`➕ Added to queue: ${track.title}`);
});

player.events.on('error', (queue, error) => {
    console.log(`❌ Player error: ${error.message}`);
    queue.metadata.channel.send(`❌ Error: ${error.message}`);
});

player.events.on('playerError', (queue, error) => {
    console.log(`❌ Player error: ${error.message}`);
    queue.metadata.channel.send(`❌ Playback error: ${error.message}`);
});

player.events.on('emptyQueue', (queue) => {
    queue.metadata.channel.send('✅ Queue finished!');
});

console.log('🎵 Music player initialized with Youtubei extractor');

// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN);
