const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'color',
    description: 'Get color information',
    execute(message, args) {
        const color = args[0] || Math.floor(Math.random()*16777215).toString(16);
        const hex = color.replace('#', '');
        
        axios.get(`https://www.thecolorapi.com/id?hex=${hex}`)
            .then(response => {
                const data = response.data;
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.VISUAL} ${data.name.value}`,
                    description: `${ROYAL_EMOJIS.DIAMOND} Color Information`,
                    color: parseInt(hex, 16),
                    thumbnail: `https://singlecolorimage.com/get/${hex}/100x100`,
                    fields: [
                        { name: 'HEX', value: data.hex.value, inline: true },
                        { name: 'RGB', value: `${data.rgb.r}, ${data.rgb.g}, ${data.rgb.b}`, inline: true },
                        { name: 'HSL', value: `${data.hsl.h}°, ${data.hsl.s}%, ${data.hsl.l}%`, inline: true }
                    ]
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch color data!`);
            });
    }
};
