const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'bite',
    description: 'Bite someone',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        try {
            // Try multiple endpoints as bite might not exist
            let response = await fetch('https://nekos.life/api/v2/img/bite');
            if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
                // Fallback to a similar action
                response = await fetch('https://nekos.life/api/v2/img/kiss');
            }
            
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('🦷 Bite!')
                .setDescription(target ? `${message.author} bites ${target}!` : `${message.author} bites the air!`)
                .setImage(data.url)
                .setColor('#8B4513')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Bite API error:', error);
            
            // Fallback embed without image
            const embed = new EmbedBuilder()
                .setTitle('🦷 Bite!')
                .setDescription(target ? `${message.author} bites ${target}! *chomp chomp* 🦷` : `${message.author} bites the air! *chomp chomp* 🦷`)
                .setColor('#8B4513')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
