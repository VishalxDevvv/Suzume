const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'quote',
    description: 'Get an inspirational quote',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.quotable.io/random');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('💭 Inspirational Quote')
                .setDescription(`*"${data.content}"*`)
                .addFields({ name: '👤 Author', value: data.author })
                .setColor('#9370DB')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Quote API error:', error);
            message.reply('Failed to fetch a quote!');
        }
    }
};
