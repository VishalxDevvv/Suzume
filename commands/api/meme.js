const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'meme',
    description: 'Get a random meme',
    execute(message, args) {
        axios.get('https://meme-api.com/gimme')
            .then(response => {
                const meme = response.data;
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.LAUGH} ${meme.title}`,
                    description: `${ROYAL_EMOJIS.STATS} ${meme.ups} upvotes | r/${meme.subreddit}`,
                    color: ROYAL_COLORS.GOLD,
                    image: meme.url,
                    url: meme.postLink
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch meme!`);
            });
    }
};
