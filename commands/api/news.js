const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'news',
    description: 'Get latest tech news',
    execute(message, args) {
        axios.get('https://hacker-news.firebaseio.com/v0/topstories.json')
            .then(response => {
                const storyId = response.data[0]; // Get top story
                return axios.get(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
            })
            .then(response => {
                const story = response.data;
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.INFO} Latest Tech News`,
                    description: `**${story.title}**\n\n${ROYAL_EMOJIS.STATS} Score: ${story.score} | Comments: ${story.descendants || 0}`,
                    color: ROYAL_COLORS.ROYAL_BLUE,
                    url: story.url,
                    footer: { text: 'Powered by Hacker News' }
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch news!`);
            });
    }
};
