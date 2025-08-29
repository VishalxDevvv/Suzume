const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'pat',
    description: 'Pat someone',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        try {
            const response = await fetch('https://nekos.life/api/v2/img/pat');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('🤚 Pat!')
                .setDescription(target ? `${message.author} pats ${target}!` : `${message.author} pats themselves!`)
                .setImage(data.url)
                .setColor('#87CEEB')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Pat API error:', error);
            message.reply('Failed to pat!');
        }
    }
};
