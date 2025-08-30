const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'punch',
    description: 'Punch someone',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        try {
            let response = await fetch('https://api.waifu.pics/sfw/punch');
            if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
                response = await fetch('https://api.waifu.pics/sfw/slap');
            }
            
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('👊 Punch!')
                .setDescription(target ? `${message.author} punches ${target}!` : `${message.author} punches the air!`)
                .setImage(data.url)
                .setColor('#DC143C')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Punch API error:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('👊 Punch!')
                .setDescription(target ? `${message.author} punches ${target}! *pow pow* 👊💥` : `${message.author} punches the air! *whoosh* 👊💨`)
                .setColor('#DC143C')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
