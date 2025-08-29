const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'diceroll',
    description: 'Roll dice',
    execute(message, args) {
        const sides = args[0] ? parseInt(args[0]) : 6;
        const count = args[1] ? parseInt(args[1]) : 1;

        if (isNaN(sides) || sides < 2 || sides > 100) {
            return message.reply(`${ROYAL_EMOJIS.ERROR} Dice must have 2-100 sides!`);
        }

        if (isNaN(count) || count < 1 || count > 10) {
            return message.reply(`${ROYAL_EMOJIS.ERROR} You can roll 1-10 dice at once!`);
        }

        const rolls = [];
        let total = 0;

        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            rolls.push(roll);
            total += roll;
        }

        const embed = RoyalStyler.createRoyalEmbed({
            title: '🎲 Dice Roll',
            description: `**Results:** ${rolls.join(', ')}\n**Total:** ${total}`,
            color: ROYAL_COLORS.EMERALD,
            fields: [
                { name: 'Dice Type', value: `d${sides}`, inline: true },
                { name: 'Count', value: count.toString(), inline: true },
                { name: 'Average', value: (total / count).toFixed(2), inline: true }
            ],
            footer: { text: `Rolling ${count}d${sides}` }
        });

        message.reply({ embeds: [embed] });
    }
};
