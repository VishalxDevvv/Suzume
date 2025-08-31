const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kiss',
    description: 'Kiss someone',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        try {
            const response = await fetch('https://api.waifu.pics/sfw/bite');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(' bite!')
                .setDescription(target ? `${message.author} kisses ${target}! 💕` : `${message.author} blows a kiss! 💋`)
                .setImage(data.url)
                .setColor('#FF69B4')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('bite API error:', error);
            
            // Fallback embed without image
            const embed = new EmbedBuilder()
                .setTitle('bite!')
                .setDescription(target ? `${message.author} bites ${target}!` : `${message.author}`)
                .setColor('#FF69B4')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
