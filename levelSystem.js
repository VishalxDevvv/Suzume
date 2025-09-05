const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('./royalStyles');

class LevelSystem {
    constructor(database) {
        this.db = database;
        this.cooldowns = new Map(); // Message cooldown to prevent spam
        this.cooldownTime = 60000; // 1 minute cooldown between XP gains
    }

    // Calculate XP required for a level
    getXPForLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    // Calculate level from XP
    getLevelFromXP(xp) {
        let level = 1;
        let totalXP = 0;
        
        while (totalXP <= xp) {
            totalXP += this.getXPForLevel(level);
            if (totalXP <= xp) level++;
        }
        
        return level;
    }

    // Get XP needed for next level
    getXPForNextLevel(currentXP, currentLevel) {
        const nextLevelXP = this.getXPForLevel(currentLevel + 1);
        const currentLevelXP = this.getXPForLevel(currentLevel);
        const progressXP = currentXP - this.getTotalXPForLevel(currentLevel - 1);
        
        return {
            needed: nextLevelXP - progressXP,
            current: progressXP,
            total: nextLevelXP
        };
    }

    // Get total XP required to reach a level
    getTotalXPForLevel(level) {
        let total = 0;
        for (let i = 1; i <= level; i++) {
            total += this.getXPForLevel(i);
        }
        return total;
    }

    // Process message for XP gain
    async processMessage(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const userId = message.author.id;
        const guildId = message.guild.id;
        const userKey = `${userId}-${guildId}`;

        // Check cooldown
        const now = Date.now();
        const lastMessage = this.cooldowns.get(userKey);
        
        if (lastMessage && (now - lastMessage) < this.cooldownTime) {
            return; // Still on cooldown
        }

        // Set cooldown
        this.cooldowns.set(userKey, now);

        // Generate random XP (15-25 per message)
        const xpGain = Math.floor(Math.random() * 11) + 15;

        try {
            // Get current user data
            let userData = await this.db.getUser(userId, guildId);
            
            if (!userData) {
                // Create new user
                await this.db.upsertUser(userId, guildId, xpGain);
                userData = await this.db.getUser(userId, guildId);
            } else {
                // Update existing user
                await this.db.upsertUser(userId, guildId, xpGain);
                userData = await this.db.getUser(userId, guildId);
            }

            // Check for level up
            const oldLevel = userData.level;
            const newLevel = this.getLevelFromXP(userData.xp);

            if (newLevel > oldLevel) {
                await this.db.updateUserLevel(userId, guildId, newLevel);
                await this.handleLevelUp(message, newLevel, oldLevel);
            }

        } catch (error) {
            console.error('Error processing XP:', error);
        }
    }

