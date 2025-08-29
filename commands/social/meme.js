const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'meme',
    description: 'Get a random meme',
    async execute(message, args) {
        try {
            const response = await fetch('https://meme-api.com/gimme');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(`ROYAL_EMOJIS.LAUGH ${data.title}`)
                .setImage(data.url)
                .setColor('#FF6B35')
                .setFooter({ text: `👍 ${data.ups} upvotes • r/${data.subreddit}` })
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Meme API error:', error);
            message.reply('Failed to fetch a meme!');
        }
    }
};
