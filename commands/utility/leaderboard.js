const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const fs = require('fs');

module.exports = {
    name: 'leaderboard',
    description: 'View server XP leaderboard',
    execute(message, args) {
        const levelsFile = './data/levels.json';
        if (!fs.existsSync(levelsFile)) {
            return message.reply(`${ROYAL_EMOJIS.INFO} No level data found yet!`);
        }

        const levels = JSON.parse(fs.readFileSync(levelsFile));
        const sorted = Object.entries(levels)
            .sort(([,a], [,b]) => b.level - a.level || b.xp - a.xp)
            .slice(0, 10);

        if (sorted.length === 0) {
            return message.reply(`${ROYAL_EMOJIS.INFO} No users found in leaderboard!`);
        }

        const leaderboard = sorted.map(([userId, data], index) => {
            const user = message.client.users.cache.get(userId);
            const username = user ? user.username : 'Unknown User';
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            return `${medal} **${username}** - Level ${data.level} (${data.xp} XP)`;
        }).join('\n');

        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.STATS} XP Leaderboard`,
            description: leaderboard,
            color: ROYAL_COLORS.GOLD
        });

        message.reply({ embeds: [embed] });
    }
};
