const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nhie',
    description: 'Get a never have I ever question',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.truthordarebot.xyz/api/nhie');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('🙋 Never Have I Ever')
                .setDescription(data.question)
                .setColor('#FF69B4')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('NHIE API error:', error);
            message.reply('Failed to fetch never have I ever question!');
        }
    }
};
