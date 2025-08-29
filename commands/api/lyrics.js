const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'lyrics',
    description: 'Get song lyrics',
    execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide a song name! Example: \`$lyrics Shape of You\``);
        }
        
        const song = args.join(' ');
        
        axios.get(`https://api.lyrics.ovh/v1/artist/song/${encodeURIComponent(song)}`)
            .then(response => {
                const lyrics = response.data.lyrics;
                if (!lyrics) {
                    return message.reply(`${ROYAL_EMOJIS.ERROR} Lyrics not found for "${song}"!`);
                }
                
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.ENTERTAINMENT} ${song}`,
                    description: lyrics.length > 2000 ? lyrics.substring(0, 2000) + '...' : lyrics,
                    color: ROYAL_COLORS.PURPLE,
                    footer: { text: 'Powered by Lyrics.ovh' }
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch lyrics for "${song}"!`);
            });
    }
};
