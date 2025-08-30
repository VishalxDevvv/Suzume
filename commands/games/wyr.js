const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'wyr',
    description: 'Get a would you rather question',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.truthordarebot.xyz/api/wyr');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('  Would You Rather')
                .setDescription(data.question)
                .setColor('#9932CC')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('WYR API error:', error);
            message.reply('Failed to fetch would you rather question!');
        }
    }
};
