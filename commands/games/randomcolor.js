const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomcolor',
    description: 'Generate a random color',
    async execute(message, args) {
        try {
            const response = await fetch('https://www.colr.org/json/color/random');
            const data = await response.json();
            
            const hexColor = `#${data.new_color}`;
            const colorInt = parseInt(data.new_color, 16);

            const embed = RoyalStyler.createRoyalEmbed({
                title: '🎨 Random Color',
                description: `**Hex:** ${hexColor}\n**RGB:** Coming soon...`,
                color: colorInt,
                thumbnail: `https://via.placeholder.com/200x200/${data.new_color}/${data.new_color}`,
                footer: { text: 'Source: Colr API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            // Fallback to generating random color locally
            const randomColor = Math.floor(Math.random()*16777215);
            const hexColor = `#${randomColor.toString(16).padStart(6, '0')}`;
            
            const embed = RoyalStyler.createRoyalEmbed({
                title: '🎨 Random Color',
                description: `**Hex:** ${hexColor}`,
                color: randomColor,
                footer: { text: 'Generated locally' }
            });

            message.reply({ embeds: [embed] });
        }
    }
};
