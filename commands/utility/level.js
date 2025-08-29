const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const fs = require('fs');

const levelsFile = './data/levels.json';

function loadLevels() {
    if (!fs.existsSync('./data')) fs.mkdirSync('./data');
    if (!fs.existsSync(levelsFile)) fs.writeFileSync(levelsFile, '{}');
    return JSON.parse(fs.readFileSync(levelsFile));
}

function saveLevels(data) {
    fs.writeFileSync(levelsFile, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'level',
    description: 'Check your level and XP',
    execute(message, args) {
        const levels = loadLevels();
        const userId = message.author.id;
        const userData = levels[userId] || { xp: 0, level: 1 };
        
        const xpNeeded = userData.level * 100;
        const progress = Math.floor((userData.xp / xpNeeded) * 10);
        const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);

        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.XP} Level Stats`,
            description: `${ROYAL_EMOJIS.STATS} **${message.author.username}'s Progress**`,
            color: ROYAL_COLORS.GOLD,
            thumbnail: message.author.displayAvatarURL(),
            fields: [
                { name: 'Level', value: userData.level.toString(), inline: true },
                { name: 'XP', value: `${userData.xp}/${xpNeeded}`, inline: true },
                { name: 'Progress', value: `\`${progressBar}\``, inline: false }
            ]
        });

        message.reply({ embeds: [embed] });
    }
};
