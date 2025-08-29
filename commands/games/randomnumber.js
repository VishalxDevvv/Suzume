const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomnumber',
    description: 'Generate a random number',
    execute(message, args) {
        let min = 1;
        let max = 100;

        if (args[0]) min = parseInt(args[0]);
        if (args[1]) max = parseInt(args[1]);

        if (isNaN(min) || isNaN(max)) {
            return message.reply(`${ROYAL_EMOJIS.ERROR} Please provide valid numbers! Example: \`$randomnumber 1 100\``);
        }

        if (min >= max) {
            return message.reply(`${ROYAL_EMOJIS.WARNING} Minimum must be less than maximum!`);
        }

        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

        const embed = RoyalStyler.createRoyalEmbed({
            title: '🎲 Random Number',
            description: `**Generated Number:** ${randomNum}`,
            color: ROYAL_COLORS.EMERALD,
            fields: [
                { name: 'Range', value: `${min} - ${max}`, inline: true },
                { name: 'Total Possibilities', value: (max - min + 1).toString(), inline: true }
            ],
            footer: { text: 'Generated using Math.random()' }
        });

        message.reply({ embeds: [embed] });
    }
};
