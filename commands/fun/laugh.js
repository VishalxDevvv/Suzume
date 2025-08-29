const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'laugh',
    description: 'Show laughing emotion',
    async execute(message, args) {
        try {
            let response = await fetch('https://nekos.life/api/v2/img/laugh');
            if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
                response = await fetch('https://nekos.life/api/v2/img/pat');
            }
            
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('ROYAL_EMOJIS.LAUGH Laughing')
                .setDescription(`${message.author} is laughing!`)
                .setImage(data.url)
                .setColor('#FFD700')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Laugh API error:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('ROYAL_EMOJIS.LAUGH Laughing')
                .setDescription(`${message.author} is laughing! *laughs heartily* ROYAL_EMOJIS.LAUGH🤣✨\n\nHAHAHA! That's hilarious! 😆`)
                .setColor('#FFD700')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
