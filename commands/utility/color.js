const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'color',
    description: 'Get information about a color',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a hex color! Usage: `+color <hex>` (e.g., +color ff0000)');
        }

        let hex = args[0].replace('#', '');
        if (!/^[0-9A-F]{6}$/i.test(hex)) {
            return message.reply('Please provide a valid hex color (6 characters)!');
        }
        
        try {
            const response = await fetch(`https://www.thecolorapi.com/id?hex=${hex}`);
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(`🎨 Color Information`)
                .setColor(`#${hex}`)
                .addFields(
                    { name: 'Name', value: data.name.value, inline: true },
                    { name: 'Hex', value: data.hex.value, inline: true },
                    { name: 'RGB', value: `${data.rgb.r}, ${data.rgb.g}, ${data.rgb.b}`, inline: true },
                    { name: 'HSL', value: `${data.hsl.h}°, ${data.hsl.s}%, ${data.hsl.l}%`, inline: true }
                )
                .setThumbnail(`https://singlecolorimage.com/get/${hex}/100x100`)
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Color API error:', error);
            message.reply('Failed to fetch color information!');
        }
    }
};
