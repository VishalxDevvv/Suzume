const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const Economy = require('../../economy');

module.exports = {
    name: 'suzu',
    description: 'Global economy system - cash, daily, top, shop',
    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase();
        const userId = message.author.id;

        switch (subcommand) {
            case 'cf':
            case 'flip': {
                // Redirect to cf command
                const cfCommand = message.client.commands?.get('cf') || require('../games/cf.js');
                const cfArgs = args.slice(1); // Remove 'cf' from args
                return await cfCommand.execute(message, cfArgs);
            }

            case 'give':
            case 'gift':
            case 'send': {
                // Redirect to give command
                const giveCommand = message.client.commands?.get('give') || require('./give.js');
                const giveArgs = args.slice(1); // Remove 'give' from args
                return await giveCommand.execute(message, giveArgs);
            }

            case 'cash':
            case 'balance':
            case 'bal':
            case 'money':
            case 'wallet': {
                const user = Economy.getUser(userId);
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.DIAMOND} ${message.author.username}'s Wallet`,
                    description: `<a:cash:1412109414516789380> **${user.balance.toLocaleString()}** suzu cash`,
                    color: ROYAL_COLORS.EMERALD,
                    thumbnail: message.author.displayAvatarURL({ dynamic: true }),
                    footer: { text: '©Vishal' }
                });
                return message.reply({ embeds: [embed] });
            }

            case 'setbg': {
                const bgUrl = args[1];
                if (!bgUrl) {
                    return message.reply('🌸 Please provide a background URL! Use: `sz setbg <image_url>` 💖');
                }

                // Simple URL validation
                if (!bgUrl.match(/\.(jpeg|jpg|gif|png)$/)) {
                    return message.reply('🌸 Please provide a valid image URL (jpg, png, gif) 💖');
                }

                // Store in a simple way (you can expand this to database later)
                const fs = require('fs');
                const bgData = {};
                
                try {
                    const existingData = fs.readFileSync('./data/backgrounds.json', 'utf8');
                    Object.assign(bgData, JSON.parse(existingData));
                } catch (e) { /* File doesn't exist yet */ }

                bgData[userId] = bgUrl;
                
                // Ensure data directory exists
                if (!fs.existsSync('./data')) {
                    fs.mkdirSync('./data');
                }
                
                fs.writeFileSync('./data/backgrounds.json', JSON.stringify(bgData, null, 2));
                
                return message.reply('🌸 Custom background set! Use `sz profile` to see it ✨');
            }

            case 'level':
            case 'lvl':
            case 'rank': {
                // Check if user mentioned someone
                const targetUser = message.mentions.users.first() || message.author;
                const targetId = targetUser.id;
                const user = Economy.getUser(targetId);
                
                // Get leaderboard position
                const leaderboard = Economy.getLeaderboard(1000);
                const position = leaderboard.findIndex(u => u.user_id === targetId) + 1;
                const rank = position > 0 ? `#${position}` : 'Unranked';

                // Get XP progress with safe defaults
                const userXP = Math.max(0, user.xp || 0);
                const userLevel = Math.max(1, user.level || 1);
                const currentLevelXP = Economy.getXPForLevel(userLevel);
                const nextLevelXP = Economy.getXPForLevel(userLevel + 1);
                const progressXP = Math.max(0, userXP - currentLevelXP);
                const neededXP = nextLevelXP - currentLevelXP;

                const embed = RoyalStyler.createRoyalEmbed({
                    title: `🏆 ${targetUser.username}'s Rank`,
                    description: `${targetUser} here's your ranking information ✨`,
                    fields: [
                        {
                            name: '🏆 Server Rank',
                            value: rank,
                            inline: true
                        },
                        {
                            name: '📈 Level',
                            value: `Level ${userLevel}`,
                            inline: true
                        },
                        {
                            name: '⭐ XP Progress',
                            value: `${progressXP.toLocaleString()} / ${neededXP.toLocaleString()}`,
                            inline: true
                        }
                    ],
                    color: ROYAL_COLORS.GOLD,
                    thumbnail: targetUser.displayAvatarURL({ dynamic: true }),
                    footer: { text: 'Keep climbing the ranks! 🚀' }
                });

                return message.reply({ embeds: [embed] });
            }

            case 'profile': {
                // Check if user mentioned someone
                const targetUser = message.mentions.users.first() || message.author;
                const targetId = targetUser.id;
                const user = Economy.getUser(targetId);
                
                // Get leaderboard position
                const leaderboard = Economy.getLeaderboard(1000);
                const position = leaderboard.findIndex(u => u.user_id === targetId) + 1;
                const rank = position > 0 ? `#${position}` : 'Unranked';
                
                // Calculate daily streak
                const lastDaily = user.daily_last ? new Date(user.daily_last) : null;
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                
                let streak = 0;
                if (lastDaily) {
                    const lastDailyDate = lastDaily.toDateString();
                    const todayDate = today.toDateString();
                    const yesterdayDate = yesterday.toDateString();
                    
                    if (lastDailyDate === todayDate || lastDailyDate === yesterdayDate) {
                        streak = 1;
                    }
                }

                // Get XP progress with safe defaults
                const userXP = Math.max(0, user.xp || 0);
                const userLevel = Math.max(1, user.level || 1);
                const currentLevelXP = Economy.getXPForLevel(userLevel);
                const nextLevelXP = Economy.getXPForLevel(userLevel + 1);
                const progressXP = Math.max(0, userXP - currentLevelXP);
                const neededXP = nextLevelXP - currentLevelXP;

                // Create image card
                const { createCanvas, loadImage } = require('canvas');
                const { AttachmentBuilder } = require('discord.js');

                const canvas = createCanvas(900, 500);
                const ctx = canvas.getContext('2d');

                // Try to load custom background
                let hasCustomBg = false;
                const defaultBgUrl = 'https://i.pinimg.com/736x/2c/1b/30/2c1b30287a465fe59d297eb11ff45c78.jpg';
                
                try {
                    const fs = require('fs');
                    const bgData = JSON.parse(fs.readFileSync('./data/backgrounds.json', 'utf8'));
                    const customBgUrl = bgData[targetId] || defaultBgUrl;
                    
                    const customBg = await loadImage(customBgUrl);
                    ctx.drawImage(customBg, 0, 0, 900, 500);
                    hasCustomBg = true;
                } catch (e) { 
                    // Use default background if custom fails
                    try {
                        const defaultBg = await loadImage(defaultBgUrl);
                        ctx.drawImage(defaultBg, 0, 0, 900, 500);
                        hasCustomBg = true;
                    } catch (err) {
                        // Fallback to gradient if image fails
                    }
                }

                // Fallback gradient if no custom background
                if (!hasCustomBg) {
                    const gradient = ctx.createLinearGradient(0, 0, 900, 500);
                    gradient.addColorStop(0, '#667eea');
                    gradient.addColorStop(1, '#764ba2');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 900, 500);
                }

                // Semi-transparent overlay
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(0, 0, 900, 500);

                // User avatar
                try {
                    const avatar = await loadImage(targetUser.displayAvatarURL({ extension: 'png', size: 256 }));
                    
                    // Avatar border
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.arc(150, 150, 83, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    // Avatar image
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(150, 150, 80, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(avatar, 70, 70, 160, 160);
                    ctx.restore();
                } catch (error) {
                    // Fallback circle
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(150, 150, 80, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Username
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 32px Arial';
                ctx.fillText(`🌸 ${targetUser.username}`, 280, 120);

                // Stats layout
                ctx.font = 'bold 24px Arial';
                ctx.fillText(`🪙 Balance: ${user.balance.toLocaleString()} suzu cash`, 280, 170);
                ctx.fillText(`📈 Level: ${userLevel}`, 280, 210);
                ctx.fillText(`⭐ XP: ${progressXP.toLocaleString()} / ${neededXP.toLocaleString()}`, 280, 250);
                ctx.fillText(`🔥 Daily Streak: ${streak} days`, 280, 290);
                ctx.fillText(`🏆 Rank: ${rank}`, 280, 330);
                ctx.fillText(`🎲 Total Flips: ${user.flip_count.toLocaleString()}`, 280, 370);

                // Footer
                ctx.font = '18px Arial';
                ctx.fillStyle = '#ffffff99';
                ctx.fillText('Stay consistent, grow stronger ✨', 280, 420);

                const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'profile-card.png' });
                return message.reply({ files: [attachment] });
            }

            default: {
                return message.reply(`🌸 Unknown command! Try: \`sz cash\`, \`sz daily\`, \`sz give @user 100\` 💖`);
            }

            case 'daily': 
            case 'claim': {
                // Redirect to daily command
                const dailyCommand = message.client.commands?.get('daily') || require('./daily.js');
                return await dailyCommand.execute(message, []);
            }

            case 'top':
            case 'leaderboard':
            case 'lb': 
            case 'rich': {
                // Redirect to leaderboard command
                const lbCommand = message.client.commands?.get('leaderboard') || require('./leaderboard.js');
                return await lbCommand.execute(message, []);
            }

            case 'stats':
            case 'global': {
                const stats = Economy.getGlobalStats();
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.STATS} Global Economy Statistics`,
                    description: `🌍 **Suzume's Global Economy**\n\n👥 **Total Users:** ${stats.total_users.toLocaleString()}\n💰 **Total Money:** ${stats.total_money.toLocaleString()} suzu cash\n🎲 **Total Flips:** ${stats.total_flips.toLocaleString()}\n💚 **Total Won:** ${stats.total_won.toLocaleString()}\n💔 **Total Lost:** ${stats.total_lost.toLocaleString()}\n\n✨ Your balance works on every server!`,
                    color: ROYAL_COLORS.ROYAL_BLUE,
                    footer: { text: 'Global economy powered by Suzume 💖' }
                });
                return message.reply({ embeds: [embed] });
            }

            case 'shop': {
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.SHOP} Suzume's Global Shop`,
                    description: `🚧 **Coming Soon!** 🚧\n\nI'm still setting up my global shop~ Check back later for:\n\n💎 **Global Cosmetics**\n🎭 **Cross-Server Badges** \n⚡ **Universal Perks**\n🎲 **Gambling Boosts**\n🌍 **Server Passes**\n\nKeep earning suzu cash for when it opens! ✨`,
                    color: ROYAL_COLORS.PINK,
                    footer: { text: 'Global shop opening soon~ Stay tuned! 💖' }
                });
                return message.reply({ embeds: [embed] });
            }

            case 'help': {
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `🌸 Suzume Commands:`,
                    description: `\`suzu cash\`        → check your wallet balance\n\`suzu daily\`       → claim your daily rewards\n\`suzu top\`         → see the leaderboard\n\`suzu cf 100 h\`    → flip 100 coins on heads\n\`suzu cf all t\`    → go all-in (max 250k) on tails\n\`suzu stats\`       → global economy stats\n\`suzu shop\`        → browse items (coming soon!)\n\n💡 **Quick shortcuts:** \`cash\`, \`daily\`, \`cf 100 h\`\n🌍 **Global Economy** - Your balance works everywhere!`,
                    color: ROYAL_COLORS.ROYAL_BLUE,
                    footer: { text: 'All commands work with or without prefix! 💖' }
                });
                return message.reply({ embeds: [embed] });
            }
        }
    }
};
