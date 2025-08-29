const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomname',
    description: 'Generate random names',
    async execute(message, args) {
        try {
            const response = await fetch('https://names.drycodes.com/1?nameOptions=boy_names,girl_names');
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: '👶 Random Name',
                description: `**Generated Name:** ${data[0]}`,
                color: ROYAL_COLORS.ROSE_GOLD,
                footer: { text: 'Source: DryCode Names API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            // Fallback names
            const names = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River'];
            const randomName = names[Math.floor(Math.random() * names.length)];
            
            const embed = RoyalStyler.createRoyalEmbed({
                title: '👶 Random Name',
                description: `**Generated Name:** ${randomName}`,
                color: ROYAL_COLORS.ROSE_GOLD,
                footer: { text: 'Generated locally' }
            });

            message.reply({ embeds: [embed] });
        }
    }
};
