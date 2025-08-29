const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomactivity',
    description: 'Get a random activity suggestion',
    async execute(message, args) {
        try {
            const response = await fetch('https://www.boredapi.com/api/activity');
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: '🎯 Random Activity',
                description: data.activity,
                color: ROYAL_COLORS.PURPLE,
                fields: [
                    { name: 'Type', value: data.type, inline: true },
                    { name: 'Participants', value: data.participants.toString(), inline: true },
                    { name: 'Price Level', value: data.price === 0 ? 'Free' : `${(data.price * 100).toFixed(0)}%`, inline: true }
                ],
                footer: { text: 'Source: Bored API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch activity suggestion!`);
        }
    }
};
