const { Client, GatewayIntentBits, Events, Collection, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const Database = require('./database');
const LevelSystem = require('./levelSystem');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('./royalStyles');
const CustomEmojiManager = require('./customEmojis');
const EmojiFun = require('./emojiFeatures');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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

// XP System
const levelsFile = './data/levels.json';

function loadLevels() {
    if (!fs.existsSync('./data')) fs.mkdirSync('./data');
    if (!fs.existsSync(levelsFile)) fs.writeFileSync(levelsFile, '{}');
    return JSON.parse(fs.readFileSync(levelsFile));
}

function saveLevels(data) {
    fs.writeFileSync(levelsFile, JSON.stringify(data, null, 2));
}

function addXP(userId, username) {
    const levels = loadLevels();
    if (!levels[userId]) levels[userId] = { xp: 0, level: 1 };
    
    levels[userId].xp += Math.floor(Math.random() * 15) + 5; // 5-20 XP per message
    const xpNeeded = levels[userId].level * 100;
    
    if (levels[userId].xp >= xpNeeded) {
        levels[userId].level++;
        levels[userId].xp = 0;
        saveLevels(levels);
        return levels[userId].level; // Return new level for level up message
    }
    
    saveLevels(levels);
    return null;
}

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
        const newLevel = addXP(message.author.id, message.author.username);
        if (newLevel) {
            const levelUpEmbed = RoyalStyler.createRoyalEmbed({
                title: `${ROYAL_EMOJIS.XP} Level Up!`,
                description: `${ROYAL_EMOJIS.SUCCESS} **${message.author.username}** reached level **${newLevel}**!`,
                color: ROYAL_COLORS.GOLD,
                thumbnail: message.author.displayAvatarURL()
            });
            message.reply({ embeds: [levelUpEmbed] });
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
            .setTitle('${ROYAL_EMOJIS.STATS} Server Information')
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
                { name: '${ROYAL_EMOJIS.STATS} Servers', value: client.guilds.cache.size.toString(), inline: true },
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
                { name: '${ROYAL_EMOJIS.STATS} Level System', value: 'Start chatting to gain XP and level up!', inline: false },
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
                { name: '${ROYAL_EMOJIS.STATS} Member Count', value: `We now have ${message.guild.memberCount} members`, inline: true },
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
            const errorMsg = { content: 'There was an error executing that command!', ephemeral: true };
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
                { name: '${ROYAL_EMOJIS.STATS} Servers', value: client.guilds.cache.size.toString(), inline: true },
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
            return await interaction.reply({ content: '❌ You need the "Ban Members" permission to use this command.', ephemeral: true });
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
            await interaction.reply({ content: '❌ Failed to ban user. Make sure I have permission and the user is bannable.', ephemeral: true });
        }
    }

    else if (commandName === 'unban') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return await interaction.reply({ content: '❌ You need the "Ban Members" permission to use this command.', ephemeral: true });
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
            await interaction.reply({ content: '❌ Failed to unban user. Make sure the user ID is correct and they are banned.', ephemeral: true });
        }
    }

    else if (commandName === 'kick') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return await interaction.reply({ content: '❌ You need the "Kick Members" permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        if (!member) {
            return await interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
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
            await interaction.reply({ content: '❌ Failed to kick user. Make sure I have permission and the user is kickable.', ephemeral: true });
        }
    }

    else if (commandName === 'timeout') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return await interaction.reply({ content: '❌ You need the "Timeout Members" permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        if (!member) {
            return await interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
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
            await interaction.reply({ content: '❌ Failed to timeout user. Make sure I have permission and the duration is valid (max 28 days).', ephemeral: true });
        }
    }

    else if (commandName === 'untimeout') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return await interaction.reply({ content: '❌ You need the "Timeout Members" permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        
        if (!member) {
            return await interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
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
            await interaction.reply({ content: '❌ Failed to remove timeout. Make sure the user is currently timed out.', ephemeral: true });
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
            return await interaction.reply({ content: '❌ User not found in this server!', ephemeral: true });
        }

        try {
            const stats = await levelSystem.getUserStats(targetUser.id, interaction.guild.id);
            
            if (!stats) {
                return await interaction.reply({ 
                    content: `${targetUser.id === interaction.user.id ? 'You haven\'t' : `${targetUser.username} hasn't`} sent any messages yet!`, 
                    ephemeral: true 
                });
            }

            const levelCard = levelSystem.createLevelCard(targetMember, stats);
            await interaction.reply({ embeds: [levelCard] });
        } catch (error) {
            console.error('Error getting user stats:', error);
            await interaction.reply({ content: '❌ An error occurred while fetching level data.', ephemeral: true });
        }
    }

    else if (commandName === 'leaderboard') {
        const limit = interaction.options.getInteger('limit') || 10;
        
        try {
            const leaderboardEmbed = await levelSystem.createLeaderboard(interaction.guild, limit);
            await interaction.reply({ embeds: [leaderboardEmbed] });
        } catch (error) {
            console.error('Error creating leaderboard:', error);
            await interaction.reply({ content: '❌ An error occurred while fetching leaderboard data.', ephemeral: true });
        }
    }

    else if (commandName === 'setlevelrole') {
        // Check if user has administrator permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({ content: '❌ You need Administrator permissions to use this command!', ephemeral: true });
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
            await interaction.reply({ content: '❌ An error occurred while setting the level role.', ephemeral: true });
        }
    }

    else if (commandName === 'removelevelrole') {
        // Check if user has administrator permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({ content: '❌ You need Administrator permissions to use this command!', ephemeral: true });
        }

        const level = interaction.options.getInteger('level');

        try {
            const changes = await database.removeLevelRole(interaction.guild.id, level);
            
            if (changes === 0) {
                return await interaction.reply({ content: `❌ No level role found for level ${level}!`, ephemeral: true });
            }

            const successEmbed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('✅ Level Role Removed!')
                .setDescription(`Level role for level **${level}** has been removed!`)
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error removing level role:', error);
            await interaction.reply({ content: '❌ An error occurred while removing the level role.', ephemeral: true });
        }
    }

    else if (commandName === 'levelroles') {
        try {
            const levelRoles = await database.getLevelRoles(interaction.guild.id);
            
            if (levelRoles.length === 0) {
                return await interaction.reply({ content: '❌ No level roles have been set up for this server!', ephemeral: true });
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
            await interaction.reply({ content: '❌ An error occurred while fetching level roles.', ephemeral: true });
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
            const welcomeEmbed = RoyalStyler.createRoyalWelcome(member);
            await welcomeChannel.send({ embeds: [welcomeEmbed] });
            console.log(`✅ Sent welcome message for ${member.user.tag} in ${member.guild.name}`);
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
    database.close();
    client.destroy();
    process.exit(0);
});

// Handle interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    const customId = interaction.isButton() ? interaction.customId : interaction.values[0];
    let helpEmbed;

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

    try {
        let response, data, embed;

        switch (interaction.customId) {
            case 'new_truth':
                response = await fetch('https://api.truthordarebot.xyz/v1/truth');
                data = await response.json();
                embed = new EmbedBuilder()
                    .setTitle('🤔 Truth Question')
                    .setDescription(data.question)
                    .setColor('#4169E1')
                    .setTimestamp();
                break;

            case 'new_dare':
                response = await fetch('https://api.truthordarebot.xyz/api/dare');
                data = await response.json();
                embed = new EmbedBuilder()
                    .setTitle('😈 Dare Challenge')
                    .setDescription(data.question)
                    .setColor('#FF4500')
                    .setTimestamp();
                break;

            case 'get_dare':
                response = await fetch('https://api.truthordarebot.xyz/api/dare');
                data = await response.json();
                embed = new EmbedBuilder()
                    .setTitle('😈 Dare Challenge')
                    .setDescription(data.question)
                    .setColor('#FF4500')
                    .setTimestamp();
                break;

            case 'get_truth':
                response = await fetch('https://api.truthordarebot.xyz/v1/truth');
                data = await response.json();
                embed = new EmbedBuilder()
                    .setTitle('🤔 Truth Question')
                    .setDescription(data.question)
                    .setColor('#4169E1')
                    .setTimestamp();
                break;

            case 'get_wyr':
                response = await fetch('https://api.truthordarebot.xyz/api/wyr');
                data = await response.json();
                embed = new EmbedBuilder()
                    .setTitle('🤷 Would You Rather')
                    .setDescription(data.question)
                    .setColor('#9932CC')
                    .setTimestamp();
                break;

            case 'get_nhie':
                response = await fetch('https://api.truthordarebot.xyz/api/nhie');
                data = await response.json();
                embed = new EmbedBuilder()
                    .setTitle('🙋 Never Have I Ever')
                    .setDescription(data.question)
                    .setColor('#FF69B4')
                    .setTimestamp();
                break;
        }

        await interaction.update({ embeds: [embed] });
    } catch (error) {
        console.error('Button interaction error:', error);
        await interaction.reply({ content: 'Failed to fetch new question!', ephemeral: true });
    }
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
