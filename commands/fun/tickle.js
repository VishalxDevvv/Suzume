const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tickle',
    description: 'Tickle someone',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        try {
            let response = await fetch('https://api.waifu.pics/sfw/waifu');
            if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
                response = await fetch('https://api.waifu.pics/sfw/waifu');
            }
            
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('🤭 Tickle!')
                .setDescription(target ? `${message.author} tickles ${target}!` : `${message.author} tickles themselves!`)
                .setImage(data.url)
                .setColor('#FFFFE0')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Tickle API error:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('🤭 Tickle!')
                .setDescription(target ? `${message.author} tickles ${target}! *tickle tickle* 🤭✨\n\n"Hehehe!" 😆` : `${message.author} tickles themselves! *giggles* 🤭💫`)
                .setColor('#FFFFE0')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
