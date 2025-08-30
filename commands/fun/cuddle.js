const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'cuddle',
    description: 'Cuddle with someone',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        try {
            const response = await fetch('https://api.waifu.pics/sfw/cuddle');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('🤗 Cuddle!')
                .setDescription(target ? `${message.author} cuddles with ${target}!` : `${message.author} wants cuddles!`)
                .setImage(data.url)
                .setColor('#FFB6C1')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Cuddle API error:', error);
            message.reply('Failed to cuddle!');
        }
    }
};
