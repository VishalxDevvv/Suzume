const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'advice',
    description: 'Get random life advice',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.adviceslip.com/advice');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.BULB} Life Advice`)
                .setDescription(`*"${data.slip.advice}"*`)
                .setColor('#32CD32')
                .setFooter({ text: `Advice #${data.slip.id}` })
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Advice API error:', error);
            message.reply('Failed to fetch advice!');
        }
    }
};
