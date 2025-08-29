const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'dance',
    description: 'Show dancing animation',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.waifu.pics/sfw/dance');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('💃 Dance!')
                .setDescription(`${message.author} is dancing!`)
                .setImage(data.url)
                .setColor('#FF1493')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Dance API error:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('💃 Dance!')
                .setDescription(`${message.author} is dancing! *dances energetically* 💃🕺✨`)
                .setColor('#FF1493')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
