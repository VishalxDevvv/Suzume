const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'hug',
    description: 'Send a hug to someone',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        try {
            const response = await fetch('https://nekos.life/api/v2/img/hug');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('🤗 Hug!')
                .setDescription(target ? `${message.author} hugs ${target}!` : `${message.author} sends a hug!`)
                .setImage(data.url)
                .setColor('#FF69B4')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Hug API error:', error);
            message.reply('Failed to send hug!');
        }
    }
};
