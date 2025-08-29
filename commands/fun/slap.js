const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'slap',
    description: 'Slap someone',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        try {
            const response = await fetch('https://nekos.life/api/v2/img/slap');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('ROYAL_EMOJIS.HELLO Slap!')
                .setDescription(target ? `${message.author} slaps ${target}!` : `${message.author} slaps the air!`)
                .setImage(data.url)
                .setColor('#FF4500')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Slap API error:', error);
            message.reply('Failed to slap!');
        }
    }
};
