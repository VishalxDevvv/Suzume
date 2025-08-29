const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randommeme',
    description: 'Get a random meme',
    async execute(message, args) {
        try {
            const response = await fetch('https://meme-api.com/gimme');
            const data = await response.json();

            if (data.nsfw) {
                return message.reply(`${ROYAL_EMOJIS.WARNING} NSFW content detected, fetching another meme...`);
            }

            const embed = RoyalStyler.createRoyalEmbed({
                title: 'ROYAL_EMOJIS.LAUGH Random Meme',
                description: `**${data.title}**\n\n👍 ${data.ups} upvotes`,
                color: ROYAL_COLORS.GOLD,
                image: data.url,
                fields: [
                    { name: 'Subreddit', value: `r/${data.subreddit}`, inline: true },
                    { name: 'Author', value: `u/${data.author}`, inline: true }
                ],
                footer: { text: 'Source: Reddit via Meme API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch meme!`);
        }
    }
};
