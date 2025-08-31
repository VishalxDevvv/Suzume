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

        // Join args to get full input
        const input = args.join(' ');
        let artist = '';
        let song = '';

        // Check if user provided "Artist - Song" format
        if (input.includes(' - ')) {
            [artist, song] = input.split(' - ').map(str => str.trim());
        } else {
            // If only song is provided
            song = input;
            artist = 'Unknown'; // placeholder for API
        }

        // API request
        axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`)
            .then(response => {
                const lyrics = response.data.lyrics;
                if (!lyrics) {
                    return message.reply(`${ROYAL_EMOJIS.ERROR} Lyrics not found for "${song}"!`);
                }

                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.ENTERTAINMENT} ${song}${artist !== 'Unknown' ? ` by ${artist}` : ''}`,
                    description: lyrics.length > 2000 ? lyrics.substring(0, 2000) + '...' : lyrics,
                    color: ROYAL_COLORS.PURPLE,
                    footer: { text: 'Powered by Lyrics.ovh' }
                });

                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                console.error(error); // log for debugging
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch lyrics for "${song}"!`);
            });
    }
};
