const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'tnd',
    description: 'Interactive Truth or Dare game',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle('🎮 **TRUTH OR DARE** 🎮')
            .setDescription(`${ROYAL_EMOJIS.SPARKLES} **Ready for a challenge?** ${ROYAL_EMOJIS.SPARKLES}\n\n` +
                `🤔 **Truth** - Answer a personal question honestly\n` +
                `😈 **Dare** - Complete a fun challenge\n` +
                `🎲 **Random** - Let fate decide your challenge!\n\n` +
                `${ROYAL_EMOJIS.FANCY_DIVIDER}\n` +
                `*Click a button below to start the game!*`)
            .setColor('#FF6B6B')
            .setFooter({ 
                text: `Requested by ${message.author.username} • Truth or Dare Game`,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tnd_truth')
                    .setLabel('Truth')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🤔'),
                new ButtonBuilder()
                    .setCustomId('tnd_dare')
                    .setLabel('Dare')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('😈'),
                new ButtonBuilder()
                    .setCustomId('tnd_random')
                    .setLabel('Random')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎲')
            );
        
        message.reply({ embeds: [embed], components: [row] });
    }
};
