const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'cat',
    description: 'Get a random cat image',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.thecatapi.com/v1/images/search');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('🐱 Random Cat')
                .setImage(data[0].url)
                .setColor('#FFA500')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Cat API error:', error);
            message.reply('Failed to fetch a cat image!');
        }
    }
};
