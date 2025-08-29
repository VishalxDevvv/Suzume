const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'fact',
    description: 'Get a random interesting fact',
    async execute(message, args) {
        try {
            const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('🧠 Random Fact')
                .setDescription(data.text)
                .setColor('#4169E1')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Fact API error:', error);
            message.reply('Failed to fetch a fact!');
        }
    }
};
