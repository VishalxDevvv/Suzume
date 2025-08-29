const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Play the slot machine'),
    
    async execute(interaction) {
        const slots = ['🍎', '🍊', '🍋', '🍇', '🍓', '💎', '⭐', '🔔'];
        
        const result = [
            slots[Math.floor(Math.random() * slots.length)],
            slots[Math.floor(Math.random() * slots.length)],
            slots[Math.floor(Math.random() * slots.length)]
        ];
        
        let outcome = 'Try again!';
        let color = ROYAL_COLORS.CRIMSON;
        
        if (result[0] === result[1] && result[1] === result[2]) {
            if (result[0] === '💎') {
                outcome = 'JACKPOT! 💰💰💰';
                color = ROYAL_COLORS.GOLD;
            } else {
                outcome = 'Winner! 🎉';
                color = ROYAL_COLORS.EMERALD;
            }
        } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
            outcome = 'Small win! 🎊';
            color = ROYAL_COLORS.PURPLE;
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`${ROYAL_EMOJIS.ENTERTAINMENT} Slot Machine`)
            .setColor(color)
            .setDescription(`🎰 ${result.join(' | ')} 🎰`)
            .addFields(
                { name: '🏆 Result', value: outcome, inline: true },
                { name: '🎲 Player', value: interaction.user.tag, inline: true }
            )
            .setFooter({ text: '© Vishal\'s Royal Bot • Feeling lucky?' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    },
};
