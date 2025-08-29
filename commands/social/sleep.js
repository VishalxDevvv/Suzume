const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sleep',
    description: 'Show sleeping animation',
    async execute(message, args) {
        try {
            // Try multiple endpoints as backup
            let response = await fetch('https://nekos.life/api/v2/img/sleepy');
            if (!response.ok) {
                response = await fetch('https://nekos.life/api/v2/img/pat'); // fallback
            }
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('😴 Sleep!')
                .setDescription(`${message.author} is sleeping... Zzz`)
                .setImage(data.url)
                .setColor('#4B0082')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Sleep API error:', error);
            
            // Fallback embed without image
            const embed = new EmbedBuilder()
                .setTitle('😴 Sleep!')
                .setDescription(`${message.author} is sleeping... Zzz\n\n*💤 Sweet dreams! 💤*`)
                .setColor('#4B0082')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
