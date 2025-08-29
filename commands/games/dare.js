const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'dare',
    description: 'Get a dare challenge',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.truthordarebot.xyz/api/dare');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('😈 Dare Challenge')
                .setDescription(data.question)
                .setColor('#FF4500')
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('get_truth')
                        .setLabel('Get Truth')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🤔'),
                    new ButtonBuilder()
                        .setCustomId('new_dare')
                        .setLabel('New Dare')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('😈'),
                    new ButtonBuilder()
                        .setCustomId('get_nhie')
                        .setLabel('Never Have I Ever')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🙋')
                );
            
            message.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Dare API error:', error);
            message.reply('Failed to fetch dare challenge!');
        }
    }
};
