const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'wave',
    description: 'Wave at someone',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        try {
            let response = await fetch('https://api.waifu.pics/sfw/wave');
            if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
                response = await fetch('https://api.waifu.pics/sfw/wave');
            }
            
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(' Wave!')
                .setDescription(target ? `${message.author} waves at ${target}!` : `${message.author} waves hello!`)
                .setImage(data.url)
                .setColor('#00CED1')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Wave API error:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('ROYAL_EMOJIS.HELLO Wave!')
                .setDescription(target ? `${message.author} waves at ${target}! *waves enthusiastically* ROYAL_EMOJIS.HELLO✨` : `${message.author} waves hello! *waves cheerfully* ROYAL_EMOJIS.HELLO😊`)
                .setColor('#00CED1')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
