const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'wink',
    description: 'Wink at someone',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        try {
            let response = await fetch('https://nekos.life/api/v2/img/wink');
            if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
                response = await fetch('https://nekos.life/api/v2/img/pat');
            }
            
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('😉 Wink!')
                .setDescription(target ? `${message.author} winks at ${target}!` : `${message.author} winks!`)
                .setImage(data.url)
                .setColor('#FF6347')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Wink API error:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('😉 Wink!')
                .setDescription(target ? `${message.author} winks at ${target}! *winks playfully* 😉✨` : `${message.author} winks! *winks cutely* 😉💫`)
                .setColor('#FF6347')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
