const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'smile',
    description: 'Show smiling emotion',
    async execute(message, args) {
        try {
            let response = await fetch('https://nekos.life/api/v2/img/smile');
            if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
                response = await fetch('https://nekos.life/api/v2/img/hug');
            }
            
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('😊 Smile!')
                .setDescription(`${message.author} is smiling!`)
                .setImage(data.url)
                .setColor('#FFD700')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Smile API error:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('😊 Smile!')
                .setDescription(`${message.author} is smiling! *beams brightly* 😊✨\n\nWhat a beautiful smile! 😄💫`)
                .setColor('#FFD700')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
