const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'truth',
    description: 'Get a truth question',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.truthordarebot.xyz/v1/truth');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('🤔 Truth Question')
                .setDescription(data.question)
                .setColor('#4169E1')
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('new_truth')
                        .setLabel('New Truth')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🤔'),
                    new ButtonBuilder()
                        .setCustomId('get_dare')
                        .setLabel('Get Dare')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('😈'),
                    new ButtonBuilder()
                        .setCustomId('get_wyr')
                        .setLabel('Would You Rather')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🤷')
                );
            
            message.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Truth API error:', error);
            message.reply('Failed to fetch truth question!');
        }
    }
};
