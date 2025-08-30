const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'feed',
    description: 'Feed someone',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        try {
            let response = await fetch('https://api.waifu.pics/sfw/poke/feed');
            if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
                response = await fetch('https://api.waifu.pics/sfw/poke/feed');
            }
            
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('🍽️ Feed!')
                .setDescription(target ? `${message.author} feeds ${target}!` : `${message.author} is eating!`)
                .setImage(data.url)
                .setColor('#FFA500')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Feed API error:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('🍽️ Feed!')
                .setDescription(target ? `${message.author} feeds ${target}! *nom nom* 🍽️✨\n\n"Here, try this!" 😊🥄` : `${message.author} is eating! *munch munch* 😋🍴`)
                .setColor('#FFA500')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
