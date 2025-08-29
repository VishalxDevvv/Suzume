const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'cry',
    description: 'Show crying emotion',
    async execute(message, args) {
        try {
            let response = await fetch('https://nekos.life/api/v2/img/cry');
            if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
                // Use hug as fallback for cry (more appropriate)
                response = await fetch('https://nekos.life/api/v2/img/hug');
            }
            
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('😭 Crying')
                .setDescription(`${message.author} is crying...`)
                .setImage(data.url)
                .setColor('#4682B4')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Cry API error:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('😭 Crying')
                .setDescription(`${message.author} is crying... *sniffles* 😭💧\n\n*Here's a virtual hug* 🤗💕`)
                .setColor('#4682B4')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
