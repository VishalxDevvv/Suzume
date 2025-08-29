const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'poke',
    description: 'Poke someone',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        try {
            const response = await fetch('https://nekos.life/api/v2/img/poke');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('👉 Poke!')
                .setDescription(target ? `${message.author} pokes ${target}!` : `${message.author} pokes the air!`)
                .setImage(data.url)
                .setColor('#98FB98')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Poke API error:', error);
            message.reply('Failed to poke!');
        }
    }
};
