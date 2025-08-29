const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kiss',
    description: 'Send a kiss to someone',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        try {
            const response = await fetch('https://nekos.life/api/v2/img/kiss');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('😘 Kiss!')
                .setDescription(target ? `${message.author} kisses ${target}!` : `${message.author} sends a kiss!`)
                .setImage(data.url)
                .setColor('#FF1493')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Kiss API error:', error);
            message.reply('Failed to send kiss!');
        }
    }
};
