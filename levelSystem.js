const { EmbedBuilder } = require('discord.js');

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
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎉 Level Up!')
            .setDescription(`${message.author} has leveled up!`)
            .addFields(
                { name: 'Previous Level', value: oldLevel.toString(), inline: true },
                { name: 'New Level', value: newLevel.toString(), inline: true },
                { name: 'Congratulations!', value: `You've reached level ${newLevel}!`, inline: false }
            )
            .setThumbnail(message.author.displayAvatarURL())
            .setTimestamp();

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
    createLevelCard(user, stats) {
        const progressBar = this.createProgressBar(stats.nextLevel.current, stats.nextLevel.total);
        
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${user.displayName}'s Level Card`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '${ROYAL_EMOJIS.STATS} Level', value: stats.level.toString(), inline: true },
                { name: '⭐ XP', value: stats.xp.toString(), inline: true },
                { name: '🏆 Rank', value: `#${stats.rank}`, inline: true },
                { name: '💬 Messages', value: stats.total_messages.toString(), inline: true },
                { name: '📈 Next Level', value: `${stats.nextLevel.needed} XP needed`, inline: true },
                { name: '${ROYAL_EMOJIS.STATS} Progress', value: progressBar, inline: false }
            )
            .setTimestamp();

        return embed;
    }

    // Create progress bar
    createProgressBar(current, total, length = 20) {
        const percentage = Math.min(current / total, 1);
        const filled = Math.round(length * percentage);
        const empty = length - filled;
        
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        return `${bar} ${Math.round(percentage * 100)}%`;
    }

    // Create leaderboard embed
    async createLeaderboard(guild, limit = 10) {
        try {
            const leaderboard = await this.db.getLeaderboard(guild.id, limit);
            
            if (leaderboard.length === 0) {
                return new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('${ROYAL_EMOJIS.STATS} Server Leaderboard')
                    .setDescription('No users found in the leaderboard yet!');
            }

            let description = '';
            for (let i = 0; i < leaderboard.length; i++) {
                const userData = leaderboard[i];
                const user = await guild.members.fetch(userData.user_id).catch(() => null);
                const username = user ? user.displayName : 'Unknown User';
                
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                description += `${medal} **${username}** - Level ${userData.level} (${userData.xp} XP)\n`;
            }

            return new EmbedBuilder()
                .setColor('#ffd700')
                .setTitle('${ROYAL_EMOJIS.STATS} Server Leaderboard')
                .setDescription(description)
                .setFooter({ text: `Showing top ${leaderboard.length} users` })
                .setTimestamp();

        } catch (error) {
            console.error('Error creating leaderboard:', error);
            return new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('Failed to load leaderboard data.');
        }
    }
}

module.exports = LevelSystem;
