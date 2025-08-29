const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'dog',
    description: 'Get a random dog image',
    async execute(message, args) {
        try {
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('🐶 Random Dog')
                .setImage(data.message)
                .setColor('#8B4513')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Dog API error:', error);
            message.reply('Failed to fetch a dog image!');
        }
    }
};
