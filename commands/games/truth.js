const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'truth',
    description: 'Get a truth question',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.truthordarebot.xyz/v1/truth');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(`Requested by ${message.author.username}`)
                .setDescription(`**${data.question}**`)
                .setColor('#4CAF50')
                .setFooter({ text: `Type: ${data.type} | Rating: ${data.rating} | ID: ${data.id}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('truth_new')
                        .setLabel('Truth')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('dare_new')
                        .setLabel('Dare')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('random_new')
                        .setLabel('Random')
                        .setStyle(ButtonStyle.Primary)
                );
            
            message.reply({ embeds: [embed], components: [row] }).catch(error => {
                console.error('Permission error in truth command:', error);
                if (error.code === 50013) {
                    message.channel.send('I don\'t have permission to send embeds or use buttons in this channel!').catch(() => {});
                }
            });
        } catch (error) {
            console.error('Truth API error:', error);
            message.reply('Failed to fetch truth question from API!');
        }
    }
};