    // Handle level up
    async handleLevelUp(message, newLevel, oldLevel) {
        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.SPARKLES} Level Up!`,
            description: `${message.author} has leveled up!`,
            color: ROYAL_COLORS.GREEN,
            thumbnail: message.author.displayAvatarURL(),
            fields: [
                { name: 'Previous Level', value: oldLevel.toString(), inline: true },
                { name: 'New Level', value: newLevel.toString(), inline: true },
                { name: 'Congratulations!', value: `You've reached level ${newLevel}!`, inline: false }
            ]
        });

        try {
            await message.channel.send({ embeds: [embed] });
            
            // Check for level roles
            await this.assignLevelRole(message.member, newLevel);
        } catch (error) {
            console.error('Error sending level up message:', error);
        }
    }

    // Assign level role if configured
    async assignLevelRole(member, level) {
        try {
            const levelRoles = await this.db.getLevelRoles(member.guild.id);
            const roleData = levelRoles.find(r => r.level === level);
            
            if (roleData) {
                const role = member.guild.roles.cache.get(roleData.role_id);
                if (role && !member.roles.cache.has(role.id)) {
                    await member.roles.add(role);
                    console.log(`Assigned level ${level} role to ${member.user.tag}`);
                }
            }
        } catch (error) {
            console.error('Error assigning level role:', error);
        }
    }

    // Get user stats
    async getUserStats(userId, guildId) {
        try {
            const userData = await this.db.getUser(userId, guildId);
            if (!userData) return null;

            const rank = await this.db.getUserRank(userId, guildId);
            const nextLevelInfo = this.getXPForNextLevel(userData.xp, userData.level);

            return {
                ...userData,
                rank,
                nextLevel: nextLevelInfo
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            return null;
        }
    }

    // Create level card embed
    // Create level card embed with canvas image
    async createLevelCard(user, stats) {
        try {
            const { createCanvas, loadImage } = require('canvas');
            const { AttachmentBuilder } = require('discord.js');

            const canvas = createCanvas(800, 400);
            const ctx = canvas.getContext('2d');

            // Background
            const defaultBgUrl = 'https://i.pinimg.com/736x/2c/1b/30/2c1b30287a465fe59d297eb11ff45c78.jpg';
            try {
                const bg = await loadImage(defaultBgUrl);
                ctx.drawImage(bg, 0, 0, 800, 400);
            } catch (e) {
                // Fallback gradient
                const gradient = ctx.createLinearGradient(0, 0, 800, 400);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 800, 400);
            }

            // Semi-transparent overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, 800, 400);

            // User avatar
            try {
                const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
                
                // Avatar border
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(120, 120, 75, 0, Math.PI * 2);
                ctx.stroke();
                
                // Avatar image
                ctx.save();
                ctx.beginPath();
                ctx.arc(120, 120, 70, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(avatar, 50, 50, 140, 140);
                ctx.restore();
            } catch (error) {
                // Fallback circle
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(120, 120, 70, 0, Math.PI * 2);
                ctx.fill();
            }

            // Username
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.fillText(`${user.displayName}`, 220, 80);

            // Level info
            ctx.font = 'bold 22px Arial';
            ctx.fillText(`🏆 Level ${stats.level}`, 220, 120);
            ctx.fillText(`⭐ ${stats.xp.toLocaleString()} XP`, 220, 150);
            ctx.fillText(`📈 Rank #${stats.rank}`, 220, 180);
            ctx.fillText(`💬 ${stats.total_messages.toLocaleString()} Messages`, 220, 210);

            // Progress bar
            const barWidth = 350;
            const barHeight = 20;
            const barX = 220;
            const barY = 240;
            
            // Progress bar background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Progress bar fill
            const progress = stats.nextLevel.current / stats.nextLevel.total;
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(barX, barY, barWidth * progress, barHeight);
            
            // Progress text
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.fillText(`${stats.nextLevel.current.toLocaleString()} / ${stats.nextLevel.total.toLocaleString()} XP`, barX, barY + 35);
            ctx.fillText(`${stats.nextLevel.needed.toLocaleString()} XP to next level`, barX, barY + 55);

            // Footer
            ctx.font = '14px Arial';
            ctx.fillStyle = '#ffffff99';
            ctx.fillText('Keep chatting to level up! ✨', 220, 340);

            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'level-card.png' });
            
            const embed = RoyalStyler.createRoyalEmbed({
                title: `${ROYAL_EMOJIS.DIAMOND} ${user.displayName}'s Level Card`,
                color: ROYAL_COLORS.ROYAL_BLUE,
                image: { url: 'attachment://level-card.png' }
            });

            return { embeds: [embed], files: [attachment] };

        } catch (error) {
            console.error('Error creating level card:', error);
            // Fallback to simple embed
            const progressBar = this.createProgressBar(stats.nextLevel.current, stats.nextLevel.total);
            
            const embed = RoyalStyler.createRoyalEmbed({
                title: `${user.displayName}'s Level Card`,
                thumbnail: user.displayAvatarURL(),
                color: ROYAL_COLORS.ROYAL_BLUE,
                fields: [
                    { name: `${ROYAL_EMOJIS.STATS} Level`, value: stats.level.toString(), inline: true },
                    { name: `${ROYAL_EMOJIS.STAR} XP`, value: stats.xp.toString(), inline: true },
                    { name: '🏆 Rank', value: `#${stats.rank}`, inline: true },
                    { name: '💬 Messages', value: stats.total_messages.toString(), inline: true },
                    { name: '📈 Next Level', value: `${stats.nextLevel.needed} XP needed`, inline: true },
                    { name: `${ROYAL_EMOJIS.STATS} Progress`, value: progressBar, inline: false }
                ]
            });

            return { embeds: [embed] };
        }
    }

    // Create progress bar
    createProgressBar(current, total, length = 20) {
        const percentage = Math.min(current / total, 1);
        const filled = Math.round(length * percentage);
        const empty = length - filled;
        
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        return `${bar} ${Math.round(percentage * 100)}%`;
    }

    // Create leaderboard embed with pagination
    async createLeaderboard(guild, limit = 10, page = 1) {
        try {
            const totalLimit = limit * 5; // Get more data for pagination
            const leaderboard = await this.db.getLeaderboard(guild.id, totalLimit);
            
            if (leaderboard.length === 0) {
                return {
                    embed: RoyalStyler.createRoyalEmbed({
                        title: `${ROYAL_EMOJIS.DIAMOND} ${guild.name} XP Leaderboard`,
                        description: 'No users found in the leaderboard yet!',
                        color: ROYAL_COLORS.RED
                    }),
                    components: []
                };
            }

            // Filter active users and paginate
            let activeUsers = [];
            for (const userData of leaderboard) {
                const user = await guild.members.fetch(userData.user_id).catch(() => null);
                if (user) {
                    activeUsers.push({ ...userData, displayName: user.displayName });
                }
            }

            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const pageUsers = activeUsers.slice(startIndex, endIndex);
            const totalPages = Math.ceil(activeUsers.length / limit);

            let description = '';
            for (let i = 0; i < pageUsers.length; i++) {
                const userData = pageUsers[i];
                const position = startIndex + i + 1;
                const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
                description += `${medal} **${userData.displayName}** - Level ${userData.level} (${userData.xp} XP)\n`;
            }

            const embed = RoyalStyler.createRoyalEmbed({
                title: `${ROYAL_EMOJIS.DIAMOND} ${guild.name} XP Leaderboard`,
                description,
                color: ROYAL_COLORS.GOLD,
                footer: { text: `Page ${page}/${totalPages} • ${activeUsers.length} active users` }
            });

            // Create pagination buttons
            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`lb_page_${page - 1}`)
                        .setLabel('◀️ Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 1),
                    new ButtonBuilder()
                        .setCustomId('lb_refresh')
                        .setLabel('🔄 Refresh')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`lb_page_${page + 1}`)
                        .setLabel('Next ▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page >= totalPages)
                );

            return { embed, components: [buttons] };

        } catch (error) {
            console.error('Error creating leaderboard:', error);
            return {
                embed: RoyalStyler.createRoyalEmbed({
                    title: 'Error',
                    description: 'Failed to load leaderboard data.',
                    color: ROYAL_COLORS.RED
                }),
                components: []
            };
        }
    }
}

module.exports = LevelSystem;
