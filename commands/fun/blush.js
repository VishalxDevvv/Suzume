const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'blush',
    description: 'Show blushing emotion',
    async execute(message, args) {
        try {
            // Try multiple endpoints as blush might not exist
            let response = await fetch('https://api.waifu.pics/sfw/blush');
            if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
                // Use kiss as fallback for blush (both are cute/romantic)
                response = await fetch('https://api.waifu.pics/sfw/blush');
            }
            
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('😊 Blush!')
                .setDescription(`${message.author} is blushing!`)
                .setImage(data.url)
                .setColor('#FFB6C1')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Blush API error:', error);
            
            // Fallback embed without image
            const embed = new EmbedBuilder()
                .setTitle('😊 Blush!')
                .setDescription(`${message.author} is blushing! *blushes cutely* 😊💕`)
                .setColor('#FFB6C1')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
